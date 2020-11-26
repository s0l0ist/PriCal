import * as React from 'react'

interface FetchHandlerProps<T> {
  onCompleted: (data: T) => void
  onError: (err: Error) => void
}

interface FetchProps {
  url: string
  method: 'post' | 'get'
}

export default function useRequest() {
  /**
   * Builds a request to be called later
   * @param fetchProps Options for the request
   * @param fetchHandlerProps Optional Handlers to call
   */
  const buildRequest = React.useCallback(function buildRequest<R>(
    fetchProps: FetchProps,
    fetchHandlerProps: FetchHandlerProps<R>
  ) {
    const [loading, setLoading] = React.useState<boolean>(false)

    /**
     * Dispatches a network request
     * @param payload The payload to be send in the request body
     */
    const request = React.useCallback(async function request<A>(payload: A) {
      const handleError = fetchHandlerProps.onError
      const handleCompleted = fetchHandlerProps.onCompleted

      // Fire the request!
      try {
        setLoading(true)
        const response = await fetch(fetchProps.url, {
          method: fetchProps.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        handleCompleted(await response.json())
      } catch (e) {
        handleError(e)
      } finally {
        setLoading(false)
      }
    }, [fetchHandlerProps])

    return React.useMemo(
      () =>
        [
          request,
          {
            loading
          }
        ] as const,
      [request]
    )
  },
  [])

  return React.useMemo(
    () =>
      ({
        buildRequest
      } as const),
    [buildRequest]
  )
}
