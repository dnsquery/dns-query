export class AbortError extends Error {
  constructor();
  code: 'ABORT_ERR';
  name: 'AbortError';
}

export class HTTPStatusError extends Error {
  constructor(uri: string, status: number, method: string);
  uri: string;
  status: number;
  method: 'POST' | 'GET';
  code: 'HTTP_STATUS';
  name: 'StatusError';
  response: Response;
  endpoint: Endpoint;
}

export class ResponseError extends Error {
  constructor(message: string)
  code: 'RESPONSE_ERR';
  name: 'ResponseError';
  response: Response;
  endpoint: Endpoint;
}

export class TimeoutError extends Error {
  constructor(timeout: number)
  timeout: number;
  code: 'ETIMEOUT';
  name: 'TimeoutError';
}

export class Endpoint {
  /* https is the default for DoH endpoints, udp4:/upd6: for regular dns endpoints and http for debug only! defaults to https: */
  protocol?: 'http:' | 'https:' | 'udp4:' | 'udp6:';
  /* Host to look up, http/https only */
  host: string;
  /* IP4, IPV6 */
  /* Path, prefixed with /, defaults to /dns-query for the http/https protocol, ignored for udp */
  path?: string;
  /* https port, defaults to 443 for https, 80 for http and 53 for udp*/
  port?: number;
  /* true, if endpoint is known to log requests, defaults to false */
  log?: boolean;
  /* true, if endpoint supports http/https CORS headers, defaults to false */
  cors?: boolean;
  /* true, if endpoint is known to filters/redirects DNS packets, defaults to false */
  filter?: boolean;
  /* link to documentation, if available */
  docs?: string;
  /* Known geographical location */
  location?: string;
  /* Method to request in case of http/https, defaults to GET */
  method?: 'post' | 'Post' | 'POST' | 'get' | 'Get' | 'GET';
  constructor(data: EndpointProps);
}