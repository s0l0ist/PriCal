import React from 'react'
import { View, StyleSheet } from 'react-native'

import ListSchedules from '../components/ListSchedules'

const SchedulesScreen: React.FC = () => {
  // When this screen comes into view, refresh
  return (
    <View style={styles.container}>
      <ListSchedules />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default SchedulesScreen
