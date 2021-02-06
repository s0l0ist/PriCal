import * as React from 'react'
import * as Base64 from 'base64-js'
import useCalendar from './useCalendar'
import { getDateRange } from '../utils/Date'
import useRequest from './useRequest'
import useGrid from './useGrid'
import usePsi from './usePsi'
import { SCHEDULE_DAYS } from '../constants/Grid'

// Create a type alias
type Base64 = string

// Types for sending a request payload (and the response)
type RequestPayload = {
  contextId: string // This is used as an on-device identifier to lookup key used to create the request)
  request: Base64
}
type RequestPayloadResponse = {
  requestId: string
}
// Types for fetching a request payload (and the response)
type FetchRequestPayload = {
  requestId: string
}
type FetchRequestPayloadResponse = {
  requestId: string
  request: Base64
}

// Types for sending a setup and response payload (and the response)
type ResponsePayload = {
  requestId: string // we need to send the response corresponding to the original requestId
  response: Base64
  serverSetup: Base64
}
type ResponsePayloadResponse = {
  responseId: string // Not used. For reference only.
}
// Types for fetching a setup and response payload (and the response)
type FetchResponsePayload = {
  requestId: string
}
type FetchResponsePayloadResponse = {
  requestId: string
  contextId: string
  response: Base64
  serverSetup: Base64
}

type ScheduleState = {
  processing: boolean
  requestPayloadResponse: RequestPayloadResponse | undefined
  fetchRequestPayloadResponse: FetchRequestPayloadResponse | undefined
  responsePayloadResponse: ResponsePayloadResponse | undefined
  fetchResponsePayloadResponse: FetchResponsePayloadResponse | undefined
}

export default function useSchedule() {
  const [state, setState] = React.useState<ScheduleState>({
    processing: false,
    requestPayloadResponse: undefined,
    fetchRequestPayloadResponse: undefined,
    responsePayloadResponse: undefined,
    fetchResponsePayloadResponse: undefined
  })

  const [{ localCalendars }, { listEvents }] = useCalendar()
  const { convertToGrid } = useGrid()
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
      url: 'http://localhost:8081/processResponse',
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
      url: 'http://localhost:8081/processResponse',
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
   * Effect for sending the client request to the server
   */
  React.useEffect(() => {
    if (currentContext && clientRequest) {
      sendClientRequest<RequestPayload>({
        contextId: currentContext.contextId,
        request: Base64.fromByteArray(clientRequest!.serializeBinary())
      })
      setState(prev => ({
        ...prev,
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
        console.log(
          'Feching request payload',
          state.requestPayloadResponse!.requestId
        )
        fetchClientRequest<FetchRequestPayload>({
          requestId: state.requestPayloadResponse!.requestId
        })
        setState(prev => ({
          ...prev,
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
      console.log('sending server response...')
      sendProcessResponse<ResponsePayload>({
        requestId: state.fetchRequestPayloadResponse!.requestId,
        response: Base64.fromByteArray(serverResponse.serializeBinary()),
        serverSetup: Base64.fromByteArray(serverSetup.serializeBinary())
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
        fetchServerResponse<FetchResponsePayload>({
          requestId: state.responsePayloadResponse!.responseId
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
        const { contextId } = state.fetchResponsePayloadResponse!
        const serverResponse = deserializeResponse(
          Base64.toByteArray(state.fetchResponsePayloadResponse!.response)
        )
        const serverSetup = deserializeServerSetup(
          Base64.toByteArray(state.fetchResponsePayloadResponse!.serverSetup)
        )
        computeIntersection(contextId, serverResponse, serverSetup)
      })()
    }
  }, [state.fetchResponsePayloadResponse])

  async function handleError(error: Error) {
    console.error('got error', error)
    setState(prev => ({
      ...prev,
      processing: false
    }))
  }

  return React.useMemo(
    () => [intersection, state.processing, { createRequest }] as const,
    [intersection, state.processing, createRequest]
  )
}
