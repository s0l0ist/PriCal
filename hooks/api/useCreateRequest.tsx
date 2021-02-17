import * as React from 'react'

import useRequest from '../useRequest'

export type CreateRequestProps = {
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
  response: CreateRequestResponse | undefined
  error: Error | undefined
}
export default function useCreateRequest() {
  const [state, setState] = React.useState<CreateRequestState>({
    processing: false,
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
          response: payload,
          error: undefined
        })
      },
      onError: err => {
        console.error('Failed to create the client request')
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
  const makeApiRequest = (requestIds: CreateRequestProps) => {
    apiRequest<CreateRequestProps>(requestIds)
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
