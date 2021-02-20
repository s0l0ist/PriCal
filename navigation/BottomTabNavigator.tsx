import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { RouteProp } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'

import CreateScreen from '../screens/CreateScreen'
import LinkScreen from '../screens/LinkScreen'
import ScheduleDetailsScreen from '../screens/ScheduleDetailsScreen'
import SchedulesScreen from '../screens/SchedulesScreen'

/**
 * Type for the root navigation stack
 */
export type RootStackParamList = {
  Root: undefined
  NotFound: undefined
  Approval: {
    requestId: string
  }
}

/**
 * Type for the bottom tabs
 */
export type BottomTabParamList = {
  Create: undefined
  Schedules: undefined
}

/**
 * Type for the create tab params
 */
export type CreateTabParamList = {
  CreateScreen: undefined
  LinkScreen: {
    requestId: string
  }
}

/**
 * Type for the schedules tab params
 */
export type SchedulesTabParamList = {
  SchedulesScreen: undefined
  ScheduleDetailsScreen: {
    requestId: string
    requestName: string
  }
}

/**
 * Type for the schedule details screen route
 */
export type ScheduleDetailsScreenRouteProp = RouteProp<
  SchedulesTabParamList,
  'ScheduleDetailsScreen'
>

/**
 * Type for the link screen route
 */
export type LinkScreenRouteProp = RouteProp<CreateTabParamList, 'LinkScreen'>

/**
 * Type for the approval screen route
 */
export type ApprovalScreenRouteProp = RouteProp<RootStackParamList, 'Approval'>

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const BottomTab = createBottomTabNavigator<BottomTabParamList>()
const CreateTabStack = createStackNavigator<CreateTabParamList>()
const SchedulesTabStack = createStackNavigator<SchedulesTabParamList>()

/**
 * The main bottom tab navigation which defines the individual tabs
 */
export default function BottomTabNavigator() {
  return (
    <BottomTab.Navigator initialRouteName="Create">
      <BottomTab.Screen
        name="Create"
        component={CreateTabNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-add" color={color} />
        }}
      />
      <BottomTab.Screen
        name="Schedules"
        component={SchedulesTabNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="ios-list" color={color} />
          )
        }}
      />
    </BottomTab.Navigator>
  )
}

/**
 * The create tab and its child screens
 */
function CreateTabNavigator() {
  return (
    <CreateTabStack.Navigator>
      <CreateTabStack.Screen
        name="CreateScreen"
        component={CreateScreen}
        options={{ headerTitle: 'Create a Request' }}
      />
      <CreateTabStack.Screen
        name="LinkScreen"
        component={LinkScreen}
        options={{ headerTitle: 'Send your link' }}
      />
    </CreateTabStack.Navigator>
  )
}

/**
 * The schedules tab and its child screens
 */
function SchedulesTabNavigator() {
  return (
    <SchedulesTabStack.Navigator>
      <SchedulesTabStack.Screen
        name="SchedulesScreen"
        component={SchedulesScreen}
        options={{ headerTitle: 'Active Schedule Requests' }}
      />
      <SchedulesTabStack.Screen
        name="ScheduleDetailsScreen"
        component={ScheduleDetailsScreen}
        options={{ headerTitle: 'Schedule Details' }}
      />
    </SchedulesTabStack.Navigator>
  )
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name']
  color: string
}) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />
}
