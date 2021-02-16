import * as React from 'react'

import { REQUEST_IDS } from '../../constants/Storage'
import useStorage from './useStorage'

type Request = {
  requestId: string
  requestName: string
  contextId: string
  privateKey: string
}

export default function useSync() {
  const [, { storeObject, getObject }] = useStorage()

  const getRequest = (requestId: string) => {
    return getObject<Request>(requestId)
  }
  const setRequest = (request: Request) => {
    return storeObject<Request>(request.requestId, request)
  }
  const setRequests = (requests: Request[]) => {
    const saveList = requests.map(x => setRequest(x))
    return Promise.all(saveList)
  }
  const listRequestIds = () => {
    return getObject<string[]>(REQUEST_IDS)
  }
  const addRequestId = async (requestId: string) => {
    const requestIds = await listRequestIds()
    return storeObject<string[]>(REQUEST_IDS, [
      ...(requestIds ?? []),
      requestId
    ])
  }

  return React.useMemo(
    () =>
      ({
        getRequest,
        setRequest,
        setRequests,
        listRequestIds,
        addRequestId
      } as const),
    [getRequest, setRequest, setRequests, listRequestIds, addRequestId]
  )
}
