import * as React from 'react'

import { PermissionResponse } from '../../hooks/useCalendar'

/**
 * The type can be undefined if the user denies permission
 */
export type PermissionsContextProps = {
  hasAllPermissions: boolean
  hasNotificationsPermission: boolean
  missingPermissions: PermissionResponse[]
  hasSecureStorage: boolean
}

/**
 * We use a context for the application permissions to share these across all components of
 * the application.
 */
const PermissionsContext = React.createContext<PermissionsContextProps>({
  hasAllPermissions: false,
  hasNotificationsPermission: false,
  missingPermissions: [],
  hasSecureStorage: false
})

export default PermissionsContext
