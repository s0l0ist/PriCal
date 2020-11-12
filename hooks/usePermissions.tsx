import * as Calendar from 'expo-calendar'
import * as React from 'react'
import { PermissionResponse, PermissionsArray } from '../types'

/**
 * Requests for REMINDER permission if not already granted
 */
const requestReminderPermission = async (): Promise<PermissionResponse> => {
  const reminderPermissions = await Calendar.getRemindersPermissionsAsync()
  if (reminderPermissions.canAskAgain && !reminderPermissions.granted) {
    const reminderPermissionsResponse = await Calendar.requestRemindersPermissionsAsync()
    return { Response: reminderPermissionsResponse, Permission: 'REMINDERS' }
  }
  return { Response: reminderPermissions, Permission: 'REMINDERS' }
}

/**
 * Requests for CALENDAR permission if not already granted
 */
const requestCalendarPermission = async (): Promise<PermissionResponse> => {
  const calendarPermissions = await Calendar.getCalendarPermissionsAsync()
  if (calendarPermissions.canAskAgain && !calendarPermissions.granted) {
    const calendarPermissionsResponse = await Calendar.requestCalendarPermissionsAsync()
    return { Response: calendarPermissionsResponse, Permission: 'CALENDAR' }
  }
  return { Response: calendarPermissions, Permission: 'CALENDAR' }
}

export default function usePermissions() {
  const [permissionStatuses, setPermissionStatuses] = React.useState<
    Array<PermissionResponse>
  >([])
  const [hasPermission, setHasPermission] = React.useState<boolean>(false)

  const getPermissionStatuses = (
    permissionRequests: PermissionsArray
  ) => async (): Promise<PermissionResponse[]> =>
    await Promise.all(permissionRequests.map(x => x()))

  const getAllPermissionStatuses = React.useMemo(
    () =>
      getPermissionStatuses([
        requestReminderPermission,
        requestCalendarPermission
      ]),
    []
  )

  // Request any permissions prior to any user interaction
  React.useEffect(() => {
    ;(async () => {
      const statuses = await getAllPermissionStatuses()
      setPermissionStatuses(statuses)
      setHasPermission(statuses.every(x => x.Response.granted))
    })()
  }, [])

  return React.useMemo(
    () => ({
      permissionStatuses,
      hasPermission
    }),
    [permissionStatuses, hasPermission] as const
  )
}
