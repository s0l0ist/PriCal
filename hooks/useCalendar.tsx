import * as Calendar from 'expo-calendar'
import * as React from 'react'

export type PermissionResponse = {
  Response: Calendar.PermissionResponse
  Permission: string
}

type CalendarState = {
  calendars: Calendar.Calendar[]
  localCalendars: Calendar.Calendar[]
}

export default function useCalendar() {
  const [state, setState] = React.useState<CalendarState>({
    calendars: [],
    localCalendars: []
  })

  /**
   * Returns a list of the devices calendars
   */
  const getCalendars = (): Promise<Calendar.Calendar[]> => {
    return Calendar.getCalendarsAsync()
  }

  /**
   * Lists all events within the specified window for the given calendars
   * @param calendarIds
   * @param startDate
   * @param endDate
   */
  const listEvents = (
    calendarIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Calendar.Event[]> => {
    return Calendar.getEventsAsync(calendarIds, startDate, endDate)
  }

  /**
   * Effect to set our state.
   */
  React.useEffect(() => {
    ;(async () => {
      const calendars = await getCalendars()
      const localCalendars = calendars.filter(
        x =>
          x.entityType === Calendar.EntityTypes.EVENT &&
          (x.type === Calendar.SourceType.LOCAL ||
            x.type === Calendar.SourceType.EXCHANGE ||
            x.type === Calendar.SourceType.CALDAV)
      )
      setState({
        calendars,
        localCalendars
      })
    })()
  }, [])

  return React.useMemo(() => [state, { listEvents }] as const, [state])
}
