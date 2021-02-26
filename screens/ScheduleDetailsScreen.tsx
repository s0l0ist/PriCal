import { StackNavigationProp } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import PsiWebView from '../components/PsiWebView'
import ScheduleDetails from '../components/ScheduleDetails'
import { SchedulesTabParamList } from '../navigation/BottomTabNavigator'

export type SchedulesScreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'ScheduleDetailsScreen'
>

const ScheduleDetailsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <PsiWebView>
        <ScheduleDetails />
      </PsiWebView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default ScheduleDetailsScreen
