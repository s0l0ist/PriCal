import { ReturnTypeAsync } from '../types'

/**
 * Creates a HOC which times the execution of the provided function
 * @param func
 */
function withLog<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnTypeAsync<T> {
  const funcName = func.name
  // Return a new function that tracks how long the original took
  return (...args: Parameters<T>): ReturnTypeAsync<T> => {
    const startTime = new Date().getTime()
    const results = func.apply(func, args)
    const duration = new Date().getTime() - startTime
    console.log(`Calling '${funcName}' took ${duration}ms`)
    return results
  }
}

export default withLog
