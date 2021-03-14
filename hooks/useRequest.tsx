import * as React from 'react'

type FetchHandlerProps<T> = {
  onCompleted: (data: T) => void
  onError: (err: Error) => void
}

type FetchProps = {
  url: string
  method: 'post' | 'get' | 'delete'
}

type RequestState = {
  requesting: boolean
  receivedError: boolean
}

const objToQueryString = (payload: any) => {
  const keyValuePairs = []
  for (const key in payload) {
    keyValuePairs.push(
      encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])
    )
  }
  return keyValuePairs.join('&')
}

/**
 * A hook for interfacing with the request API
 */
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
    const [state, setState] = React.useState<RequestState>({
      requesting: false,
      receivedError: false
    })

    /**
     * Dispatches a network request
     * @param payload The payload to be send in the request body
     */
    const request = React.useCallback(
      async function request<A>(payload: A) {
        const handleError = fetchHandlerProps.onError
        const handleCompleted = fetchHandlerProps.onCompleted

        // Fire the request!
        try {
          setState({
            requesting: true,
            receivedError: false
          })

          const options = {
            method: fetchProps.method,
            headers: { 'Content-Type': 'application/json' },
            body: ''
          }

          let url = fetchProps.url
          if (fetchProps.method === 'get') {
            url = `${fetchProps.url}?${objToQueryString(payload)}`
          } else {
            options.body = JSON.stringify(payload)
          }

          const response = await fetch(url, options)
          const json = await response.json()
          handleCompleted(json)
        } catch (e) {
          setState(prev => ({
            ...prev,
            receivedError: true
          }))
          handleError(e)
        } finally {
          setState(prev => ({
            ...prev,
            requesting: false
          }))
        }
      },
      [fetchHandlerProps]
    )

    return React.useMemo(() => [request, state] as const, [request, state])
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
