import { StackNavigationProp } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { View } from 'react-native'

import PsiWebView from '../components/PsiWebView'
import ApprovalModal from '../components/modals/Approval'
import { RootStackParamList } from '../navigation/BottomTabNavigator'

export type ApprovalScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Root'
>

const ApprovalScreen: React.FC = () => {
  return (
    <View>
      <StatusBar style="dark" />
      <PsiWebView>
        <ApprovalModal />
      </PsiWebView>
    </View>
  )
}

export default ApprovalScreen
