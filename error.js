'use strict'

function inherit (ctor, superCtor) {
  Object.defineProperty(ctor, 'super_', {
    value: superCtor,
    writable: true,
    configurable: true
  })
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype)
}

let AbortError = global.AbortError
if (!AbortError) {
  AbortError = function () {
    Error.captureStackTrace(this, AbortError)
    this.message = 'Request aborted.'
    this.code = 'ABORT_ERR'
    this.name = 'AbortError'
  }
  inherit(AbortError, Error)
}

function HTTPStatusError (uri, code, method) {
  Error.captureStackTrace(this, HTTPStatusError)
  this.message = 'HTTPStatusError (status=' + code + ' while requesting (' + uri + ' [' + method + '])'
  this.uri = uri
  this.status = code
  this.method = method
  this.code = 'HTTP_STATUS'
  this.name = 'StatusError'
}
inherit(HTTPStatusError, Error)

function ResponseError (message) {
  Error.captureStackTrace(this, ResponseError)
  this.message = message
  this.code = 'RESPONSE_ERR'
  this.name = 'ResponseError'
}
inherit(ResponseError, Error)

function TimeoutError (timeout) {
  Error.captureStackTrace(this, TimeoutError)
  this.message = 'Timeout (t=' + timeout + ').'
  this.code = 'ETIMEOUT'
  this.name = 'TimeoutError'
  this.timeout = timeout
}
inherit(TimeoutError, Error)

module.exports = {
  AbortError: AbortError,
  HTTPStatusError: HTTPStatusError,
  ResponseError: ResponseError,
  TimeoutError: TimeoutError
}
