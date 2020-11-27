import * as React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import { MonoText } from './MonoText'
import useSchedule from '../hooks/useSchedule'

export default function Body() {
  const [intersection, { createRequest }] = useSchedule()

  return (
    <View>
      <View style={styles.helpContainer}>
        <TouchableOpacity onPress={createRequest} style={styles.helpLink}>
          <Text style={styles.getStartedText}>
            Tap here to create a client request, send it and compute the
            intersection
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.getStartedContainer}>
        <Text style={styles.getStartedText}>Intersection:</Text>
        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
        >
          <MonoText>{intersection.join(', ')}</MonoText>
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
