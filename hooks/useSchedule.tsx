import * as React from 'react'
import useCalendar from './useCalendar'
import { getDateRange } from '../utils/Date'
import useRequest from './useRequest'
import useGrid from './useGrid'
import usePsi from './usePsi'

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
  fetchRequestPayload: RequestPayload | undefined
  fetchResponsePayload: ResponsePayload | undefined
}

export default function useSchedule() {
  const [state, setState] = React.useState<ScheduleState>({
    fetchRequestPayload: undefined,
    fetchResponsePayload: undefined
  })

  const [{ localCalendars, events }, { listEvents }] = useCalendar()
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
          fetchResponsePayload: payload
        })),
      onError: handleError
    }
  )

  /**
   * Gathers the user's default calendar and list of events for today.
   */
  const createRequest = async () => {
    const fomattedEvents = events.map(x => ({
      start: new Date(x.startDate),
      end: new Date(x.endDate)
    }))

    const rightNow = new Date()
    const { start, end } = getDateRange(1, rightNow)
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
    }
  }, [clientRequest])

  /**
   * Effect for receiving and processing the client request payload. Get 90 days of events
   */
  React.useEffect(() => {
    if (state.fetchRequestPayload) {
      ;(async () => {
        const clientRequest = deserializeRequest(
          Uint8Array.from(state.fetchRequestPayload!.request)
        )
        const rightNow = new Date()
        const { start, end } = getDateRange(1, rightNow)
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
  }

  return React.useMemo(() => [intersection, { createRequest }] as const, [
    intersection,
    createRequest
  ])
}
