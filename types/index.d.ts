import { Packet } from 'dns-packet';
import { IncomingMessage } from 'http';

export interface Options {
  /* Set of endpoints to lookup doh queries.  */
  endpoints?: 'doh' | 'dns' | Iterable<Endpoint | EndpointProps | string>;
  /* Amount of retry's if a request fails, defaults to 5 */
  retries?: number;
  /* Timeout for a single request in milliseconds, defaults to 30000 */
  timeout?: number;
  /* Signal to abort the request */
  signal?: AbortSignal;
}

export type EndpointProps = Omit<Endpoint, ''>;
export type Response = undefined | XMLHttpRequest | IncomingMessage;

export function query(packet: Packet, options?: Options): Promise<Packet & {
  endpoint: Endpoint;
  response: Response;
}>;

export function parseEndpoints(endpoints?: Iterable<Endpoint | EndpointProps | string>): Endpoint[];
