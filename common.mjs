import { URL } from 'url'
let AbortError = typeof global !== 'undefined' ? global.AbortError : typeof window !== 'undefined' ? window.AbortError : null
if (!AbortError) {
  AbortError = class AbortError extends Error {
    constructor (message = 'Request aborted.') {
      super(message)
      Error.captureStackTrace(this, AbortError)
    }
  }
  AbortError.prototype.code = 'ABORT_ERR'
}

export { AbortError }

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
TimeoutError.prototype.code = 'ETIMEOUT'

export class Endpoint {
  constructor (opts) {
    if (!opts.protocol) {
      this.protocol = 'https:'
    } else if (!['http:', 'https:', 'udp4:', 'udp6:'].includes(opts.protocol)) {
      throw new Error(`Invalid Endpoint: unsupported protocol "${opts.protocol}" for endpoint: ${JSON.stringify(opts)}`);
    } else {
      this.protocol = opts.protocol
    }

    const port = typeof opts.port === 'string' ? opts.port = parseInt(opts.port, 10) : opts.port

    const isHTTP = this.protocol === 'https:' || this.protocol === 'http:'
    if (isHTTP) {
      if (port === undefined || port === null) {
        this.port = this.protocol === 'https:' ? 443 : 80
      } else if (typeof port !== 'number' && !isNaN(port)) {
        throw new Error(`Invalid Endpoint: port "${opts.port}" needs to be a number: ${JSON.stringify(opts)}`)
      }
      if (!opts.host || typeof opts.host !== 'string') {
        throw new Error(`Invalid Endpoint: host "${opts.path}" needs to be set: ${JSON.stringify(opts)}`)
      }
      this.host = opts.host
      this.cors = !!opts.cors
      this.path = opts.path || '/dns-query'
      this.method = /^post$/i.test(opts.method) ? 'POST' : 'GET'
      this.ipv4 = opts.ipv4
      this.ipv6 = opts.ipv6
      this.url = new URL(`${this.protocol}//${this.host}:${this.port}${this.path}`)
    } else {
      if (port === undefined || port === null) {
        // DNSCrypt uses port 443, publicKey indicates DNSCrypt
        this.port = opts.pk ? 443 : 53
      } else if (typeof port !== 'number' && !isNaN(port)) {
        throw new Error(`Invalid Endpoint: port "${opts.port}" needs to be a number: ${JSON.stringify(opts)}`)
      } else {
        this.port = port
      }
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
}
