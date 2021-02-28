import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import * as React from 'react'

import { EXPO_NOTIFICATION_TOKEN } from '../constants/Storage'
import useStorage from './store/useStorage'

type NotificationState = {
  expoPushToken: Notifications.ExpoPushToken | undefined
  notification: Notifications.Notification | undefined
  notificationResponse: Notifications.NotificationResponse | undefined
}

const DUMMY_TOKEN = {
  type: 'expo',
  data: 'dummy_expo_push_token'
} as Notifications.ExpoPushToken

export default function useNotification() {
  const [, { storeObject, getObject }] = useStorage()

  const [state, setState] = React.useState<NotificationState>({
    expoPushToken: undefined,
    notification: undefined,
    notificationResponse: undefined
  })

  const notificationReceivedHandler = React.useCallback(
    (note: Notifications.Notification): void => {
      console.log('Notification received:', note)
      setState(prev => ({
        ...prev,
        notification: note
      }))
    },
    []
  )

  const notificationReponseReceivedHandler = React.useCallback(
    (response: Notifications.NotificationResponse): void => {
      console.log('Notification response received:', response)
      setState(prev => ({
        ...prev,
        notificationResponse: response
      }))
    },
    []
  )

  React.useEffect(() => {
    ;(async () => {
      if (Constants.isDevice) {
        // Get the token from storage, if it doesn't exist, get it and store it
        let token = await getObject<Notifications.ExpoPushToken>(
          EXPO_NOTIFICATION_TOKEN
        )
        // If no token, then fetch one
        if (!token) {
          token = await Notifications.getExpoPushTokenAsync()
          await storeObject<Notifications.ExpoPushToken>(
            EXPO_NOTIFICATION_TOKEN,
            token
          )
        }
        // If the token is the dummy token, then fetch a real one
        if (JSON.stringify(token) === JSON.stringify(DUMMY_TOKEN)) {
          token = await Notifications.getExpoPushTokenAsync()
          await storeObject<Notifications.ExpoPushToken>(
            EXPO_NOTIFICATION_TOKEN,
            token
          )
        }

        setState(prev => ({
          ...prev,
          expoPushToken: token!
        }))
      } else {
        console.info(
          'Running in a simulator, setting dummy push notification token'
        )
        setState(prev => ({
          ...prev,
          expoPushToken: DUMMY_TOKEN
        }))
      }
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

  return React.useMemo(() => [state] as const, [state])
}
