import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'

import ApprovalModal from '../components/modals/Approval'
import {
  ApprovalScreenRouteProp,
  RootStackParamList
} from '../navigation/BottomTabNavigator'

export type ApprovalScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Root'
>

type ApprovalScreenProps = {
  route: ApprovalScreenRouteProp
  navigation: ApprovalScreenNavigationProp
}

const ApprovalScreen: React.FC<ApprovalScreenProps> = ({
  route,
  navigation
}) => {
  return <ApprovalModal route={route} navigation={navigation} />
}

export default ApprovalScreen
