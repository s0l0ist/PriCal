import * as React from 'react'

import useSync, { Profile } from './store/useSync'

type ProfileState = {
  profile: Profile | undefined
  loaded: boolean
}
/**
 * A hook for interfacing with the user's local profile
 */
export default function useProfile() {
  const [state, setState] = React.useState<ProfileState>({
    profile: undefined,
    loaded: false
  })

  const { getProfile, storeProfile } = useSync()

  /**
   * Saves a user's profile
   */
  const saveProfile = (profile: Profile) => {
    setState(prev => ({
      ...prev,
      profile
    }))
    return storeProfile(profile)
  }

  /**
   * Effect: on mount, load the user's profile
   */
  React.useEffect(() => {
    ;(async () => {
      const profile = await getProfile()
      if (profile) {
        setState({
          profile,
          loaded: true
        })
        return
      }
      setState(prev => ({
        ...prev,
        loaded: true
      }))
    })()
  }, [])

  return React.useMemo(() => [state, { saveProfile }] as const, [
    state,
    saveProfile
  ])
}
