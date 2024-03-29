import { Ionicons } from '@expo/vector-icons'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import * as React from 'react'

/**
 * A hook for interfacing with the cached resources API
 */
export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    ;(async () => {
      if (!isLoadingComplete) {
        try {
          SplashScreen.preventAutoHideAsync()

          // Load fonts
          await Font.loadAsync({
            ...Ionicons.font,
            'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf')
          })
        } catch (e) {
          // We might want to provide this error information to an error reporting service
          console.warn('uh oh:', e)
        } finally {
          setLoadingComplete(true)
          SplashScreen.hideAsync()
        }
      }
    })()
  }, [isLoadingComplete])

  return React.useMemo(() => [isLoadingComplete], [isLoadingComplete])
}
