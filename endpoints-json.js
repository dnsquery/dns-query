//
// Generates ./endpoints.json from ./endpoints.md
//
const MarkdownIt = require('markdown-it')
const md = new MarkdownIt()
const fs = require('fs')

run()

function run () {
  console.log('# Loading Table from ./endpoints.md')
  const endpoints = loadTable(0).slice(1).map(lineToEndpoint)
  const result = {}
  for (const endpoint of endpoints) {
    result[endpoint.name] = endpoint
    delete endpoint.name
  }
  console.log('# Writing JSON to ./endpoints.json')
  fs.writeFileSync('./endpoints.json', JSON.stringify(result, null, 2))
  console.log('# Writing types to ./types/index.d.ts')
  fs.writeFileSync('./types/index.d.ts', createDTS(result))
  console.log('# Done.')
}

function createDTS (result) {
  return `import { Packet } from 'dns-packet';

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

export class Endpoint {
  /* https is the default for DoH endpoints, udp4:/upd6: for regular dns endpoints and http for debug only! defaults to https: */
  protocol?: 'http:' | 'https:' | 'udp4:' | 'udp6:';
  /* Host to look up */
  host: string;
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

export type EndpointProps = Omit<Endpoint, ''>;

export function query(packet: Packet, options?: Options): Promise<Packet & {
  endpoint: Endpoint;
}>;

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
}
export class ResponseError extends Error {
  constructor(message: string)
  code: 'RESPONSE_ERR';
  name: 'ResponseError';
}
export class TimeoutError extends Error {
  constructor(timeout: number)
  timeout: number;
  code: 'ETIMEOUT';
  name: 'TimeoutError';
}
export function parseEndpoints(endpoints?: Iterable<Endpoint | EndpointProps | string>): Endpoint[];
export const endpoints: {
  ${Object.keys(result).map(createDTSEndpoint).join('\n  ')}
};
`
}

function createDTSEndpoint (name) {
  return `${name}: Endpoint;`
}

function lineToEndpoint (line) {
  const [[{ text: name, href: docs }], [rawHost], [location], [filter], [log], [cors], [method]] = line
  const url = new URL(`https://${rawHost}`)
  const endpoint = {
    name,
    host: url.hostname,
    docs
  }
  if (url.port) {
    endpoint.port = parseInt(url.port, 10)
  }
  if (url.pathname !== '/') {
    endpoint.path = url.pathname
  }
  if (bool(cors)) {
    endpoint.cors = true
  }
  if (bool(filter)) {
    endpoint.filter = true
  }
  if (bool(log)) {
    endpoint.log = true
  }
  if (method === 'POST') {
    endpoint.method = 'POST'
  }
  if (location !== '?') {
    endpoint.location = location
  }
  return endpoint
}

function bool (txt) {
  return /✓/.test(txt)
}

function loadTable (index) {
  let table
  let line
  let cell
  let current = 0
  let active = false
  for (let node of md.parse(fs.readFileSync('./endpoints.md', 'utf-8'), {})) {
    if (node.type === 'table_open') {
      table = []
      active = current === index
    }
    if (active) {
      if (node.type === 'tr_open') {
        line = []
        table.push(line)
      }
      if (node.type === 'td_open' || node.type === 'th_open') {
        cell = []
        line.push(cell)
        continue
      }
      if (node.type === 'td_close' || node.type === 'th_close') {
        cell = null
      }
    }
    if (node.type === 'table_close') {
      if (current === index) {
        return table
      }
      table = null
      line = null
      current++
    }
    if (cell) {
      if (node.type === 'inline') {
        node = reduceLinks(node.children)
      }
      if (Array.isArray(node) && node.length === 1) {
        node = node[0]
      }
      cell.push(node)
    }
  }
}

function reduceLinks (node) {
  const result = []
  let link
  for (const entry of node) {
    if (entry.type === 'link_open') {
      link = {
        href: getAttr('href', entry.attrs)
      }
    }
    if (entry.type === 'link_close') {
      if (link) {
        result.push(link)
      }
      link = null
    }
    if (entry.type === 'text') {
      if (link) {
        link.text = entry.content
      } else {
        result.push(entry.content)
      }
    }
  }
  return result
}

function getAttr (type, attrs) {
  for (const attr of attrs) {
    if (attr[0] === type) {
      return attr[1]
    }
  }
}
