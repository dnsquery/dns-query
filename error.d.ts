namespace error {
  class AbortError extends Error {
    constructor ()
    code: 'ABORT_ERR'
    name: 'AbortError'
  }
  class HTTPStatusError extends Error {
    constructor (uri: string, status: number, method: string)
    uri: string
    status: number
    method: 'POST' | 'GET'
    code: 'HTTP_STATUS'
    name: 'StatusError'
  }
  class ResponseError extends Error {
    constructor (message: string)
    code: 'RESPONSE_ERR'
    name: 'ResponseError'
  }
  class TimeoutError extends Error {
    constructor (timeout: number)
    timeout: number
    code: 'ETIMEOUT'
    name: 'TimeoutError'
  }
}

export = error