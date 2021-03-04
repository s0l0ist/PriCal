import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'

import PsiWebView from '../components/PsiWebView'
import ApprovalScreen from '../screens/ApprovalScreen'
import NotFoundScreen from '../screens/NotFoundScreen'
import BottomTabNavigator, { RootStackParamList } from './BottomTabNavigator'
import LinkingConfiguration from './LinkingConfiguration'

/**
 * If you are not familiar with React Navigation, we recommend going through the
 * "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
 *
 * We're also wrapping the entire navigtion with our PsiWebView which
 * loads a hidden PSI webview and waits for it to initialize before
 * loading the rest of the application.
 */
export default function Navigation() {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <PsiWebView>
        <RootNavigator />
      </PsiWebView>
    </NavigationContainer>
  )
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const RootStack = createStackNavigator<RootStackParamList>()

function RootNavigator() {
  return (
    <RootStack.Navigator mode="modal" screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Root" component={BottomTabNavigator} />
      <RootStack.Screen
        name="Approval"
        component={ApprovalScreen}
        options={{
          animationEnabled: true,
          title: 'Approve Request',
          cardStyle: { backgroundColor: 'rgba(0, 0, 0, 0.15)' },
          cardOverlayEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => {
            return {
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 0.5, 0.9, 1],
                  outputRange: [0, 0.25, 0.7, 1]
                })
              },
              overlayStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: 'clamp'
                })
              }
            }
          }
        }}
      />
      <RootStack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: 'Oops!' }}
      />
    </RootStack.Navigator>
  )
}
