import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as React from 'react'

import { PermissionResponse } from './useCalendar'

type PermissionsArray = readonly ((
  ...args: any[]
) => Promise<PermissionResponse>)[]

/**
 * Requests for REMINDER permission if not already granted
 */
const requestReminderPermission = async (): Promise<PermissionResponse> => {
  const permission = await Permissions.getAsync(Permissions.REMINDERS)
  if (permission.canAskAgain && !permission.granted) {
    const permissionResponse = await Permissions.askAsync(Permissions.REMINDERS)
    return { Response: permissionResponse, Permission: 'REMINDERS' }
  }
  return { Response: permission, Permission: 'REMINDERS' }
}

/**
 * Requests for CALENDAR permission if not already granted
 */
const requestCalendarPermission = async (): Promise<PermissionResponse> => {
  const permission = await Permissions.getAsync(Permissions.CALENDAR)
  if (permission.canAskAgain && !permission.granted) {
    const permissionResponse = await Permissions.askAsync(Permissions.CALENDAR)
    return { Response: permissionResponse, Permission: 'CALENDAR' }
  }
  return { Response: permission, Permission: 'CALENDAR' }
}

/**
 * Requests for NOTIFICATIONS permission if not alreday granted
 */
const requestNotificationPermission = async (): Promise<PermissionResponse> => {
  // If we're in a simulator, simulate a successful grant
  if (!Constants.isDevice) {
    return {
      Response: {
        status: Permissions.PermissionStatus.GRANTED,
        expires: 'never' as Permissions.PermissionExpiration,
        granted: true,
        canAskAgain: false
      } as Permissions.PermissionResponse,
      Permission: 'NOTIFICATIONS'
    }
  }

  const permission = await Permissions.getAsync(Permissions.NOTIFICATIONS)
  if (permission.canAskAgain && !permission.granted) {
    const permissionResponse = await Permissions.askAsync(
      Permissions.NOTIFICATIONS
    )
    return { Response: permissionResponse, Permission: 'NOTIFICATIONS' }
  }
  return { Response: permission, Permission: 'NOTIFICATIONS' }
}

type PermissionState = {
  hasPermission: boolean
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
    hasPermission: false,
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
      const hasPermission = permissionStatuses.every(x => x.Response.granted)
      const grantedPermissions = permissionStatuses.filter(
        x => x.Response.granted
      )
      const missingPermissions = permissionStatuses.filter(
        x => !x.Response.granted
      )
      setState({
        hasPermission,
        permissionStatuses,
        grantedPermissions,
        missingPermissions
      })
    })()
  }, [])

  return React.useMemo(() => [state] as const, [state])
}
