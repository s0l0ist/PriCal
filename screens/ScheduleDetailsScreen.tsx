import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import ScheduleDetails from '../components/ScheduleDetails'
import { SchedulesTabParamList } from '../navigation/BottomTabNavigator'

export type SchedulesScreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'ScheduleDetailsScreen'
>

const ScheduleDetailsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScheduleDetails />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default ScheduleDetailsScreen
