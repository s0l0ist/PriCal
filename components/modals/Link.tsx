import { Ionicons } from '@expo/vector-icons'
import Clipboard from 'expo-clipboard'
import * as MailComposer from 'expo-mail-composer'
import { MailComposerStatus } from 'expo-mail-composer'
import React from 'react'
import { Modal, StyleSheet, Text, Pressable, View, Alert } from 'react-native'

import LinkConfig from '../../navigation/LinkingConfiguration'

const createUrl = (id: string) => {
  const url = `${LinkConfig.prefixes.slice(-1).pop()}${
    LinkConfig.config.screens.Approval
  }`
  // TODO: We don't have a way to define a link programatically
  // so if the `:requestId` changes, we *have* to change this
  // function manually or else it will fail silently and break
  // deep linking.
  return url.replace(':requestId', id)
}

type LinkModalProps = {
  requestId: string
  onClose: () => void
}

// const LinkModal: React.FC<LinkModalProps> = ({ requestId, onClose }) => {
export default function LinkModal({ requestId, onClose }: LinkModalProps) {
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
            text: 'Copy',
            style: 'default',
            onPress: () => copyToClipboard(requestId)
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

    // The email was saved or sent, close the modal.
    setModalVisible(false)
  }

  /**
   * Effect: Go back to the root screen when the modal
   * is not visible
   */
  React.useEffect(() => {
    if (!modalVisible) {
      // Trigger the callback prop
      onClose()
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
              Done! Next, you'll need to send the link to your intended
              recepient. Copy the link directly or send an email!
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
