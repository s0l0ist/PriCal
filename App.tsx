import * as React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Onboarding from './components/Onboarding'
import useCachedResources from './hooks/useCachedResources'
import Navigation from './navigation'

export default function App() {
  const [hasLoaded] = useCachedResources()

  if (!hasLoaded) {
    return null
  }
  return (
    <SafeAreaProvider>
      <Onboarding>
        <Navigation />
      </Onboarding>
    </SafeAreaProvider>
  )
}
