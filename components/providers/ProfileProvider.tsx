import * as React from 'react'

import { Profile } from '../../hooks/store/useSync'
import ProfileContext from '../contexts/ProfileContext'

type ProfileProviderProps = {
  profile: Profile | undefined
}

/**
 * Create a Profile provider that will provide the
 * users profile to child components
 */
const ProfileProvider: React.FC<ProfileProviderProps> = ({
  profile,
  children
}) => {
  return (
    <ProfileContext.Provider
      value={{
        profile
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export default ProfileProvider
