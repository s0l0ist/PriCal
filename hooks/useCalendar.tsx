import * as Calendar from 'expo-calendar'
import * as React from 'react'
import { Platform } from 'react-native'

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
 *
 * TODO: Present the user with a list of calendars to select during
 * the onboarding process.
 */
export default function useCalendar() {
  const [state, setState] = React.useState<CalendarState>({
    calendars: [],
    localCalendars: []
  })

  /**
   * Returns a list of calendars
   */
  const getCalendars = React.useCallback((): Promise<Calendar.Calendar[]> => {
    return Calendar.getCalendarsAsync()
  }, [])

  /**
   * Lists all events within the specified window for the specified calendars
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

  const filterIosCalendars = (calendars: Calendar.Calendar[]) => {
    const calendarEventTypes = calendars.filter(
      x => x.entityType === Calendar.EntityTypes.EVENT
    )
    const localCalendars = calendarEventTypes.filter(
      x =>
        x.type === Calendar.SourceType.LOCAL ||
        x.type === Calendar.SourceType.EXCHANGE ||
        x.type === Calendar.SourceType.CALDAV
    )
    return localCalendars
  }

  // TODO: Make this more accurate
  const filterAndroidCalendars = (calendars: Calendar.Calendar[]) => {
    const calendarEventTypes = calendars.filter(
      x =>
        x.entityType === Calendar.EntityTypes.EVENT || x.accessLevel === 'owner'
    )
    const localCalendars = calendarEventTypes.filter(
      x => x.source.type === 'com.google'
    )
    return localCalendars
  }

  const filterCalendars = (calendars: Calendar.Calendar[]) => {
    switch (Platform.OS) {
      case 'ios':
        return filterIosCalendars(calendars)
      case 'android':
        return filterAndroidCalendars(calendars)
      default:
        throw new Error('Unsupported OS!')
    }
  }

  /**
   * Effect: get all calendars
   * TODO: Allow user to select specific calendars
   */
  React.useEffect(() => {
    ;(async () => {
      const calendars = await getCalendars()
      const localCalendars = filterCalendars(calendars)

      setState({
        calendars,
        localCalendars
      })
    })()
  }, [])

  return React.useMemo(() => [state, { listEvents }] as const, [state])
}
