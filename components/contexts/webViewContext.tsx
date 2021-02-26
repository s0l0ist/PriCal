import * as React from 'react'

import {
  Context,
  ServerResponse,
  Intersection
} from '../../hooks/useWebViewProtocol'

type ContextProps = {
  createClientRequest: (grid: string[]) => Promise<Context>
  createServerResponse: (
    request: string,
    grid: string[]
  ) => Promise<ServerResponse>
  computeIntersection: (
    key: string,
    response: string,
    setup: string
  ) => Promise<Intersection>
}

// We cannot set a default value until the WebView has been loaded. Unfortunately,
// this means we need to keep in mind this context may not be initialized. However
// in this application, we're ensuring we use the context after it has been initialized.
const PsiWebViewContext = React.createContext<ContextProps>({} as ContextProps)

export default PsiWebViewContext
