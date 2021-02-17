import { useFocusEffect } from '@react-navigation/native'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import useGetPrivateResponse from '../hooks/api/useGetPrivateResponse'
import useSync from '../hooks/store/useSync'

type ScheduleDetailsProps = {
  requestId: string
}

const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({ requestId }) => {
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
    // If there were no Ids stored, we can just skip this call
    // as there's nothing to fetch and nothing to update
    if (!request) {
      throw new Error('Unable to fetch stored request')
    }

    // Fetch the private response information
    getResponseDetails({
      requestId: request.requestId,
      contextId: request.contextId
    })
  }, [requestId])

  /**
   * When this view comes into focus, we should refresh
   * the list of Requests
   */
  useFocusEffect(
    React.useCallback(() => {
      // clearRequests() // used for debugging
      onRefresh()
    }, [])
  )

  return (
    <View>
      <TouchableOpacity disabled={api.processing} onPress={onRefresh}>
        <Text>
          Tap here to create a client request, send it and compute the
          intersection
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default ScheduleDetails
