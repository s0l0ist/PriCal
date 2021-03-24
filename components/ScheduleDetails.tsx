import { useRoute, useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, StyleSheet, Text, Button } from 'react-native'

import useDeleteRequest from '../hooks/api/useDeleteRequest'
import useGetPrivateResponse from '../hooks/api/useGetPrivateResponse'
import useSync, { Request } from '../hooks/store/useSync'
import useSchedule from '../hooks/useSchedule'
import {
  ScheduleDetailsScreenRouteProp,
  SchedulesScreenNavigationProp
} from '../navigation/BottomTabNavigator'
import PsiContext from './contexts/PsiContext'

/**
 * Component to show the details of both parties schedules
 */
export default function ScheduleDetails() {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [requestContext, setRequestContext] = React.useState<Request>()
  const [intersection, setIntersection] = React.useState<number[]>([])
  const [privateResponseApi, getResponseDetails] = useGetPrivateResponse()
  const [deleteRequestApi, deleteRequest] = useDeleteRequest()
  const { getRequest, removeRequest } = useSync()
  const context = React.useContext(PsiContext)
  const { getIntersection } = useSchedule(context)
  const {
    params: { requestId, requestName }
  } = useRoute<ScheduleDetailsScreenRouteProp>()
  const navigation = useNavigation<SchedulesScreenNavigationProp>()

  /**
   * Effect: on mount, fetch our context from local storage
   * and also fire the request to fetch the server response
   */
  React.useEffect(() => {
    ;(async () => {
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
      return () => {
        setLoading(false)
        setRequestContext(undefined)
      }
    })()
  }, [])

  /**
   * Effect: when we receive any type of response, clear our loading status
   */
  React.useEffect(() => {
    ;(async () => {
      if (privateResponseApi.response) {
        if (privateResponseApi.response.response) {
          const inter = await calculateIntersection({
            response: privateResponseApi.response.response,
            setup: privateResponseApi.response.setup
          })
          setIntersection(inter)
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

  if (!requestContext) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }

  // If no response/setup, then the request is still pending
  return (
    <View>
      <Text style={styles.title}>
        {privateResponseApi.response?.requestName ?? requestName}
      </Text>
      <Button
        title="Delete"
        disabled={privateResponseApi.processing}
        onPress={() => {
          deleteRequest({
            requests: [{ requestId, contextId: requestContext.contextId }]
          })
        }}
      />
      <View>
        <Text>{`Got intersection: [${intersection.join(',')}]`}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16
  },
  title: {
    fontSize: 32
  }
})
