'use strict'
const packet = require('dns-packet')
const Buffer = require('buffer').Buffer
const lib = require('./lib.node.js')
const request = lib.request
const defaultEndpoints = lib.endpoints
const error = require('./error.js')
const AbortError = error.AbortError
const ResponseError = error.ResponseError

function queryOne (endpoint, query, timeout, abortSignal) {
  const https = endpoint.https !== false
  return new Promise(function (resolve, reject) {
    if (abortSignal && abortSignal.aborted) {
      return reject(new AbortError())
    }
    request(
      https ? 'https:' : 'http:',
      endpoint.host,
      endpoint.port ? parseInt(endpoint.port, 10) : (https ? 443 : 80),
      endpoint.path || '/dns-query',
      /^post$/i.test(endpoint.method) ? 'POST' : 'GET',
      packet.encode(Object.assign({
        flags: packet.RECURSION_DESIRED,
        type: 'query'
      }, query)),
      timeout,
      abortSignal,
      function (error, data) {
        if (error !== null) {
          reject(error)
        } else {
          data = Buffer.from(data)
          let decoded
          try {
            decoded = packet.decode(data)
          } catch (err) {
            return reject(new ResponseError('Invalid packet (cause=' + err.message+ ')', err))
          }
          resolve(decoded)
        }
      }
    )
  })
}

function query (q, opts) {
  opts = Object.assign({
    endpoints: defaultEndpoints,
    retry: 3,
    timeout: 30000
  }, opts)
  const endpoints = opts.endpoints
  const signal = opts.signal
  const endpoint = Array.isArray(endpoints)
    ? endpoints[Math.floor(Math.random() * endpoints.length) % endpoints.length]
    : endpoints
  return queryOne(endpoint, q, opts.timeout, signal)
    .then(
      data => {
        // Add the endpoint to give a chance to identify which endpoint returned the result
        data.endpoint = endpoint
        return data
      },
      err => {
        if (err.name === 'AbortError' || opts.retry === 0) {
          throw err
        }
        opts.retry -= 1
        return query(q, opts)
      }
    )
}

module.exports = {
  query: query,
  AbortError: AbortError,
  ResponseError: ResponseError,
  TimeoutError: error.TimeoutError,
  HTTPStatusError: error.HTTPStatusError
}
