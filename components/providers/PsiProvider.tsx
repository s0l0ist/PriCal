import * as React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

import usePsiProtocol from '../../hooks/usePsiProtocol'
import WebViewContext from '../contexts/WebViewContext'

/**
 * Create a WebView component that will load a static site exposing
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
   * rendering the children until both the page and PSI library are ready.
   */
  const [loaded, setLoaded] = React.useState<boolean>(false)

  /**
   * Use our defined PSI API functions that interface with the WebView.
   * When these are called, the payloads are dispatched to the webview
   * to be evaluated and their response is returned asynchronously
   */
  const {
    onPsiInit,
    onMessage,
    createClientRequest,
    createServerResponse,
    computeIntersection
  } = usePsiProtocol({
    webviewRef
  })

  /**
   * When the PSI library has finished initializing, set our initialized flag.
   *
   * We cannot use the PSI library until the WebView has loaded AND the
   * initialization of the PSI library inside has completed. Therefore,
   * we switch the handler for the WebView's `onMessage` callback
   * when the PSI library is ready to accept commands.
   *
   * Note: we do not explicitly prevent commands from being sent to the PSI library.
   * If messages are sent before it is loaded, they will be silently dropped. This
   * is why we use this component as a high-level provider that will be rendered
   * very early in the application.
   */
  const setPsiInitialized = onPsiInit(payload => setLoaded(payload.initialized))

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
            uri: 'http://192.168.1.203:19006/'
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
