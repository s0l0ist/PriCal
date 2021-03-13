import { useFocusEffect, useNavigation } from '@react-navigation/native'
import React from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ListRenderItemInfo,
  Pressable
} from 'react-native'

import useListRequests, {
  ListRequestResponse,
  ListRequestResponses
} from '../hooks/api/useListRequests'
import useSync from '../hooks/store/useSync'
import { SchedulesScreenNavigationProp } from '../navigation/BottomTabNavigator'
import { compare } from '../utils/compare'

export default function Schedules() {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [pullLoading, setPullLoading] = React.useState<boolean>(false)
  const [requestsApi, listRequests] = useListRequests()
  const { getRequests, filterRequests } = useSync()

  const navigation = useNavigation<SchedulesScreenNavigationProp>()

  /**
   * Refresh the list of requests from storage
   * and sync them to what the cloud has. If the cloud returns
   * fewer requests, we need to throw away our stale data.
   */
  const onRefresh = React.useCallback(async () => {
    // If we're already refreshing, ignore the request
    if (requestsApi.processing) {
      return
    }
    // fetch from storage
    const requests = await getRequests()
    // extract Ids
    const requestIds = [...requests.keys()]

    // If there were no Ids stored, we can just skip this call
    // as there's nothing to fetch and nothing to update
    if (!requestIds) {
      return
    }
    // TODO: Update with information about availability
    listRequests({
      requestIds
    })
  }, [])

  /**
   * When the user pulls down to refres, we set a different loading state
   */
  const onPullRefresh = () => {
    setPullLoading(true)
    onRefresh()
  }

  /**
   * Effect: Always accept the server as the source of truth.
   * we purge any stale items in storage that aren't reflected
   * by the server.
   */
  React.useEffect(() => {
    ;(async () => {
      if (requestsApi.response) {
        const requestIds = requestsApi.response.map(x => x.requestId)
        await filterRequests(requestIds)
        setLoading(false)
        setPullLoading(false)
      }
    })()
  }, [requestsApi.response])

  React.useEffect(() => {
    if (requestsApi.error) {
      setLoading(false)
      setPullLoading(false)
    }
  }, [requestsApi.error])

  /**
   * Effect: On screen/component focus, we refresh the list
   * but we do not animate the flatlist.
   */
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true)
      onRefresh()
    }, [])
  )

  /**
   * Compose a sort function for requests
   */
  const sortedRequests = React.useCallback(
    (requests: ListRequestResponses) =>
      [...requests.values()].filter(x => x.requestId).sort(compareRequestName),
    []
  )
  /**
   * Compose a comparator for `requestName`
   */
  const compareRequestName = React.useCallback(
    (a: ListRequestResponse, b: ListRequestResponse) =>
      compare(a, b, 'requestName'),
    []
  )

  const requests = React.useMemo(
    () => sortedRequests(requestsApi.response ?? []),
    [requestsApi.response]
  )

  const Schedule = React.useCallback(
    ({
      requestName,
      requestId
    }: {
      requestName: string
      requestId: string
    }) => (
      <Pressable
        onPress={() => {
          // Navigate to the details route with params
          navigation.navigate('ScheduleDetailsScreen', {
            requestId,
            requestName
          })
        }}
      >
        <View style={styles.item}>
          <Text style={styles.title}>{requestName}</Text>
          <Text>Tap to view</Text>
        </View>
      </Pressable>
    ),
    []
  )

  const renderItem = React.useCallback(
    (request: ListRenderItemInfo<ListRequestResponse>) => (
      <Schedule
        requestName={request.item.requestName}
        requestId={request.item.requestId}
      />
    ),
    []
  )

  return (
    <View style={styles.container}>
      {requestsApi.completed && !requests.length && (
        <View>
          <Text>You have no requests</Text>
        </View>
      )}

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={x => x.requestId}
        onRefresh={onPullRefresh}
        refreshing={pullLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
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
