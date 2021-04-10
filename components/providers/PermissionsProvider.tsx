import * as React from 'react'

import PermissionsContext, {
  IPermissionsContext
} from '../contexts/PermissionsContext'

/**
 * This component renders all children if the
 * required permissions are met. Push notifications
 * are not a required permission
 */
const PermissionsProvider: React.FC<IPermissionsContext> = ({
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
