import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { StyleSheet, SafeAreaView } from 'react-native'

import CreateSchedule from '../components/CreateSchedule'

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <CreateSchedule />
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
})
