import * as React from 'react'

import useRequest from '../useRequest'

export type DeleteRequestProps = {
  requests: {
    requestId: string
    contextId: string
  }[]
}
export type DeleteRequestResponse = {
  deletedCount: number
}
export type DeleteRequestResponses = DeleteRequestResponse[]

type DeleteRequestState = {
  processing: boolean
  completed: boolean
  response: DeleteRequestResponses | undefined
  error: Error | undefined
}
/**
 * A hook for making an API call to delete a client request
 */
export default function useDeleteRequest() {
  const [state, setState] = React.useState<DeleteRequestState>({
    processing: false,
    completed: false,
    response: undefined,
    error: undefined
  })
  const { buildRequest } = useRequest()
  const [apiRequest] = buildRequest<DeleteRequestResponses>(
    {
      url:
        'https://us-central1-boreal-ellipse-303722.cloudfunctions.net/clientRequest',
      method: 'delete'
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
        console.warn('Failed to delete the client requests(s)')
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
  const makeApiRequest = (payload: DeleteRequestProps) => {
    apiRequest<DeleteRequestProps>(payload)
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
