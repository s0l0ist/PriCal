import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View
} from 'react-native'

import useCreateResponse from '../../hooks/api/useCreateResponse'
import useGetPublicRequest from '../../hooks/api/useGetPublicRequest'
import useSchedule from '../../hooks/useSchedule'
import {
  ApprovalScreenNavigationProp,
  ApprovalScreenRouteProp
} from '../../navigation/BottomTabNavigator'
import WebViewContext from '../contexts/WebViewContext'

export default function ApprovalModal() {
  const [modalVisible, setModalVisible] = useState(true)
  const [approval, setApproval] = useState(false)
  const [requestApi, getPublicRequest] = useGetPublicRequest()
  const [responseApi, sendResponse] = useCreateResponse()
  const context = React.useContext(WebViewContext)! // This *will* be defined
  const { createResponse } = useSchedule(context)

  const {
    params: { requestId }
  } = useRoute<ApprovalScreenRouteProp>()
  const navigation = useNavigation<ApprovalScreenNavigationProp>()

  /**
   * Effect: Get the public request details to perform the
   * PSI server response and setup to be sent back.
   */
  React.useEffect(() => {
    if (requestId) {
      getPublicRequest({
        requestId
      })
    }
  }, [requestId])

  /**
   * Effect: When we receive a successful API response payload
   * containing the public PSI Request details, create the server
   * response and submit the payload back to the cloud.
   */
  React.useEffect(() => {
    ;(async () => {
      if (requestApi.response && !requestApi.error && approval) {
        const serverResponse = await createResponse(
          requestApi.response!.request
        )
        sendResponse({
          requestId,
          response: serverResponse.serverResponse,
          setup: serverResponse.serverSetup
        })
        setApproval(false)
      }
    })()
  }, [requestApi.response, requestApi.error, approval])

  /**
   * Effect: Upon a successful server response to the request,
   * close the modal which will trigger the navigation
   * to go back.
   */
  React.useEffect(() => {
    if (responseApi.response && !responseApi.error) {
      setModalVisible(false)
    }
  }, [responseApi.response, responseApi.error])

  /**
   * Effect: Go back to the root screen when the modal
   * is not visible
   */
  React.useEffect(() => {
    if (!modalVisible) {
      if (navigation.canGoBack()) {
        // This is called when the deep link is clicked, and the application
        // was open in the background.
        navigation.goBack()
      } else {
        // This is called when the deep link is clicked, but the application
        // was closed, triggering the app to open. When this happens,
        // there's no state to `goBack` to so we replace the entire
        // stack with the Root stack.
        navigation.replace('Root')
      }
    }
  }, [modalVisible])

  /**
   * Track the protocol state to notify the UI that
   * requests are in flight
   */
  const isProcessing = React.useMemo(() => {
    return requestApi.processing || responseApi.processing
  }, [requestApi.processing, responseApi.processing])

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
            {requestApi.response && (
              <Text style={styles.modalText}>
                Hi there, someone would like to request your 2-week
                availability.
              </Text>
            )}
            {requestApi.error && (
              <Text style={styles.modalText}>
                This request has been canceled!
              </Text>
            )}
            <ActivityIndicator animating={isProcessing} />
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.button}
                disabled={isProcessing}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-outline" size={48} color="gray" />
              </Pressable>
              {requestApi.response && (
                <Pressable
                  style={styles.button}
                  disabled={isProcessing || Boolean(requestApi.error)}
                  onPress={() => setApproval(true)}
                >
                  <Ionicons name="checkmark" size={48} color="green" />
                </Pressable>
              )}
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
