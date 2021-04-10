import * as React from 'react'

import { PermissionResponse } from '../../hooks/useCalendar'

/**
 * The type can be undefined if the user denies permission
 */
export interface IPermissionsContext {
  hasRequiredPermissions: boolean
  hasCalendarPermission: boolean
  hasReminderPermission: boolean
  hasNotificationsPermission: boolean
  missingPermissions: PermissionResponse[]
}

/**
 * We use a context for the application permissions to share these across all components of
 * the application.
 */
const PermissionsContext = React.createContext<IPermissionsContext>({
  hasRequiredPermissions: false,
  hasCalendarPermission: false,
  hasReminderPermission: false,
  hasNotificationsPermission: false,
  missingPermissions: []
})

export default PermissionsContext
