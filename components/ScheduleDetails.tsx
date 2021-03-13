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
import WebViewContext from './contexts/WebViewContext'

export default function ScheduleDetails() {
  const [requestContext, setRequestContext] = React.useState<Request>()
  const [intersection, setIntersection] = React.useState<number[]>([])
  const [responseApi, getResponseDetails] = useGetPrivateResponse()
  const [deleteResponseApi, deleteRequest] = useDeleteRequest()
  const { getRequest, removeRequest } = useSync()

  const context = React.useContext(WebViewContext)! // This *will* be defined
  const { getIntersection } = useSchedule(context)

  const {
    params: { requestId, requestName }
  } = useRoute<ScheduleDetailsScreenRouteProp>()
  const navigation = useNavigation<SchedulesScreenNavigationProp>()

  /**
   * Effect: on mount, fetch the context from local storage
   */
  React.useEffect(() => {
    ;(async () => {
      // Fetch the request storage
      const request = await getRequest(requestId)
      // This should never happen as we always stay in sync in the previous screen
      if (!request) {
        throw new Error('Unable to fetch stored request')
      }
      setRequestContext(request)
      return () => {
        setRequestContext(undefined)
      }
    })()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      if (deleteResponseApi.response) {
        // If successful, then delete from storage
        await removeRequest(requestId)
        navigation.goBack()
      }
    })()
  }, [deleteResponseApi.response])
  /**
   * On a manual refresh, we fetch the *private* request details.
   *
   * This means only the device which knows both the requestId
   * and contextId may fetch a person's PSI-encrypted schedule.
   *
   * If there's no server Response or Setup, then we're still waiting
   * for the other party to confirm the request.
   */
  const onRefresh = React.useCallback(async () => {
    if (requestContext) {
      // Fetch the private response information. The response will
      // contain enough information to perform the PSI intersection calulation
      // iff the request was approved by the other party.
      getResponseDetails({
        requestId: requestContext.requestId,
        contextId: requestContext.contextId
      })
    }
  }, [requestContext])

  /**
   * Effect: Refresh the details our list if props change
   * This is useful when we open deep links
   */
  React.useEffect(() => {
    onRefresh()
  }, [requestContext, requestId, requestName])

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

  React.useEffect(() => {
    ;(async () => {
      if (responseApi.response?.response && responseApi.response?.setup) {
        const inter = await calculateIntersection({
          response: responseApi.response.response,
          setup: responseApi.response.setup
        })
        setIntersection(inter)
      }
    })()
  }, [responseApi.response])

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
        {responseApi.response?.requestName ?? requestName}
      </Text>
      <View>
        <Text>{`Your request is pending approval`}</Text>
      </View>
      <Button
        title="Delete"
        disabled={responseApi.processing}
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
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16
  },
  title: {
    fontSize: 32
  }
})
