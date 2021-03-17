import * as React from 'react'

import useProfile from '../../hooks/useProfile'
import ProfileContext from '../contexts/ProfileContext'

/**
 * Create a Profile provider that will obtain the users
 * current profile or prompt to set one if it doesn't exist.
 * The provider will contain the user's profile holding his name
 * and will be sent in the payload of a client request.
 */
const ProfileProvider: React.FC = ({ children }) => {
  // Declaring the hook will prompt for permissions
  // but since this is not a requirement,
  const [profile, { saveProfile }] = useProfile()

  // TODO: Prompt to set the profile

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
