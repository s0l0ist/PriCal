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

/**
 * Component to list all schedule requests
 */
export default function Schedules() {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [listRequestsApi, listRequests] = useListRequests()
  const { getRequests, filterRequests } = useSync()

  const navigation = useNavigation<SchedulesScreenNavigationProp>()

  /**
   * Refresh the list of requests from storage
   * and sync them to what the cloud has. If the cloud returns
   * fewer requests, we need to throw away our stale data.
   */
  const onRefresh = React.useCallback(async () => {
    // If we're already refreshing, ignore the request
    if (listRequestsApi.processing) {
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
    setLoading(true)
    onRefresh()
  }

  /**
   * Effect: Always accept the server as the source of truth.
   * we purge any stale items in storage that aren't reflected
   * by the server.
   */
  React.useEffect(() => {
    ;(async () => {
      if (listRequestsApi.response) {
        const requestIds = listRequestsApi.response.map(x => x.requestId)
        await filterRequests(requestIds)
        setLoading(false)
      }
      if (listRequestsApi.error) {
        setLoading(false)
      }
    })()
  }, [listRequestsApi.response, listRequestsApi.error])

  /**
   * Effect: On screen/component focus, we refresh the list
   * but we do not animate the flatlist.
   */
  useFocusEffect(
    React.useCallback(() => {
      onRefresh()
    }, [])
  )

  const requests = React.useMemo(
    () => sortedRequests(listRequestsApi.response ?? []),
    [listRequestsApi.response]
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toDateString()
  }

  const Schedule = ({
    requestName,
    requestId,
    createdAt,
    updatedAt
  }: {
    requestName: string
    requestId: string
    createdAt: string
    updatedAt?: string
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
        <Text>{formatDate(createdAt)}</Text>
        {updatedAt && <Text>{`Updated At: ${formatDate(updatedAt)}`}</Text>}
      </View>
    </Pressable>
  )

  const renderItem = (request: ListRenderItemInfo<ListRequestResponse>) => (
    <Schedule
      requestName={request.item.requestName}
      requestId={request.item.requestId}
      createdAt={request.item.createdAt}
      updatedAt={request.item.updatedAt}
    />
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={x => x.requestId}
        onRefresh={onPullRefresh}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {listRequestsApi.completed && !requests.length && (
              <Text style={styles.emptyText}>You have no requests</Text>
            )}
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%'
  },
  emptyContainer: {
    flex: 1,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 17
  },
  item: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 20,
    marginTop: 8,
    marginHorizontal: 8
  },
  title: {
    fontSize: 32
  }
})

/**
 * Compose a sort function for requests
 */
function sortedRequests(requests: ListRequestResponses) {
  return [...requests.values()].filter(x => x.requestId).sort(compareCreatedAt)
}

/**
 * Compose a comparator for `createdAt`
 */
function compareCreatedAt(a: ListRequestResponse, b: ListRequestResponse) {
  return compare(a, b, 'createdAt')
}
