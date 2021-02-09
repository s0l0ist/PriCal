import * as Permissions from 'expo-permissions'
import * as React from 'react'

import { PermissionResponse, PermissionsArray } from '../types'

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
  permissionStatuses: PermissionResponse[]
  hasPermission: boolean
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
    permissionStatuses: [],
    hasPermission: false
  })

  const getPermissionStatuses = (
    permissionRequests: PermissionsArray
  ) => async (): Promise<PermissionResponse[]> =>
    await Promise.all(permissionRequests.map(x => x()))

  const getAllPermissionStatuses = React.useMemo(
    () =>
      getPermissionStatuses([
        requestReminderPermission,
        requestCalendarPermission,
        requestNotificationPermission
      ]),
    []
  )

  // Request any permissions prior to any user interaction
  React.useEffect(() => {
    ;(async () => {
      const permissionStatuses = await getAllPermissionStatuses()
      const hasPermission = permissionStatuses.every(x => x.Response.granted)
      setState({
        permissionStatuses,
        hasPermission
      })
    })()
  }, [])

  return React.useMemo(() => [state] as const, [state])
}
