import * as React from 'react'

import {
  ClientRequest,
  ServerResponse,
  Intersection,
  IClientRequest,
  IComputeIntersection,
  IServerResponse
} from '../../hooks/usePsiProtocol'

export interface IPsiContext {
  createClientRequest: (props: IClientRequest) => Promise<ClientRequest>
  createServerResponse: (props: IServerResponse) => Promise<ServerResponse>
  computeIntersection: (props: IComputeIntersection) => Promise<Intersection>
}

// We cannot set a default value until the WebView has been loaded. Unfortunately,
// this means we need to keep in mind this context may not be initialized. However
// in this application, we're ensuring we use the context after it has been initialized.
const PsiContext = React.createContext<IPsiContext>({} as IPsiContext)

export default PsiContext
