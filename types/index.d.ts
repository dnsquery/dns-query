import { SingleQuestionPacket, RecordClass } from '@leichtgewicht/dns-packet';
import {
  Endpoint, EndpointOpts, Resolver
} from '../common.js';

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
  toEndpoint,
  Resolver,
  RawResolver
} from '../common.js';

export const backup: {
  data: Resolver
  time: number
};

export type OrPromise <T> = Promise<T> | T;
export type LoadEndpointInput = OrPromise<'doh' | 'dns' | ((endpoint: Endpoint) => boolean) | Iterable<Endpoint | EndpointOpts | string>>;
export type EndpointsInput = OrPromise<Iterable<Endpoint | EndpointOpts | string>>;

export interface QueryOpts {
  /* Set of endpoints to lookup doh queries.  */
  endpoints?: EndpointsInput;
  /* Amount of retry's if a request fails, defaults to 5 */
  retries?: number;
  /* Timeout for a single request in milliseconds, defaults to 30000 */
  timeout?: number;
  /* Signal to abort the request */
  signal?: AbortSignal;
}

export type DNSErrorCodeName = 'FormErr' | 'ServFail' | 'NXDomain' | 'NotImp' | 'Refused' | 'YXDomain' | 'YXRRSet' | 'NXRRSet' | 'NotAuth' | 'NotZone' | 'DSOTYPENI';
export const DNS_RCODE_ERROR: { [key: number]: DNSErrorCodeName };
export const DNS_RCODE_MESSAGE: { [key: number]: string };

export class DNSRcodeError extends Error {
  code: string;
  rcode: RecordClass;
  error: string;
  question: SingleQuestionPacket;
}

export interface WellknownOpts {
  timeout: number;
  update: boolean;
  updateURL: URL;
  persist: boolean;
  localStoragePrefix: string;
  maxAge: number;
}

export function validateResponse <R>(res: R): R;
export function combineTXT(inputs: Uint8Array[]): Uint8Array;

export interface WellknownData {
  resolvers: Resolver[];
  resolverByName: { [name: string]: Resolver };
  endpoints: Endpoint[];
  endpointByName: { [name: string]: Endpoint };
}

export class Wellknown {
  opts: WellknownOpts;
  constructor(opts?: Partial<WellknownOpts>);

  data(): Promise<WellknownData>;
  endpoints(input?: LoadEndpointInput): Promise<Endpoint[]>;
}

export function query(query: SingleQuestionPacket, opts: QueryOpts): Promise<SingleQuestionPacket & {
  endpoint: string
  question: SingleQuestionPacket
  response: any
}>;
export const wellknown: Wellknown;
export interface TxtEntry {
  data: string;
  ttl: number;
}
export interface TxtResult {
  entries: TxtEntry[];
  endpoint: string;
}
export function lookupTxt(domain: string, options: QueryOpts): Promise<TxtResult>;
