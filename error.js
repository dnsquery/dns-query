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

module.exports = {
  AbortError: AbortError,
  HTTPStatusError: HTTPStatusError,
  ResponseError: ResponseError,
  TimeoutError: TimeoutError
}
