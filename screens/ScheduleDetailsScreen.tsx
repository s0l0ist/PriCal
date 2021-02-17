import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import ScheduleDetails from '../components/ScheduleDetails'
import {
  DetailsScreenRouteProp,
  SchedulesTabParamList
} from '../navigation/BottomTabNavigator'

export type DetailscreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'DetailsScreen'
>

type SchedulesScreenProps = {
  route: DetailsScreenRouteProp
}

const ScheduleDetailsScreen: React.FC<SchedulesScreenProps> = ({ route }) => {
  // When this screen comes into view, refresh
  return (
    <View style={styles.container}>
      <ScheduleDetails route={route} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default ScheduleDetailsScreen
