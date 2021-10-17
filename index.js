'use strict'
const packet = require('dns-packet')
const lib = require('./lib.node.js')
const common = require('./common.js')
const AbortError = common.AbortError
const ResponseError = common.ResponseError
const Endpoint = common.Endpoint
const endpoints = common.endpoints
const v4Regex = /^((\d{1,3}\.){3,3}\d{1,3})(:(\d{2,5}))?$/
const v6Regex = /^((::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?)(:(\d{2,5}))?$/i

function queryOne (endpoint, query, timeout, abortSignal) {
  if (abortSignal && abortSignal.aborted) {
    return Promise.reject(new AbortError())
  }
  if (endpoint.protocol === 'udp4:' || endpoint.protocol === 'udp6:') {
    return lib.queryDns(endpoint, query, timeout, abortSignal)
  }
  return queryDoh(endpoint, query, timeout, abortSignal)
}

function queryDoh (endpoint, query, timeout, abortSignal) {
  const protocol = endpoint.protocol || 'https:'
  return new Promise(function (resolve, reject) {
    lib.request(
      protocol,
      endpoint.host,
      endpoint.port ? parseInt(endpoint.port, 10) : (protocol === 'https:' ? 443 : 80),
      endpoint.path || '/dns-query',
      /^post$/i.test(endpoint.method) ? 'POST' : 'GET',
      packet.encode(Object.assign({
        flags: packet.RECURSION_DESIRED,
        type: 'query'
      }, query)),
      timeout,
      abortSignal,
      function (error, data, response) {
        let decoded
        if (error === null) {
          if (data.length === 0) {
            error = new ResponseError('Empty.')
          } else {
            try {
              decoded = packet.decode(data)
            } catch (err) {
              error = new ResponseError('Invalid packet (cause=' + err.message + ')', err)
            }
          }
        }
        if (error !== null) {
          reject(Object.assign(error, { response, endpoint }))
        } else {
          decoded.endpoint = endpoint
          decoded.response = response
          resolve(decoded)
        }
      }
    )
  })
}

function query (q, opts) {
  opts = Object.assign({
    retries: 5,
    timeout: 30000
  }, opts)
  let endpoints
  try {
    if (opts.endpoints === 'doh') {
      endpoints = lib.endpoints({ doh: true, dns: false })
    } else if (opts.endpoints === 'dns') {
      endpoints = lib.endpoints({ doh: false, dns: true })
    } else {
      endpoints = parseEndpoints(opts.endpoints) || lib.endpoints({ doh: true, dns: true })
    }
    if (!endpoints || endpoints.length === 0) {
      throw new Error('No endpoints defined.')
    }
  } catch (error) {
    return Promise.reject(error)
  }
  return queryN(endpoints, q, opts)
}

function queryN (endpoints, q, opts) {
  const endpoint = endpoints.length === 1
    ? endpoints[0]
    : endpoints[Math.floor(Math.random() * endpoints.length) % endpoints.length]
  return queryOne(endpoint, q, opts.timeout, opts.signal)
    .then(
      data => {
        // Add the endpoint to give a chance to identify which endpoint returned the result
        data.endpoint = endpoint
        return data
      },
      err => {
        if (err.name === 'AbortError' || opts.retries === 0) {
          throw err
        }
        if (opts.retries > 0) {
          opts.retries -= 1
        }
        return query(q, opts)
      }
    )
}

function parseEndpoints (input) {
  if (!input) {
    return
  }
  if (typeof input[Symbol.iterator] !== 'function' || typeof input === 'string') {
    throw new Error('Endpoints needs to be iterable.')
  }
  const result = []
  for (let endpoint of input) {
    if (typeof endpoint === 'object') {
      if (!(endpoint instanceof Endpoint)) {
        endpoint = new Endpoint(endpoint)
      }
      result.push(endpoint)
    } else if (typeof endpoint === 'string') {
      result.push(endpoints[endpoint] || parseEndpoint(endpoint))
    }
  }
  return result
}

function parseEndpoint (endpoint) {
  const parts = /^(([^:]+?:)\/\/)?([^/]*?)(\/.*?)?(\s\[(post|get)\])?$/i.exec(endpoint)
  let protocol = parts[2] || 'https:'
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
  if (protocol === 'udp:') {
    protocol = family === 2 ? 'udp6:' : 'udp4:'
  }
  return new Endpoint({
    protocol: protocol,
    host,
    port,
    path: parts[4],
    method: parts[6]
  })
}

module.exports = {
  query: query,
  endpoints: endpoints,
  parseEndpoints: parseEndpoints,
  AbortError: AbortError,
  ResponseError: ResponseError,
  TimeoutError: common.TimeoutError,
  HTTPStatusError: common.HTTPStatusError,
  Endpoint: Endpoint
}
