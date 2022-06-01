import { SingleQuestionPacket } from '@leichtgewicht/dns-packet';
import {
  Endpoint, EndpointOpts
} from '../common.js';

import {
  RawResolver
} from '../resolvers.js';

export {
  TimeoutError,
  HTTPStatusError,
  AbortError,
  ResponseError,
  BaseEndpoint,
  BaseEndpointOpts,
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
  RawResolver
} from '../resolvers.js';

export type Resolver = RawResolver<Endpoint>;
export const backup: {
  data: Resolver
  time: number
};

export interface Wellknown {
  resolvers: Resolver[];
  resolverByName: { [name: string]: Resolver };
  endpoints: Endpoint[];
  endpointByName: { [name: string]: Endpoint };
}

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
  localStoragePrefix: string
  maxAge: number
}>;

export class Session {
  opts: SessionOpts;
  constructor(opts: SessionOpts);

  wellknown(): Promise<Wellknown>;
  endpoints(): Promise<Endpoint[]>;
  query(query: SingleQuestionPacket, opts: QueryOpts): Promise<SingleQuestionPacket>;
}

export function query(query: SingleQuestionPacket, opts: QueryOpts): Promise<SingleQuestionPacket & {
  endpoint: string
  response: any
}>;
export function wellknown(): Promise<Wellknown>;
export function endpoints(): Promise<Endpoint[]>;
export function loadEndpoints(session: Session, input: EndpointInput): Promise<Endpoint[]>;
