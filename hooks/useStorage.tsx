import * as SecureStore from 'expo-secure-store'
import * as React from 'react'
import { KEYCHAIN_SERVICE } from '../constants/Storage'

export default function useStorage() {
  const [hasSecureStorage, setHasSecureStorage] = React.useState<boolean>(false)

  const isStorageAvailable = async (): Promise<boolean> => {
    return await SecureStore.isAvailableAsync()
  }

  const storeItem = async (key: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(key, value, {
      keychainService: KEYCHAIN_SERVICE,
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
    })
  }

  const getItem = async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key, {
      keychainService: KEYCHAIN_SERVICE
    })
  }

  const deleteItem = async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key, {
      keychainService: KEYCHAIN_SERVICE
    })
  }

  const storeMap = async (key: string, value: Map<any, any>): Promise<void> => {
    const serialized = JSON.stringify([...value.entries()])
    return storeItem(key, serialized)
  }

  const loadMap = async (key: string): Promise<Map<any, any>> => {
    const serialized = await getItem(key)
    if (!serialized) {
      return new Map()
    }
    return new Map(JSON.parse(serialized))
  }

  // Always check to see if the device supports SecureStorage.
  React.useEffect(() => {
    ;(async () => {
      const isAvailable = await isStorageAvailable()
      setHasSecureStorage(isAvailable)
    })()
  }, [])

  return React.useMemo(
    () =>
      [
        hasSecureStorage,
        {
          storeMap,
          loadMap,
          storeItem,
          getItem,
          deleteItem
        }
      ] as const,
    [hasSecureStorage, storeMap, loadMap, storeItem, getItem, deleteItem]
  )
}
