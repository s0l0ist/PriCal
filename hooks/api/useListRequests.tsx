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
  response: ListRequestResponses | undefined
  error: Error | undefined
}
export default function useListRequests() {
  const [state, setState] = React.useState<ListRequestsState>({
    processing: false,
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
          response: payload,
          error: undefined
        })
      },
      onError: err => {
        console.error('Failed to list the client requests')
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
  const makeApiRequest = (requestIds: ListRequestsProps) => {
    apiRequest<ListRequestsProps>(requestIds)
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
