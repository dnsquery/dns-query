let AbortError = typeof global !== 'undefined' ? global.AbortError : typeof window !== 'undefined' ? window.AbortError : null
if (!AbortError) {
  AbortError = class AbortError extends Error {
    constructor (message = 'Request aborted.') {
      super(message)
    }
  }
}
AbortError.prototype.name = 'AbortError'
AbortError.prototype.code = 'ABORT_ERR'

const URL = (typeof globalThis !== 'undefined' && globalThis.URL) || require('url').URL

export { AbortError, URL }

export class HTTPStatusError extends Error {
  constructor (uri, code, method) {
    super('status=' + code + ' while requesting ' + uri + ' [' + method + ']')
    this.uri = uri
    this.status = code
    this.method = method
  }

  toJSON () {
    return {
      code: this.code,
      uri: this.uri,
      status: this.status,
      method: this.method,
      endpoint: this.endpoint
    }
  }
}
HTTPStatusError.prototype.name = 'HTTPStatusError'
HTTPStatusError.prototype.code = 'HTTP_STATUS'

export class ResponseError extends Error {
  constructor (message, cause) {
    super(message)
    this.cause = cause
  }

  toJSON () {
    return {
      message: this.message,
      endpoint: this.endpoint,
      code: this.code,
      cause: reduceError(this.cause)
    }
  }
}
ResponseError.prototype.name = 'ResponseError'
ResponseError.prototype.code = 'RESPONSE_ERR'

export class TimeoutError extends Error {
  constructor (timeout) {
    super('Timeout (t=' + timeout + ').')
    this.timeout = timeout
  }

  toJSON () {
    return {
      code: this.code,
      endpoint: this.endpoint,
      timeout: this.timeout
    }
  }
}
TimeoutError.prototype.name = 'TimeoutError'
TimeoutError.prototype.code = 'ETIMEOUT'

