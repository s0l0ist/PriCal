import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'

import CreateScreen from '../screens/CreateScreen'
import SchedulesScreen from '../screens/SchedulesScreen'

export type RootStackParamList = {
  Root: undefined
  NotFound: undefined
}

export type BottomTabParamList = {
  Create: undefined
  Schedules: undefined
}

export type CreateTabParamList = {
  CreateScreen: undefined
}

export type SchedulesTabParamList = {
  SchedulesScreen: undefined
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const CreateTabStack = createStackNavigator<CreateTabParamList>()

function CreateTabNavigator(props: any) {
  return (
    <CreateTabStack.Navigator>
      <CreateTabStack.Screen
        name="CreateScreen"
        component={CreateScreen}
        options={{ headerTitle: 'Create a Request' }}
      />
    </CreateTabStack.Navigator>
  )
}

const SchedulesTabStack = createStackNavigator<SchedulesTabParamList>()

function SchedulesTabNavigator() {
  return (
    <SchedulesTabStack.Navigator>
      <SchedulesTabStack.Screen
        name="SchedulesScreen"
        component={SchedulesScreen}
        options={{ headerTitle: 'Active Schedule Requests' }}
      />
    </SchedulesTabStack.Navigator>
  )
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>()

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

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name']
  color: string
}) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />
}
