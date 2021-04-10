import { useAssets } from 'expo-asset'
import React from 'react'
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import WebView from 'react-native-webview'

import useNotification from '../hooks/useNotification'
import usePermissions from '../hooks/usePermissions'
import useProfile from '../hooks/useProfile'
import usePsiProtocol from '../hooks/usePsiProtocol'
import ExpoTokenProvider from './providers/ExpoTokenProvider'
import PermissionsProvider from './providers/PermissionsProvider'
import ProfileProvider from './providers/ProfileProvider'
import PsiProvider from './providers/PsiProvider'

/**
 * This component is responsible for onboarding the user in the app.
 * It should prompt the user for a name, then show the user
 * which permissions are missing before continuing.
 *
 * We render this component before all other navigation stacks
 * to guarantee functionality will not be blocked by permissions.
 */
const Onboarding: React.FC = ({ children }) => {
  /**
   * Track the top-level initialized state of our app. This is used to block
   * rendering the children until all hooks have reached steady state:
   * - Profile
   * - (Required) Permissions
   */
  const [initialized, setInitialized] = React.useState<boolean>(false)

  /*****************
   *  Profile
   *****************/
  const [user, { saveProfile }] = useProfile()
  const [name, setName] = React.useState<string>('')

  /*****************
   *  Permissions
   *****************/
  const [permissions] = usePermissions()

  /*****************
   *  Assets
   *****************/
  /**
   * We load our static site containing the PSI WASM library that we will load in
   * a WebView
   */
  const [assets, assetsError] = useAssets([require('../assets/www/index.html')])

  /*****************
   *  Expo Push Notification token
   *****************/
  const [token] = useNotification()

  /*****************
   *  PSI
   *****************/
  /**
   * We're using a WebView as a work around to use the PSI WebAssembly
   * library as WebAssembly is not supported in react-native.
   *
   * Create a reference to the webview that we will pass
   * to the usePsiProtocol hook. The protocol hook needs to communicate
   * with the WebView's postMessage API in order to use the PSI WASM
   * accelerated library.
   */
  const webviewRef = React.useRef<WebView>(null)

  /**
   * Use our defined PSI API functions that interface with the WebView.
   * When these are called, the payloads are dispatched to the webview
   * to be evaluated and their response is returned asynchronously.
   * We pass them to the respective provider for transparent access
   * to the PSI API.
   */
  const [
    psiLoaded,
    {
      onMessage,
      createClientRequest,
      createServerResponse,
      computeIntersection
    }
  ] = usePsiProtocol({
    webviewRef
  })

  /*****************
   *  Effects
   *****************/
  /**
   * Effect: if we're done loading, we are finished initializing!
   * `user` and `permissions` have a `loaded` state, but `assets` will be
   * null or an array.
   */
  React.useEffect(() => {
    if (user.loaded && permissions.loaded && assets) {
      setInitialized(true)
    }
  }, [user.loaded, permissions.loaded, assets])

  /**
   * Show spinner while we're initializing
   */
  if (!initialized) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
        <ActivityIndicator animating={!initialized} />
      </View>
    )
  }

  /**
   * If the assets failed to load, then display the error
   */
  if (assetsError) {
    return (
      <View style={styles.loading}>
        <Text>{`Error loading WebView: ${assetsError}`}</Text>
      </View>
    )
  }

  /**
   * If the user hasn't set up their profile,
   * prompt them here.
   */
  if (!user.profile?.name) {
    return (
      <View style={styles.loading}>
        <Text>Enter your name</Text>
        <TextInput
          style={{
            textAlign: 'center',
            height: 40,
            paddingLeft: 10,
            paddingRight: 10,
            width: '75%',
            borderRadius: 50,
            borderColor: 'gray',
            borderWidth: 1
          }}
          onChangeText={setName}
          value={name}
        />

        <View>
          <Button
            disabled={!name}
            onPress={() => saveProfile({ name })}
            title="Save"
          />
        </View>
      </View>
    )
  }

  /**
   * Show any permissions that need to be granted
   */
  if (!permissions.hasRequiredPermissions) {
    return (
      <View style={styles.container}>
        <View style={styles.column}>
          <Text
            style={styles.helperText}
          >{`You must first enable the following permissions before this app can work:`}</Text>

          <View style={styles.row}>
            <View style={styles.bullet}>
              <Text>{'\u2022'}</Text>
            </View>
            {permissions.missingPermissions.map((x, i) => (
              <View key={i} style={styles.bulletText}>
                <Text>
                  <Text style={styles.boldText}>{x.Permission}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  /**
   * Determine if we are ready to render the rest of the
   * application. We cannot put the psiLoaded in the above effect
   * because we need to render the WebView first to begin the
   * initialization process for psiLoaded!
   */
  const applicationReady = initialized && psiLoaded

  /**
   * Exctract the local uri from the index.html asset
   */
  const uri = assets![0].localUri!

  return (
    <PsiProvider
      onMessage={onMessage}
      createClientRequest={createClientRequest}
      createServerResponse={createServerResponse}
      computeIntersection={computeIntersection}
      webviewRef={webviewRef}
      uri={uri}
    >
      {!applicationReady && (
        <View style={styles.loading}>
          <Text>Loading...</Text>
          <ActivityIndicator animating={true} />
        </View>
      )}
      {applicationReady && (
        <ProfileProvider profile={user.profile} setProfile={saveProfile}>
          <PermissionsProvider
            hasRequiredPermissions={permissions.hasRequiredPermissions}
            hasCalendarPermission={permissions.hasCalendarPermission}
            hasReminderPermission={permissions.hasReminderPermission}
            hasNotificationsPermission={permissions.hasNotificationsPermission}
            missingPermissions={permissions.missingPermissions}
          >
            <ExpoTokenProvider token={token}>{children}</ExpoTokenProvider>
          </PermissionsProvider>
        </ProfileProvider>
      )}
    </PsiProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'space-between',
    marginTop: '100%'
  },
  helperText: {
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flex: 1,
    margin: 20
  },
  bullet: {
    width: 10,
    marginRight: 10
  },
  bulletText: {
    flex: 1
  },
  boldText: {
    fontWeight: 'bold'
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default Onboarding
