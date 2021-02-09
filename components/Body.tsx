import * as React from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View
} from 'react-native'
import { MonoText } from './MonoText'
import useSchedule from '../hooks/useSchedule'

type BodyState = {
  requestName: string
}

export default function Body() {
  const [state, setState] = React.useState<BodyState>({
    requestName: ''
  })

  const onChangeText = async (text: string) => {
    setState(prev => ({
      ...prev,
      requestName: text
    }))
  }

  const onPress = async () => {
    // Set the request name state
    changeRequestName(state.requestName)
    createRequest()
    setState(prev => ({
      ...prev,
      requestName: ''
    }))
  }

  const [
    { intersection, processing, requests },
    { createRequest, changeRequestName }
  ] = useSchedule()

  const textString = `Tap here to create a client request, send it and compute the intersection: ${processing}`
  return (
    <View>
      <View style={styles.helpContainer}>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={text => onChangeText(text)}
          value={state.requestName}
        />

        <TouchableOpacity
          disabled={processing}
          onPress={onPress}
          style={styles.helpLink}
        >
          <Text style={styles.getStartedText}>{textString}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.getStartedContainer}>
        <Text style={styles.getStartedText}>Intersection:</Text>
        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
        >
          <MonoText>[{intersection.join(', ')}]</MonoText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4
  },
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
