import { ExpoPushToken } from 'expo-notifications'
import * as React from 'react'

/**
 * The type can be undefined if the user denies permission
 */
export interface IExpoNotificationContext {
  token: ExpoPushToken | undefined
}

/**
 * We use a context for push notification tokens since the application needs
 * to function even if the push notification persmissions were not granted or were revoked.
 *
 * The application will use the context to check if there's a token. If not, then the requestor
 * will not receive a notification when the other party approves the request (and produces a response).
 *
 * Instead, the requestor will need to poll/refresh the list of events to 'guess'.
 */
const ExpoNotificationContext = React.createContext<IExpoNotificationContext>({
  token: undefined
})

export default ExpoNotificationContext
