import * as React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import useCalendar from '../hooks/useCalendar'
import { MonoText } from './MonoText'
import { getTodayRange } from '../utils/Date'
import * as Calendar from 'expo-calendar'
import useRequest from '../hooks/useRequest'
import useGrid from '../hooks/useGrid'
import usePsi from '../hooks/usePsi'

export default function Body() {
  const { listCalendars, listEvents } = useCalendar()
  const { convertToGrid } = useGrid()
  const [, { createClientRequest }] = usePsi()
  const { buildRequest } = useRequest()

  // Create our client requestor. This
  const [sendClientRequest, { loading }] = buildRequest({
    url: 'http://localhost:8081/clientRequest',
    method: 'post'
  })

  /**
   * Gathers the user's default calendar and list of events for today.
   */
  async function createRequest() {
    console.log('Creating Client Request!')
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

    const grid = convertToGrid(events)

    const [requestId, clientRequest] = await createClientRequest(grid)

    console.log('Sending Client Request')

    // Send the client request to the broker
    sendClientRequest(
      {
        requestId,
        clientRequest: clientRequest.toObject()
      },
      {
        onCompleted: handleResponse,
        onError: handleError
      }
    )

    console.log('Sent Client Request')
  }

  async function handleResponse(response: any) {
    console.log('got response', response)
  }

  async function handleError(error: Error) {
    console.error('got error', error)
  }

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
        <TouchableOpacity onPress={createRequest} style={styles.helpLink}>
          <Text style={styles.helpLinkText}>
            Tap here to create a client request, send it and compute the
            intersection
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
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
