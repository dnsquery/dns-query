let AbortError = typeof global !== 'undefined' ? global.AbortError : typeof window !== 'undefined' ? window.AbortError : null
if (!AbortError) {
  AbortError = class AbortError extends Error {
    constructor (message = 'Request aborted.') {
      super(message)
      Error.captureStackTrace(this, AbortError)
    }
  }
}
AbortError.prototype.name = 'AbortError'
AbortError.prototype.code = 'ABORT_ERR'

const URL = global.URL || require('url').URL

export { AbortError, URL }

export class HTTPStatusError extends Error {
  constructor (uri, code, method) {
    super('status=' + code + ' while requesting ' + uri + ' [' + method + ']')
    Error.captureStackTrace(this, HTTPStatusError)
    this.uri = uri
    this.status = code
    this.method = method
  }

  toJSON () {
    return {
      code: this.code,
      uri: this.uri,
      status: this.status,
      method: this.method
    }
  }
}
HTTPStatusError.prototype.name = 'HTTPStatusError'
HTTPStatusError.prototype.code = 'HTTP_STATUS'

export class ResponseError extends Error {
  constructor (message, cause) {
    super(message)
    Error.captureStackTrace(this, ResponseError)
    this.cause = cause
  }

  toJSON () {
    return {
      message: this.message,
      code: this.code,
      cause: JSON.parse(JSON.stringify(this.cause))
    }
  }
}
ResponseError.prototype.name = 'ResponseError'
ResponseError.prototype.code = 'RESPONSE_ERR'

export class TimeoutError extends Error {
  constructor (timeout) {
    super('Timeout (t=' + timeout + ').')
    Error.captureStackTrace(this, TimeoutError)
    this.timeout = timeout
  }

  toJSON () {
    return {
      code: this.code,
      timeout: this.timeout
    }
  }
}
TimeoutError.prototype.name = 'TimeoutError'
TimeoutError.prototype.code = 'ETIMEOUT'

const v4Regex = /^((\d{1,3}\.){3,3}\d{1,3})(:(\d{2,5}))?$/
const v6Regex = /^((::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?)(:(\d{2,5}))?$/i

export function parseEndpoint (endpoint) {
  const parts = /^(([^:]+?:)\/\/)?([^/]*?)(\/.*?)?(\s\[(post|get)\])?(\s\[pk=(.*)\])?$/i.exec(endpoint)
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
    return new Endpoint({ protocol: 'udp6:', ipv6: host, pk: parts[8], port })
  }
  if ((protocol === 'udp:' && family === 1) || protocol === 'udp4:') {
    return new Endpoint({ protocol: 'udp4:', ipv4: host, pk: parts[8], port })
  }
  return new Endpoint({
    protocol,
    host,
    port,
    path: parts[4],
    method: parts[6]
  })
}

export const supportedProtocols = ['http:', 'https:', 'udp4:', 'udp6:']
export class Endpoint {
  constructor (opts) {
    this.name = opts.name || null

    if (!opts.protocol) {
      this.protocol = 'https:'
    } else if (!supportedProtocols.includes(opts.protocol)) {
      throw new Error(`Invalid Endpoint: unsupported protocol "${opts.protocol}" for endpoint: ${JSON.stringify(opts)}, supported protocols: ${supportedProtocols.join(', ')}`)
    } else {
      this.protocol = opts.protocol
    }

    const isHTTP = this.protocol === 'https:' || this.protocol === 'http:'
    const port = typeof opts.port === 'string' ? opts.port = parseInt(opts.port, 10) : opts.port
    if (port === undefined || port === null) {
      this.port = isHTTP
        ? (this.protocol === 'https:' ? 443 : 80)
        : (this.pk ? 443 : 53)
    } else if (typeof port !== 'number' && !isNaN(port)) {
      throw new Error(`Invalid Endpoint: port "${opts.port}" needs to be a number: ${JSON.stringify(opts)}`)
    } else {
      this.port = port
    }
    if (isHTTP) {
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
    } else {
      if (opts.pk) {
        this.pk = opts.pk
      }
      if (this.protocol === 'udp4:') {
        if (!opts.ipv4 || typeof opts.ipv4 !== 'string') {
          throw new Error(`Invalid Endpoint: ipv4 "${opts.ipv4}" needs to be set: ${JSON.stringify(opts)}`)
        }
        this.ipv4 = opts.ipv4
      }
      if (this.protocol === 'udp6:') {
        if (!opts.ipv6 || typeof opts.ipv6 !== 'string') {
          throw new Error(`Invalid Endpoint: ipv6 "${opts.ipv6}" needs to be set: ${JSON.stringify(opts)}`)
        }
        this.ipv6 = opts.ipv6
      }
    }
  }

  toString () {
    if (this.protocol === 'udp4:' || this.protocol === 'udp6:') {
      const port = this.port !== (this.pk ? 443 : 53) ? `:${this.port}` : ''
      const pk = this.pk ? ` [pk=${this.pk}]` : ''
      return `udp://${this.ipv4 || this.ipv6}${port}${pk}`
    } else {
      const port = this.port !== (this.protocol === 'https:' ? 443 : 80) ? `:${this.port}` : ''
      const method = this.method !== 'GET' ? ' [post]' : ''
      const path = this.path === '/dns-query' ? '' : this.path
      return `${this.protocol}//${this.host}${port}${path}${method}`
    }
  }
}
