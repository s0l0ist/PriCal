import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { View } from 'react-native'

import ApprovalModal from '../components/modals/Approval'

export default function ApprovalScreen() {
  return (
    <View>
      <StatusBar style="dark" />
      <ApprovalModal />
    </View>
  )
}
