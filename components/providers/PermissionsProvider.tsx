import * as React from 'react'

import { PermissionResponse } from '../../hooks/useCalendar'
import PermissionsContext from '../contexts/PermissionsContext'

type PermissionsProviderProps = {
  hasRequiredPermissions: boolean
  hasCalendarPermission: boolean
  hasReminderPermission: boolean
  hasNotificationsPermission: boolean
  missingPermissions: PermissionResponse[]
}
/**
 * This component renders all children if the
 * required permissions are met. Push notifications
 * are not a required permission
 */
const PermissionsProvider: React.FC<PermissionsProviderProps> = ({
  hasRequiredPermissions,
  hasCalendarPermission,
  hasReminderPermission,
  hasNotificationsPermission,
  missingPermissions,
  children
}) => {
  return (
    <PermissionsContext.Provider
      value={{
        hasRequiredPermissions,
        hasCalendarPermission,
        hasReminderPermission,
        hasNotificationsPermission,
        missingPermissions
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export default PermissionsProvider
