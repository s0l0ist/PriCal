import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Agenda } from 'react-native-calendars'

type CalendarViewProps = {
  createdAt: string
  updatedAt: string
  intersection: number[]
}

/**
 * Component to show the calendar intersection of both parties
 */
export default function CalendarView({
  createdAt,
  updatedAt,
  intersection
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    console.log('**************** EXPENSIVE')
    const date = new Date(createdAt)
    const offset = date.getTimezoneOffset()
    const today = new Date(date.getTime() - offset * 60 * 1000)
    return today.toISOString().split('T')[0]
  })

  console.log('selectedDate', selectedDate)

  return (
    <Agenda
      // The list of items that have to be displayed in agenda. If you want to render item as empty date
      // the value of date key has to be an empty array []. If there exists no value for date key it is
      // considered that the date in question is not yet loaded
      items={{
        '2021-03-22': [{ name: 'item 1 - 2021-03-22' }],
        '2021-03-23': [{ name: 'item 2 - 2021-03-23', height: 80 }],
        '2021-03-24': [],
        '2021-03-25': [
          { name: 'item 3 - 2021-03-25' },
          { name: 'item 4 - 2021-03-25' }
        ]
      }}
      // Callback that gets called when items for a certain month should be loaded (month became visible)
      // loadItemsForMonth={month => {
      //   console.log('trigger items loading', month)
      // }}
      // Callback that fires when the calendar is opened or closed
      onCalendarToggled={calendarOpened => {
        console.log(calendarOpened)
      }}
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
      minDate={'2021-01-01'}
      // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
      maxDate={'2022-01-01'}
      // Max amount of months allowed to scroll to the past. Default = 50
      pastScrollRange={50}
      // Max amount of months allowed to scroll to the future. Default = 50
      futureScrollRange={50}
      // Specify how each item should be rendered in agenda
      renderItem={(item, firstItemInDay) => {
        return (
          <View>
            <Text>{item.name}</Text>
          </View>
        )
      }}
      // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
      // renderDay={(day, item) => {
      //   return (
      //     <View>
      //       <Text>{`Render Day: ${JSON.stringify(item)}`}</Text>
      //     </View>
      //   )
      // }}
      // Specify how empty date content with no items should be rendered
      renderEmptyDate={() => {
        return (
          <View style={styles.emptyDate}>
            <Text>This is empty date!</Text>
          </View>
        )
      }}
      // Specify how agenda knob should look like
      renderKnob={() => {
        return (
          <View>
            <Text>Change Range</Text>
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
        return r1.name !== r2.name
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
      onRefresh={() => console.log('refreshing...')}
      // Set this true while waiting for new data from a refresh
      refreshing={false}
      // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
      refreshControl={null}
      // Agenda theme
      theme={{
        agendaDayTextColor: 'yellow',
        agendaDayNumColor: 'green',
        agendaTodayColor: 'red',
        agendaKnobColor: 'blue'
      }}
    />
  )
}

const styles = StyleSheet.create({
  emptyDate: {
    // height: 15,
    // flex: 1,
    // paddingTop: 30
  }
})
