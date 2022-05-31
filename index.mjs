import * as packet from '@leichtgewicht/dns-packet'
import * as lib from './lib.mjs'
import { resolvers as backupResolvers } from './resolvers.mjs'
import {
  AbortError,
  ResponseError,
  BaseEndpoint,
  parseEndpoint,
  URL,
  toEndpoint
} from './common.mjs'

export {
  TimeoutError,
  HTTPStatusError,
  AbortError,
  ResponseError,
  BaseEndpoint,
  HTTPEndpoint,
  UDP4Endpoint,
  UDP6Endpoint,
  parseEndpoint,
  toEndpoint
} from './common.mjs'

function resolversToWellknown (res) {
  const resolvers = res.data.map(resolver => {
    resolver.endpoint = toEndpoint(Object.assign({ name: resolver.name }, resolver.endpoint))
    return resolver
  })
  const endpoints = resolvers.map(resolver => resolver.endpoint)
  return lib.processWellknown({
    data: {
      resolvers,
      resolverByName: resolvers.reduce((byName, resolver) => {
        byName[resolver.name] = resolver
        return byName
      }, {}),
      endpoints,
      endpointByName: endpoints.reduce((byName, endpoint) => {
        byName[endpoint.name] = endpoint
        return byName
      }, {})
    },
    time: (res.time === null || res.time === undefined) ? Date.now() : res.time
  })
}

export const backup = resolversToWellknown(backupResolvers)

function toMultiQuery (singleQuery) {
  const query = Object.assign({
    type: 'query'
  }, singleQuery)
  delete query.question
  query.questions = []
  if (singleQuery.question) {
    query.questions.push(singleQuery.question)
  }
  return query
}

function queryOne (endpoint, query, timeout, abortSignal) {
  if (abortSignal && abortSignal.aborted) {
    return Promise.reject(new AbortError())
  }
  if (endpoint.protocol === 'udp4:' || endpoint.protocol === 'udp6:') {
    return lib.queryDns(endpoint, toMultiQuery(query), timeout, abortSignal)
      .then(result => {
        result.question = result.questions[0]
        delete result.questions
        return result
      })
  }
  return queryDoh(endpoint, query, timeout, abortSignal)
}

function queryDoh (endpoint, query, timeout, abortSignal) {
  return lib.request(
    endpoint.url,
    endpoint.method,
    packet.query.encode(Object.assign({
      flags: packet.RECURSION_DESIRED
    }, query)),
    timeout,
    abortSignal
  ).then(
    function (res) {
      const data = res.data
      const response = res.response
      let error = res.error
      if (error === undefined) {
        if (data.length === 0) {
          error = new ResponseError('Empty.')
        } else {
          try {
            const decoded = packet.response.decode(data)
            decoded.endpoint = endpoint
            decoded.response = response
            return decoded
          } catch (err) {
            error = new ResponseError('Invalid packet (cause=' + err.message + ')', err)
          }
        }
      }
      throw Object.assign(error, { response, endpoint })
    },
    error => {
      throw Object.assign(error, { endpoint })
    }
  )
}

const UPDATE_URL = new URL('https://martinheidegger.github.io/dns-query/resolvers.json')

export class Session {
  constructor (opts) {
    this.opts = Object.assign({
      retries: 5,
      timeout: 30000, // 30 seconds
      update: true,
      updateURL: UPDATE_URL,
      persist: false,
      localStoragePrefix: 'dnsquery_',
      maxAge: 300000 // 5 minutes
    }, opts)
    this._wellknownP = null
  }

  _wellknown (force, outdated) {
    if (!force && this._wellknownP !== null) {
      return this._wellknownP.then(res => {
        if (res.time < Date.now() - this.opts.maxAge) {
          return this._wellknown(true, res)
        }
        return res
      })
    }
    this._wellknownP = (!this.opts.update
      ? Promise.resolve(backup)
      : lib.loadJSON(
        this.opts.updateURL,
        this.opts.persist
          ? {
              name: 'resolvers.json',
              localStoragePrefix: this.opts.localStoragePrefix,
              maxTime: Date.now() - this.opts.maxAge
            }
          : null,
        this.opts.timeout
      )
        .then(res => resolversToWellknown({
          data: res.data.resolvers,
          time: res.time
        }))
        .catch(() => outdated || backup)
    )
    return this._wellknownP
  }

  wellknown () {
    return this._wellknown(false).then(data => data.data)
  }

  endpoints () {
    return this.wellknown().then(data => data.endpoints)
  }

  query (q, opts) {
    opts = Object.assign({}, this.opts, opts)
    if (!q.question) return Promise.reject(new Error('To request data you need to specify a .question!'))
    return loadEndpoints(this, opts.endpoints)
      .then(endpoints => queryN(endpoints, q, opts))
  }
}

const defautSession = new Session()

export function query (q, opts) {
  return defautSession.query(q, opts)
}

export function endpoints () {
  return defautSession.endpoints()
}

export function wellknown () {
  return defautSession.wellknown()
}

function queryN (endpoints, q, opts) {
  if (endpoints.length === 0) {
    throw new Error('No endpoints defined.')
  }
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

function filterEndpoints (filter) {
  return function (endpoints) {
    const result = []
    for (const name in endpoints) {
      const endpoint = endpoints[name]
      if (filter(endpoint)) {
        result.push(endpoint)
      }
    }
    return result
  }
}

const filterDoh = filterEndpoints(function filterDoh (endpoint) {
  return endpoint.protocol === 'https:' || endpoint.protocol === 'http:'
})

const filterDns = filterEndpoints(function filterDns (endpoint) {
  return endpoint.protocol === 'udp4:' || endpoint.protocol === 'udp6:'
})

function isPromise (input) {
  if (input === null) {
    return false
  }
  if (typeof input !== 'object') {
    return false
  }
  return typeof input.then === 'function'
}

function isString (entry) {
  return typeof entry === 'string'
}

export function loadEndpoints (session, input) {
  const p = isPromise(input) ? input : Promise.resolve(input)
  return p.then(function (endpoints) {
    if (endpoints === 'doh') {
      return session.endpoints().then(filterDoh)
    }
    if (endpoints === 'dns') {
      return session.endpoints().then(filterDns)
    }
    const type = typeof endpoints
    if (type === 'function') {
      return session.endpoints().then(filterEndpoints(endpoints))
    }
    if (endpoints === null || endpoints === undefined) {
      return session.endpoints()
    }
    if (type === 'string' || typeof endpoints[Symbol.iterator] !== 'function') {
      throw new Error(`Endpoints (${endpoints}) needs to be iterable.`)
    }
    endpoints = Array.from(endpoints).filter(Boolean)
    if (endpoints.findIndex(isString) === -1) {
      return endpoints.map(endpoint => {
        if (endpoint instanceof BaseEndpoint) {
          return endpoint
        }
        return toEndpoint(endpoint)
      })
    }
    return session.wellknown()
      .then(wellknown =>
        endpoints.map(endpoint => {
          if (endpoint instanceof BaseEndpoint) {
            return endpoint
          }
          if (typeof endpoint === 'string') {
            return wellknown.endpointByName[endpoint] || parseEndpoint(endpoint)
          }
          return toEndpoint(endpoint)
        })
      )
  })
}
