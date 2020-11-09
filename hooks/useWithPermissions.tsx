import {
  PermissionResponse,
  hasCalendarPermission,
  hasReminderPermission
} from '../permissions'

export type Callback<A, T> = {
  (args?: A): T
}

/**
 * Creates a wrapped function which checks the returned output from a list
 * of functionsbefore returning the original function. If the prechecks failed,
 * return a null function handler.
 *
 * @param checkPermissions Permissions to check
 */
function useWithPreCheck<A, T>(
  preChecks: (() => Promise<PermissionResponse>)[]
) {
  return async function withCallback(callback: Callback<A, T>) {
    // Wait for all preChecks to complete
    const statuses = await Promise.all(preChecks.map(x => x()))
    const failedStatuses = statuses.filter(x => !x.Response.granted)
    if (failedStatuses.length > 0) {
      throw new Error(
        `Called function ${
          callback.name
        }, but did not have required permissions: [${failedStatuses.map(
          x => x.Permission
        )}]`
      )
    }

    return callback
  }
}

/**
 * Creates a wrapped function which checks for all permissions necessary
 * for the function to execute successfully
 *
 * @param fn Async function to execute
 */
async function useWithAllPermissions<A, T>(
  fn: Callback<A, T>
): Promise<Callback<A, T>> {
  return await useWithPreCheck<A, T>([
    hasReminderPermission,
    hasCalendarPermission
  ])(fn)
}

export default function useWithPermissions<A, T>(args?: A) {
  return async (fn: Callback<A, T>) => {
    const wrapped = await useWithAllPermissions(fn)
    return wrapped(args)
  }
}
