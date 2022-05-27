import { Endpoint } from './common.js'

export interface Resolver {
  name: string
  endpoint: Endpoint
  /** Description as provided by hoster. */
  description: string
  /** true, if endpoint is known to log requests, defaults to false */
  log?: boolean
  /** true, if endpoint is known to filters/redirects DNS packets, defaults to false */
  filter?: boolean
  /** link to documentation */
  docs?: string
  /** Country as specified by hoster */
  country?: string
  /** GEO Location as specified by the hoster */
  location?: {
    lat: number
    long: number
  }
}
export interface ResolverLookup {
  resolvers: Resolver[]
  resolverByName: { [name: string]: Resolver }
  endpoints: Endpoint[]
  endpointByName: { [name: string]: Endpoint }
}

export const lookup: ResolverLookup
