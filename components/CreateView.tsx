import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'

const CreateView: React.FC = ({ children }) => (
  <View style={styles.container}>
    <Text style={styles.title}>PriCal</Text>
    {children}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  }
})

export default CreateView
