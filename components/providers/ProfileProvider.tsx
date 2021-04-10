import * as React from 'react'

import ProfileContext, { IProfileContext } from '../contexts/ProfileContext'

/**
 * Create a Profile provider that will provide the
 * users profile to child components
 */
const ProfileProvider: React.FC<IProfileContext> = ({
  profile,
  setProfile,
  children
}) => {
  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export default ProfileProvider
