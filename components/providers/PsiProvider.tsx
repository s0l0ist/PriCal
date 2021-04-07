import * as React from 'react'
import { View } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import {
  ClientRequest,
  ClientRequestProps,
  ComputeIntersectionProps,
  Intersection,
  ServerResponse,
  ServerResponseProps
} from '../../hooks/usePsiProtocol'
import PsiContext from '../contexts/PsiContext'

type PsiProviderProps = {
  onMessage: (event: WebViewMessageEvent) => void
  createClientRequest: (payload: ClientRequestProps) => Promise<ClientRequest>
  createServerResponse: (
    payload: ServerResponseProps
  ) => Promise<ServerResponse>
  computeIntersection: (
    payload: ComputeIntersectionProps
  ) => Promise<Intersection>
  webviewRef: React.RefObject<WebView<object>>
  uri: string
}
/**
 * Create a PSI WebView component that will load a static site exposing
 * a PSI API. This component will be used as a parent component
 * to wrap children in order to provide the APIs used in the webview
 * parent component. The WebView needs to be rendered in order to
 * interact with it; however, we do not need it other than providing
 * the functionality the JavaScript content provides. Therefore we
 * hide the view by setting the height and width to 0.
 *
 * We use a context to avoid passing the APIs as props to every child
 */
const PsiProvider: React.FC<PsiProviderProps> = ({
  onMessage,
  createClientRequest,
  createServerResponse,
  computeIntersection,
  webviewRef,
  uri,
  children
}) => {
  return (
    <PsiContext.Provider
      value={{
        createClientRequest,
        createServerResponse,
        computeIntersection
      }}
    >
      <View
        style={{
          width: 0,
          height: 0
        }}
      >
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          // This is needed for Android
          allowFileAccess={true}
          source={{ uri }}
          style={{ width: 0, height: 0 }}
          // The first message received should be the initialization
          // command. Afterward, we need to use the other handler.
          onMessage={onMessage}
          onError={() => console.error('error loading page')}
          onLoadStart={() => console.log('started loading page')}
          onLoad={() => {
            console.log('finished loading page')
          }}
        />
      </View>
      {children}
    </PsiContext.Provider>
  )
}

export default PsiProvider
