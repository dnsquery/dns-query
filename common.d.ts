export class AbortError extends Error {
  constructor();
  code: 'ABORT_ERR';
  name: 'AbortError';
  response?: any;
  endpoint?: string;
}

export class HTTPStatusError extends Error {
  constructor(uri: string, status: number, method: string);
  uri: string;
  status: number;
  method: 'POST' | 'GET';
  code: 'HTTP_STATUS';
  name: 'StatusError';
  response?: any;
  endpoint?: string;
  toJSON (): any;
}

export class ResponseError extends Error {
  constructor(message: string)
  code: 'RESPONSE_ERR';
  name: 'ResponseError';
  response?: any;
  endpoint?: string;
  toJSON (): any
}

export class TimeoutError extends Error {
  constructor(timeout: number)
  timeout: number;
  code: 'ETIMEOUT';
  name: 'TimeoutError';
  response?: any;
  endpoint?: string;
  toJSON (): any;
}

export class InvalidProtocolError extends Error {
  constructor (protocol: string, endpoint: string)
  protocol: string;
  endpoint: string;
  code: 'EPROTOCOL';
  name: 'InvalidProtocolError';
  toJSON (): any;
}

export interface BaseEndpointOpts <Protocol extends string> {
  protocol: Protocol
  name?: string | null
  port?: number | string | null
}

export class BaseEndpoint <Protocol extends string> {
  protocol: Protocol
  name: string | null
  port: number

  constructor (
    opts: BaseEndpointOpts<Protocol>,
    isHTTP: boolean
  )
}

export interface UDPEndpointOpts <Protocol extends string> extends BaseEndpointOpts<Protocol> {
  pk?: string | null
}

export class UDPEndpoint <Protocol extends string> extends BaseEndpoint<Protocol> {
  pk: string | null
  constructor (opts: UDPEndpoint<Protocol>)
}

export interface UDP4EndpointOpts extends UDPEndpointOpts<'udp4:'> {
  ipv4: string
}

export class UDP4Endpoint extends UDPEndpoint<'udp4:'> {
  ipv4: string
  constructor (opts: UDP4EndpointOpts)
}

export interface UDP6EndpointOpts extends UDPEndpointOpts<'udp6:'> {
  ipv6: string
}

export class UDP6Endpoint extends UDPEndpoint<'udp6:'> {
  ipv6: string
  constructor (opts: UDP6EndpointOpts)
}

export interface HTTPEndpointOpts extends BaseEndpointOpts<'http:' | 'https:'> {
  host: string
  ipv4?: string
  ipv6?: string
  cors?: boolean
  path?: string
  method?: 'POST' | 'GET'
}

export class HTTPEndpoint extends BaseEndpoint<'http:' | 'https:'> {
  host: string
  ipv4?: string
  ipv6?: string
  cors: boolean
  path: string
  method: 'POST' | 'GET'
  url: URL
  constructor (opts: HTTPEndpointOpts);
}

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
  cors?: boolean
}

export type Resolver = RawResolver<Endpoint>;

export type EndpointOpts = UDP4EndpointOpts | UDP6EndpointOpts | HTTPEndpointOpts;
export type Endpoint = UDP4Endpoint | UDP6Endpoint | HTTPEndpoint;

export function toEndpoint (opts: EndpointOpts | string): Endpoint;
export function parseEndpoint (input: string): Endpoint;
export function reduceError (input: any): any;
