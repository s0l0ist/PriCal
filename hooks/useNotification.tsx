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

export default function useNotification() {
  const [token, setPushToken] = React.useState<Notifications.ExpoPushToken>()

  const { hasNotificationsPermission } = React.useContext(PermissionsContext)
  console.log('hasNotificationsPermission', hasNotificationsPermission)
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
   * Effect:
   */
  React.useEffect(() => {
    ;(async () => {
      if (hasNotificationsPermission) {
        if (Constants.isDevice) {
          const token = await Notifications.getExpoPushTokenAsync()
          setPushToken(token)
        } else {
          console.info(
            'Running in a simulator, setting dummy push notification token'
          )
          setPushToken(DUMMY_TOKEN)
        }
      }
    })()

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
  }, [hasNotificationsPermission])

  return React.useMemo(() => [token] as const, [token])
}
