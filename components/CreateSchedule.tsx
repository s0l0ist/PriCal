import * as React from 'react'
import {
  StyleSheet,
  Text,
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
import ProfileContext from './contexts/ProfileContext'
import PsiContext from './contexts/PsiContext'
import LinkModal from './modals/Link'

type Request = {
  requestId: string
  requestName: string
  contextId: string
  privateKey: string
}

type RequestPartial = Pick<Request, 'requestName' | 'contextId' | 'privateKey'>

/**
 * Component that renders the flow to create a schedule request
 */
export default function CreateRequest() {
  const [requestName, setRequestName] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false)
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [requestPartial, setRequestPartial] = React.useState<RequestPartial>()
  const [
    requestApiResponse,
    setRequestApiResponse
  ] = React.useState<CreateRequestResponse>()

  const user = React.useContext(ProfileContext)
  const context = React.useContext(PsiContext)
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
    const partialRequest = await createRequest(requestName)
    makeApiRequest({
      token: token?.data, // Attach the push token to the payload.
      requestor: user.profile.name, // Attach our user's name
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
      <View style={styles.container}>
        <Text style={styles.helperText}>
          Create a request to view availability
        </Text>
        <TextInput
          placeholder="John's schedule"
          editable={!loading}
          style={styles.textInput}
          onChangeText={setRequestName}
          value={requestName}
        />
        <ActivityIndicator style={styles.activity} animating={loading} />

        <Button
          disabled={!requestName || loading}
          onPress={onCreateRequest}
          title="Create"
        />
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
  container: {
    alignItems: 'center'
  },
  helperText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 10
  },
  textInput: {
    height: 40,
    textAlign: 'center',
    width: '75%',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: 'gray',
    borderWidth: 1
  },
  activity: {
    padding: 10
  }
})
