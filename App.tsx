import * as React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import Body from './components/Body'
import useCachedResources from './hooks/useCachedResources'
import useNotification from './hooks/useNotification'
import usePermissions from './hooks/usePermissions'
import useStorage from './hooks/useStorage'

export default function App() {
  const [hasLoaded] = useCachedResources()
  const [{ hasPermission, missingPermissions }] = usePermissions()
  const [{ hasSecureStorage }] = useStorage()
  const [{ expoPushToken }] = useNotification()

  if (!hasLoaded) {
    return null
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>PriCal</Text>
        <View style={styles.separator} />
        {missingPermissions.map((x, i) => (
          <Text key={i}>Missing permission: {x.Permission}</Text>
        ))}
      </View>
    )
  }

  if (!hasSecureStorage) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>PriCal</Text>
        <View style={styles.separator} />
        <Text>This device is not support SecureStorage.</Text>
      </View>
    )
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
