import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ListRenderItemInfo,
  TouchableOpacity,
  Pressable
} from 'react-native'

import useListRequests, {
  ListRequestResponse,
  ListRequestResponses
} from '../hooks/api/useListRequests'
import useSync from '../hooks/store/useSync'
import { SchedulesScreenNavigationProp } from '../screens/SchedulesScreen'
import { compare } from '../utils/compare'

const Schedules: React.FC = () => {
  const [api, listRequests] = useListRequests()
  const { getRequests, filterRequests } = useSync()

  const navigation = useNavigation<SchedulesScreenNavigationProp>()

  /**
   * On a manual refresh, we load our requests from storage
   * and sync them to what the server has. If the server returns
   * fewer requests, we need to throw away our stale data
   */
  const onRefresh = React.useCallback(async () => {
    // If we're already refreshing, ignore the request
    if (api.processing) {
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
    // Fetch the latest server data
    listRequests({
      requestIds
    })
  }, [])

  /**
   * Effect: Always accept the server as the source of truth.
   * we purge any stale items in storage that aren't reflected
   * by the server.
   */
  React.useEffect(() => {
    if (api.response) {
      const requestIds = api.response.map(x => x.requestId)
      filterRequests(requestIds)
    }
  }, [api.response])

  /**
   * Effect: On component mount, refresh our schedules
   */
  React.useEffect(() => {
    onRefresh()
  }, [])

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

  const requests = React.useMemo(() => sortedRequests(api.response ?? []), [
    api.response
  ])

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
    <View>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={x => x.requestId}
        onRefresh={onRefresh}
        refreshing={api.processing}
      />
      <TouchableOpacity disabled={api.processing} onPress={onRefresh}>
        <Text>
          Tap here to create a client request, send it and compute the
          intersection
        </Text>
      </TouchableOpacity>
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

export default Schedules
