import * as packet from '@leichtgewicht/dns-packet'
import { toRcode } from '@leichtgewicht/dns-packet/rcodes.js'
import { decode } from 'utf8-codec'
import * as lib from './lib.mjs'
import { resolvers as backupResolvers } from './resolvers.mjs'
import {
  AbortError,
  ResponseError,
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

export const DNS_RCODE_ERROR = {
  1: 'FormErr',
  2: 'ServFail',
  3: 'NXDomain',
  4: 'NotImp',
  5: 'Refused',
  6: 'YXDomain',
  7: 'YXRRSet',
  8: 'NXRRSet',
  9: 'NotAuth',
  10: 'NotZone',
  11: 'DSOTYPENI'
}

export const DNS_RCODE_MESSAGE = {
  // https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6
  1: 'The name server was unable to interpret the query.',
  2: 'The name server was unable to process this query due to a problem with the name server.',
  3: 'Non-Existent Domain.',
  4: 'The name server does not support the requested kind of query.',
  5: 'The name server refuses to perform the specified operation for policy reasons.',
  6: 'Name Exists when it should not.',
  7: 'RR Set Exists when it should not.',
  8: 'RR Set that should exist does not.',
  9: 'Server Not Authoritative for zone  / Not Authorized.',
  10: 'Name not contained in zone.',
  11: 'DSO-TYPE Not Implemented.'
}

export class DNSRcodeError extends Error {
  constructor (rcode, question) {
    super(`${(DNS_RCODE_MESSAGE[rcode] || 'Undefined error.')} (rcode=${rcode}${DNS_RCODE_ERROR[rcode] ? `, error=${DNS_RCODE_ERROR[rcode]}` : ''}, question=${JSON.stringify(question)})`)
    this.rcode = rcode
    this.code = `DNS_RCODE_${rcode}`
    this.error = DNS_RCODE_ERROR[rcode]
    this.question = question
  }

  toJSON () {
    return {
      code: this.code,
      error: this.error,
      question: this.question,
      endpoint: this.endpoint
    }
  }
}

export function validateResponse (data, question) {
  const rcode = toRcode(data.rcode)
  if (rcode !== 0) {
    const err = new DNSRcodeError(rcode, question)
    err.endpoint = data.endpoint
    throw err
  }
  return data
}

function processResolvers (res) {
  const time = (res.time === null || res.time === undefined) ? Date.now() : res.time
  const resolvers = lib.processResolvers(res.data.map(resolver => {
    resolver.endpoint = toEndpoint(Object.assign({ name: resolver.name }, resolver.endpoint))
    return resolver
  }))
  const endpoints = resolvers.map(resolver => resolver.endpoint)
  return {
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
    time
  }
}

export const backup = processResolvers(backupResolvers)

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
    return lib.queryDns(endpoint, query, timeout, abortSignal)
  }
  return queryDoh(endpoint, query, timeout, abortSignal)
}

function queryDoh (endpoint, query, timeout, abortSignal) {
  return lib.request(
    endpoint.url,
    endpoint.method,
    packet.encode(Object.assign({
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
            const decoded = packet.decode(data)
            decoded.response = response
            return decoded
          } catch (err) {
            error = new ResponseError('Invalid packet (cause=' + err.message + ')', err)
          }
        }
      }
      throw Object.assign(error, { response })
    }
  )
}

const UPDATE_URL = new URL('https://martinheidegger.github.io/dns-query/resolvers.json')

function concatUint8 (arrs) {
  const res = new Uint8Array(
    arrs.reduce((len, arr) => len + arr.length, 0)
  )
  let pos = 0
  for (const arr of arrs) {
    res.set(arr, pos)
    pos += arr.length
  }
  return res
}

export function combineTXT (inputs) {
  return decode(concatUint8(inputs))
}

function isNameString (entry) {
  return /^@/.test(entry)
}

export class Wellknown {
  constructor (opts) {
    this.opts = Object.assign({
      timeout: 5000,
      update: true,
      updateURL: UPDATE_URL,
      persist: false,
      localStoragePrefix: 'dnsquery_',
      maxAge: 300000 // 5 minutes
    }, opts)
    this._dataP = null
  }

