import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { RouteProp } from '@react-navigation/native'
import {
  createStackNavigator,
  StackNavigationProp
} from '@react-navigation/stack'
import * as React from 'react'

import CreateScreen from '../screens/CreateScreen'
import ScheduleDetailsScreen from '../screens/ScheduleDetailsScreen'
import SchedulesScreen from '../screens/SchedulesScreen'
import SettingsScreen from '../screens/SettingsScreen'

/**
 * Types for our navigation hierarchy from the root tree (left to right)
 */
export type RootStackParamList = {
  Root: undefined
  NotFound: undefined
  Approval: {
    requestId: string
  }
}
export type BottomTabParamList = {
  Settings: undefined
  Create: undefined
  Schedules: undefined
}
export type SettingsTabParamList = {
  SettingsScreen: undefined
}
export type CreateTabParamList = {
  CreateScreen: undefined
}
export type SchedulesTabParamList = {
  SchedulesScreen: undefined
  ScheduleDetailsScreen: {
    requestId: string
    requestName: string
  }
}

/**
 * Types for the useNavigation hook used throughout the app
 */
export type ApprovalScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Root'
>
export type NotFoundScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NotFound'
>
export type CreateScreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'SchedulesScreen'
>
export type SchedulesScreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'ScheduleDetailsScreen'
>
/**
 * Types for the useRoute hook used throughout the app
 */
export type ApprovalScreenRouteProp = RouteProp<RootStackParamList, 'Approval'>
export type ScheduleDetailsScreenRouteProp = RouteProp<
  SchedulesTabParamList,
  'ScheduleDetailsScreen'
>

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const BottomTab = createBottomTabNavigator<BottomTabParamList>()
const SettingsTabStack = createStackNavigator<SettingsTabParamList>()
const CreateTabStack = createStackNavigator<CreateTabParamList>()
const SchedulesTabStack = createStackNavigator<SchedulesTabParamList>()

/**
 * The main bottom tab navigation which defines the individual tabs
 */
export default function BottomTabNavigator() {
  return (
    <BottomTab.Navigator initialRouteName="Create" lazy={true}>
      <BottomTab.Screen
        name="Settings"
        component={SettingsTabNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="ios-settings" color={color} />
          )
        }}
      />
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
 * The settings tab and its child screens
 */
function SettingsTabNavigator() {
  return (
    <SettingsTabStack.Navigator>
      <SettingsTabStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings'
        }}
      />
    </SettingsTabStack.Navigator>
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
        options={{
          headerTitle: 'Create a Request'
        }}
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
        options={{
          headerTitle: 'Active Schedule Requests'
        }}
      />
      <SchedulesTabStack.Screen
        name="ScheduleDetailsScreen"
        component={ScheduleDetailsScreen}
        options={{
          headerTitle: 'Schedule Details'
        }}
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
