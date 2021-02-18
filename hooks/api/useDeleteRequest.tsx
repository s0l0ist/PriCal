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
  response: DeleteRequestResponses | undefined
  error: Error | undefined
}
export default function useDeleteRequest() {
  const [state, setState] = React.useState<DeleteRequestState>({
    processing: false,
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
          response: payload,
          error: undefined
        })
      },
      onError: err => {
        console.error('Failed to delete the client requests(s)')
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
