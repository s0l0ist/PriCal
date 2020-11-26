import * as React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Body from './components/Body'
import useCachedResources from './hooks/useCachedResources'
import usePermissions from './hooks/usePermissions'
import useStorage from './hooks/useStorage'

export default function App() {
  const [hasLoaded] = useCachedResources()
  const [{ hasPermission }] = usePermissions()
  const [{ hasSecureStorage }] = useStorage()

  if (!hasLoaded) {
    return null
  }

  console.log(
    `hasLoaded: ${hasLoaded}, hasPermission: ${hasPermission}, hasSecureStorage: ${hasSecureStorage}`
  )

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
