import { PermissionsArray, ReturnTypeAsync } from '../types'

/**
 * Creates a HOC which checks the returned output from a list
 * of functionsbefore returning the original function. Throws an
 * exception if the permissions were not set.
 *
 * @param func
 */
export default function withPermissions(checks: PermissionsArray) {
  // Return a function that accepts another function to wrap in our permissions checks
  return function <T extends (...args: any[]) => any>(
    func: T
  ): (...args: Parameters<T>) => Promise<ReturnTypeAsync<T>> {
    // Return the new function will check permissions
    return async (...args: Parameters<T>): Promise<ReturnTypeAsync<T>> => {
      const statuses = await Promise.all(checks.map(x => x()))
      const failedStatuses = statuses.filter(x => !x.Response.granted)
      if (failedStatuses.length > 0) {
        throw new Error(
          `Attempted to execute a function, but did not have required permissions: [${failedStatuses.map(
            x => x.Permission
          )}]`
        )
      }
      return await func.call(func, args)
    }
  }
}
