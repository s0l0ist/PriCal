import EventEmitter from 'eventemitter3'
import * as React from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import useRandom from './useRandom'

const INITIALIZED_COMAND_ID = 'INITIALIZED'

/**
 * Type alias to 'see' that the string should be base64 encoded
 */
type base64 = string

/**
 * Prop types for our APIs
 */
export type InitializedProps = {
  initialized: boolean
}

export type ClientRequestProps = {
  grid: string[]
}

export type ServerResponseProps = {
  request: base64
  grid: string[]
}

export type ComputeIntersectionProps = {
  key: base64
  response: base64
  setup: base64
}

/**
 * Return types for our APIs
 */
export type ClientRequest = {
  contextId: string
  privateKey: base64
  clientRequest: base64
}

export type ServerResponse = {
  serverSetup: base64
  serverResponse: base64
}

export type Intersection = {
  intersection: number[]
}

export enum PSI_COMMAND_TYPES {
  INITIALIZED = 'INITIALIZED',
  CREATE_REQUEST = 'CREATE_REQUEST',
  CREATE_RESPONSE = 'CREATE_RESPONSE',
  COMPUTE_INTERSECTION = 'COMPUTE_INTERSECTION'
}

export type PSI_INITIALIZED_COMMAND = {
  id: string
  type: PSI_COMMAND_TYPES.INITIALIZED
  payload: InitializedProps
}

type PSI_CREATE_REQUEST_COMMAND = {
  id: string
  type: PSI_COMMAND_TYPES.CREATE_REQUEST
  payload: ClientRequestProps
}

type PSI_CREATE_RESPONSE_COMMAND = {
  id: string
  type: PSI_COMMAND_TYPES.CREATE_RESPONSE
  payload: ServerResponseProps
}

type PSI_COMPUTE_INTERSECTION_COMMAND = {
  id: string
  type: PSI_COMMAND_TYPES.COMPUTE_INTERSECTION
  payload: ComputeIntersectionProps
}

type COMMAND =
  | PSI_INITIALIZED_COMMAND
  | PSI_CREATE_REQUEST_COMMAND
  | PSI_CREATE_RESPONSE_COMMAND
  | PSI_COMPUTE_INTERSECTION_COMMAND

/**
 * A hook for interfacing with the PSI Protocol. Since WASM
 * is not supported in react-native, we communicate with the
 * PSI library loaded in a WebView. This hook accepts a
 * reference to a WebView in order to decouple the API
 * from the component which renders the WebView.
 */
export default function usePsiProtocol({
  webviewRef
}: {
  webviewRef: React.RefObject<WebView<object>>
}) {
  const [loaded, setLoaded] = React.useState<boolean>(false)
  const listener = React.useRef<EventEmitter>()
  const { getRandomString } = useRandom()
  /**
   * Define an internal function to send commands to the WebView
   */
  const sendMessage = (command: COMMAND) => {
    webviewRef.current!.postMessage(JSON.stringify(command))
  }

  /**
   * Define a handler which takes in an event from the WebView
   * and sends it back to our listener via the payload's ID
   *
   * This should be passed into the WebView's `onMessage` handler
   */
  const onMessage = (event: WebViewMessageEvent) => {
    const payload = JSON.parse(event.nativeEvent.data) as COMMAND
    listener.current!.emit(payload.id, payload)
  }

  /**
   * Define a handler that sends a payload to the WevView
   * and returns a promise holding the WebView's response
   */
  async function firePromise<T>(payload: any) {
    const data = await new Promise(resolve => {
      // Create a temporary listener for the `id`
      // This promise will return with the WebView's response
      listener.current!.once(payload.id, (payload: any) => {
        resolve(payload)
      })

      // Fire the message to the WebView!
      sendMessage(payload)
    })

    return data as T
  }

  /**
   * Create and expose the 3 PSI APIs that we want to bridge.
   */
  const createClientRequest = (
    payload: ClientRequestProps
  ): Promise<ClientRequest> => {
    const message = {
      id: getRandomString(4),
      type: PSI_COMMAND_TYPES.CREATE_REQUEST,
      payload
    } as PSI_CREATE_REQUEST_COMMAND

    return firePromise<ClientRequest>(message)
  }

  const createServerResponse = async (
    payload: ServerResponseProps
  ): Promise<ServerResponse> => {
    const message = {
      id: getRandomString(4),
      type: PSI_COMMAND_TYPES.CREATE_RESPONSE,
      payload
    } as PSI_CREATE_RESPONSE_COMMAND

    return firePromise<ServerResponse>(message)
  }

  const computeIntersection = async (
    payload: ComputeIntersectionProps
  ): Promise<Intersection> => {
    const message = {
      id: getRandomString(4),
      type: PSI_COMMAND_TYPES.COMPUTE_INTERSECTION,
      payload
    } as PSI_COMPUTE_INTERSECTION_COMMAND

    return firePromise<Intersection>(message)
  }

  /**
   * Effect: Create our listener on mount and remove any listeners on unmount
   */
  React.useEffect(() => {
    listener.current = new EventEmitter()

    // Listen for the one-time init message
    listener.current.once(PSI_COMMAND_TYPES.INITIALIZED, () => setLoaded(true))

    return () => {
      listener.current!.removeAllListeners()
    }
  }, [])

  return React.useMemo(
    () =>
      [
        loaded,
        {
          onMessage,
          createClientRequest,
          createServerResponse,
          computeIntersection
        }
      ] as const,
    [
      loaded,
      webviewRef,
      onMessage,
      createClientRequest,
      createServerResponse,
      computeIntersection
    ]
  )
}