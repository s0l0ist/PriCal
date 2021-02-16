import * as React from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View
} from 'react-native'

import useCreateRequest from '../hooks/api/useCreateRequest'
import useSchedule from '../hooks/useSchedule'

type CreateRequestProps = {
  onSuccess: () => void
}

const CreateRequest: React.FC<CreateRequestProps> = ({ onSuccess }) => {
  const [requestName, setRequestName] = React.useState<string>('')

  const [{ createRequest }] = useSchedule()
  const [api, makeApiRequest] = useCreateRequest()

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
    const payload = await createRequest(requestName)
    makeApiRequest({
      requestName: payload.requestName,
      contextId: payload.contextId,
      request: payload.request
    })

    // Immediatly set the processing flag, and reset the request name
    setRequestName('')
  }

  React.useEffect(() => {
    if (api.response) {
      console.log('Received api.response, navigating to schedules')
      // Trigger the navigation callback prop
      onSuccess()
    }
  }, [api.response])

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

        <TouchableOpacity
          disabled={!requestName || api.processing}
          onPress={onCreateRequest}
          style={styles.helpLink}
        >
          <Text style={styles.getStartedText}>
            Tap here to create a client request, send it and compute the
            intersection
          </Text>
        </TouchableOpacity>
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
  }
})

export default CreateRequest
