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

const baseParts = /^(([a-z0-9]+:)\/\/)?([^/[\s:]+|\[[^\]]+\])?(:([^/\s]+))?(\/[^\s]*)?(.*)$/
const httpFlags = /\[(post|get|((ipv4|ipv6|name)=([^\]]+)))\]/ig
const updFlags = /\[(((pk|name)=([^\]]+)))\]/ig

export function parseEndpoint (endpoint) {
  const parts = baseParts.exec(endpoint)
  const protocol = parts[2] || 'https:'
  const host = parts[3]
  const port = parts[5]
  const path = parts[6]
  const rest = parts[7]
  if (protocol === 'https:' || protocol === 'http:') {
    const flags = parseFlags(rest, httpFlags)
    return {
      name: flags.name,
      protocol,
      ipv4: flags.ipv4,
      ipv6: flags.ipv6,
      host,
      port,
      path,
      method: flags.post ? 'POST' : 'GET'
    }
  }
  if (protocol === 'udp:' || protocol === 'udp4:' || protocol === 'udp6:') {
    const flags = parseFlags(rest, updFlags)
    const v6Parts = /^\[(.*)\]$/.exec(host)
    if (v6Parts && protocol === 'udp4:') {
      throw new Error(`Endpoint parsing error: Cannot use ipv6 host with udp4: (endpoint=${endpoint})`)
    }
    if (!v6Parts && protocol === 'udp6:') {
      throw new Error(`Endpoint parsing error: Incorrectly formatted host for udp6: (endpoint=${endpoint})`)
    }
    if (v6Parts) {
      return new UDP6Endpoint({ protocol: 'udp6:', ipv6: v6Parts[1], port, pk: flags.pk, name: flags.name })
    }
    return new UDP4Endpoint({ protocol: 'udp4:', ipv4: host, port, pk: flags.pk, name: flags.name })
  }
  throw new InvalidProtocolError(protocol, endpoint)
}

function parseFlags (rest, regex) {
  regex.lastIndex = 0
  const result = {}
  while (true) {
    const match = regex.exec(rest)
    if (!match) break
    if (match[2]) {
      result[match[3].toLowerCase()] = match[4]
    } else {
      result[match[1].toLowerCase()] = true
    }
  }
  return result
}

export class InvalidProtocolError extends Error {
  constructor (protocol, endpoint) {
    super(`Invalid Endpoint: unsupported protocol "${protocol}" for endpoint: ${endpoint}, supported protocols: ${supportedProtocols.join(', ')}`)
    this.protocol = protocol
    this.endpoint = endpoint
  }

  toJSON () {
    return {
      code: this.code,
      endpoint: this.endpoint,
      timeout: this.timeout
    }
  }
}
InvalidProtocolError.prototype.name = 'InvalidProtocolError'
InvalidProtocolError.prototype.code = 'EPROTOCOL'

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
    return `udp://${this.ipv4 || `[${this.ipv6}]`}${port}${pk}${name}`
  }
}

export class UDP4Endpoint extends UDPEndpoint {
  constructor (opts) {
    super(Object.assign({ protocol: 'udp4:' }, opts))
    if (!opts.ipv4 || typeof opts.ipv4 !== 'string') {
      throw new Error(`Invalid Endpoint: .ipv4 "${opts.ipv4}" needs to be set: ${JSON.stringify(opts)}`)
    }
    this.ipv4 = opts.ipv4
  }
}

export class UDP6Endpoint extends UDPEndpoint {
  constructor (opts) {
    super(Object.assign({ protocol: 'udp6:' }, opts))
    if (!opts.ipv6 || typeof opts.ipv6 !== 'string') {
      throw new Error(`Invalid Endpoint: .ipv6 "${opts.ipv6}" needs to be set: ${JSON.stringify(opts)}`)
    }
    this.ipv6 = opts.ipv6
  }
}

function safeHost (host) {
  return v6Regex.test(host) && !v4Regex.test(host) ? `[${host}]` : host
}

export class HTTPEndpoint extends BaseEndpoint {
  constructor (opts) {
    super(Object.assign({ protocol: 'https:' }, opts), true)
    if (!opts.host) {
      if (opts.ipv4) {
        opts.host = opts.ipv4
      }
      if (opts.ipv6) {
        opts.host = `[${opts.ipv6}]`
      }
    }
    if (!opts.host || typeof opts.host !== 'string') {
      throw new Error(`Invalid Endpoint: host "${opts.path}" needs to be set: ${JSON.stringify(opts)}`)
    }
    this.host = opts.host
    this.path = opts.path || '/dns-query'
    this.method = /^post$/i.test(opts.method) ? 'POST' : 'GET'
    this.ipv4 = opts.ipv4
    this.ipv6 = opts.ipv6
    if (!this.ipv6) {
      const v6Parts = v6Regex.exec(this.host)
      if (v6Parts) {
        this.ipv6 = v6Parts[1]
      }
    }
    if (!this.ipv4) {
      if (v4Regex.test(this.host)) {
        this.ipv4 = this.host
      }
    }
    const url = `${this.protocol}//${safeHost(this.host)}:${this.port}${this.path}`
    try {
      this.url = new URL(url)
    } catch (err) {
      throw new Error(err.message + ` [${url}]`)
    }
  }

  toString () {
    const protocol = this.protocol === 'https:' ? '' : 'http://'
    const port = this.port !== (this.protocol === 'https:' ? 443 : 80) ? `:${this.port}` : ''
    const method = this.method !== 'GET' ? ' [post]' : ''
    const path = this.path === '/dns-query' ? '' : this.path
    const name = this.name ? ` [name=${this.name}]` : ''
    const ipv4 = this.ipv4 && this.ipv4 !== this.host ? ` [ipv4=${this.ipv4}]` : ''
    const ipv6 = this.ipv6 && this.ipv6 !== this.host ? ` [ipv6=${this.ipv6}]` : ''
    return `${protocol}${safeHost(this.host)}${port}${path}${method}${ipv4}${ipv6}${name}`
  }
}

export function toEndpoint (input) {
  let opts
  if (typeof input === 'string') {
    opts = parseEndpoint(input)
  } else {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new Error(`Can not convert ${input} to an endpoint`)
    } else if (input instanceof BaseEndpoint) {
      return input
    }
    opts = input
  }
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
  throw new InvalidProtocolError(protocol, JSON.stringify(opts))
}
