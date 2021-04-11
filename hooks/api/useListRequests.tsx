import * as React from 'react'

import useRequest, { HTTP_METHOD } from './useRequest'

interface IListRequests {
  requestIds: string[]
}
export type ListRequestResponse = {
  requestId: string
  requestName: string
  createdAt: string
  updatedAt?: string // If the requestee did not approve, this field will not be present
}
export type ListRequestResponses = ListRequestResponse[]

type ListRequestsState = {
  processing: boolean
  completed: boolean
  response: ListRequestResponses | undefined
  error: Error | undefined
}
/**
 * A hook for making an API call to list all client requests
 */
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
      method: HTTP_METHOD.POST
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
  const makeApiRequest = (payload: IListRequests) => {
    apiRequest<IListRequests>(payload)
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
