import * as React from 'react'

import useRequest from '../useRequest'

export type GetPublicRequestProps = {
  requestId: string
}
export type GetPublicRequestResponse = {
  requestId: string
  request: string
}
type GetPublicRequestState = {
  processing: boolean
  response: GetPublicRequestResponse | undefined
  error: Error | undefined
}
export default function useGetPublicRequest() {
  const [state, setState] = React.useState<GetPublicRequestState>({
    processing: false,
    response: undefined,
    error: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<GetPublicRequestResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/clientRequest',
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
        console.warn('Failed to get the client request')
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
  const makeApiRequest = (payload: GetPublicRequestProps) => {
    apiRequest<GetPublicRequestProps>(payload)
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
