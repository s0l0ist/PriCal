import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'

import LinkModal from '../components/modals/Link'
import {
  LinkScreenRouteProp,
  BottomTabParamList
} from '../navigation/BottomTabNavigator'

export type LinkScreenNavigationProp = StackNavigationProp<
  BottomTabParamList,
  'Schedules'
>

type LinkScreenProps = {
  route: LinkScreenRouteProp
  navigation: LinkScreenNavigationProp
}

const LinkScreen: React.FC<LinkScreenProps> = ({ route, navigation }) => {
  return <LinkModal route={route} navigation={navigation} />
}

export default LinkScreen
