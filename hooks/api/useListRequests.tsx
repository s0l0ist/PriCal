import * as React from 'react'

import useRequest from '../useRequest'

export type ListRequestsProps = {
  requestIds: string[]
}
export type ListRequestResponse = {
  requestId: string
  requestName: string
}
export type ListRequestResponses = ListRequestResponse[]

type ListRequestsState = {
  processing: boolean
  completed: boolean
  response: ListRequestResponses | undefined
  error: Error | undefined
}
export default function useListRequests() {
  const [state, setState] = React.useState<ListRequestsState>({
    processing: false,
    completed: false,
    response: undefined,
    error: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<ListRequestResponses>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/listClientRequests',
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
        console.warn('Failed to list the client requests')
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
  const makeApiRequest = (payload: ListRequestsProps) => {
    apiRequest<ListRequestsProps>(payload)
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
