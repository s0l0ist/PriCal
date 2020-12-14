import * as React from 'react'
import useCalendar from './useCalendar'
import { getDateRange } from '../utils/Date'
import useRequest from './useRequest'
import useGrid from './useGrid'
import usePsi from './usePsi'
import { SCHEDULE_DAYS } from '../constants/Grid'

type RequestPayload = {
  contextId: string
  request: number[]
}

type ResponsePayload = {
  contextId: string
  response: number[]
  serverSetup: number[]
}

type ScheduleState = {
  processing: boolean
  fetchRequestPayload: RequestPayload | undefined
  fetchResponsePayload: ResponsePayload | undefined
}

export default function useSchedule() {
  const [state, setState] = React.useState<ScheduleState>({
    processing: false,
    fetchRequestPayload: undefined,
    fetchResponsePayload: undefined
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
  const [sendClientRequest] = buildRequest<RequestPayload>(
    {
      url: 'http://localhost:8081/clientRequest',
      method: 'post'
    },
    {
      onCompleted: payload =>
        setState(prev => ({
          ...prev,
          fetchRequestPayload: payload
        })),
      onError: handleError
    }
  )

  // Builds a process response dispatcher
  const [sendProcessResponse] = buildRequest<ResponsePayload>(
    {
      url: 'http://localhost:8081/processResponse',
      method: 'post'
    },
    {
      onCompleted: payload =>
        setState(prev => ({
          ...prev,
          processing: false,
          fetchResponsePayload: payload
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
   * Effect for sending the client request
   */
  React.useEffect(() => {
    if (currentContext && clientRequest) {
      // Send the client request to the broker
      // TODO: replace the return type here with void or refactor. This is only necessary
      // for a demo where a single phone simulates the interaction. In reality, this endpoint
      // is idempotent
      sendClientRequest<RequestPayload>({
        contextId: currentContext.contextId,
        request: [...clientRequest!.serializeBinary()]
      })
      setState(prev => ({
        ...prev,
        processing: true
      }))
    }
  }, [clientRequest])

  /**
   * Effect for receiving and processing the client request payload
   */
  React.useEffect(() => {
    if (state.fetchRequestPayload) {
      ;(async () => {
        const clientRequest = deserializeRequest(
          Uint8Array.from(state.fetchRequestPayload!.request)
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
  }, [state.fetchRequestPayload])

  /**
   * Effect for sending the server response
   */
  React.useEffect(() => {
    if (currentContext && serverResponse && serverSetup) {
      sendProcessResponse<ResponsePayload>({
        contextId: currentContext.contextId,
        response: [...serverResponse.serializeBinary()],
        serverSetup: [...serverSetup.serializeBinary()]
      })
    }
  }, [serverResponse, serverSetup])

  /**
   * Effect for receiving and processing the server response payload (intersection)
   */
  React.useEffect(() => {
    if (state.fetchResponsePayload) {
      ;(async () => {
        const { contextId } = state.fetchRequestPayload!
        const serverResponse = deserializeResponse(
          Uint8Array.from(state.fetchResponsePayload!.response)
        )
        const serverSetup = deserializeServerSetup(
          Uint8Array.from(state.fetchResponsePayload!.serverSetup)
        )
        computeIntersection(contextId, serverResponse, serverSetup)
      })()
    }
  }, [state.fetchResponsePayload])

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
