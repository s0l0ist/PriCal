import * as React from 'react'

import useRequest from '../useRequest'

export type GetRequestProps = {
  requestId: string
  contextId: string
}
export type GetRequestResponse = {
  requestId: string
  requestName: string
  contextId: string
  response: string
  setup: string
}
type GetRequestState = {
  processing: boolean
  response: GetRequestResponse | undefined
}
export default function useGetRequest() {
  const [state, setState] = React.useState<GetRequestState>({
    processing: false,
    response: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<GetRequestResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/serverResponse',
      method: 'get'
    },
    {
      onCompleted: payload => {
        setState({
          processing: false,
          response: payload
        })
      },
      onError: err => {
        console.error('Failed to get the server response', err)
        setState(prev => ({
          ...prev,
          processing: false
        }))
      }
    }
  )

  /**
   * Manual refresh of requests
   */
  const makeApiRequest = (requestIds: GetRequestProps) => {
    apiRequest<GetRequestProps>(requestIds)
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
