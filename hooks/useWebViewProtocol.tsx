import EventEmitter from 'eventemitter3'
import * as React from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import useRandom from './useRandom'

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

export type Intersection = {
  intersection: number[]
}

enum PSI_COMMAND_TYPES {
  CREATE_REQUEST = 'CREATE_REQUEST',
  CREATE_RESPONSE = 'CREATE_RESPONSE',
  COMPUTE_INTERSECTION = 'COMPUTE_INTERSECTION'
}

interface PSI_CREATE_REQUEST_COMMAND {
  id: string
  type: PSI_COMMAND_TYPES.CREATE_REQUEST
  payload: {
    grid: string[]
  }
}

interface PSI_CREATE_RESPONSE_COMMAND {
  id: string
  type: PSI_COMMAND_TYPES.CREATE_RESPONSE
  payload: {
    request: base64
    grid: string[]
  }
}

interface PSI_COMPUTE_INTERSECTION_COMMAND {
  id: string
  type: PSI_COMMAND_TYPES.COMPUTE_INTERSECTION
  payload: {
    key: base64
    response: base64
    setup: base64
  }
}

type COMMAND =
  | PSI_CREATE_REQUEST_COMMAND
  | PSI_CREATE_RESPONSE_COMMAND
  | PSI_COMPUTE_INTERSECTION_COMMAND

export default function useWebViewProtocol({
  webviewRef
}: {
  webviewRef: React.RefObject<WebView<object>>
}) {
  const listener = React.useRef(new EventEmitter())
  const { getRandomString } = useRandom()
  /**
   * Define an internal function to send commands to the WebView
   */
  const sendMessage = React.useCallback(
    (command: COMMAND) => {
      console.log('sending message to WebView')
      webviewRef.current?.postMessage(JSON.stringify(command))
    },
    [webviewRef]
  )

  /**
   * Define a handler which takes in an event from the WebView
   * and triggers our listener.
   *
   * This should be passed into the WebView's `onMessage` handler
   */
  const onMessage = (event: WebViewMessageEvent) => {
    const payload = JSON.parse(event.nativeEvent.data)
    listener.current!.emit(payload.id, payload)
  }

  /**
   *
   */
  const firePromise = React.useCallback(
    async function firePromise<T>(payload: any) {
      const data = await new Promise(resolve => {
        // Create a temporary listener for the `id`
        // This promise will return with the WebView's response
        listener.current!.once(payload.id, (payload: any) => {
          resolve(payload)
        })

        // Fire the message to the WebView
        sendMessage(payload)
      })

      return data as T
    },
    [sendMessage]
  )

  const createClientRequest = (grid: string[]) => {
    const payload = {
      id: getRandomString(4),
      type: PSI_COMMAND_TYPES.CREATE_REQUEST,
      payload: {
        grid
      }
    } as PSI_CREATE_REQUEST_COMMAND

    return firePromise<Context>(payload)
  }

  const createServerResponse = async (request: base64, grid: string[]) => {
    const id = getRandomString(4)
    const payload = {
      id,
      type: PSI_COMMAND_TYPES.CREATE_RESPONSE,
      payload: {
        request,
        grid
      }
    } as PSI_CREATE_RESPONSE_COMMAND

    return firePromise<ServerResponse>(payload)
  }

  const computeIntersection = async (
    key: string,
    response: string,
    setup: string
  ) => {
    const id = getRandomString(4)
    const payload = {
      id,
      type: PSI_COMMAND_TYPES.COMPUTE_INTERSECTION,
      payload: {
        key,
        response,
        setup
      }
    } as PSI_COMPUTE_INTERSECTION_COMMAND

    return firePromise<Intersection>(payload)
  }

  /**
   * Ensure we remve all listeners on unmount
   */
  React.useEffect(() => {
    return () => {
      listener.current.removeAllListeners()
    }
  }, [listener])

  return React.useMemo(
    () =>
      ({
        onMessage,
        createClientRequest,
        createServerResponse,
        computeIntersection
      } as const),
    [
      webviewRef,
      onMessage,
      createClientRequest,
      createServerResponse,
      computeIntersection
    ]
  )
}
