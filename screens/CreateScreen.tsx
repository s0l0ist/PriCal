import { StackNavigationProp } from '@react-navigation/stack'
import * as React from 'react'
import { Text } from 'react-native'

import CreateSchedule from '../components/CreateSchedule'
import CreateView from '../components/CreateView'
// import useNotification from '../hooks/useNotification'
import useStorage from '../hooks/store/useStorage'
import usePermissions from '../hooks/usePermissions'
import { CreateTabParamList } from '../navigation/BottomTabNavigator'

export type CreateScreenNavigationProp = StackNavigationProp<
  CreateTabParamList,
  'LinkScreen'
>

type CreateScreenProps = {
  navigation: CreateScreenNavigationProp
}

const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  const [{ hasPermission, missingPermissions }] = usePermissions()
  const [{ hasSecureStorage }] = useStorage()
  // const [{ expoPushToken }] = useNotification()

  if (!hasPermission) {
    return (
      <CreateView>
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
        <Text>This device is not support SecureStorage.</Text>
      </CreateView>
    )
  }

  return (
    <CreateView>
      <CreateSchedule navigation={navigation} />
    </CreateView>
  )
}

export default CreateScreen
