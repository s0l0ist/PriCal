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
  ListRequestResponse
} from '../hooks/api/useListRequests'
import { compare } from '../utils/compare'

const Item = ({ title }: { title: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
)

const compareRequestName = (a: ListRequestResponse, b: ListRequestResponse) => {
  return compare(a, b, 'requestName')
}

const ListSchedules: React.FC = () => {
  const [api, listRequests] = useListRequests()

  const onRefresh = () => {
    console.log('refreshed flatlist')
    listRequests({
      requestIds: ['602af93c262d8cf5567a8fc3', '602ad0fbdfa1256bc3374d33']
    })
  }
  const renderItem = (request: ListRenderItemInfo<ListRequestResponse>) => (
    <Item title={request.item.requestName} />
  )
  const sortedRequests = [...api.response.values()]
    .filter(x => x.requestId)
    .sort(compareRequestName)

  return (
    <View>
      <FlatList
        data={sortedRequests}
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