  _data (force, outdated) {
    if (!force && this._dataP !== null) {
      return this._dataP.then(res => {
        if (res.time < Date.now() - this.opts.maxAge) {
          return this._data(true, res)
        }
        return res
      })
    }
    this._dataP = (!this.opts.update
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
        .then(res => processResolvers({
          data: res.data.resolvers,
          time: res.time
        }))
        .catch(() => outdated || backup)
    )
    return this._dataP
  }

  data () {
    return this._data(false).then(data => data.data)
  }

  endpoints (input) {
    if (input === null || input === undefined) {
      return this.data().then(data => data.endpoints)
    }
    if (input === 'doh') {
      input = filterDoh
    }
    if (input === 'dns') {
      input = filterDns
    }
    if (typeof input === 'function') {
      return this.data().then(data => data.endpoints.filter(input))
    }
    if (typeof input === 'string' || typeof input[Symbol.iterator] !== 'function') {
      return Promise.reject(new Error(`Endpoints (${input}) needs to be iterable (array).`))
    }
    input = Array.from(input).filter(Boolean)
    if (input.findIndex(isNameString) === -1) {
      try {
        return Promise.resolve(input.map(toEndpoint))
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return this.data().then(data =>
      input.map(entry => {
        if (isNameString(entry)) {
          const found = data.endpointByName[entry.substring(1)]
          if (!found) {
            throw new Error(`Endpoint ${entry} is not known.`)
          }
          return found
        }
        return toEndpoint(entry)
      })
    )
  }
}

export const wellknown = new Wellknown()

function isPromise (input) {
  if (input === null) {
    return false
  }
  if (typeof input !== 'object') {
    return false
  }
  return typeof input.then === 'function'
}

function toPromise (input) {
  return isPromise(input) ? input : Promise.resolve(input)
}

export function query (q, opts) {
  opts = Object.assign({
    retries: 5,
    timeout: 30000 // 30 seconds
  }, opts)
  if (!q.question) return Promise.reject(new Error('To request data you need to specify a .question!'))
  return toPromise(opts.endpoints)
    .then(endpoints => {
      if (!Array.isArray(endpoints) || endpoints.length === 0) {
        throw new Error('No endpoints defined to lookup dns records.')
      }
      return queryN(endpoints.map(toEndpoint), toMultiQuery(q), opts)
    })
    .then(data => {
      data.question = data.questions[0]
      delete data.questions
      return data
    })
}

export function lookupTxt (domain, opts) {
  const q = Object.assign({
    question: {
      type: 'TXT',
      name: domain
    }
  }, opts.query)
  return query(q, opts)
    .then(data => {
      validateResponse(data, q)
      return {
        entries: (data.answers || [])
          .filter(answer => answer.type === 'TXT' && answer.data)
          .map(answer => {
            return ({
              data: combineTXT(answer.data),
              ttl: answer.ttl
            })
          })
          .sort((a, b) => {
            if (a.data > b.data) return 1
            if (a.data < b.data) return -1
            return 0
          }),
        endpoint: data.endpoint
      }
    })
}

function queryN (endpoints, q, opts) {
  const endpoint = endpoints.length === 1
    ? endpoints[0]
    : endpoints[Math.floor(Math.random() * endpoints.length) % endpoints.length]
  return queryOne(endpoint, q, opts.timeout, opts.signal)
    .then(
      data => {
        // Add the endpoint to give a chance to identify which endpoint returned the result
        data.endpoint = endpoint.toString()
        return data
      },
      err => {
        if (err.name === 'AbortError' || opts.retries === 0) {
          err.endpoint = endpoint.toString()
          throw err
        }
        if (opts.retries > 0) {
          opts.retries -= 1
        }
        return queryN(endpoints, q, opts)
      }
    )
}

function filterDoh (endpoint) {
  return endpoint.protocol === 'https:' || endpoint.protocol === 'http:'
}

function filterDns (endpoint) {
  return endpoint.protocol === 'udp4:' || endpoint.protocol === 'udp6:'
}
