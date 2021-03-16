import * as React from 'react'

import { PermissionResponse } from '../../hooks/useCalendar'

/**
 * The type can be undefined if the user denies permission
 */
export type PermissionsContextProps = {
  hasRequiredPermissions: boolean
  hasCalendarPermission: boolean
  hasReminderPermission: boolean
  hasNotificationsPermission: boolean
  missingPermissions: PermissionResponse[]
  hasSecureStorage: boolean
}

/**
 * We use a context for the application permissions to share these across all components of
 * the application.
 */
const PermissionsContext = React.createContext<PermissionsContextProps>({
  hasRequiredPermissions: false,
  hasCalendarPermission: false,
  hasReminderPermission: false,
  hasNotificationsPermission: false,
  missingPermissions: [],
  hasSecureStorage: false
})

export default PermissionsContext
