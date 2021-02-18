import React from 'react'
import { View, StyleSheet } from 'react-native'

import ApprovalModal from '../components/modals/Approval'

const ApprovalScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ApprovalModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default ApprovalScreen
