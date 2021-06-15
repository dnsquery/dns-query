'use strict'
const packet = require('dns-packet')
const lib = require('./lib.node.js')
const error = require('./error.js')
const AbortError = error.AbortError
const ResponseError = error.ResponseError
const endpoints = require('./endpoints')

function queryOne (endpoint, query, timeout, abortSignal) {
  const https = endpoint.https !== false
  return new Promise(function (resolve, reject) {
    if (abortSignal && abortSignal.aborted) {
      return reject(new AbortError())
    }
    lib.request(
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
          if (data.length === 0) {
            return reject(new ResponseError('Empty.'))
          }
          let decoded
          try {
            decoded = packet.decode(data)
          } catch (err) {
            return reject(new ResponseError('Invalid packet (cause=' + err.message + ')', err))
          }
          resolve(decoded)
        }
      }
    )
  })
}

function query (q, opts) {
  opts = Object.assign({
    retry: 3,
    timeout: 30000
  }, opts)
  const endpoints = parseEndpoints(opts.endpoints) || lib.endpoints
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
        if (opts.retry > 0) {
          opts.retry -= 1
        }
        return query(q, opts)
      }
    )
}

function parseEndpoints (input) {
  if (!input) {
    return
  }
  if (!Array.isArray(input)) {
    input = [input]
  }
  const result = []
  for (const endpoint of input) {
    if (typeof endpoint === 'object') {
      result.push(endpoint)
    } else if (typeof endpoint === 'string') {
      if (endpoints[endpoint]) {
        result.push(endpoints[endpoint])
      } else {
        const parts = /^(https?:\/\/)?([^/:]+)(:([\d]+))?(\/.+?)?(\s\[(post|get)\])?$/i.exec(endpoint)
        if (!parts) {
          throw new Error('Invalid endpoint "' + endpoint + '". It needs to match')
        }
        const https = parts[1] !== 'http://'
        result.push({
          https: https,
          host: parts[2],
          port: parts[4] ? parseInt(parts[4]) : https ? 443 : 80,
          path: parts[5],
          method: parts[7]
        })
      }
    }
  }
  return result
}

module.exports = {
  query: query,
  endpoints,
  parseEndpoints,
  AbortError: AbortError,
  ResponseError: ResponseError,
  TimeoutError: error.TimeoutError,
  HTTPStatusError: error.HTTPStatusError
}
