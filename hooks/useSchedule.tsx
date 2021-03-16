import * as React from 'react'

import { PsiApiContextProps } from '../components/contexts/WebViewContext'
import { SCHEDULE_DAYS } from '../constants/Grid'
import { getDateRange } from '../utils/date'
import useCalendar from './useCalendar'
import useGrid from './useGrid'

/**
 * A hook for interfacing with the schedule API
 */
export default function useSchedule({
  createClientRequest,
  createServerResponse,
  computeIntersection
}: PsiApiContextProps) {
  const [{ localCalendars }, { listEvents }] = useCalendar()
  const { convertToGrid } = useGrid()

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
    const context = await createClientRequest({ grid })

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
    return createServerResponse({ request, grid })
  }

  /**
   * Computes the intersection from a server response/setup payload
   */
  const getIntersection = (key: string, response: string, setup: string) => {
    return computeIntersection({ key, response, setup })
  }

  return React.useMemo(
    () => ({ createRequest, createResponse, getIntersection } as const),
    [createRequest, createResponse, getIntersection]
  )
}
