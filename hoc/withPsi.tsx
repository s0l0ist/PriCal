import { ReturnTypeAsync } from '../types'

/**
 * Creates a HOC which executes a PSI init function before each function call.
 * This ensures the PSI library singleton is always initialized
 *
 * @param func
 */
export default function withPsi(init: () => Promise<void>) {
  // Return a function that accepts another function to wrap in our permissions checks
  return function <T extends (...args: any[]) => any>(
    func: T
  ): (...args: Parameters<T>) => Promise<ReturnTypeAsync<T>> {
    // Return the new function will check permissions
    return async (...args: Parameters<T>): Promise<ReturnTypeAsync<T>> => {
      await init()
      return await func.apply(func, args)
    }
  }
}
