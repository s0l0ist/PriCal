import * as React from 'react'

interface FetchHandlerProps {
  onCompleted?: (data: any) => void
  onError?: (err: Error) => void
}

interface FetchProps {
  url: string
  method: 'post' | 'get'
  payload?: any
}

export default function useRequest(globalProps?: FetchHandlerProps) {
  const buildRequest = React.useCallback((fetchProps: FetchProps) => {
    const [loading, setLoading] = React.useState<boolean>(false)

    const request = async (
      payload: any = {},
      localProps?: FetchHandlerProps
    ) => {
      // Determine which callbacks to use. From global props, from
      // from local props, or the default handlers
      const handleError = localProps?.onError
        ? localProps.onError
        : globalProps?.onError
        ? globalProps.onError
        : (data: any) => console.log('Resonse', data)
      const handleCompleted = localProps?.onCompleted
        ? localProps.onCompleted
        : globalProps?.onCompleted
        ? globalProps.onCompleted
        : (err: Error) => console.error(err)

      // Override the fetchProps if it was passed into a request.
      const mergedProps = {
        ...fetchProps,
        payload: {
          ...fetchProps.payload,
          payload
        }
      }

      // Fire the request!
      try {
        setLoading(true)
        const response = await fetch(mergedProps.url, {
          method: mergedProps.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedProps.payload)
        })
        handleCompleted(await response.json())
      } catch (e) {
        handleError(e)
      } finally {
        setLoading(false)
      }
    }

    return [
      request,
      {
        loading
      }
    ] as const
  }, [])

  return {
    buildRequest
  } as const
}
