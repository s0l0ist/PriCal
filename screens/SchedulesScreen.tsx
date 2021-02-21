import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import Schedules from '../components/Schedules'
import { SchedulesTabParamList } from '../navigation/BottomTabNavigator'

export type SchedulesScreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'ScheduleDetailsScreen'
>

const SchedulesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Schedules />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default SchedulesScreen
