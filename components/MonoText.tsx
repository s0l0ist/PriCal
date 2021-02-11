import * as React from 'react'
import { Text as DefaultText } from 'react-native'

type TextProps = DefaultText['props']

const MonoText: React.FC<TextProps> = ({ style, ...otherProps }) => {
  return (
    <DefaultText
      style={[{ fontFamily: 'space-mono' }, style]}
      {...otherProps}
    />
  )
}

export default MonoText
