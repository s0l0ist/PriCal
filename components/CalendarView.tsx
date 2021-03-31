import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Agenda, DateObject } from 'react-native-calendars'

import { eventString } from '../utils/date'
import { CalendarViewEvent, CalendarViewEvents } from './ScheduleDetails'

type CalendarViewProps = {
  createdAt: string
  updatedAt: string
  events: Map<string, CalendarViewEvents>
}

type CalendarEventObject = { [index: string]: CalendarViewEvents }

/**
 * Component to show the calendar intersection of both parties
 */
export default function CalendarView({
  createdAt,
  updatedAt,
  events
}: CalendarViewProps) {
  const [
    calendarEvents,
    setCalendarEvents
  ] = React.useState<CalendarEventObject>({})
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    const date = new Date(createdAt)
    return eventString(date)
  })

  /**
   * Effect: convert to a format the library expects
   */
  React.useEffect(() => {
    const calEvents: CalendarEventObject = {}
    for (const [key, value] of events) {
      calEvents[key] = value
    }
    setCalendarEvents(calEvents)
  }, [events])

  const days = [...events.keys()]
  const startDate = days[0]
  const endDate = days[days.length - 1]

  const renderItem = React.useCallback(
    (item: CalendarViewEvent, firstItemInDay: boolean) => {
      if (item.available) {
        return (
          <View style={styles.itemAvailable}>
            <Text>{item.name}</Text>
          </View>
        )
      }
      return (
        <View style={styles.itemUnavailable}>
          <Text>{item.name}</Text>
        </View>
      )
    },
    []
  )

  const renderDay = React.useCallback(
    (day: DateObject | undefined, item: CalendarViewEvent) => {
      if (day) {
        return (
          <View style={styles.day}>
            <Text>{day ? day.day : item.name}</Text>
          </View>
        )
      }
      return <View />
    },
    []
  )

  return (
    <Agenda
      // The list of items that have to be displayed in agenda. If you want to render item as empty date
      // the value of date key has to be an empty array []. If there exists no value for date key it is
      // considered that the date in question is not yet loaded
      items={calendarEvents}
      // Callback that gets called when items for a certain month should be loaded (month became visible)
      // loadItemsForMonth={month => {
      //   console.log('trigger items loading', month)
      // }}
      // Callback that fires when the calendar is opened or closed
      // onCalendarToggled={calendarOpened => {}}
      // Callback that gets called on day press
      onDayPress={day => {
        setSelectedDate(day.dateString)
      }}
      // Callback that gets called when day changes while scrolling agenda list
      onDayChange={day => {
        setSelectedDate(day.dateString)
      }}
      // Initially selected day
      selected={selectedDate}
      // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
      minDate={startDate}
      // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
      maxDate={endDate}
      // Max amount of months allowed to scroll to the past. Default = 50
      pastScrollRange={50}
      // Max amount of months allowed to scroll to the future. Default = 50
      futureScrollRange={50}
      // Specify how each item should be rendered in agenda
      renderItem={renderItem}
      // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
      // renderDay={renderDay}
      // Specify how empty date content with no items should be rendered
      renderEmptyDate={() => {
        return (
          <View style={styles.emptyDate}>
            <Text>No availability</Text>
          </View>
        )
      }}
      // Specify how agenda knob should look like
      renderKnob={() => {
        return (
          <View>
            <Text>__</Text>
          </View>
        )
      }}
      // Specify what should be rendered instead of ActivityIndicator
      renderEmptyData={() => {
        return (
          <View>
            <Text>No availability</Text>
          </View>
        )
      }}
      // Specify your item comparison function for increased performance
      rowHasChanged={(r1, r2) => {
        return r1.date > r2.date
      }}
      // Hide knob button. Default = false
      hideKnob={false}
      // By default, agenda dates are marked if they have at least one item, but you can override this if needed
      // markedDates={{
      //   '2021-03-22': { marked: true },
      //   '2021-03-23': { marked: true },
      //   '2021-03-25': { disabled: true }
      // }}
      // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
      // disabledByDefault={true}
      // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
      // onRefresh={() => console.log('refreshing...')}
      // Set this true while waiting for new data from a refresh
      // refreshing={false}
      // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
      // refreshControl={null}
      // Agenda theme
      theme={{
        agendaDayTextColor: 'blue',
        agendaDayNumColor: 'blue',
        agendaTodayColor: 'blue',
        agendaKnobColor: 'blue'
      }}
    />
  )
}

const styles = StyleSheet.create({
  day: {
    backgroundColor: 'blue',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20
  },
  itemAvailable: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center'
  },
  itemUnavailable: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center'
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  }
})
