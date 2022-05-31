import { EndpointOpts } from './common.js'

export interface RawResolver <Endpoint=EndpointOpts> {
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

export const resolvers: {
  data: RawResolver[]
  time: number
}
