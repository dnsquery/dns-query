import { Packet } from '@types/dns-packet'
import { Endpoint } from './endpoints'
import { AbortError, HTTPStatusError, ResponseError, TimeoutError } from './error'

namespace query {
  interface Options {
    /* Set of endpoints to lookup doh queries.  */
    endpoints?: Endpoint[]
    /* Amount of retry's if a request fails, defaults to 3 */
    retry?: number
    /* Timeout for a single request in milliseconds, defaults to 30000 */
    timeout?: number
    /* Signal to abort the request */
    signal?: AbortSignal
  }
}

const query: {
  query (packet: Packet, options?: query.Options): Promise<Packet & {
    endpoint: Endpoint
  }>
  AbortError: typeof AbortError
  HTTPStatusError: typeof HTTPStatusError
  ResponseError: typeof ResponseError
  TimeoutError: typeof TimeoutError
}

export = query
