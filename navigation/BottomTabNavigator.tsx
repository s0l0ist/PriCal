import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'

import CreateScreen from '../screens/CreateScreen'
import RequestsScreen from '../screens/SchedulesScreen'

export type RootStackParamList = {
  Root: undefined
  NotFound: undefined
}

export type BottomTabParamList = {
  Create: undefined
  Requests: undefined
}

export type CreateTabParamList = {
  CreateScreen: undefined
}

export type RequestsTabParamList = {
  RequestsScreen: undefined
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
        name="Requests"
        component={RequestsTabNavigator}
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

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const CreateTabStack = createStackNavigator<CreateTabParamList>()

function CreateTabNavigator() {
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

const RequestsTabStack = createStackNavigator<RequestsTabParamList>()

function RequestsTabNavigator() {
  return (
    <RequestsTabStack.Navigator>
      <RequestsTabStack.Screen
        name="RequestsScreen"
        component={RequestsScreen}
        options={{ headerTitle: 'Active Requests' }}
      />
    </RequestsTabStack.Navigator>
  )
}
