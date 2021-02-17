import { useFocusEffect } from '@react-navigation/native'
import React from 'react'
import { View, StyleSheet, Text } from 'react-native'

import useGetPrivateResponse from '../hooks/api/useGetPrivateResponse'
import useSync from '../hooks/store/useSync'
import { DetailsScreenRouteProp } from '../navigation/BottomTabNavigator'

type ScheduleDetailsProps = {
  route: DetailsScreenRouteProp
}

const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({
  route: {
    params: { requestId, requestName }
  }
}) => {
  const [api, getResponseDetails] = useGetPrivateResponse()
  const { getRequest } = useSync()

  /**
   * On a manual refresh, we fetch the *private* request details.
   *
   * This means only the device which knows both the requestId
   * and contextId may fetch a person's encrypted schedule.
   *
   * If there's no server Response or Setup, then we're still waiting
   * for the other party to confirm the request.
   */
  const onRefresh = React.useCallback(async () => {
    // Fetch from storage, extract Ids
    const request = await getRequest(requestId)
    // This should never happen as we always stay in sync in the previous screen
    if (!request) {
      throw new Error('Unable to fetch stored request')
    }

    // Fetch the private response information. The response will
    // contain enough information to perform the PSI intersection calulation
    // iff the request was approved by the other party.
    getResponseDetails({
      requestId: request.requestId,
      contextId: request.contextId
    })
  }, [requestId])

  /**
   * When this view comes into focus, we fetch the details
   */
  useFocusEffect(
    React.useCallback(() => {
      // clearRequests() // used for debugging
      onRefresh()
    }, [])
  )

  return (
    <View>
      <Text style={styles.title}>{requestName}</Text>
      <View>
        <Text>{`requestId: ${requestId}`}</Text>
        <Text>{`contextId: ${api.response?.contextId}`}</Text>
        <Text>{`response: ${api.response?.response}`}</Text>
        <Text>{`setup: ${api.response?.setup}`}</Text>
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

export default ScheduleDetails
