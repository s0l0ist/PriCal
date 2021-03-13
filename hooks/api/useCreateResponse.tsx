import * as React from 'react'

import useRequest from '../useRequest'

export type CreateResponseProps = {
  requestId: string
  response: string
  setup: string
}
export type CreateResponseResponse = {
  requestId: string
}
type CreateResponseState = {
  processing: boolean
  completed: boolean
  response: CreateResponseResponse | undefined
  error: Error | undefined
}
export default function useCreateResponse() {
  const [state, setState] = React.useState<CreateResponseState>({
    processing: false,
    completed: false,
    response: undefined,
    error: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<CreateResponseResponse>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/serverResponse',
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
        console.warn('Failed to create the server response')
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
  const makeApiRequest = (payload: CreateResponseProps) => {
    apiRequest<CreateResponseProps>(payload)
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
