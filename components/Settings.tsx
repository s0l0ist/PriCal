import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * Component that renders the flow to create a schedule request
 */
export default function Settings() {
  return (
    <View style={styles.container}>
      <Text>Settings page</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  }
})
