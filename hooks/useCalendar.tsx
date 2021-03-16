import * as Calendar from 'expo-calendar'
import * as React from 'react'
import PermissionsContext from '../components/contexts/PermissionsContext'

export enum PERMISSIONS_ENUM {
  CALENDAR = 'CALENDAR',
  REMINDERS = 'REMINDERS',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export type PermissionResponse = {
  Response: Calendar.PermissionResponse
  Permission: PERMISSIONS_ENUM
}

type CalendarState = {
  calendars: Calendar.Calendar[]
  localCalendars: Calendar.Calendar[]
}

/**
 * A hook for interfacing with the calendar API
 */
export default function useCalendar() {
  const [state, setState] = React.useState<CalendarState>({
    calendars: [],
    localCalendars: []
  })

  const { hasRequiredPermissions } = React.useContext(PermissionsContext)

  /**
   * Returns a list of calendars
   */
  const getCalendars = (): Promise<Calendar.Calendar[]> => {
    return Calendar.getCalendarsAsync()
  }

  /**
   * Lists all events within the specified window for the specified calendars
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
      if (hasRequiredPermissions) {
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
      }
    })()
  }, [hasRequiredPermissions])

  return React.useMemo(() => [state, { listEvents }] as const, [state])
}
