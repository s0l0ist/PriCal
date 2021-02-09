import * as React from 'react'
import * as Base64 from 'base64-js'
import useCalendar from './useCalendar'
import { getDateRange } from '../utils/Date'
import useRequest from './useRequest'
import useGrid from './useGrid'
import usePsi from './usePsi'
import { SCHEDULE_DAYS } from '../constants/Grid'
import useStorage from './useStorage'
import { MAX_KEYS_TO_STORE, REQUEST_MAP } from '../constants/Storage'

// Create helpful type aliases
type Base64 = string
type RequestId = string

// The record stored in the database
interface RequestRecord {
  // The ID of the request record
  requestId: RequestId

  // The ID of the context pointing to the private key in SecureStorage.
  // It is also used to ensure only the originating requestor can fetch the
  // record from the database.
  contextId: string

  // Short descriptive name that both parties will see
  requestName: string

  // The base64-encoded, serialized clientRequest
  request: Base64

  // The base64-encoded, serialized serverResponse
  response: Base64

  // The base64-encoded, serialized serverSetup
  setup: Base64
}

// Types for sending a request payload (and the response)
type RequestPayload = Pick<
  RequestRecord,
  'contextId' | 'requestName' | 'request'
>
type RequestPayloadResponse = Pick<
  RequestRecord,
  'requestId' | 'requestName' | 'contextId'
>
type FetchRequestPayload = Pick<RequestRecord, 'requestId'>
type FetchRequestPayloadResponse = Pick<RequestRecord, 'requestId' | 'request'>
type ResponsePayload = Pick<RequestRecord, 'requestId' | 'response' | 'setup'>
type ResponsePayloadResponse = Pick<RequestRecord, 'requestId'>
type FetchResponsePayload = Pick<RequestRecord, 'requestId' | 'contextId'>
type FetchResponsePayloadResponse = Pick<
  RequestRecord,
  'requestId' | 'contextId' | 'requestName' | 'response' | 'setup'
>

type RequestMapRecord = Pick<RequestRecord, 'contextId' | 'requestName'>
// A type alias for storing outbound requests
type RequestMap = Map<RequestId, RequestMapRecord>

// TODO: We need a way to store API requests and map them to a persistent state
// so we can fetch the status of all client requests from the server.
// We need to think about this request with the contextId (and private key)
// so that we aren't tracking requests that do not have corresponding
// contextId's on the users phone since we only store the last 10.
type ScheduleState = {
  processing: boolean
  requestName: string
  requests: RequestMap
  requestPayloadResponse: RequestPayloadResponse | undefined
  fetchRequestPayloadResponse: FetchRequestPayloadResponse | undefined
  responsePayloadResponse: ResponsePayloadResponse | undefined
  fetchResponsePayloadResponse: FetchResponsePayloadResponse | undefined
}

