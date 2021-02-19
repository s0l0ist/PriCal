import * as React from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Pressable,
  Button
} from 'react-native'

import useCreateRequest, {
  CreateRequestResponse
} from '../hooks/api/useCreateRequest'
import useSync from '../hooks/store/useSync'
import useSchedule from '../hooks/useSchedule'
import { CreateScreenNavigationProp } from '../screens/CreateScreen'

type CreateRequestProps = {
  navigation: CreateScreenNavigationProp
}

type Request = {
  requestId: string
  requestName: string
  contextId: string
  privateKey: string
}

type RequestPartial = Pick<Request, 'requestName' | 'contextId' | 'privateKey'>

const CreateRequest: React.FC<CreateRequestProps> = ({ navigation }) => {
  const [requestName, setRequestName] = React.useState<string>('')
  const [requestPartial, setRequestPartial] = React.useState<RequestPartial>()
  const [apiResponse, setApiResponse] = React.useState<CreateRequestResponse>()
  const { createRequest } = useSchedule()
  const [api, makeApiRequest] = useCreateRequest()
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
   * Effect: monitor the API response and set a local state that we control
   * Specifically, this allows us to clear the api response state for our
   * other hook below
   */
  React.useEffect(() => {
    if (api.response) {
      setApiResponse(api.response)
    }
  }, [api.response])

  /**
   * Effect: When we receive a valid response from the server that our request
   * was correctly generated, we then merge the private data held in the partial
   * and sync to storage.
   */
  React.useEffect(() => {
    ;(async () => {
      if (apiResponse && requestPartial) {
        console.log('Received api.response, storing, navigating to schedules')
        // Sync to storage
        await addRequest({
          requestId: apiResponse.requestId,
          requestName: apiResponse.requestName,
          contextId: apiResponse.contextId,
          privateKey: requestPartial.privateKey
        })
        // Clean up our local state after consumption
        setRequestPartial(undefined)
        setApiResponse(undefined)
        // Trigger navigation to the schedules tab
        navigation.navigate('Schedules')
      }
    })()
  }, [apiResponse, requestPartial])

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
            disabled={!requestName || api.processing}
            onPress={onCreateRequest}
            title="Tap here create a request"
          />
        </View>
      </View>
    </View>
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
