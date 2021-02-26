import * as React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

import useWebViewProtocol from '../hooks/useWebViewProtocol'
import webViewContext from './contexts/webViewContext'

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
   * Obtain our PSI functions. When these are called, the payloads
   * are dispatched to the webview to be evaluated and their response
   * is returned asynchronously
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
          originWhitelist={['*']}
          source={{
            // TODO: replace with a public url
            uri: 'http://192.168.1.203:19006'
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
