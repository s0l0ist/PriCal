import { StackScreenProps } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { RootStackParamList } from '../navigation/BottomTabNavigator'

type NotFoundScreenProps = StackScreenProps<RootStackParamList, 'NotFound'>

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <Pressable onPress={() => navigation.replace('Root')} style={styles.link}>
        <Text style={styles.linkText}>Go to home screen!</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  link: {
    marginTop: 15,
    paddingVertical: 15
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7'
  }
})

export default NotFoundScreen
