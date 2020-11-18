import 'react-native-get-random-values'
import * as React from 'react'
import PSI from '@openmined/psi.js/combined_wasm_web'
import { PSILibrary } from '@openmined/psi.js/implementation/psi'
import withPsi from '../hoc/withPsi'
import { Client } from '@openmined/psi.js/implementation/client'
import { Request } from '@openmined/psi.js/implementation/proto/psi_pb'
import { Server } from '@openmined/psi.js/implementation/server'
import useRandom from './useRandom'

export default function usePsi() {
  const { getRandomString } = useRandom()

  /**
   * Define our PSI singletons
   *
   * This is our module's PSI WASM instance. There should ever only be
   * a single instance throughout the application lifetime.
   */
  let psi: PSILibrary
  let client: Client
  let server: Server
  let keyMap: Map<string, Uint8Array>
  let requestMap: Map<string, Request>

  /**
   * A function that initializes the PSI library singletons
   */
  const initPSI = async () => {
    if (!psi) {
      psi = await PSI()
      client = psi.client!.createWithNewKey(true)
      server = psi.server!.createWithNewKey(true)
      keyMap = new Map()
      requestMap = new Map()
    }
  }

  /**
   * Create a function wrapper so we can ensure
   * all psi functions reference an initialized
   * psi singleton.
   */
  const usePsi = withPsi(initPSI)

  /**
   * Encrypts a grid and returns the serialized client request
   * @param grid The time-grid to encrypt
   */
  const encryptGrid = async (
    grid: string[]
  ): Promise<readonly [string, Request]> => {
    const key = client.getPrivateKeyBytes()
    const requestId = getRandomString(4)
    const clientRequest = client.createRequest(grid)
    requestMap.set(requestId, clientRequest)
    return [requestId, clientRequest] as const
  }

  return React.useMemo(
    () =>
      ({
        encryptGrid: usePsi(encryptGrid)
      } as const),
    []
  )
}
