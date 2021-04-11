import * as React from 'react'

import useRequest, { HTTP_METHOD } from './useRequest'

interface IGetPrivateResponse {
  requestId: string
  contextId: string
}
export type GetPrivateResponseResponse = {
  requestId: string
  requestName: string
  contextId: string
  createdAt: string
  response?: string // Will not be present the client request was not approved
  setup?: string
  updatedAt?: string
}
type GetPrivateResponseState = {
  processing: boolean
  completed: boolean
  response: GetPrivateResponseResponse | undefined
  error: Error | undefined
}
/**
 * A hook for making an API call to get a client request and server response
 */
export default function useGetPrivateResponse() {
  const [state, setState] = React.useState<GetPrivateResponseState>({
    processing: false,
    completed: false,
    response: undefined,
    error: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<GetPrivateResponseResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/serverResponse',
      method: HTTP_METHOD.GET
    },
    {
      onCompleted: payload => {
        setState({
          processing: false,
          completed: true,
          response: payload,
          error: undefined
        })
      },
      onError: err => {
        console.warn('Failed to get the server response')
        setState(prev => ({
          ...prev,
          processing: false,
          completed: true,
          error: err
        }))
      }
    }
  )

  /**
   * Manual refresh of requests
   */
  const makeApiRequest = (payload: IGetPrivateResponse) => {
    apiRequest<IGetPrivateResponse>(payload)
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
