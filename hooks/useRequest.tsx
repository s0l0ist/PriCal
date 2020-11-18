import * as React from 'react'

interface RequestProps {
  onCompleted?: (data: any) => void
  onError?: (err: Error) => void
}

interface FetchProps {
  url: string
  method: 'post' | 'get'
  payload?: any
}

export default function useRequest(props?: RequestProps) {
  const handleError = props?.onError ? props.onError : () => {}
  const handleCompleted = props?.onCompleted ? props.onCompleted : () => {}

  const buildRequest = React.useCallback((buildProps: FetchProps) => {
    const [loading, setLoading] = React.useState<boolean>(false)

    const request = async (payload: any = {}) => {
      const mergedProps = { ...buildProps, payload }
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
