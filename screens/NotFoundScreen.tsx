import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { Pressable, StyleSheet, Text, SafeAreaView } from 'react-native'

import { NotFoundScreenNavigationProps } from '../navigation/BottomTabNavigator'

export default function NotFoundScreen() {
  const navigation = useNavigation<NotFoundScreenNavigationProps>()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <Pressable onPress={() => navigation.replace('Root')} style={styles.link}>
        <Text style={styles.linkText}>Go to home screen!</Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
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
