import * as React from 'react'

import { Profile } from '../../hooks/store/useSync'

/**
 * The type can be undefined for the first time
 */
export interface IProfileContext {
  profile: Profile
  setProfile: (profile: Profile) => void
}

/**
 * We use a context for the user's local profile to share with
 * the different components. Specifically, we will use it to send
 * the user's name inside the profile in the client request payload
 */
const ProfileContext = React.createContext<IProfileContext>({
  profile: {
    name: ''
  },
  setProfile: () => {}
})

export default ProfileContext
