'use strict'
class AbortError extends Error {
  constructor () {
    super('Request aborted.')
    this.code = 'ABORT_ERR'
    this.name = 'AbortError'
  }
}

class HTTPStatusError extends Error {
  constructor (uri, code, method) {
    super(`HTTPStatusError (status=${code}) while requesting (${uri} [${method}])`)
    this.uri = uri
    this.status = code
    this.method = method
    this.code = 'HTTP_STATUS'
    this.name = 'StatusError'
  }
}

class ResponseError extends Error {
  constructor (message) {
    super(message)
    this.code = 'RESPONSE_ERR'
    this.name = 'ResponseError'
  }
}

module.exports = { AbortError, HTTPStatusError, ResponseError }
