'use strict'

function inherit (ctor, superCtor) {
  Object.defineProperty(ctor, 'super_', {
    value: superCtor,
    writable: true,
    configurable: true
  })
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype)
}

let AbortError = typeof global !== 'undefined' ? global.AbortError : typeof window !== 'undefined' ? window.AbortError : null
if (!AbortError) {
  AbortError = function () {
    Error.captureStackTrace(this, AbortError)
    this.message = 'Request aborted.'
  }
  inherit(AbortError, Error)
  AbortError.prototype.code = 'ABORT_ERR'
  AbortError.prototype.name = 'AbortError'
}

function HTTPStatusError (uri, code, method) {
  Error.captureStackTrace(this, HTTPStatusError)
  this.message = 'status=' + code + ' while requesting ' + uri + ' [' + method + ']'
  this.uri = uri
  this.status = code
  this.method = method
}
inherit(HTTPStatusError, Error)
HTTPStatusError.prototype.code = 'HTTP_STATUS'
HTTPStatusError.prototype.name = 'StatusError'

function ResponseError (message, cause) {
  Error.captureStackTrace(this, ResponseError)
  this.message = message
  this.cause = cause
}
inherit(ResponseError, Error)
ResponseError.prototype.code = 'RESPONSE_ERR'
ResponseError.prototype.name = 'ResponseError'

function TimeoutError (timeout) {
  Error.captureStackTrace(this, TimeoutError)
  this.message = 'Timeout (t=' + timeout + ').'
  this.timeout = timeout
}
inherit(TimeoutError, Error)
TimeoutError.prototype.code = 'ETIMEOUT'
TimeoutError.prototype.name = 'TimeoutError'

function Endpoint (opts) {
  if (!opts.protocol) {
    opts.protocol = 'https:'
  } else if (!['http:', 'https:', 'udp4:', 'udp6:'].includes(opts.protocol)) {
    throw new Error(`Invalid Endpoint: unsupported protocol "${opts.protocol}" for endpoint: ${JSON.stringify(opts)}`)
  }
  if (typeof opts.host !== 'string') {
    throw new Error(`Invalid Endpoint: host "${opts.host}" needs to be a string: ${JSON.stringify(opts)}`)
  }
  if (typeof opts.port !== 'number' && !isNaN(opts.port)) {
    throw new Error(`Invalid Endpoint: port "${opts.port}" needs to be a number: ${JSON.stringify(opts)}`)
  }
  for (const key in opts) {
    if (opts[key] !== undefined) {
      this[key] = opts[key]
    }
  }
}

const rawEndpoints = require('./endpoints.json')
const endpoints = {}
for (const name in rawEndpoints) {
  endpoints[name] = new Endpoint(rawEndpoints[name])
}

module.exports = {
  endpoints,
  AbortError: AbortError,
  HTTPStatusError: HTTPStatusError,
  ResponseError: ResponseError,
  TimeoutError: TimeoutError,
  Endpoint: Endpoint
}
