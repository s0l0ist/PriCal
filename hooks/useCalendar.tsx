import * as Calendar from 'expo-calendar'
import * as React from 'react'
import { Platform } from 'react-native'

export default function useCalendar() {
  const listCalendars = async () => {
    return await Calendar.getCalendarsAsync()
  }

  const getDefaultCalendarSource = async () => {
    if (Platform.OS === 'ios') {
      const calendars = await Calendar.getCalendarsAsync()
      const defaultCalendars = calendars.filter(
        each => each.source.name === 'Default'
      )
      console.log('defaultCalendars', defaultCalendars)
      return defaultCalendars[0].source
    }
    return {
      type: 'local',
      isLocalAccount: true,
      name: 'Expo Calendar'
    } as Calendar.Source
  }

  const createCalendar = async (source: Calendar.Source) => {
    return await Calendar.createCalendarAsync({
      title: 'Expo Calendar',
      color: 'blue',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: source.id,
      source: source,
      name: 'internalCalendarName',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER
    })
  }

  const listEvents = async (
    calendarIds: string[],
    startDate: Date,
    endDate: Date
  ) => {
    return await Calendar.getEventsAsync(calendarIds, startDate, endDate)
  }

  return React.useMemo(
    () => ({
      listCalendars,
      getDefaultCalendarSource,
      createCalendar,
      listEvents
    }),
    []
  )
}
