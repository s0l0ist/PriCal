import * as React from 'react'

import ExpoNotificationContext, {
  IExpoNotificationContext
} from '../contexts/ExpoNotificationContext'

/**
 * Create a PushToken provider that will give access
 * to a push notification token if permitted. The provider
 * will have the value of the token that will be sent in
 * the payload of a client request.
 */
const ExpoTokenProvider: React.FC<IExpoNotificationContext> = ({
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
