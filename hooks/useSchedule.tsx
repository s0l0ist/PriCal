import * as React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import useCalendar from './useCalendar'
import { MonoText } from '../components/MonoText'
import { getTodayRange } from '../utils/Date'
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

export default function useSchedule() {
  const [_, localCalendars, { listEvents }] = useCalendar()
  const [fetchRequestPayload, setFetchRequestPayload] = React.useState<
    RequestPayload
  >()
  const [fetchResponsePayload, setFetchResponsePayload] = React.useState<
    ResponsePayload
  >()

  const { convertToGrid } = useGrid()
  const [
    currentContext,
    clientRequest,
    serverResponseAndSetup,
    intersection,
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
      onCompleted: setFetchRequestPayload,
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
      onCompleted: setFetchResponsePayload,
      onError: handleError
    }
  )

  /**
   * Gathers the user's default calendar and list of events for today.
   */
  const createRequest = async () => {
    const rightNow = new Date()
    const { start, end } = getTodayRange(rightNow)
    const rawEvents = await listEvents(
      localCalendars.map(x => x.id),
      start,
      end
    )
    const events = rawEvents.map(x => ({
      start: new Date(x.startDate),
      end: new Date(x.endDate)
    }))

    const grid = convertToGrid(events)
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
   * Effect for receiving and processing the client request payload
   */
  React.useEffect(() => {
    if (fetchRequestPayload) {
      ;(async () => {
        const clientRequest = deserializeRequest(
          Uint8Array.from(fetchRequestPayload.request)
        )

        const rightNow = new Date()
        const { start, end } = getTodayRange(rightNow)
        const rawEvents = await listEvents(
          localCalendars.map(x => x.id),
          start,
          end
        )
        const events = rawEvents.map(x => ({
          start: new Date(x.startDate),
          end: new Date(x.endDate)
        }))

        const grid = convertToGrid(events)

        processRequest(clientRequest, grid)
      })()
    }
  }, [fetchRequestPayload])

  /**
   * Effect for sending the server response
   */
  React.useEffect(() => {
    if (currentContext && serverResponseAndSetup) {
      sendProcessResponse<ResponsePayload>({
        contextId: currentContext.contextId,
        response: [...serverResponseAndSetup.response.serializeBinary()],
        serverSetup: [...serverResponseAndSetup.setup.serializeBinary()]
      })
    }
  }, [serverResponseAndSetup])

  /**
   * Effect for receiving and processing the server response payload (intersection)
   */
  React.useEffect(() => {
    if (fetchResponsePayload) {
      ;(async () => {
        const { contextId } = fetchRequestPayload!
        const serverResponse = deserializeResponse(
          Uint8Array.from(fetchResponsePayload.response)
        )
        const serverSetup = deserializeServerSetup(
          Uint8Array.from(fetchResponsePayload.serverSetup)
        )
        computeIntersection(contextId, serverResponse, serverSetup)
      })()
    }
  }, [fetchResponsePayload])

  async function handleError(error: Error) {
    console.error('got error', error)
  }

  return React.useMemo(() => [intersection, { createRequest }] as const, [
    intersection,
    createRequest
  ])
}
