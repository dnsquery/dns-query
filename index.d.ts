import { Packet } from '@types/dns-packet'

namespace query {
  interface Endpoint {
    host: string
    /* Path, prefixed with /, defaults to /dns-query */
    path?: string
    /* Port, defaults to 443 */
    port?: number
    /* true, if endpoint logs requests */
    logging?: boolean
    /* true, if endpoint support CORS headers */
    cors?: boolean
    /* true, if endpoint filters/redirects DNS packets */
    filtered?: boolean
  }
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

declare function query (packet: Packet, options?: query.Options): Promise<Packet>
export = query
