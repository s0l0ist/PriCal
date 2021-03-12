import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as React from 'react'
import { Platform } from 'react-native'

import { PermissionResponse, PERMISSIONS_ENUM } from './useCalendar'

type PermissionsArray = readonly ((
  ...args: (() => Promise<PermissionResponse>)[]
) => Promise<PermissionResponse>)[]

/**
 * Requests for REMINDER permission if not already granted
 */
const requestReminderPermission = async (): Promise<PermissionResponse> => {
  // This permission is really only required for iOS devices as the Expo Calendar library
  // requires this permission in order to just read the calendars.
  if (Platform.OS !== 'ios') {
    return {
      Response: {
        status: Permissions.PermissionStatus.GRANTED,
        expires: 'never' as Permissions.PermissionExpiration,
        granted: true,
        canAskAgain: false
      } as Permissions.PermissionResponse,
      Permission: PERMISSIONS_ENUM.REMINDERS
    }
  }

  const permission = await Permissions.getAsync(Permissions.REMINDERS)
  if (permission.canAskAgain && !permission.granted) {
    const permissionResponse = await Permissions.askAsync(Permissions.REMINDERS)
    return {
      Response: permissionResponse,
      Permission: PERMISSIONS_ENUM.REMINDERS
    }
  }
  return { Response: permission, Permission: PERMISSIONS_ENUM.REMINDERS }
}

/**
 * Requests for CALENDAR permission if not already granted
 */
const requestCalendarPermission = async (): Promise<PermissionResponse> => {
  const permission = await Permissions.getAsync(Permissions.CALENDAR)
  if (permission.canAskAgain && !permission.granted) {
    const permissionResponse = await Permissions.askAsync(Permissions.CALENDAR)
    return {
      Response: permissionResponse,
      Permission: PERMISSIONS_ENUM.CALENDAR
    }
  }
  return { Response: permission, Permission: PERMISSIONS_ENUM.CALENDAR }
}

/**
 * Requests for NOTIFICATIONS permission if not already granted
 */
const requestNotificationPermission = async (): Promise<PermissionResponse> => {
  // If we're in a simulator, simulate a successful grant
  // TODO: remove this check once we test push notifications work.
  if (!Constants.isDevice) {
    return {
      Response: {
        status: Permissions.PermissionStatus.GRANTED,
        expires: 'never' as Permissions.PermissionExpiration,
        granted: true,
        canAskAgain: false
      } as Permissions.PermissionResponse,
      Permission: PERMISSIONS_ENUM.NOTIFICATIONS
    }
  }

  const permission = await Permissions.getAsync(Permissions.NOTIFICATIONS)
  if (permission.canAskAgain && !permission.granted) {
    const permissionResponse = await Permissions.askAsync(
      Permissions.NOTIFICATIONS
    )
    return {
      Response: permissionResponse,
      Permission: PERMISSIONS_ENUM.NOTIFICATIONS
    }
  }
  return { Response: permission, Permission: PERMISSIONS_ENUM.NOTIFICATIONS }
}

type PermissionState = {
  hasAllPermissions: boolean
  hasNotificationsPermission: boolean
  permissionStatuses: PermissionResponse[]
  grantedPermissions: PermissionResponse[]
  missingPermissions: PermissionResponse[]
}

/**
 * Checks if all required permissions have been set.
 *
 * If any of them are unsuccessful, `hasPermission` is false
 * and you should inspect `permissionStatuses` to see
 * which have failed.
 */
export default function usePermissions() {
  const [state, setState] = React.useState<PermissionState>({
    hasAllPermissions: false,
    hasNotificationsPermission: false,
    permissionStatuses: [],
    grantedPermissions: [],
    missingPermissions: []
  })

  const getPermissionStatuses = (
    permissionRequests: PermissionsArray
  ): Promise<PermissionResponse[]> =>
    Promise.all(permissionRequests.map(x => x()))

  // Request any permissions prior to any user interaction
  React.useEffect(() => {
    ;(async () => {
      const permissionStatuses = await getPermissionStatuses([
        requestReminderPermission,
        requestCalendarPermission,
        requestNotificationPermission
      ])

      const grantedPermissions = permissionStatuses.filter(
        x => x.Response.granted
      )
      const missingPermissions = permissionStatuses.filter(
        x => !x.Response.granted
      )

      /**
       * Depending on the device OS, we set the permissions
       */
      const hasCalendarPermission = permissionStatuses
        .filter(x => x.Permission === PERMISSIONS_ENUM.CALENDAR)
        .every(x => x.Response.granted)

      const hasReminderPermission = permissionStatuses
        .filter(x => x.Permission === PERMISSIONS_ENUM.REMINDERS)
        .every(x => x.Response.granted)

      const hasNotificationsPermission = permissionStatuses
        .filter(x => x.Permission === PERMISSIONS_ENUM.NOTIFICATIONS)
        .every(x => x.Response.granted)

      // iOS requires both Calendar and Reminders for the expo-calendar library
      // Andriod only needs Calendar.
      const hasAllPermissions =
        Platform.OS === 'ios'
          ? hasCalendarPermission && hasReminderPermission
          : hasCalendarPermission

      setState({
        hasAllPermissions,
        hasNotificationsPermission,
        permissionStatuses,
        grantedPermissions,
        missingPermissions
      })
    })()
  }, [])

  return React.useMemo(() => [state] as const, [state])
}
