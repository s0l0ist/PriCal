import * as Calendar from 'expo-calendar'
import * as React from 'react'
import { Platform } from 'react-native'

export default function useCalendar() {
  const [calendars, setCalendars] = React.useState<Calendar.Calendar[]>([])
  const [localCalendars, setLocalCalendars] = React.useState<
    Calendar.Calendar[]
  >([])
  const [defaultCalendarSource, setDefaultCalendarSource] = React.useState<
    Calendar.Source
  >()

  /**
   * Returns a list of the devices calendars
   */
  const getCalendars = async (): Promise<Calendar.Calendar[]> => {
    return await Calendar.getCalendarsAsync()
  }

  /**
   * Returns the devices default calendar source
   */
  const getDefaultCalendarSource = async (): Promise<Calendar.Source> => {
    if (Platform.OS === 'ios') {
      const calendars = await Calendar.getCalendarsAsync()
      const defaultCalendars = calendars.filter(
        each => each.source.name === 'Default'
      )
      return defaultCalendars[0].source
    }
    return {
      type: 'local',
      isLocalAccount: true,
      name: 'Expo Calendar'
    } as Calendar.Source
  }

  /**
   * Lists all events within the specified window for the given calendars
   * @param calendarIds
   * @param startDate
   * @param endDate
   */
  const listEvents = async (
    calendarIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Calendar.Event[]> => {
    return await Calendar.getEventsAsync(calendarIds, startDate, endDate)
  }

  /**
   * Effect to set our state.
   */
  React.useEffect(() => {
    ;(async () => {
      const [calendars, defaultSource] = await Promise.all([
        getCalendars(),
        getDefaultCalendarSource()
      ])
      const localCalendars = calendars.filter(
        x =>
          x.entityType === Calendar.EntityTypes.EVENT &&
          x.type === Calendar.SourceType.LOCAL
      )

      setCalendars(calendars)
      setDefaultCalendarSource(defaultSource)
      setLocalCalendars(localCalendars)
    })()
  }, [])

  return React.useMemo(
    () =>
      [
        calendars,
        localCalendars,
        {
          listEvents
        }
      ] as const,
    [calendars, localCalendars]
  )
}
