import * as React from 'react'
import * as Base64 from 'base64-js'
import PSI from '@openmined/psi.js/combined_wasm_web'
import { PSILibrary } from '@openmined/psi.js/implementation/psi'
import {
  Request,
  Response,
  ServerSetup
} from '@openmined/psi.js/implementation/proto/psi_pb'
import useRandom from './useRandom'
import useStorage from './useStorage'
import { CONTEXT_MAP, MAX_KEYS_TO_STORE } from '../constants/Storage'

type Context = {
  contextId: string
  privateKey: Uint8Array
}

type ContextMap = Map<string, string>

type ServerResponseAndSetup = {
  response: Response
  setup: ServerSetup
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
  const [psi, setPsi] = React.useState<PSILibrary>()
  const [currentContext, setCurrentContext] = React.useState<Context>()
  const [contexts, setContexts] = React.useState<ContextMap>(new Map())
  const [clientRequest, setClientRequest] = React.useState<Request>()
  const [serverResponseAndSetup, setServerResponseAndSetup] = React.useState<
    ServerResponseAndSetup
  >()
  const [intersection, setIntersection] = React.useState<number[]>([])
  const { getRandomString } = useRandom()
  const [, { storeMap, loadMap }] = useStorage()

  /**
   * [Acting as a Client] Encrypts a grid and returns the serialized client request
   * @param grid The time-grid to encrypt
   */
  const createClientRequest = React.useCallback(
    (grid: string[]) => {
      const contextId = getRandomString(4)
      const client = psi!.client!.createWithNewKey(true)
      const privateKey = client.getPrivateKeyBytes()
      const clientRequest = client.createRequest(grid)

      setCurrentContext({
        contextId,
        privateKey
      })
      setClientRequest(clientRequest)

      // Always destroy the client instance to prevent WASM heap buildup
      client.delete()
    },
    [psi]
  )

  /**
   * [Acting as a Server] Processes the client request and returns both an
   * encrypted server response and server setup generated from a time-grid
   *
   * @param request The client request
   * @param grid: The time-grid to generate the setup
   */
  const processRequest = React.useCallback(
    (request: Request, grid: string[]) => {
      const server = psi!.server!.createWithNewKey(true)
      const serverResponse = server.processRequest(request)
      const serverSetup = server.createSetupMessage(
        0.001,
        request.getEncryptedElementsList().length,
        grid,
        psi!.dataStructure.GCS
      )

      setServerResponseAndSetup({
        response: serverResponse,
        setup: serverSetup
      })

      // Always destroy the server instance to prevent WASM heap buildup
      server.delete()
    },
    [psi]
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
      const base64Key = contexts.get(contextId)
      if (!base64Key) {
        console.log('Could not find a corresponding currentContext!')
        return []
      }

      const privateKey = Base64.toByteArray(base64Key)
      const client = psi!.client!.createFromKey(privateKey, true)

      const intersection = client.getIntersection(serverSetup, response)
      const instersectionSorted = intersection.sort()
      setIntersection(instersectionSorted)
    },
    [psi, contexts]
  )

  /**
   * Deserializes and returns an instance of a [Client] Response
   * @param binary Serialized Response
   */
  const deserializeResponse = (binary: Uint8Array): Response => {
    return psi!.response.deserializeBinary(binary)
  }

  /**
   * Deserializes and returns an instance of a [Server] Request
   * @param binary Serialized Request
   */
  const deserializeRequest = (binary: Uint8Array): Request => {
    return psi!.request.deserializeBinary(binary)
  }

  /**
   * Deserializes and returns an instance of a [Server] ServerSetup
   * @param binary Serialized ServerResponse
   */
  const deserializeServerSetup = (binary: Uint8Array): ServerSetup => {
    return psi!.serverSetup.deserializeBinary(binary)
  }

  /**
   * Effect to load the library and contexts from SecureStorage
   */
  React.useEffect(() => {
    ;(async () => {
      const [cxtMap, psiLib] = await Promise.all([loadMap(CONTEXT_MAP), PSI()])
      setContexts(cxtMap)
      setPsi(psiLib)
    })()
  }, [])

  /**
   * Effect which updates our map of contexts when a new one is detected
   */
  React.useEffect(() => {
    if (currentContext) {
      // convert Uint8Array to base64 string
      const base64Key = Base64.fromByteArray(currentContext.privateKey)
      const fixedContextMap = new Map(
        [...contexts].slice(-(MAX_KEYS_TO_STORE - 1))
      )
      fixedContextMap.set(currentContext.contextId, base64Key)
      setContexts(fixedContextMap)
    }
  }, [currentContext])

  /**
   * Effect to persist the contexts when they are updated
   */
  React.useEffect(() => {
    if (contexts.size) {
      storeMap(CONTEXT_MAP, contexts)
    }
  }, [contexts])

  return React.useMemo(
    () =>
      [
        currentContext,
        clientRequest,
        serverResponseAndSetup,
        intersection,
        {
          createClientRequest,
          processRequest,
          computeIntersection,
          deserializeResponse,
          deserializeRequest,
          deserializeServerSetup
        }
      ] as const,
    [psi, currentContext, clientRequest, serverResponseAndSetup, intersection]
  )
}
