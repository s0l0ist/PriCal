import PSI from '@openmined/psi.js/combined_wasm_web'
import {
  Request,
  Response,
  ServerSetup
} from '@openmined/psi.js/implementation/proto/psi_pb'
import { PSILibrary } from '@openmined/psi.js/implementation/psi'
import * as Base64 from 'base64-js'
import * as React from 'react'

import useRandom from './useRandom'

type PsiState = {
  psi: PSILibrary | undefined
}
type base64 = string

export type Context = {
  contextId: string
  privateKey: base64
  clientRequest: base64
}

export type ServerResponse = {
  serverSetup: base64
  serverResponse: base64
}

/**
 * Create a singleton instance as we shouldn't instantiate
 * more than 1 WASM instance in the application's lifecycle
 */
let psi: PSILibrary

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
    psi: undefined
  })

  const { getRandomString } = useRandom()

  /**
   * [Acting as a Client] Encrypts a grid and returns the serialized client request
   * @param grid The time-grid to encrypt
   */
  const createClientRequest = React.useCallback(
    (grid: string[]) => {
      const contextId = getRandomString(4)
      const client = state.psi!.client!.createWithNewKey(true)
      const privateKey = Base64.fromByteArray(client.getPrivateKeyBytes())
      const clientRequest = Base64.fromByteArray(
        client.createRequest(grid).serializeBinary()
      )

      // Always destroy the client instance to prevent WASM heap buildup
      client.delete()

      return {
        contextId,
        privateKey,
        clientRequest
      } as Context
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
  const createServerResponse = React.useCallback(
    (request: base64, grid: string[]) => {
      const clientRequest = deserializeRequest(request)
      const server = state.psi!.server!.createWithNewKey(true)
      const serverResponse = Base64.fromByteArray(
        server.processRequest(clientRequest).serializeBinary()
      )
      const serverSetup = Base64.fromByteArray(
        server
          .createSetupMessage(
            0.001,
            clientRequest.getEncryptedElementsList().length,
            grid,
            state.psi!.dataStructure.GCS
          )
          .serializeBinary()
      )

      // Always destroy the server instance to prevent WASM heap buildup
      server.delete()

      return {
        serverResponse,
        serverSetup
      } as ServerResponse
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
    (key: base64, response: base64, setup: base64) => {
      const privateKey = Base64.toByteArray(key)
      const client = state.psi!.client!.createFromKey(privateKey, true)
      const serverResponse = deserializeResponse(response)
      const serverSetup = deserializeServerSetup(setup)
      const intersection = client.getIntersection(serverSetup, serverResponse)
      client.delete()
      return intersection.sort()
    },
    [state.psi]
  )

  /**
   * Deserializes and returns an instance of a [Client] Response
   * @param binary Serialized Response
   */
  const deserializeResponse = React.useCallback(
    (response: base64): Response => {
      return state.psi!.response.deserializeBinary(Base64.toByteArray(response))
    },
    [state.psi]
  )

  /**
   * Deserializes and returns an instance of a [Server] Request
   * @param binary Serialized Request
   */
  const deserializeRequest = React.useCallback(
    (request: base64): Request => {
      return state.psi!.request.deserializeBinary(Base64.toByteArray(request))
    },
    [state.psi]
  )

  /**
   * Deserializes and returns an instance of a [Server] ServerSetup
   * @param binary Serialized ServerResponse
   */
  const deserializeServerSetup = React.useCallback(
    (setup: base64): ServerSetup => {
      return state.psi!.serverSetup.deserializeBinary(Base64.toByteArray(setup))
    },
    [state.psi]
  )

  /**
   * Effect: On mount, initialize the PSI library and set the state
   */
  React.useEffect(() => {
    ;(async () => {
      if (!psi) {
        console.log('psi loading')
        psi = await PSI()
      }
      setState(prev => ({
        ...prev,
        psi
      }))
    })()
  }, [])

  return React.useMemo(() => {
    return {
      createClientRequest,
      createServerResponse,
      computeIntersection,
      deserializeResponse,
      deserializeRequest,
      deserializeServerSetup
    } as const
  }, [state.psi])
}
