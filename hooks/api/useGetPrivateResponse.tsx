import * as React from 'react'

import useRequest from '../useRequest'

export type GetPrivateResponseProps = {
  requestId: string
  contextId: string
}
export type GetPrivateResponseResponse = {
  requestId: string
  requestName: string
  contextId: string
  response: string
  setup: string
}
type GetPrivateResponseState = {
  processing: boolean
  response: GetPrivateResponseResponse | undefined
  error: Error | undefined
}
export default function useGetPrivateResponse() {
  const [state, setState] = React.useState<GetPrivateResponseState>({
    processing: false,
    response: undefined,
    error: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<GetPrivateResponseResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/serverResponse',
      method: 'get'
    },
    {
      onCompleted: payload => {
        setState({
          processing: false,
          response: payload,
          error: undefined
        })
      },
      onError: err => {
        console.warn('Failed to get the server response')
        setState(prev => ({
          ...prev,
          processing: false,
          error: err
        }))
      }
    }
  )

  /**
   * Manual refresh of requests
   */
  const makeApiRequest = (payload: GetPrivateResponseProps) => {
    apiRequest<GetPrivateResponseProps>(payload)
    setState(prev => ({
      ...prev,
      processing: true
    }))
  }

  return React.useMemo(() => [state, makeApiRequest] as const, [
    state,
    makeApiRequest
  ])
}
