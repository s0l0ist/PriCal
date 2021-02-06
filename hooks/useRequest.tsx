import * as React from 'react'

interface FetchHandlerProps<T> {
  onCompleted: (data: T) => void
  onError: (err: Error) => void
}

interface FetchProps {
  url: string
  method: 'post' | 'get'
}

type RequestState = {
  requesting: boolean
  receivedError: boolean
}

function objToQueryString(payload: any) {
  const keyValuePairs = []
  for (const key in payload) {
    keyValuePairs.push(
      encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])
    )
  }
  return keyValuePairs.join('&')
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

          let url = fetchProps.url
          const options = {
            method: fetchProps.method,
            headers: { 'Content-Type': 'application/json' },
            body: ''
          }

          if (fetchProps.method === 'post') {
            options.body = JSON.stringify(payload)
          }

          if (fetchProps.method === 'get') {
            url = `${fetchProps.url}?${objToQueryString(payload)}`
          }

          const response = await fetch(url, options)
          handleCompleted(await response.json())
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

    return React.useMemo(() => [request, state] as const, [request])
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
