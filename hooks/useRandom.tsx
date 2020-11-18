import 'react-native-get-random-values'
import * as React from 'react'

export default function useRandom() {
  /**
   * Convert a decimal number to hex
   * Ex: i.e. 0-255 -> '00'-'ff'
   * @param dec The decimal number to convert
   */
  const dec2hex = (dec: number) => {
    return dec < 10 ? '0' + String(dec) : dec.toString(16)
  }

  /**
   * Generate a random string from the specified number of bytes
   *
   * @param bytes Number of random bytes for returned string
   */
  const getRandomBytes = (bytes: number): Uint8Array => {
    const byteArray = Uint8Array.from({ length: bytes })
    crypto.getRandomValues(byteArray)
    return byteArray
  }

  /**
   * Generate a random string from the specified number of bytes
   *
   * @param bytes Number of random bytes for returned string
   */
  const getRandomString = (bytes: number): string => {
    const byteArray = getRandomBytes(bytes)
    return Array.from(byteArray, dec2hex).join('')
  }

  return React.useMemo(
    () =>
      ({
        getRandomBytes,
        getRandomString
      } as const),
    []
  )
}
