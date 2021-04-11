import * as SecureStore from 'expo-secure-store'
import * as React from 'react'

import { KEYCHAIN_SERVICE } from '../../utils/constants'

type StorageState = {
  hasSecureStorage: boolean
}
/**
 * A hook for a low level API around SecureStorage
 */
export default function useStorage() {
  const [state, setState] = React.useState<StorageState>({
    hasSecureStorage: false
  })

  const storeItem = React.useCallback(
    (key: string, value: string): Promise<void> =>
      SecureStore.setItemAsync(key, value, {
        keychainService: KEYCHAIN_SERVICE,
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
      }),
    []
  )

  const storeObject = React.useCallback(function storeObject<T>(
    key: string,
    value: T
  ): Promise<void> {
    return storeItem(key, JSON.stringify(value))
  },
  [])

  const getItem = React.useCallback((key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key, {
      keychainService: KEYCHAIN_SERVICE
    })
  }, [])

  const getObject = React.useCallback(async function getObject<T>(
    key: string
  ): Promise<T | null> {
    const item = await getItem(key)
    if (!item) {
      return null
    }
    return JSON.parse(item)
  },
  [])

  const deleteItem = React.useCallback((key: string): Promise<void> => {
    return SecureStore.deleteItemAsync(key, {
      keychainService: KEYCHAIN_SERVICE
    })
  }, [])

  const deleteObject = deleteItem

  const storeMap = React.useCallback(function storeMap<T>(
    key: string,
    value: Map<string, T>
  ): Promise<void> {
    const serialized = JSON.stringify([...value.entries()])
    return storeItem(key, serialized)
  },
  [])

  const getMap = React.useCallback(async function getMap<T>(
    key: string
  ): Promise<Map<string, T>> {
    const serialized = await getItem(key)
    if (!serialized) {
      return new Map()
    }
    return new Map(JSON.parse(serialized))
  },
  [])

  // Always check to see if the device supports SecureStorage.
  React.useEffect(() => {
    ;(async () => {
      const hasSecureStorage = await SecureStore.isAvailableAsync()
      setState({
        hasSecureStorage
      })
    })()
  }, [])

  return React.useMemo(
    () =>
      [
        state,
        {
          storeMap,
          getMap,
          storeItem,
          storeObject,
          getItem,
          getObject,
          deleteItem,
          deleteObject
        }
      ] as const,
    [state]
  )
}
