import * as React from 'react'

import { PROFILE, REQUEST_MAP } from '../../utils/constants'
import useStorage from './useStorage'

export type Request = {
  requestId: string
  requestName: string
  contextId: string
  privateKey: string
}

export type Profile = {
  name: string
}

/**
 * A hook for a universal storage library specific to this application
 */
export default function useSync() {
  const [
    ,
    { storeMap, getMap, getObject, storeObject, deleteObject }
  ] = useStorage()

  /**
   * Get the user's stored profile
   */
  const getProfile = () => {
    return getObject<Profile>(PROFILE)
  }

  /**
   * Set the user's profile
   */
  const storeProfile = (profile: Profile) => {
    return storeObject<Profile>(PROFILE, profile)
  }

  /**
   * Delete the user's profile
   */
  const removeProfile = () => {
    return deleteObject(PROFILE)
  }

  /**
   * Get a single request from storage
   */
  const getRequest = async (requestId: string) => {
    const requests = await getMap<Request>(REQUEST_MAP)
    return requests.get(requestId)
  }
  /**
   * Get a all requests from storage
   */
  const getRequests = () => {
    return getMap<Request>(REQUEST_MAP)
  }
  /**
   * Adds a single request overwriting any existing entry
   */
  const addRequest = async (request: Request) => {
    const requests = await getMap<Request>(REQUEST_MAP)
    requests.set(request.requestId, request)
    return storeMap<Request>(REQUEST_MAP, requests)
  }
  /**
   * Adds multiple requests to storage overwiting existing entries
   */
  const addRequests = async (requests: Request[]) => {
    const prevRequests = await getMap<Request>(REQUEST_MAP)
    requests.forEach(x => {
      prevRequests.set(x.requestId, x)
    })
    return storeMap<Request>(REQUEST_MAP, prevRequests)
  }

  /**
   * Removes a single request from storage by requestId
   */
  const removeRequest = async (requestId: string) => {
    const requests = await getMap<Request>(REQUEST_MAP)
    requests.delete(requestId)
    return storeMap<Request>(REQUEST_MAP, requests)
  }

  /**
   * Removes multiple requests from storage by requestId
   */
  const removeRequests = async (requestIds: string[]) => {
    const requests = await getMap<Request>(REQUEST_MAP)
    requestIds.forEach(id => requests.delete(id))
    return storeMap<Request>(REQUEST_MAP, requests)
  }

  /**
   * Removes any existing not in the specified list of requestIds
   */
  const filterRequests = async (requestIds: string[]) => {
    const newRequests = new Map<string, Request>()
    const prevRequests = await getMap<Request>(REQUEST_MAP)
    requestIds.forEach(id => {
      if (prevRequests.has(id)) {
        newRequests.set(id, prevRequests.get(id)!)
      }
    })
    return storeMap<Request>(REQUEST_MAP, newRequests)
  }

  /**
   * Assigns multiple requests to storage overwiting all previous entries
   */
  const setRequests = async (requests: Request[]) => {
    const newRequests = new Map<string, Request>()
    requests.forEach(x => {
      newRequests.set(x.requestId, x)
    })
    return storeMap<Request>(REQUEST_MAP, newRequests)
  }

  /**
   * Clear all requests in storage
   */
  const clearRequests = () => setRequests([])

  return React.useMemo(
    () =>
      ({
        getProfile,
        storeProfile,
        removeProfile,
        getRequest,
        getRequests,
        addRequest,
        addRequests,
        removeRequest,
        removeRequests,
        filterRequests,
        setRequests,
        clearRequests
      } as const),
    [
      getProfile,
      storeProfile,
      removeProfile,
      getRequest,
      getRequests,
      addRequest,
      addRequests,
      removeRequest,
      removeRequests,
      filterRequests,
      setRequests,
      clearRequests
    ]
  )
}
