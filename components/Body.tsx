import * as React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import { MonoText } from './MonoText'
import useSchedule from '../hooks/useSchedule'
import { Agenda } from 'react-native-calendars'

export default function Body() {
  const [intersection, processing, { createRequest }] = useSchedule()

  const textString = `Tap here to create a client request, send it and compute the intersection: ${processing}`
  return (
    <View>
      <View style={styles.helpContainer}>
        <TouchableOpacity onPress={createRequest} style={styles.helpLink}>
          <Text style={styles.getStartedText}>{textString}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.getStartedContainer}>
        <Text style={styles.getStartedText}>Intersection:</Text>
        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
        >
          <MonoText>[{intersection.join(', ')}]</MonoText>
        </View>
      </View>

      <Agenda
        // The list of items that have to be displayed in agenda. If you want to render item as empty date
        // the value of date key has to be an empty array []. If there exists no value for date key it is
        // considered that the date in question is not yet loaded
        items={{
          '2020-12-22': [{ name: 'item 1 - any js object' }],
          '2020-12-23': [{ name: 'item 2 - any js object', height: 80 }],
          '2020-12-24': [],
          '2020-12-25': [
            { name: 'item 3 - any js object' },
            { name: 'any js object' }
          ]
        }}
        // Callback that gets called when items for a certain month should be loaded (month became visible)
        loadItemsForMonth={month => {
          console.log('trigger items loading')
        }}
        // Callback that fires when the calendar is opened or closed
        onCalendarToggled={calendarOpened => {
          console.log(calendarOpened)
        }}
        // Callback that gets called on day press
        onDayPress={day => {
          console.log('day pressed')
        }}
        // Callback that gets called when day changes while scrolling agenda list
        onDayChange={day => {
          console.log('day changed')
        }}
        // Initially selected day
        selected={'2020-12-16'}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        minDate={'2020-12-10'}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        maxDate={'2020-12-30'}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={50}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={50}
        // Specify how each item should be rendered in agenda
        renderItem={(item, firstItemInDay) => {
          return <View />
        }}
        // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
        renderDay={(day, item) => {
          return <View />
        }}
        // Specify how empty date content with no items should be rendered
        renderEmptyDate={() => {
          return <View />
        }}
        // Specify how agenda knob should look like
        renderKnob={() => {
          return <View />
        }}
        // Specify what should be rendered instead of ActivityIndicator
        renderEmptyData={() => {
          return <View />
        }}
        // Specify your item comparison function for increased performance
        rowHasChanged={(r1, r2) => {
          return r1.text !== r2.text
        }}
        // Hide knob button. Default = false
        hideKnob={false}
        // By default, agenda dates are marked if they have at least one item, but you can override this if needed
        markedDates={{
          '2020-12-16': { selected: true, marked: true },
          '2020-12-17': { marked: true },
          '2020-12-18': { disabled: true }
        }}
        // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
        disabledByDefault={false}
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
        onRefresh={() => console.log('refreshing...')}
        // Set this true while waiting for new data from a refresh
        refreshing={false}
        // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
        refreshControl={null}
        // Agenda theme
        // theme={{
        //   ...calendarTheme,
        //   agendaDayTextColor: 'yellow',
        //   agendaDayNumColor: 'green',
        //   agendaTodayColor: 'red',
        //   agendaKnobColor: 'blue'
        // }}
        // Agenda container style
        // style={{}}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center'
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center'
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    textAlign: 'center'
  }
})
