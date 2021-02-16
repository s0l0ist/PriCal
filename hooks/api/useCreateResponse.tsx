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
  response: CreateResponseResponse | undefined
}
export default function useCreateResponse() {
  const [state, setState] = React.useState<CreateResponseState>({
    processing: false,
    response: undefined
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
          response: payload
        })
      },
      onError: err => {
        console.error('Failed to create the server response', err)
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
  const makeApiRequest = (requestIds: CreateResponseProps) => {
    apiRequest<CreateResponseProps>(requestIds)
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
