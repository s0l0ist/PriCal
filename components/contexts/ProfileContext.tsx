import * as React from 'react'

import { Profile } from '../../hooks/store/useSync'

/**
 * The type can be undefined for the first time
 */
export type ProfileContextProps = {
  profile: Profile | undefined
}

/**
 * We use a context for the user's local profile to share among
 * the different components. Specifically, we will use it to send
 * the user's name inside the profile in the client request payload
 */
const ProfileContext = React.createContext<ProfileContextProps>({
  profile: undefined
})

export default ProfileContext
