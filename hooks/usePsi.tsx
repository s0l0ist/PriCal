import PSI from '@openmined/psi.js/combined_wasm_web'
import {
  Request,
  Response,
  ServerSetup
} from '@openmined/psi.js/implementation/proto/psi_pb'
import { PSILibrary } from '@openmined/psi.js/implementation/psi'
import * as Base64 from 'base64-js'
import * as React from 'react'

import { CONTEXT_MAP, MAX_KEYS_TO_STORE } from '../constants/Storage'
import useRandom from './useRandom'
import useStorage from './useStorage'

type Context = {
  contextId: string
  privateKey: Uint8Array
}

type ContextMap = Map<string, string>

type PsiState = {
  psi: PSILibrary | undefined
  currentContext: Context | undefined
  contexts: ContextMap
  clientRequest: Request | undefined
  serverResponse: Response | undefined
  serverSetup: ServerSetup | undefined
  intersection: number[]
}

/**
 * Define our PSI library helpers
 *
 * This file holds our module's PSI WASM instance. There should ever only be
 * a single instance throughout the application lifetime.
 *
 * A currentContext map is used to track the entire PSI protocol. Initiating the PSI protocol
 * generates an ID which will be used to reference the client's private key used in the transaction
 * since the application is stateless.
 *
 * Ex: A client makes a request to another client (server) via push notification.
 * When the server has responded, the client will be notified via another push notification
 * and will lookup up the private key that was used in the original request, create a
 * new client instance with the key, and compute the intersection.
 */
export default function usePsi() {
  const [state, setState] = React.useState<PsiState>({
    psi: undefined,
    currentContext: undefined,
    contexts: new Map(),
    clientRequest: undefined,
    serverResponse: undefined,
    serverSetup: undefined,
    intersection: []
  })

  const { getRandomString } = useRandom()
  const [, { storeMap, loadMap }] = useStorage()

  /**
   * [Acting as a Client] Encrypts a grid and returns the serialized client request
   * @param grid The time-grid to encrypt
   */
  const createClientRequest = React.useCallback(
    (grid: string[]) => {
      const contextId = getRandomString(4)
      const client = state.psi!.client!.createWithNewKey(true)
      const privateKey = client.getPrivateKeyBytes()
      const clientRequest = client.createRequest(grid)

      setState(prev => ({
        ...prev,
        currentContext: {
          contextId,
          privateKey
        },
        clientRequest
      }))

      // Always destroy the client instance to prevent WASM heap buildup
      client.delete()
    },
    [state.psi]
  )

  /**
   * [Acting as a Server] Processes the client request and returns both an
   * encrypted server response and server setup generated from a time-grid
   *
   * @param request The client request
   * @param grid The time-grid to generate the setup
   */
  const processRequest = React.useCallback(
    (request: Request, grid: string[]) => {
      const server = state.psi!.server!.createWithNewKey(true)
      const serverResponse = server.processRequest(request)
      const serverSetup = server.createSetupMessage(
        0.001,
        request.getEncryptedElementsList().length,
        grid,
        state.psi!.dataStructure.GCS
      )

      setState(prev => ({
        ...prev,
        serverResponse,
        serverSetup
      }))

      // Always destroy the server instance to prevent WASM heap buildup
      server.delete()
    },
    [state.psi]
  )

  /**
   * [Acting as a Client] Computes the (private) intersection from the
   * server's response and the original client's request
   * @param contextId
   * @param response
   * @param serverSetup
   */
  const computeIntersection = React.useCallback(
    async (contextId: string, response: Response, serverSetup: ServerSetup) => {
      const base64Key = state.contexts.get(contextId)
      if (!base64Key) {
        console.log('Could not find a corresponding currentContext!')
        return []
      }

      const privateKey = Base64.toByteArray(base64Key)
      const client = state.psi!.client!.createFromKey(privateKey, true)

      const intersection = client.getIntersection(serverSetup, response)
      const instersectionSorted = intersection.sort()

      setState(prev => ({
        ...prev,
        intersection: instersectionSorted
      }))
    },
    [state.psi, state.contexts]
  )

  /**
   * Deserializes and returns an instance of a [Client] Response
   * @param binary Serialized Response
   */
  const deserializeResponse = React.useCallback(
    (binary: Uint8Array): Response => {
      return state.psi!.response.deserializeBinary(binary)
    },
    [state.psi]
  )

  /**
   * Deserializes and returns an instance of a [Server] Request
   * @param binary Serialized Request
   */
  const deserializeRequest = React.useCallback(
    (binary: Uint8Array): Request => {
      return state.psi!.request.deserializeBinary(binary)
    },
    [state.psi]
  )

  /**
   * Deserializes and returns an instance of a [Server] ServerSetup
   * @param binary Serialized ServerResponse
   */
  const deserializeServerSetup = React.useCallback(
    (binary: Uint8Array): ServerSetup => {
      return state.psi!.serverSetup.deserializeBinary(binary)
    },
    [state.psi]
  )

  /**
   * Effect to load the library and contexts from SecureStorage
   */
  React.useEffect(() => {
    ;(async () => {
      const [contexts, psi] = await Promise.all([loadMap(CONTEXT_MAP), PSI()])
      setState(prev => ({
        ...prev,
        psi,
        contexts
      }))
    })()
  }, [])

  /**
   * Effect which updates our map of contexts when a new one is detected
   */
  React.useEffect(() => {
    if (state.currentContext) {
      // convert Uint8Array to base64 string
      const base64Key = Base64.fromByteArray(state.currentContext.privateKey)
      const fixedContextMap = new Map(
        [...state.contexts].slice(-(MAX_KEYS_TO_STORE - 1))
      )
      fixedContextMap.set(state.currentContext.contextId, base64Key)

      setState(prev => ({
        ...prev,
        contexts: fixedContextMap
      }))
    }
  }, [state.currentContext])

  /**
   * Effect to persist the contexts when they are updated
   */
  React.useEffect(() => {
    if (state.contexts.size) {
      storeMap(CONTEXT_MAP, state.contexts)
    }
  }, [state.contexts])

  return React.useMemo(
    () =>
      [
        state,
        {
          createClientRequest,
          processRequest,
          computeIntersection,
          deserializeResponse,
          deserializeRequest,
          deserializeServerSetup
        }
      ] as const,
    [state]
  )
}
