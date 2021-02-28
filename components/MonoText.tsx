import * as React from 'react'
import { Text as DefaultText } from 'react-native'

type TextProps = DefaultText['props']

export default function MonoText({ style, ...otherProps }: TextProps) {
  return (
    <DefaultText
      style={[{ fontFamily: 'space-mono' }, style]}
      {...otherProps}
    />
  )
}
