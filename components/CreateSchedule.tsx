import * as React from 'react'
import { StyleSheet, TextInput, View, Button } from 'react-native'

import useCreateRequest, {
  CreateRequestResponse
} from '../hooks/api/useCreateRequest'
import useSync from '../hooks/store/useSync'
import useSchedule from '../hooks/useSchedule'
import LinkModal from './modals/Link'

type Request = {
  requestId: string
  requestName: string
  contextId: string
  privateKey: string
}

type RequestPartial = Pick<Request, 'requestName' | 'contextId' | 'privateKey'>

const CreateRequest: React.FC = () => {
  const [requestName, setRequestName] = React.useState<string>('')
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [requestPartial, setRequestPartial] = React.useState<RequestPartial>()
  const [
    requestApiResponse,
    setApiResponse
  ] = React.useState<CreateRequestResponse>()
  const { createRequest } = useSchedule()
  const [requestApi, makeApiRequest] = useCreateRequest()
  const { addRequest } = useSync()

  /**
   * Handler to update the requestName
   */
  const onRequestNameChange = (text: string) => {
    setRequestName(text)
  }

  /**
   * Create a client request when the button is pressed
   * and then send it to the server for storage
   */
  const onCreateRequest = async () => {
    // Create the clientReqeust
    console.log('creating and sending client request', requestName)
    const partialRequest = await createRequest(requestName)
    makeApiRequest({
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
    setApiResponse(undefined)
    setShowModal(false)
  }

  /**
   * Effect: monitor the API response and set a local state that we control
   * Specifically, this allows us to clear the requestApi response state for our
   * other hook below
   */
  React.useEffect(() => {
    if (requestApi.response) {
      setApiResponse(requestApi.response)
    }
  }, [requestApi.response])

  /**
   * Effect: When we receive a valid response from the server that our request
   * was correctly generated, we then merge the private data held in the partial
   * and sync to storage.
   */
  React.useEffect(() => {
    ;(async () => {
      if (requestApiResponse && requestPartial) {
        console.log(
          'Received requestApi.response, storing, navigating to link screen'
        )
        // Sync to storage
        await addRequest({
          requestId: requestApiResponse.requestId,
          requestName: requestApiResponse.requestName,
          contextId: requestApiResponse.contextId,
          privateKey: requestPartial.privateKey
        })
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
            onChangeText={onRequestNameChange}
            value={requestName}
          />

          <View style={styles.button}>
            <Button
              disabled={!requestName || requestApi.processing}
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
      requestId={requestApi.response!.requestId}
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
  button: {
    marginTop: 20,
    justifyContent: 'center'
  }
})

export default CreateRequest
