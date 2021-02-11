import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'

const Screen: React.FC = ({ children }) => (
  <View style={styles.container}>
    <Text style={styles.title}>PriCal</Text>
    <View style={styles.separator} />
    {children}
  </View>
)

export default Screen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
})
