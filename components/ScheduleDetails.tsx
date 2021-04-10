import { useRoute, useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, StyleSheet, Text, Button, ActivityIndicator } from 'react-native'

import { GRID_ELEMENTS_PER_DAY, SCHEDULE_DAYS } from '../constants/Grid'
import useDeleteRequest from '../hooks/api/useDeleteRequest'
import useGetPrivateResponse from '../hooks/api/useGetPrivateResponse'
import useSync, { Request } from '../hooks/store/useSync'
import useGrid from '../hooks/useGrid'
import useSchedule from '../hooks/useSchedule'
import {
  ScheduleDetailsScreenRouteProp,
  SchedulesScreenNavigationProp
} from '../navigation/BottomTabNavigator'
import { eventString, getDateRange } from '../utils/date'
import CalendarView from './CalendarView'
import PsiContext from './contexts/PsiContext'

export type CalendarViewEvent = {
  name: string
  date: Date
  available: boolean
}

export type CalendarViewEvents = CalendarViewEvent[]
/**
 * Component to show the details of both parties schedules
 */
export default function ScheduleDetails() {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [requestContext, setRequestContext] = React.useState<Request>()
  const [events, setEvents] = React.useState<Map<string, CalendarViewEvents>>(
    new Map()
  )
  const [privateResponseApi, getResponseDetails] = useGetPrivateResponse()
  const [deleteRequestApi, deleteRequest] = useDeleteRequest()
  const { getRequest, removeRequest } = useSync()
  const context = React.useContext(PsiContext)
  const { getIntersection } = useSchedule(context)
  const { createGrid } = useGrid()
  const {
    params: { requestId, requestName }
  } = useRoute<ScheduleDetailsScreenRouteProp>()
  const navigation = useNavigation<SchedulesScreenNavigationProp>()

  /**
   * Compute the intersection of a response.
   *
   * This is done by looking up the private key that was
   * used to create the inititial PSI Request and passing in
   * the PSI response/setup from the approver.
   */
  const calculateIntersection = React.useCallback(
    async ({ response, setup }: { response: string; setup: string }) => {
      if (requestContext) {
        const { intersection } = await getIntersection(
          requestContext.privateKey,
          response,
          setup
        )

        return intersection
      }
      return []
    },
    [requestContext, getIntersection]
  )

  /**
   * Effect: on mount, fetch our context from local storage
   * and also fire the request to fetch the server response
   */
  React.useEffect(() => {
    ;(async () => {
      // Overide the title of the screen
      navigation.setOptions({ headerTitle: requestName })

      // Fetch the request storage
      const request = await getRequest(requestId)
      // This should never happen as we always stay in sync in the previous screen
      if (!request) {
        throw new Error('Unable to fetch stored request')
      }
      getResponseDetails({
        requestId: request.requestId,
        contextId: request.contextId
      })
      setRequestContext(request)
    })()
  }, [])

  /**
   * Effect: when we receive any type of response, clear our loading status
   */
  React.useEffect(() => {
    ;(async () => {
      if (privateResponseApi.response) {
        if (
          privateResponseApi.response.response &&
          privateResponseApi.response.setup
        ) {
          const inter = await calculateIntersection({
            response: privateResponseApi.response.response,
            setup: privateResponseApi.response.setup
          })
          // We get the original request creation time from the database
          const createdAt = new Date(privateResponseApi.response.createdAt)

          // Next, we recreate an empty time-grid staring from the original time.
          // We will mark off the indicies specified from the intersection.
          const { start, end } = getDateRange(SCHEDULE_DAYS, createdAt)
          const emptyGrid = createGrid(start, end)

          // Create an empty map and use a for-loop to populate it
          // for best performance as this could be very large
          const displayedEvents = new Map<string, any>()
          for (let i = 0; i < emptyGrid.length; i++) {
            const gridItem = emptyGrid[i]
            const eventIndex = eventString(gridItem)
            const eventName = gridItem.toLocaleTimeString()

            // If we don't have an day-entry, create a list of events with
            // the new event
            if (!displayedEvents.has(eventIndex)) {
              displayedEvents.set(eventIndex, [
                { name: eventName, date: gridItem, available: false }
              ])
              continue
            }

            // Otherwise, fetch the previous list and add to it
            const prevEvent = displayedEvents.get(eventIndex)
            prevEvent.push({
              name: eventName,
              date: gridItem,
              available: false
            })
          }

          // We need to determine what an index represents with respect
          // to the time grid.
          // Ex:
          //   an intersection index could represent a 15-minute window
          //
          inter.forEach((i: number) => {
            const dayIndex = Math.floor(i / GRID_ELEMENTS_PER_DAY)
            const days = [...displayedEvents.keys()]
            const day = days[dayIndex]
            const dayEvents = displayedEvents.get(day)

            const eventIndex = Math.floor(i % GRID_ELEMENTS_PER_DAY)
            // Get the specified event
            const event = dayEvents[eventIndex]
            const modifiedEvent = {
              ...event,
              available: true
            }

            // Next, put pack the modified event
            dayEvents[eventIndex] = modifiedEvent
            displayedEvents.set(day, dayEvents)
          })

          // TODO: fetch OUR latest calendar events from the createdAt time to merge in
          // the latest updates/changes from the requestor's side as this doesn't need
          // another intersection calculation.
          setEvents(displayedEvents)
        }
        setLoading(false)
      }
      if (privateResponseApi.error) {
        setLoading(false)
      }
    })()
  }, [privateResponseApi.response, privateResponseApi.error])

  /**
   * Effect: if the delete request completed successfully, remove from local storage
   * and go back
   */
  React.useEffect(() => {
    ;(async () => {
      if (deleteRequestApi.response) {
        // If successful, then delete from storage
        await removeRequest(requestId)
        navigation.goBack()
      }
    })()
  }, [deleteRequestApi.response])

  // If the component is still initializing, return the activity indicator
  if (loading || !requestContext || !privateResponseApi.completed) {
    return (
      <View style={styles.container}>
        <ActivityIndicator animating={loading} />
      </View>
    )
  }

  // If the api response doesn't contain a serverResponse, we let the user
  // know the request is still waiting for the other party to accept.
  const isPending =
    privateResponseApi.completed &&
    (!privateResponseApi.response?.response ||
      !privateResponseApi.response?.createdAt ||
      !privateResponseApi.response?.updatedAt)

  return (
    <View style={styles.container}>
      <Button
        title="Delete"
        disabled={privateResponseApi.processing}
        onPress={() => {
          deleteRequest({
            requests: [{ requestId, contextId: requestContext.contextId }]
          })
        }}
      />
      {isPending && (
        <Text>This request is still pending! Check back later</Text>
      )}
      {!isPending && (
        <View style={styles.calendarContainer}>
          <CalendarView
            createdAt={privateResponseApi.response!.createdAt}
            updatedAt={privateResponseApi.response!.updatedAt!}
            events={events}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  calendarContainer: {
    width: '100%',
    height: '100%'
  }
})
