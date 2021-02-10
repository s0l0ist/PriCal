import React from 'react'
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  ListRenderItemInfo
} from 'react-native'

import { RequestMap, RequestMapRecord } from '../hooks/useSchedule'

// Simulated data
const REQUESTS: RequestMap = new Map([
  [
    'request_1',
    {
      requestId: 'request_1',
      contextId: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      requestName: 'First Item'
    }
  ],
  [
    'request_2',
    {
      requestId: 'request_2',
      contextId: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      requestName: 'Second Item'
    }
  ],
  [
    'request_3',
    {
      requestId: 'request_3',
      contextId: '58694a0f-3da1-471f-bd96-145571e29d72',
      requestName: 'Third Item'
    }
  ]
])

const Item = ({ title }: { title: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
)

const compare = (a: RequestMapRecord, b: RequestMapRecord) => {
  // Use toUpperCase() to ignore character casing
  const nameA = a.requestName.toUpperCase()
  const nameB = b.requestName.toUpperCase()
  let comparison = 0
  if (nameA > nameB) {
    comparison = 1
  } else if (nameA < nameB) {
    comparison = -1
  }
  return comparison
}

export default function App() {
  const renderItem = (request: ListRenderItemInfo<RequestMapRecord>) => (
    <Item title={request.item.requestName} />
  )

  const sortedRequests = [...REQUESTS.values()].sort(compare)
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sortedRequests}
        renderItem={renderItem}
        keyExtractor={x => x.requestId}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight ?? 0
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
