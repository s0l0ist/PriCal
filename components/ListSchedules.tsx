import { useFocusEffect } from '@react-navigation/native'
import React from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ListRenderItemInfo,
  TouchableOpacity
} from 'react-native'

import useListRequests, {
  ListRequestResponse,
  ListRequestResponses
} from '../hooks/api/useListRequests'
import useSync from '../hooks/store/useSync'
import { compare } from '../utils/compare'

const Item = ({ title }: { title: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
)
const renderItem = (request: ListRenderItemInfo<ListRequestResponse>) => (
  <Item title={request.item.requestName} />
)

const ListSchedules: React.FC = () => {
  const [api, listRequests] = useListRequests()
  const { getRequests, filterRequests } = useSync()

  /**
   * On a manual refresh, we load our requests from storage
   * and sync them to what the server has. If the server returns
   * fewer requests, we need to throw away our stale data
   */
  const onRefresh = React.useCallback(async () => {
    // Fetch from storage, extract Ids
    const requestIds = [...(await getRequests()).keys()]
    console.log('refreshing requestIds', requestIds)
    // If there were no Ids stored (first time user), we can just skip this call
    // as there's nothing to fetch.
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
   * When this tab comes into focus, we should refresh
   * the list of Requests
   */
  useFocusEffect(
    React.useCallback(() => {
      // clearRequests() // used for debugging
      onRefresh()
    }, [])
  )

  /**
   * Compose a comparator for `requestName`
   */
  const compareRequestName = React.useCallback(
    (a: ListRequestResponse, b: ListRequestResponse) =>
      compare(a, b, 'requestName'),
    []
  )

  const sortedRequests = React.useCallback(
    (requests: ListRequestResponses) =>
      [...requests.values()].filter(x => x.requestId).sort(compareRequestName),
    []
  )

  const requests = sortedRequests(api.response ?? [])

  return (
    <View>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={x => x.requestId}
        onRefresh={() => onRefresh()}
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

export default ListSchedules
