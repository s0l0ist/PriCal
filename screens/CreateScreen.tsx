import { StackNavigationProp } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { Text } from 'react-native'

import CreateSchedule from '../components/CreateSchedule'
import CreateView from '../components/CreateView'
import PsiWebView from '../components/PsiWebView'
// import useNotification from '../hooks/useNotification'
import useStorage from '../hooks/store/useStorage'
import usePermissions from '../hooks/usePermissions'
import { SchedulesTabParamList } from '../navigation/BottomTabNavigator'

export type CreateScreenNavigationProp = StackNavigationProp<
  SchedulesTabParamList,
  'SchedulesScreen'
>

const CreateScreen: React.FC = () => {
  const [{ hasPermission, missingPermissions }] = usePermissions()
  const [{ hasSecureStorage }] = useStorage()

  // const [{ expoPushToken }] = useNotification()

  if (!hasPermission) {
    return (
      <CreateView>
        <StatusBar style="dark" />
        <Text>Missing permissions:</Text>
        {missingPermissions.map((x, i) => (
          <Text key={i}>{x.Permission}</Text>
        ))}
      </CreateView>
    )
  }

  if (!hasSecureStorage) {
    return (
      <CreateView>
        <StatusBar style="dark" />
        <Text>This device is not support SecureStorage.</Text>
      </CreateView>
    )
  }

  return (
    <CreateView>
      <StatusBar style="dark" />
      <PsiWebView>
        <CreateSchedule />
      </PsiWebView>
    </CreateView>
  )
}

export default CreateScreen
