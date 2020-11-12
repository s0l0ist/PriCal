import * as React from 'react'
import { Text as DefaultText } from 'react-native'

type TextProps = DefaultText['props']

export function MonoText(props: TextProps) {
  const { style, ...otherProps } = props
  return (
    <DefaultText
      style={[{ fontFamily: 'space-mono' }, style]}
      {...otherProps}
    />
  )
}
