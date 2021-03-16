import * as React from 'react'

import useStorage from '../../hooks/store/useStorage'
import usePermissions from '../../hooks/usePermissions'
import PermissionsContext from '../contexts/PermissionsContext'

/**
 * This component renders all children if the
 * required permissions are met. Push notifications
 * are not a required permission
 */
const PermissionsProvider: React.FC = ({ children }) => {
  const [
    {
      hasRequiredPermissions,
      hasCalendarPermission,
      hasReminderPermission,
      hasNotificationsPermission,
      missingPermissions
    }
  ] = usePermissions()
  const [{ hasSecureStorage }] = useStorage()

  return (
    <PermissionsContext.Provider
      value={{
        hasRequiredPermissions,
        hasCalendarPermission,
        hasReminderPermission,
        hasNotificationsPermission,
        missingPermissions,
        hasSecureStorage
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export default PermissionsProvider
