import * as Calendar from 'expo-calendar'
import * as React from 'react'
import { getDateRange } from '../utils/Date'

type CalendarState = {
  calendars: Calendar.Calendar[]
  localCalendars: Calendar.Calendar[]
  events: Calendar.Event[]
}

export default function useCalendar() {
  const [state, setState] = React.useState<CalendarState>({
    calendars: [],
    localCalendars: [],
    events: []
  })

  /**
   * Returns a list of the devices calendars
   */
  const getCalendars = React.useCallback((): Promise<Calendar.Calendar[]> => {
    return Calendar.getCalendarsAsync()
  }, [])

  /**
   * Lists all events within the specified window for the given calendars
   * @param calendarIds
   * @param startDate
   * @param endDate
   */
  const listEvents = React.useCallback(
    (
      calendarIds: string[],
      startDate: Date,
      endDate: Date
    ): Promise<Calendar.Event[]> => {
      return Calendar.getEventsAsync(calendarIds, startDate, endDate)
    },
    []
  )

  /**
   * Effect to set our state. We fetch 90 days worth of events.
   */
  React.useEffect(() => {
    ;(async () => {
      const calendars = await getCalendars()
      const localCalendars = calendars.filter(
        x =>
          x.entityType === Calendar.EntityTypes.EVENT &&
          (x.type === Calendar.SourceType.LOCAL ||
            x.type === Calendar.SourceType.EXCHANGE ||
            x.type === Calendar.SourceType.CALDAV ||
            x.type === Calendar.SourceType.MOBILEME)
      )

      const rightNow = new Date()
      const { start, end } = getDateRange(90, rightNow)
      const events = await listEvents(
        localCalendars.map(x => x.id),
        start,
        end
      )
      setState({
        calendars,
        localCalendars,
        events
      })
    })()
  }, [])

  return React.useMemo(() => [state, { listEvents }] as const, [state])
}
