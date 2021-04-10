import * as React from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'

import ProfileContext from './contexts/ProfileContext'

/**
 * Component that renders user-controllable settings
 */
export default function Settings() {
  const [name, setName] = React.useState<string>('')
  const profileContext = React.useContext(ProfileContext)

  const save = () => {
    saveProfile()
  }

  const onSubmitEditing = () => {
    saveProfile()
  }

  const saveProfile = () => {
    if (!name) {
      return
    }
    profileContext.setProfile({
      name
    })
  }

  /**
   * Effect: after the profile has been loaded,
   * set our initial user's name
   */
  React.useEffect(() => {
    if (profileContext.profile?.name) {
      setName(profileContext.profile.name)
    }
  }, [profileContext.profile])

  return (
    <View style={styles.container}>
      <Text>Your name</Text>
      <TextInput
        autoCorrect={false}
        placeholder="John Doe"
        style={styles.textInput}
        onChangeText={setName}
        value={name}
        onSubmitEditing={onSubmitEditing}
      />
      <Button disabled={!name} onPress={save} title="Save" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  textInput: {
    height: 40,
    textAlign: 'center',
    width: '75%',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: 'gray',
    borderWidth: 1
  }
})
