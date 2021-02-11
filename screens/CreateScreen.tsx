import * as React from 'react'
import { Text } from 'react-native'

import Body from '../components/Body'
import CreateView from '../components/CreateView'
import useNotification from '../hooks/useNotification'
import usePermissions from '../hooks/usePermissions'
import useStorage from '../hooks/useStorage'

const CreateScreen: React.FC = () => {
  const [{ hasPermission, missingPermissions }] = usePermissions()
  const [{ hasSecureStorage }] = useStorage()
  const [{ expoPushToken }] = useNotification()

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
      <Body />
    </CreateView>
  )
}

export default CreateScreen
