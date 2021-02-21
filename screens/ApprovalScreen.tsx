import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'

import ApprovalModal from '../components/modals/Approval'
import { RootStackParamList } from '../navigation/BottomTabNavigator'

export type ApprovalScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Root'
>

const ApprovalScreen: React.FC = () => {
  return <ApprovalModal />
}

export default ApprovalScreen
