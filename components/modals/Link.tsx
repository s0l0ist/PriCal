import { Ionicons } from '@expo/vector-icons'
import Clipboard from 'expo-clipboard'
import * as MailComposer from 'expo-mail-composer'
import { MailComposerStatus } from 'expo-mail-composer'
import React from 'react'
import { Modal, StyleSheet, Text, Pressable, View, Alert } from 'react-native'

import { LinkScreenRouteProp } from '../../navigation/BottomTabNavigator'
import LinkConfig from '../../navigation/LinkingConfiguration'
import { LinkScreenNavigationProp } from '../../screens/LinkScreen'

type LinkProps = {
  route: LinkScreenRouteProp
  navigation: LinkScreenNavigationProp
}
const createUrl = (id: string) => {
  const url = `${LinkConfig.prefixes.slice(-1).pop()}${
    LinkConfig.config.screens.Approval
  }`
  return url.replace(':requestId', id)
}

const LinkModal: React.FC<LinkProps> = ({
  route: {
    params: { requestId }
  },
  navigation
}) => {
  const [modalVisible, setModalVisible] = React.useState<boolean>(true)

  /**
   * Copy the app link to the clipboard
   */
  const copyToClipboard = (requestId: string) => {
    const url = createUrl(requestId)
    Clipboard.setString(url)
    // The link was copped! Navigate to the schedules screen
    setModalVisible(false)
  }

  /**
   * Open the user's email app
   */
  const openEmail = async (requestId: string) => {
    const isAvailable = await MailComposer.isAvailableAsync()
    if (!isAvailable) {
      Alert.alert(
        'Mail Unavailable',
        'Unable to open your mail app, please copy the link instead!',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ],
        { cancelable: false }
      )
      return
    }
    const url = createUrl(requestId)

    const mailResult = await MailComposer.composeAsync({
      body: `Visit the link to approve the request: ${url}`
    })
    if (
      mailResult.status === MailComposerStatus.CANCELLED ||
      mailResult.status === MailComposerStatus.UNDETERMINED
    ) {
      return
    }

    // The email was saved or sent!
    setModalVisible(false)
  }

  /**
   * Effect: Go back to the root screen when the modal
   * is not visible
   */
  React.useEffect(() => {
    if (!modalVisible) {
      // Need to remove the modal by going back a screen
      // This resets the tab to its root state
      navigation.goBack()
      // Next, we should redirect the user to the schedules screen
      navigation.navigate('Schedules')
    }
  }, [modalVisible])

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.mainView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Your request was created successfully! Copy or email the link to
              your intended recepient.
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.button}
                onPress={() => copyToClipboard(requestId)}
              >
                <Ionicons name="copy" size={48} color="gray" />
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => openEmail(requestId)}
              >
                <Ionicons name="mail" size={48} color="gray" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  mainView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  modalText: {
    marginBottom: 50,
    textAlign: 'center'
  }
})

export default LinkModal
