import * as React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import useCalendar from '../hooks/useCalendar'
import { MonoText } from './MonoText'
import { getTodayRange } from '../utils/date'
import * as Calendar from 'expo-calendar'
import useRequest from '../hooks/useRequest'
import useGrid from '../hooks/useGrid'
import usePsi from '../hooks/usePsi'

export default function Body() {
  const { listCalendars, listEvents } = useCalendar()
  const { convertToGrid } = useGrid()
  const { encryptGrid } = usePsi()
  const { buildRequest } = useRequest({
    onCompleted: data => console.log('got data', data),
    onError: err => console.log('got err', err)
  })

  const [request, { loading }] = buildRequest({
    url: 'http://localhost:8081/clientRequest',
    method: 'post'
  })

  React.useEffect(() => {
    ;(async () => {
      const calendars = await listCalendars()
      const localCalendar = calendars.filter(
        x =>
          x.entityType === Calendar.EntityTypes.EVENT &&
          x.type === Calendar.SourceType.LOCAL
      )
      const rightNow = new Date()
      const { start, end } = getTodayRange(rightNow)
      const rawEvents = await listEvents(
        localCalendar.map(x => x.id),
        start,
        end
      )
      const events = rawEvents.map(x => ({
        start: new Date(x.startDate),
        end: new Date(x.endDate)
      }))

      console.log('events', events)
      const grid = convertToGrid(events)

      console.log('grid', grid)
      const [requestId, clientRequest] = await encryptGrid(grid)
      request({
        requestId,
        clientRequest: clientRequest.serializeBinary()
      })
    })()
  }, [])

  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text style={styles.getStartedText}>
          Open up the code for this screen:
        </Text>

        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
        >
          <MonoText>{'sup'}</MonoText>
        </View>

        <Text style={styles.getStartedText}>
          Change any of the text, save the file, and your app will automatically
          update.
        </Text>
      </View>

      <View style={styles.helpContainer}>
        <TouchableOpacity onPress={onPress} style={styles.helpLink}>
          <Text style={styles.helpLinkText}>
            Tap here if your app doesn't automatically update after making
            changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function onPress() {
  console.log('Pressed!')
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  developmentModeText: {
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center'
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)'
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