export default function useSchedule() {
  const [state, setState] = React.useState<ScheduleState>({
    processing: false,
    requestName: '',
    requests: new Map(),
    requestPayloadResponse: undefined,
    fetchRequestPayloadResponse: undefined,
    responsePayloadResponse: undefined,
    fetchResponsePayloadResponse: undefined
  })

  const [{ localCalendars }, { listEvents }] = useCalendar()
  const { convertToGrid } = useGrid()
  const [, { storeMap, loadMap }] = useStorage()
  const [
    {
      currentContext,
      clientRequest,
      serverResponse,
      serverSetup,
      intersection
    },
    {
      createClientRequest,
      processRequest,
      computeIntersection,
      deserializeRequest,
      deserializeResponse,
      deserializeServerSetup
    }
  ] = usePsi()
  const { buildRequest } = useRequest()

  // Builds a client request dispatcher
  const [sendClientRequest] = buildRequest<RequestPayloadResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/clientRequest',
      method: 'post'
    },
    {
      onCompleted: payload =>
        setState(prev => ({
          ...prev,
          requestPayloadResponse: payload
        })),
      onError: handleError
    }
  )
  // Builds a client request fetcher
  const [fetchClientRequest] = buildRequest<FetchRequestPayloadResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/clientRequest',
      method: 'get'
    },
    {
      onCompleted: payload =>
        setState(prev => ({
          ...prev,
          fetchRequestPayloadResponse: payload
        })),
      onError: handleError
    }
  )

  // Builds a process response dispatcher
  const [sendProcessResponse] = buildRequest<ResponsePayloadResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/serverResponse',
      method: 'post'
    },
    {
      onCompleted: payload =>
        setState(prev => ({
          ...prev,
          processing: false,
          responsePayloadResponse: payload
        })),
      onError: handleError
    }
  )
  // Builds a process response dispatcher
  const [fetchServerResponse] = buildRequest<FetchResponsePayloadResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/serverResponse',
      method: 'get'
    },
    {
      onCompleted: payload =>
        setState(prev => ({
          ...prev,
          processing: false,
          fetchResponsePayloadResponse: payload
        })),
      onError: handleError
    }
  )

  /**
   * Gathers the user's default calendar and list of events for today.
   */
  const createRequest = async () => {
    const rightNow = new Date()
    const { start, end } = getDateRange(SCHEDULE_DAYS, rightNow)
    const calendarIds = localCalendars.map(x => x.id)
    const events = await listEvents(calendarIds, start, end)
    const fomattedEvents = events.map(x => ({
      start: new Date(x.startDate),
      end: new Date(x.endDate)
    }))

    const grid = convertToGrid(fomattedEvents, start, end)
    createClientRequest(grid)
  }

  /**
   * Update the name of the request
   */
  const changeRequestName = (name: string) => {
    setState(prev => ({
      ...prev,
      requestName: name
    }))
  }

  /**
   * Effect for sending the client request to the server
   */
  React.useEffect(() => {
    if (currentContext && clientRequest && state.requestName) {
      console.log('Sending request payload', state.requestName)
      sendClientRequest<RequestPayload>({
        contextId: currentContext.contextId,
        requestName: state.requestName,
        request: Base64.fromByteArray(clientRequest!.serializeBinary())
      })
      setState(prev => ({
        ...prev,
        requestName: '', // Clear the name so the form doesn't submit multiple times.
        processing: true
      }))
    }
  }, [clientRequest])

  /**
   * Effect for fetching the client request payload from the server
   */
  React.useEffect(() => {
    if (state.requestPayloadResponse) {
      ;(async () => {
        const {
          requestId,
          requestName,
          contextId
        } = state.requestPayloadResponse!
        console.log('Feching request payload', requestId)

        fetchClientRequest<FetchRequestPayload>({
          requestId
        })

        // After fetching the request, we store it.
        // TODO: Store a large amount of requests.
        // TODO: Ability to delete local (and remote) requests.
        // Store only the last few requests
        const fixedRequestMap = new Map(
          [...state.requests].slice(-(MAX_KEYS_TO_STORE - 1))
        )
        // We create a new local record based on the currentContext's ID
        // The contextId is the most recent one generated from calling `createClientRequest`
        fixedRequestMap.set(requestId, {
          requestName,
          contextId
        } as RequestMapRecord)

        setState(prev => ({
          ...prev,
          requests: fixedRequestMap,
          processing: true
        }))
      })()
    }
  }, [state.requestPayloadResponse])

  /**
   * Effect for creating server response payload
   */
  React.useEffect(() => {
    if (state.fetchRequestPayloadResponse) {
      ;(async () => {
        console.log('creating server response')
        const clientRequest = deserializeRequest(
          Base64.toByteArray(state.fetchRequestPayloadResponse!.request)
        )
        const rightNow = new Date()
        const { start, end } = getDateRange(SCHEDULE_DAYS, rightNow)
        const rawEvents = await listEvents(
          localCalendars.map(x => x.id),
          start,
          end
        )
        const events = rawEvents.map(x => ({
          start: new Date(x.startDate),
          end: new Date(x.endDate)
        }))

        const grid = convertToGrid(events, start, end)
        processRequest(clientRequest, grid)
      })()
    }
  }, [state.fetchRequestPayloadResponse])

  /**
   * Effect for sending the server response to the server
   */
  React.useEffect(() => {
    if (state.fetchRequestPayloadResponse && serverResponse && serverSetup) {
      console.log(
        'sending server response...',
        state.fetchRequestPayloadResponse!.requestId
      )
      sendProcessResponse<ResponsePayload>({
        requestId: state.fetchRequestPayloadResponse!.requestId,
        response: Base64.fromByteArray(serverResponse.serializeBinary()),
        setup: Base64.fromByteArray(serverSetup.serializeBinary())
      })
      setState(prev => ({
        ...prev,
        processing: true
      }))
    }
  }, [serverResponse, serverSetup])

  /**
   * Effect for fetching the server response payload from the server
   */
  React.useEffect(() => {
    if (state.responsePayloadResponse) {
      ;(async () => {
        console.log(
          'fetching server response...',
          state.responsePayloadResponse
        )
        // Need to fetch the contextId from our RequestMap
        const storedRequest = state.requests.get(
          state.fetchRequestPayloadResponse!.requestId
        )
        console.log('storedRequest', storedRequest)
        if (!storedRequest) {
          throw new Error('Unable to retrieve the stored request from storage')
        }

        fetchServerResponse<FetchResponsePayload>({
          requestId: state.responsePayloadResponse!.requestId,
          contextId: storedRequest!.contextId
        })
        setState(prev => ({
          ...prev,
          processing: true
        }))
      })()
    }
  }, [state.responsePayloadResponse])

  /**
   * Effect for receiving and processing the server response payload (intersection)
   */
  React.useEffect(() => {
    if (state.fetchResponsePayloadResponse) {
      ;(async () => {
        const {
          contextId,
          response,
          setup
        } = state.fetchResponsePayloadResponse!
        const serverResponse = deserializeResponse(Base64.toByteArray(response))
        const serverSetup = deserializeServerSetup(Base64.toByteArray(setup))
        computeIntersection(contextId, serverResponse, serverSetup)
      })()
    }
  }, [state.fetchResponsePayloadResponse])

  /**
   * Effect to persist the requests when they are returned back
   * from the server
   */
  React.useEffect(() => {
    if (state.requests.size) {
      storeMap(REQUEST_MAP, state.requests)
    }
  }, [state.requests])

  /**
   * Effect to load the requests from SecureStorage
   */
  React.useEffect(() => {
    ;(async () => {
      const requests = await loadMap(REQUEST_MAP)
      setState(prev => ({
        ...prev,
        requests
      }))
    })()
  }, [])

  async function handleError(error: Error) {
    console.error('got error', error)
    setState(prev => ({
      ...prev,
      processing: false
    }))
  }

  return React.useMemo(
    () =>
      [
        { ...state, intersection },
        { createRequest, changeRequestName }
      ] as const,
    [intersection, state, createRequest, changeRequestName]
  )
}
