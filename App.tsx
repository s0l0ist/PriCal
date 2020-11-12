import * as React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Body from './components/Body'
import useCachedResources from './hooks/useCachedResources'
import usePermissions from './hooks/usePermissions'

export default function App() {
  const isLoadingComplete = useCachedResources()
  const { hasPermission } = usePermissions()

  if (!isLoadingComplete) {
    return null
  }

  if (!hasPermission) {
    console.log('we dont have permission!')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PriCal</Text>
      <View style={styles.separator} />
      <Body />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    backgroundColor: '#eee',
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
})
