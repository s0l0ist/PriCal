import * as React from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Button,
  ActivityIndicator
} from 'react-native'

import useCreateRequest, {
  CreateRequestResponse
} from '../hooks/api/useCreateRequest'
import useSync from '../hooks/store/useSync'
import useSchedule from '../hooks/useSchedule'
import ExpoNotificationContext from './contexts/ExpoNotificationContext'
import WebViewContext from './contexts/WebViewContext'
import LinkModal from './modals/Link'

type Request = {
  requestId: string
  requestName: string
  contextId: string
  privateKey: string
}

type RequestPartial = Pick<Request, 'requestName' | 'contextId' | 'privateKey'>

export default function CreateRequest() {
  const [requestName, setRequestName] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false)
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [requestPartial, setRequestPartial] = React.useState<RequestPartial>()
  const [
    requestApiResponse,
    setRequestApiResponse
  ] = React.useState<CreateRequestResponse>()

  const context = React.useContext(WebViewContext)! // This *will* be defined
  // Take the push notification if we have one.
  const { token } = React.useContext(ExpoNotificationContext)
  const { createRequest } = useSchedule(context)
  const [createRequestApi, makeApiRequest] = useCreateRequest()
  const { addRequest } = useSync()

  /**
   * Create a client request when the button is pressed
   * and then send it to the cloud
   */
  const onCreateRequest = async () => {
    setLoading(true)

    // Create the clientReqeust
    console.log('creating and sending client request', requestName)
    const partialRequest = await createRequest(requestName)
    makeApiRequest({
      token: token?.data, // Attach the push token to the payload.
      requestName: partialRequest.requestName,
      contextId: partialRequest.contextId,
      request: partialRequest.request
    })

    // Clear the name to prevent the form from sumbitting and set our partial request
    setRequestName('')
    setRequestPartial(partialRequest)
  }

  /**
   * When the user closes the modal, clean up the state and navigate
   * to the schedules screen
   */
  const onModalClose = () => {
    setRequestPartial(undefined)
    setRequestApiResponse(undefined)
    setShowModal(false)
    setLoading(false)
  }

  /**
   * Effect: monitor the API response and set a local state that we control
   * Specifically, this allows us to clear the createRequestApi response state for our
   * other hook below
   */
  React.useEffect(() => {
    if (createRequestApi.response) {
      setRequestApiResponse(createRequestApi.response)
    }
  }, [createRequestApi.response])

  /**
   * Effect: If the API call had an error, we clear the loading status
   */
  React.useEffect(() => {
    if (createRequestApi.error) {
      setLoading(false)
    }
  }, [createRequestApi.error])

  /**
   * Effect: When we receive a valid response from the server that our request
   * was correctly generated, we then merge the private data held in the partial
   * and sync to storage.
   */
  React.useEffect(() => {
    ;(async () => {
      if (requestApiResponse && requestPartial) {
        console.log(
          'Received createRequestApi.response, storing, navigating to link screen'
        )
        // Sync to storage
        await addRequest({
          requestId: requestApiResponse.requestId,
          requestName: requestApiResponse.requestName,
          contextId: requestApiResponse.contextId,
          privateKey: requestPartial.privateKey
        })
        // Clear loading
        setLoading(false)
        // Trigger the modal
        setShowModal(true)
      }
    })()
  }, [requestApiResponse, requestPartial])

  if (!showModal) {
    return (
      <View>
        <View style={styles.helpContainer}>
          <TextInput
            style={{
              height: 40,
              width: '100%',
              borderColor: 'gray',
              borderWidth: 1
            }}
            onChangeText={setRequestName}
            value={requestName}
          />
          <ActivityIndicator style={styles.activity} animating={loading} />

          <View style={styles.button}>
            <Button
              disabled={!requestName || loading}
              onPress={onCreateRequest}
              title="Tap here create a request"
            />
          </View>
        </View>
      </View>
    )
  }

  return (
    <LinkModal
      requestId={createRequestApi.response!.requestId}
      onClose={onModalClose}
    />
  )
}

const styles = StyleSheet.create({
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center'
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center'
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    textAlign: 'center'
  },
  activity: {
    padding: 20
  },
  button: {
    justifyContent: 'center'
  }
})
