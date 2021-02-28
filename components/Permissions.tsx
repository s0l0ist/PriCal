import * as React from 'react'
import { Text } from 'react-native'

import useStorage from '../hooks/store/useStorage'
import useNotification from '../hooks/useNotification'
import usePermissions from '../hooks/usePermissions'

/**
 * This screen is used to wrap all the others
 */
const Permissions: React.FC = ({ children }) => {
  const [{ hasPermission, missingPermissions }] = usePermissions()
  const [{ hasSecureStorage }] = useStorage()
  useNotification()

  if (!hasPermission) {
    return (
      <>
        <Text>Missing permissions:</Text>
        {missingPermissions.map((x, i) => (
          <Text key={i}>{x.Permission}</Text>
        ))}
      </>
    )
  }

  if (!hasSecureStorage) {
    return (
      <>
        <Text>This device is not support SecureStorage.</Text>
      </>
    )
  }

  return <>{children}</>
}

export default Permissions
