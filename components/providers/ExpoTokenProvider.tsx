import { ExpoPushToken } from 'expo-notifications'
import * as React from 'react'

import ExpoNotificationContext from '../contexts/ExpoNotificationContext'

type ExpoTokenProviderProps = {
  token: ExpoPushToken | undefined
}
/**
 * Create a PushToken provider that will give access
 * to a push notification token if permitted. The provider
 * will have the value of the token that will be sent in
 * the payload of a client request.
 */
const ExpoTokenProvider: React.FC<ExpoTokenProviderProps> = ({
  token,
  children
}) => {
  return (
    <ExpoNotificationContext.Provider
      value={{
        token
      }}
    >
      {children}
    </ExpoNotificationContext.Provider>
  )
}

export default ExpoTokenProvider
