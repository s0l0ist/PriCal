import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { StyleSheet, SafeAreaView } from 'react-native'

import Settings from '../components/Settings'

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Settings />
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
})
