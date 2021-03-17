import * as React from 'react'

import useSync, { Profile } from './store/useSync'

/**
 * A hook for interfacing with the user's local profile
 */
export default function useProfile() {
  const [userProfile, setUserProfile] = React.useState<Profile>()

  const { getProfile, setProfile } = useSync()

  /**
   * Saves a user's profile
   */
  const saveProfile = async (profile: Profile) => {
    setUserProfile(profile)
    setProfile(profile)
  }

  /**
   * Effect: on mount, load the user's profile
   */
  React.useEffect(() => {
    ;(async () => {
      const profile = await getProfile()
      if (profile) {
        setUserProfile(profile)
      }
    })()
  }, [])

  return React.useMemo(() => [userProfile, { saveProfile }] as const, [
    userProfile,
    saveProfile
  ])
}
