import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import ScheduleDetails from '../components/ScheduleDetails'

export default function ScheduleDetailsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScheduleDetails />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
