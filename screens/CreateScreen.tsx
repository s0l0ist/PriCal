import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import CreateSchedule from '../components/CreateSchedule'
import Permissions from '../components/Permissions'

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Permissions>
        <Text style={styles.title}>PriCal</Text>
        <StatusBar style="dark" />
        <CreateSchedule />
      </Permissions>
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
