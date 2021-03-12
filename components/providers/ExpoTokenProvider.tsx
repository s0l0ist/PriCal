import * as React from 'react'

import useNotification from '../../hooks/useNotification'
import ExpoNotificationContext from '../contexts/ExpoNotificationContext'

/**
 * Create a PushToken provider that will give access
 * to a push notification token if permitted. The provider
 * will have the value of the token that will be send in
 * the payload of a client request.
 */
const ExpoTokenProvider: React.FC = ({ children }) => {
  // Declaring the hook will prompt for permissions
  // but since this is not a requirement,
  const [token] = useNotification()

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
