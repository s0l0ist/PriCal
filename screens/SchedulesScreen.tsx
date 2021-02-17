import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import Schedules from '../components/Schedules'
import { SchedulesTabParamList } from '../navigation/BottomTabNavigator'

export type SchedulesScreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'ScheduleDetailsScreen'
>

type SchedulesScreenProps = {
  navigation: SchedulesScreenNavigationProp
}

const SchedulesScreen: React.FC<SchedulesScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Schedules navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default SchedulesScreen
