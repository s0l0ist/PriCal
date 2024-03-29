import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { SafeAreaView } from 'react-native'

import ApprovalModal from '../components/modals/Approval'

export default function ApprovalScreen() {
  return (
    <SafeAreaView>
      <StatusBar style="dark" />
      <ApprovalModal />
    </SafeAreaView>
  )
}
