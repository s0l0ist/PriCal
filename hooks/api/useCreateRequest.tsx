import * as React from 'react'

import useRequest from '../useRequest'

export type CreateRequestProps = {
  token?: string // This is an optional push notification token
  requestName: string
  contextId: string
  request: string
}
export type CreateRequestResponse = {
  requestId: string
  requestName: string
  contextId: string
}
type CreateRequestState = {
  processing: boolean
  completed: boolean
  response: CreateRequestResponse | undefined
  error: Error | undefined
}
export default function useCreateRequest() {
  const [state, setState] = React.useState<CreateRequestState>({
    processing: false,
    completed: false,
    response: undefined,
    error: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<CreateRequestResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/clientRequest',
      method: 'post'
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
        console.warn('Failed to create the client request')
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
  const makeApiRequest = (payload: CreateRequestProps) => {
    apiRequest<CreateRequestProps>(payload)
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