const v4Regex = /^((\d{1,3}\.){3,3}\d{1,3})(:(\d{2,5}))?$/
const v6Regex = /^((::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?)(:(\d{2,5}))?$/i

export function reduceError (err) {
  if (typeof err === 'string') {
    return {
      message: err
    }
  }
  try {
    const json = JSON.stringify(err)
    if (json !== '{}') {
      return JSON.parse(json)
    }
  } catch (e) {}
  const error = {
    message: String(err.message || err)
  }
  if (err.code !== undefined) {
    error.code = String(err.code)
  }
  return error
}

export function parseEndpoint (endpoint) {
  const parts = /^(([^:]+?:)\/\/)?([^/]*?)(\/.*?)?(\s\[(post|get)\])?(\s\[pk=(.*)\])?(\s\[cors\])?(\s\[name=(.*)\])?$/i.exec(endpoint)
  const protocol = parts[2] || 'https:'
  let family = 1
  let host
  let port
  const ipv6Parts = v6Regex.exec(parts[3])
  if (ipv6Parts) {
    const ipv4Parts = v4Regex.exec(parts[3])
    if (ipv4Parts) {
      host = ipv4Parts[1]
      if (ipv4Parts[4]) {
        port = parseInt(ipv4Parts[4])
      }
    } else {
      family = 2
      host = ipv6Parts[1]
      if (ipv6Parts[9]) {
        port = parseInt(ipv6Parts[10])
      }
    }
  } else {
    const portParts = /^([^:]*)(:(.*))?$/.exec(parts[3])
    host = portParts[1]
    if (portParts[3]) {
      port = parseInt(portParts[3])
    }
  }
  if ((protocol === 'udp:' && family === 2) || protocol === 'udp6:') {
    return toEndpoint({ name: parts[11], protocol: 'udp6:', ipv6: host, pk: parts[8], port })
  }
  if ((protocol === 'udp:' && family === 1) || protocol === 'udp4:') {
    return toEndpoint({ name: parts[11], protocol: 'udp4:', ipv4: host, pk: parts[8], port })
  }
  return toEndpoint({
    name: parts[11],
    protocol,
    host,
    port,
    path: parts[4],
    method: parts[6],
    cors: !!parts[9]
  })
}

export const supportedProtocols = ['http:', 'https:', 'udp4:', 'udp6:']

export class BaseEndpoint {
  constructor (opts, isHTTP) {
    this.name = opts.name || null
    this.protocol = opts.protocol
    const port = typeof opts.port === 'string' ? opts.port = parseInt(opts.port, 10) : opts.port
    if (port === undefined || port === null) {
      this.port = isHTTP
        ? (this.protocol === 'https:' ? 443 : 80)
        : (opts.pk ? 443 : 53)
    } else if (typeof port !== 'number' && !isNaN(port)) {
      throw new Error(`Invalid Endpoint: port "${opts.port}" needs to be a number: ${JSON.stringify(opts)}`)
    } else {
      this.port = port
    }
  }

  toJSON () {
    return this.toString()
  }
}

export class UDPEndpoint extends BaseEndpoint {
  constructor (opts) {
    super(opts, false)
    this.pk = opts.pk || null
  }

  toString () {
    const port = this.port !== (this.pk ? 443 : 53) ? `:${this.port}` : ''
    const pk = this.pk ? ` [pk=${this.pk}]` : ''
    const name = this.name ? ` [name=${this.name}]` : ''
    return `udp://${this.ipv4 || this.ipv6}${port}${pk}${name}`
  }
}

export class UDP4Endpoint extends UDPEndpoint {
  constructor (opts) {
    super(opts)
    if (!opts.ipv4 || typeof opts.ipv4 !== 'string') {
      throw new Error(`Invalid Endpoint: .ipv4 "${opts.ipv4}" needs to be set: ${JSON.stringify(opts)}`)
    }
    this.ipv4 = opts.ipv4
  }
}

export class UDP6Endpoint extends UDPEndpoint {
  constructor (opts) {
    super(opts)
    if (!opts.ipv6 || typeof opts.ipv6 !== 'string') {
      throw new Error(`Invalid Endpoint: .ipv6 "${opts.ipv6}" needs to be set: ${JSON.stringify(opts)}`)
    }
    this.ipv6 = opts.ipv6
  }
}

export class HTTPEndpoint extends BaseEndpoint {
  constructor (opts) {
    super(opts, true)
    if (!opts.host || typeof opts.host !== 'string') {
      throw new Error(`Invalid Endpoint: host "${opts.path}" needs to be set: ${JSON.stringify(opts)}`)
    }
    this.host = opts.host
    this.cors = !!opts.cors
    this.path = opts.path || '/dns-query'
    this.method = /^post$/i.test(opts.method) ? 'POST' : 'GET'
    this.ipv4 = opts.ipv4
    this.ipv6 = opts.ipv6
    const urlHost = v6Regex.test(this.host) && !v4Regex.test(this.host) ? `[${this.host}]` : this.host
    this.url = new URL(`${this.protocol}//${urlHost}:${this.port}${this.path}`)
  }

  toString () {
    const port = this.port !== (this.protocol === 'https:' ? 443 : 80) ? `:${this.port}` : ''
    const method = this.method !== 'GET' ? ' [post]' : ''
    const cors = this.cors ? ' [cors]' : ''
    const path = this.path === '/dns-query' ? '' : this.path
    const name = this.name ? ` [name=${this.name}]` : ''
    return `${this.protocol}//${this.host}${port}${path}${method}${cors}${name}`
  }
}

export function toEndpoint (opts) {
  if (opts.protocol === null || opts.protocol === undefined) {
    opts.protocol = 'https:'
  }
  const protocol = opts.protocol
  if (protocol === 'udp4:') {
    return new UDP4Endpoint(opts)
  }
  if (protocol === 'udp6:') {
    return new UDP6Endpoint(opts)
  }
  if (protocol === 'https:' || protocol === 'http:') {
    return new HTTPEndpoint(opts)
  }
  throw new Error(`Invalid Endpoint: unsupported protocol "${opts.protocol}" for endpoint: ${JSON.stringify(opts)}, supported protocols: ${supportedProtocols.join(', ')}`)
}
