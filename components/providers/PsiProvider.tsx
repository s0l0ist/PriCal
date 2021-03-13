import * as React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

import useWebViewProtocol from '../../hooks/useWebViewProtocol'
import WebViewContext from '../contexts/WebViewContext'

/**
 * Create a WebView component that will load the static site exposing
 * a PSI API. This component will be used as a parent component
 * to wrap children in order to provide the APIs used in the webview
 * parent component. The WebView needs to be rendered in order to
 * interact with it; however, we do not need it other than providing
 * the functionality the JavaScript content provides. Therefore we
 * hide the view by setting the height and width to 0.
 *
 * We use a context to avoid passing the APIs as props to every child
 */
const PsiWebView: React.FC = ({ children }) => {
  /**
   * Create a reference to the webview that we will pass
   * to the protocol hook. The protocol hook needs to communicate
   * with the webview's postMessage API in order to use the PSI WASM
   * accelerated library.
   */
  const webviewRef = React.useRef<WebView>(null)

  /**
   * Track the loaded state of the web page. This is used to block
   * rendering the children until the page is ready.
   */
  const [loaded, setLoaded] = React.useState<boolean>(false)

  /**
   * Use our defined PSI API functions that interface with the WebView.
   * When these are called, the payloads are dispatched to the webview
   * to be evaluated and their response is returned asynchronously
   */
  const {
    onLoad,
    onMessage,
    createClientRequest,
    createServerResponse,
    computeIntersection
  } = useWebViewProtocol({
    webviewRef
  })

  const setPsiInitialized = onLoad(payload => setLoaded(payload.initialized))

  return (
    <WebViewContext.Provider
      value={{
        createClientRequest,
        createServerResponse,
        computeIntersection
      }}
    >
      <View style={styles.container}>
        <WebView
          ref={webviewRef}
          // TODO: replace with the public url
          originWhitelist={['*']}
          source={{
            // TODO: replace with a public url
            uri: 'http://172.20.10.2:19006/'
          }}
          style={{ width: 0, height: 0 }}
          // The first message received should be the initialization
          // command. Afterward, we need to use the other handler.
          onMessage={loaded ? onMessage : setPsiInitialized}
          scalesPageToFit={true}
          onLoadStart={() => console.log('started loading page')}
          onLoad={() => {
            console.log('finished loading page')
          }}
        />
      </View>
      {!loaded && (
        <View style={styles.loading}>
          <Text>Loading...</Text>
          <ActivityIndicator animating={!loaded} />
        </View>
      )}
      {loaded && children}
    </WebViewContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 0,
    height: 0
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default PsiWebView
