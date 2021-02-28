import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import Schedules from '../components/Schedules'

export default function SchedulesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Schedules />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
