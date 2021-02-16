/**
 * A type-safe comparator for types
 */
export const compare = <T>(a: T, b: T, key: keyof T) => {
  const propA = getProperty(a, key)
  const propB = getProperty(b, key)
  if (typeof propA === 'string' && typeof propB === 'string') {
    return strCmp(propA, propB, 'standard', { sensitivity: 'case' })
  }
  return cmp(propA, propB)
}

const getProperty = <T, K extends keyof T>(object: T, key: K): T[K] => {
  return object[key]
}

const strCmp = (
  a: string,
  b: string,
  locale?: string | string[],
  options?: Intl.CollatorOptions
) => {
  return a.localeCompare(b, locale, options)
}

const cmp = <T>(a: T, b: T) => {
  if (a > b) {
    return 1
  }
  if (a < b) {
    return -1
  }
  return 0
}
