import * as React from 'react'

import { SCHEDULE_DAYS } from '../constants/Grid'
import { getDateRange } from '../utils/date'
import useCalendar from './useCalendar'
import useGrid from './useGrid'
import usePsi from './usePsi'

export default function useSchedule() {
  const [{ localCalendars }, { listEvents }] = useCalendar()
  const { convertToGrid } = useGrid()
  const { createClientRequest, createServerResponse } = usePsi()

  /**
   * Creates a request to schedule
   *
   * - Gathers the user's default calendar and list of events
   * - Creates a time-grid from the events
   * - Creates a PSI Request from the time-grid
   */
  const createRequest = async (requestName: string) => {
    const rightNow = new Date()
    const { start, end } = getDateRange(SCHEDULE_DAYS, rightNow)
    const calendarIds = localCalendars.map(x => x.id)
    const events = await listEvents(calendarIds, start, end)
    const fomattedEvents = events.map(x => ({
      start: new Date(x.startDate),
      end: new Date(x.endDate)
    }))

    const grid = convertToGrid(fomattedEvents, start, end)
    const context = createClientRequest(grid)

    return {
      requestName,
      contextId: context.contextId,
      request: context.clientRequest,
      privateKey: context.privateKey
    }
  }

  /**
   * Creates a response to a schedule request
   *
   * - Gathers the user's default calendar and list of events
   * - Creates a time-grid from the events
   * - Creates a PSI Setup from the time-grid and Response from the PSI Request
   */
  const createResponse = async (request: string) => {
    console.log('creating server response')

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
    return createServerResponse(request, grid)
  }

  // const operation = React.useCallback(
  //   (list1: RequestContext[], list2: RequestContext[]) =>
  //     list1.filter(
  //       (set => (a: RequestContext) => set.has(a.requestId))(
  //         new Set(list2.map(b => b.requestId))
  //       )
  //     ),
  //   []
  // )

  // const intersection = React.useCallback(
  //   (list1: RequestContext[], list2: RequestContext[]) =>
  //     operation(list1, list2),
  //   []
  // )

  return React.useMemo(() => [{ createRequest, createResponse }] as const, [
    createRequest,
    createResponse
  ])
}
