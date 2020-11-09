import * as Calendar from 'expo-calendar'

export type PermissionResponse = {
  Response: Calendar.PermissionResponse
  Permission: string
}

/**
 * Requests for REMINDER permission if not already granted
 */
export const hasReminderPermission = async (): Promise<PermissionResponse> => {
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
export const hasCalendarPermission = async (): Promise<PermissionResponse> => {
  const calendarPermissions = await Calendar.getCalendarPermissionsAsync()
  if (calendarPermissions.canAskAgain && !calendarPermissions.granted) {
    const calendarPermissionsResponse = await Calendar.requestCalendarPermissionsAsync()
    return { Response: calendarPermissionsResponse, Permission: 'CALENDAR' }
  }
  return { Response: calendarPermissions, Permission: 'CALENDAR' }
}
