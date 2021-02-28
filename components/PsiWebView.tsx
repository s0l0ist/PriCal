import * as React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

import useWebViewProtocol from '../hooks/useWebViewProtocol'
import webViewContext from './contexts/webViewContext'

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
    onMessage,
    createClientRequest,
    createServerResponse,
    computeIntersection
  } = useWebViewProtocol({
    webviewRef
  })

  return (
    <webViewContext.Provider
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
            uri: 'http://localhost:19006'
          }}
          style={{ width: 0, height: 0 }}
          onMessage={onMessage}
          scalesPageToFit={true}
          onLoadStart={() => console.log('started loading page')}
          onLoad={() => {
            console.log('finished loading page')
            setLoaded(true)
          }}
        />
      </View>
      <ActivityIndicator animating={!loaded} />
      {loaded && children}
    </webViewContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 0,
    height: 0
  }
})

export default PsiWebView
