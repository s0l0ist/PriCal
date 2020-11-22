import * as React from 'react'
import * as Base64 from 'base64-js'
import PSI from '@openmined/psi.js/combined_wasm_web'
import { PSILibrary } from '@openmined/psi.js/implementation/psi'
import { Request } from '@openmined/psi.js/implementation/proto/psi_pb'
import useRandom from './useRandom'
import useStorage from './useStorage'
import { CONTEXT_MAP, MAX_KEYS_TO_STORE } from '../constants/Storage'

export default function usePsi() {
  const [isPsiInitialized, setPsiInitialized] = React.useState<boolean>(false)
  const { getRandomStringAsync, getRandomBytesAsync } = useRandom()
  const [, { storeMap, loadMap }] = useStorage()
  /**
   * Define our PSI singletons
   *
   * This is our module's PSI WASM instance. There should ever only be
   * a single instance throughout the application lifetime.
   *
   * A context map is used to track the entire PSI protocol. Initiating the PSI protocol
   * generates an ID which will be used to reference the private key used in the transaction
   * since the application is stateless.
   *
   * Ex: A client makes a request to another client (server) via push notification.
   * When the server has responded, the client will be notified via another push notification
   * and will lookup up the private key that was used in the original request, create a
   * new client instance with the key, and compute the intersection.
   */
  let psi: PSILibrary | undefined = undefined // Singleton
  let contextMap: Map<string, string> // requestId, privateKey

  /**
   * Stores a context entry to secure storage and removes entries if there's no room
   * @param contextId A context to reference the key
   * @param privateKey Private key bytes
   */
  const saveContext = async (contextId: string, privateKey: Uint8Array) => {
    // convert Uint8Array to base64 string
    const base64Key = Base64.fromByteArray(privateKey)
    contextMap = new Map([...contextMap].slice(-(MAX_KEYS_TO_STORE - 1)))
    contextMap.set(contextId, base64Key)
    await storeMap(CONTEXT_MAP, contextMap)
  }

  /**
   * Encrypts a grid and returns the serialized client request
   * @param grid The time-grid to encrypt
   */
  const createClientRequest = async (
    grid: string[]
  ): Promise<readonly [string, Request]> => {
    const contextId = await getRandomStringAsync(4)
    const client = psi!.client!.createWithNewKey(true)
    const privateKey = client.getPrivateKeyBytes()
    const clientRequest = client.createRequest(grid)

    // Persist to our SecureStorage
    await saveContext(contextId, privateKey)

    // Always destroy the client instance to prevent WASM heap buildup
    client.delete()

    return [contextId, clientRequest] as const
  }

  React.useEffect(() => {
    ;(async () => {
      // Fetch from storage
      contextMap = await loadMap(CONTEXT_MAP)

      // Next, load the singleton PSI library
      psi = await PSI()
      setPsiInitialized(true)
    })()
  }, [])

  const processRequest = async () => {}

  return React.useMemo(
    () =>
      [
        isPsiInitialized,
        {
          createClientRequest
        }
      ] as const,
    []
  )
}
