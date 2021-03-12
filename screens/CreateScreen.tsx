import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import CreateSchedule from '../components/CreateSchedule'

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PriCal</Text>
      <StatusBar style="dark" />
      <CreateSchedule />
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
  }
})
