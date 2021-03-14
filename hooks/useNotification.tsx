import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import * as React from 'react'

import PermissionsContext from '../components/contexts/PermissionsContext'

const DUMMY_TOKEN = {
  type: 'expo',
  data: 'dummy_expo_push_token'
} as Notifications.ExpoPushToken

/**
 * Define how all notifications will present to on
 * the device
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

/**
 * A hook for interfacing with the notifications API
 */
export default function useNotification() {
  const [token, setPushToken] = React.useState<Notifications.ExpoPushToken>()

  const { hasNotificationsPermission } = React.useContext(PermissionsContext)

  /**
   * Handler when the device receives a notification
   */
  const notificationReceivedHandler = React.useCallback(
    (note: Notifications.Notification): void => {
      console.log('Notification received:', note)
    },
    []
  )

  /**
   * Handler when the user interacts with the notification (aka the reponse)
   */
  const notificationReponseReceivedHandler = React.useCallback(
    (response: Notifications.NotificationResponse): void => {
      console.log('Notification response received:', response)
    },
    []
  )

  /**
   * Effect: If the user has granted permissions, get the notification token.
   * This token will be in the client request payload. When the other party
   * accepts the request, the cloud will send a notification
   */
  React.useEffect(() => {
    ;(async () => {
      // Ensure we have permission and not running in a simulator
      if (hasNotificationsPermission && Constants.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync()
        setPushToken(token)
      }
    })()
  }, [hasNotificationsPermission])

  /**
   * Effect: Create our handlers on mount. These can always be created, but they
   * will not fire unless the user grants notifications permission.
   */
  React.useEffect(() => {
    // Set our listener handlers
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
      notificationReceivedHandler
    )
    const notificationResponseReceivedSubscription = Notifications.addNotificationResponseReceivedListener(
      notificationReponseReceivedHandler
    )

    // Cleanup on unmount
    return () => {
      notificationReceivedSubscription.remove()
      notificationResponseReceivedSubscription.remove()
    }
  }, [])

  return React.useMemo(() => [token] as const, [token])
}
