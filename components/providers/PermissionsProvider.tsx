import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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

  if (!hasRequiredPermissions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.column}>
          <Text
            style={styles.helperText}
          >{`You must first enable the following permissions before this app can work:`}</Text>

          <View style={styles.row}>
            <View style={styles.bullet}>
              <Text>{'\u2022'}</Text>
            </View>
            {missingPermissions.map((x, i) => (
              <View key={i} style={styles.bulletText}>
                <Text>
                  <Text style={styles.boldText}>{x.Permission}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    )
  }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'space-between',
    marginTop: '100%'
  },
  helperText: {
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flex: 1,
    margin: 20
  },
  bullet: {
    width: 10,
    marginRight: 10
  },
  bulletText: {
    flex: 1
  },
  boldText: {
    fontWeight: 'bold'
  }
})

export default PermissionsProvider
