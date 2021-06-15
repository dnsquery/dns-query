//
// Generates ./endpoints.json from ./endpoints.md
//
const MarkdownIt = require('markdown-it')
const md = new MarkdownIt()
const fs = require('fs')

run()

function run () {
  console.log('# Loading Table from ./endpoints.md')
  const mainTable = loadTables()[0]
  let endpoints = mainTable.slice(1)
  endpoints = endpoints.map(lineToEndpoint)
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
  endpoints?: Array<Endpoint | string>;
  /* Amount of retry's if a request fails, defaults to 5 */
  retries?: number;
  /* Timeout for a single request in milliseconds, defaults to 30000 */
  timeout?: number;
  /* Signal to abort the request */
  signal?: AbortSignal;
}

export interface Endpoint {
  /* Domain name, required! */
  host: string;
  /* Path, prefixed with /, defaults to /dns-query */
  path?: string;
  /* https port, defaults to 443 */
  port?: number;
  /* true, if endpoint logs requests, defaults to false */
  log?: boolean;
  /* true, if endpoint support CORS headers, defaults to false */
  cors?: boolean;
  /* true, if endpoint filters/redirects DNS packets, defaults to false */
  filter?: boolean;
  /* link to documentation, if available */
  docs?: string;
  /* Known geographical location */
  location?: string;
  /* Method to request dns, defaults to GET */
  method?: 'post' | 'Post' | 'POST' | 'get' | 'Get' | 'GET';
  /* DEBUG ONLY! false to use http to connect instead of https, defaults to true */
  https?: boolean;
}

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

function loadTables () {
  const tables = []
  let table
  let line
  let cell
  for (let node of md.parse(fs.readFileSync('./endpoints.md', 'utf-8'), {})) {
    if (node.type === 'table_open') {
      table = []
      tables.push(table)
    }
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
    if (node.type === 'table_close') {
      table = null
      line = null
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
  return tables
}

function reduceLinks (node) {
  const result = []
  let link
  for (const entry of node) {
    if (entry.type === 'link_open') {
      link = {}
      link.href = getAttr('href', entry.attrs)
      result.push(link)
    }
    if (entry.type === 'link_close') {
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
