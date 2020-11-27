import * as Notifications from 'expo-notifications'
import * as React from 'react'
import { EXPO_NOTIFICATION_TOKEN } from '../constants/Storage'
import useStorage from './useStorage'

export default function useNotification() {
  const [, { storeItem, getItem }] = useStorage()

  const [expoPushToken, setExpoNotificationToken] = React.useState<string>('')
  const [
    notification,
    setNotification
  ] = React.useState<Notifications.Notification>()

  const [
    notificationResponse,
    setNotificationResponse
  ] = React.useState<Notifications.NotificationResponse>()

  const notificationReceivedHandler = React.useCallback(
    (notification: Notifications.Notification): void => {
      console.log('Notification received:', notification)
      setNotification(notification)
    },
    []
  )

  const notificationReponseReceivedHandler = React.useCallback(
    (response: Notifications.NotificationResponse): void => {
      console.log('Notification response received:', response)
      setNotificationResponse(response)
    },
    []
  )

  React.useEffect(() => {
    ;(async () => {
      // Get the token from storage, if it doesn't exist, get it and store it
      let token = await getItem(EXPO_NOTIFICATION_TOKEN)
      if (!token) {
        const { data } = await Notifications.getExpoPushTokenAsync()
        token = data
        await storeItem(EXPO_NOTIFICATION_TOKEN, token)
      }
      setExpoNotificationToken(token)
    })()

    // Set our listener handlers
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
      notificationReceivedHandler
    )
    const notificationResponseReceivedSubscription = Notifications.addNotificationResponseReceivedListener(
      notificationReponseReceivedHandler
    )

    // Set our destructors
    return () => {
      Notifications.removeNotificationSubscription(
        notificationReceivedSubscription
      )
      Notifications.removeNotificationSubscription(
        notificationResponseReceivedSubscription
      )
    }
  }, [])

  return React.useMemo(() => [notification, notificationResponse] as const, [
    notification,
    notificationResponse
  ])
}
