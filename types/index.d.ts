import { Packet } from '@leichtgewicht/dns-packet';
import {
  Endpoint, EndpointOpts
} from '../common.js';

import {
  ResolverLookup
} from '../resolvers.js';

export {
  TimeoutError,
  HTTPStatusError,
  AbortError,
  ResponseError,
  Endpoint,
  EndpointOpts,
  HTTPEndpoint,
  HTTPEndpointOpts,
  UDP4Endpoint,
  UDP4EndpointOpts,
  UDP6Endpoint,
  UDP6EndpointOpts,
  parseEndpoint,
  toEndpoint
} from '../common.js';

export {
  ResolverLookup,
  Resolver
} from '../resolvers.js';

export type OrPromise <T> = Promise<T> | T;
export type EndpointInput = OrPromise<'doh' | 'dns' | ((endpoint: Endpoint) => boolean) | Iterable<Endpoint | EndpointOpts | string>>;

export interface QueryOpts {
  /* Set of endpoints to lookup doh queries.  */
  endpoints?: EndpointInput;
  /* Amount of retry's if a request fails, defaults to 5 */
  retries?: number;
  /* Timeout for a single request in milliseconds, defaults to 30000 */
  timeout?: number;
  /* Signal to abort the request */
  signal?: AbortSignal;
}

export type SessionOpts = Partial<{
  retries: number
  timeout: number
  update: boolean
  updateURL: URL
  persist: boolean
  maxAge: number
}>;

export class Session {
  opts: SessionOpts;
  constructor(opts: SessionOpts);

  wellknown(): Promise<ResolverLookup>;
  endpoints(): Promise<Endpoint[]>;
  query(query: Packet, opts: QueryOpts): Promise<Packet>;
}

export function query(query: Packet, opts: QueryOpts): Promise<Packet>;
export function wellknown(): Promise<ResolverLookup>;
export function endpoints(): Promise<Endpoint[]>;
export function loadEndpoints(session: Session, input: EndpointInput): Promise<Endpoint[]>;
