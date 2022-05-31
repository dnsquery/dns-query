import test from 'fresh-tape'
import AbortController from 'abort-controller'
import * as dohQuery from '../index.mjs'
import { TimeoutError, reduceError, parseEndpoint } from '../common.mjs'
import XHR from 'xhr2'
import path from 'path'
import fs from 'fs'
const query = dohQuery.query
const toEndpoint = dohQuery.toEndpoint
const Session = dohQuery.Session
const isBrowser = typeof window !== 'undefined'

const LOCAL_ENDPOINT = {
  protocol: process.env.TEST_HTTPS === 'true' ? 'https:' : 'http:',
  host: process.env.TEST_HOST,
  port: parseInt(process.env.TEST_PORT, 10),
  method: 'POST'
}
const LOCAL_ENDPOINT_URI = `${LOCAL_ENDPOINT.https ? 'https' : 'http'}://${LOCAL_ENDPOINT.host}:${LOCAL_ENDPOINT.port}`

test('Error without query', function (t) {
  return query({}).then(
    failSuccess(t),
    function (err) {
      t.match(err.message, /To request data you need to specify a .question!/)
    }
  )
})

test('Abort before start (doh)', function (t) {
  const c = new AbortController()
  c.abort()
  return query(
    { question: { type: 'A', name: 'google.com' } },
    { signal: c.signal, endpoints: 'doh' }
  ).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'AbortError')
    }
  )
})

test('Abort before start (dns)', {
  skip: isBrowser
}, function (t) {
  const c = new AbortController()
  c.abort()
  return query(
    { question: { type: 'A', name: 'google.com' } },
    { signal: c.signal, endpoints: 'dns' }
  ).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'AbortError')
    }
  )
})

test('local /text causes ResponseError, with retries=0, once!', function (t) {
  return getLog().then(function () { return localQuery('/text') }).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'ResponseError')
      t.equals(err.message, 'Invalid packet (cause=Header must be 12 bytes)')
      t.notEqual(err.cause, undefined)
      t.notEqual(err.cause, null)
      t.deepEqual(err.endpoint, toEndpoint(Object.assign({}, LOCAL_ENDPOINT, { path: '/text' })))
      t.notEqual(err.response, undefined)
      t.deepEqual(err.toJSON(), {
        cause: { message: 'Header must be 12 bytes' },
        code: 'RESPONSE_ERR',
        message: err.message
      })
      return getLog(true).then(
        function (data) {
          t.deepEquals(
            data,
            [
              { method: 'POST', url: '/text' }
            ]
          )
        }
      )
    }
  )
})

test('local /text causes ResponseError, with retries=3, several times', function (t) {
  return localQuery('/text', { retries: 3 }).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'ResponseError')
      t.deepEqual(err.endpoint, toEndpoint(Object.assign({}, LOCAL_ENDPOINT, { path: '/text' })))
      t.notEquals(err.response, undefined)
      return getLog(true).then(
        function (data) {
          t.deepEquals(
            data,
            [
              { method: 'POST', url: '/text' },
              { method: 'POST', url: '/text' },
              { method: 'POST', url: '/text' },
              { method: 'POST', url: '/text' }
            ]
          )
        }
      )
    }
  )
})

test('local /get-dns-packet endpoint', function (t) {
  return getLog().then(localQuery.bind(null, '/get-dns-packet', {}, { method: 'GET' })).then(
    function (data) {
      t.equals(data.type, 'query')
      t.deepEquals(data.question, { name: 'google.com', type: 'A', class: 'IN' })
      return getLog(true).then(
        function (data) {
          t.deepEquals(
            data,
            [
              { method: 'GET', url: '/get-dns-packet?dns=AAABAAABAAAAAAAABmdvb2dsZQNjb20AAAEAAQ' }
            ]
          )
        }
      )
    }
  )
})

test('local /dns-packet endpoint', function (t) {
  return getLog().then(localQuery.bind(null, '/dns-packet')).then(
    function (data) {
      t.equals(data.type, 'response')
      t.deepEquals(data.answers, [{
        name: 'google.com',
        type: 'A',
        ttl: 432,
        class: 'IN',
        flush: false,
        data: '0.0.0.0'
      }])
      return getLog(true).then(
        function (data) {
          t.deepEquals(
            data,
            [
              { method: 'POST', url: '/dns-packet' }
            ]
          )
        }
      )
    }
  )
})

test('local /404 causes StatusError', function (t) {
  return localQuery('/404').then(
    failSuccess(t),
    function (err) {
      t.deepEqual(err.endpoint, toEndpoint(Object.assign({}, LOCAL_ENDPOINT, { path: '/404' })))
      t.notEqual(err.response, undefined)
      t.equals(err.code, 'HTTP_STATUS')
      t.deepEqual(err.toJSON(), {
        uri: `${LOCAL_ENDPOINT_URI}/404`,
        code: 'HTTP_STATUS',
        status: isBrowser ? 0 : 404,
        method: 'POST'
      })
    }
  )
})

test('local /500 causes StatusError', function (t) {
  return localQuery('/500').then(
    failSuccess(t),
    function (err) {
      t.equals(err.code, 'HTTP_STATUS')
    }
  )
})

test('aborting /infinite requests while running (doh)', function (t) {
  const c = new AbortController()
  const p = localQuery('/infinite', { signal: c.signal })
  setTimeout(() => {
    c.abort()
  }, 300)
  return p.then(
    failSuccess(t),
    function (err) {
      if (err.name === 'AbortError') {
        t.pass('Aborted')
      } else {
        console.log(err.stack)
        t.fail('Error')
      }
    }
  )
})

test('aborting requests while running (dns)', {
  skip: isBrowser
}, function (t) {
  const c = new AbortController()
  const p = query({ question: { type: 'A', name: 'google.com' } }, { signal: c.signal, endpoints: 'dns' })
  setImmediate(() => { c.abort() })
  return p.then(
    failSuccess(t),
    function (err) {
      if (err.name === 'AbortError') {
        t.pass('Aborted')
      } else {
        t.fail('Error')
      }
    }
  )
})

test('processing incomplete output', { timeout: 10000 }, function (t) {
  return localQuery('/incomplete', { timeout: 200 }).then(
    failSuccess(t),
    function (error) {
      t.not(error, null)
    }
  )
})

test('processing timeout', { timeout: 2000 }, function (t) {
  const timeout = 120
  return localQuery('/timeout', { timeout }).then(
    failSuccess(t),
    function (error) {
      t.equals(error.timeout, timeout)
      t.equals(error.name, 'TimeoutError')
      t.deepEquals(error.toJSON(), {
        code: 'ETIMEOUT',
        timeout
      })
    }
  )
})

test('randomness of endpoint choice', function (t) {
  const paths = ['/dns-packet', '/dns-packet-b', '/dns-packet-c', '/dns-packet-d']
  return getLog().then(function () {
    return Promise.all(Array.from(new Array(100).keys()).map(function () {
      return localQuery(paths)
    }))
  })
    .then(getLog)
    .then(function (data) {
      const counts = {}
      data.forEach(function (entry) {
        counts[entry.url] = (counts[entry.url] || 0) + 1
      })
      t.deepEquals(Object.keys(counts).sort(), paths)
      Object.keys(counts).forEach(function (key) {
        t.ok(counts[key] > 10, key + ' count > 10')
      })
    })
})

test('empty data treated as response error', function (t) {
  return localQuery('/empty').then(
    failSuccess(t),
    function (err) {
      t.equals(err.message, 'Empty.')
    }
  )
})

test('infinite retries', function (t) {
  const c = new AbortController()
  setTimeout(c.abort.bind(c), 800)
  return getLog().then(localQuery.bind(null, '/500', { retries: -1, signal: c.signal })).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'AbortError', 'Abort Error called')
      return getLog(false)
    }
  ).then(function (data) {
    t.ok(data.length > 2, data.length + ' requests') // There should be at least ~400 requests, using 2 to account for slow computers/connections
  })
})

test('timeout on udp6 sockets', {
  skip: isBrowser
}, function (t) {
  return query({ question: { name: 'google.com', type: 'A' } }, { timeout: 100, endpoints: ['udp6://' + LOCAL_ENDPOINT.host + ':' + LOCAL_ENDPOINT.port] }).then(
    failSuccess(t),
    function (err) {
      t.equals(err.message, (new TimeoutError(100)).message)
    }
  )
})

test('parsing of endpoints', function (t) {
  const session = new Session({
    update: false
  })
  return session.wellknown().then(function (wellknown) {
    const endpoints = wellknown.endpointByName
    return Promise.resolve(null)
      .then(function () {
        const fixtures = [
          { input: [endpoints.google], expected: [endpoints.google] },
          { input: ['google', 'cloudflare'], expected: [endpoints.google, endpoints.cloudflare] },
          { input: [{ protocol: 'https:', host: 'abcd.com' }], expected: [toEndpoint({ protocol: 'https:', host: 'abcd.com' })] },
          { input: [{ host: 'abcd.com' }], expected: [toEndpoint({ protocol: 'https:', host: 'abcd.com' })] },
          { input: ['google', endpoints.cloudflare, { host: 'abcd.com' }], expected: [endpoints.google, endpoints.cloudflare, toEndpoint({ host: 'abcd.com' })] },
          { input: ['https://abcd.com'], expected: [toEndpoint({ protocol: 'https:', host: 'abcd.com' })] },
          { input: ['https://abcd.com:8443/'], expected: [toEndpoint({ protocol: 'https:', host: 'abcd.com', port: 8443, path: '/' })] },
          { input: ['http://foo.com:123/ygga [post]'], expected: [toEndpoint({ protocol: 'http:', host: 'foo.com', port: 123, path: '/ygga', method: 'post' })] },
          { input: ['http://foo.com/ygga/fuga [get]'], expected: [toEndpoint({ protocol: 'http:', host: 'foo.com', path: '/ygga/fuga', method: 'get' })] },
          { input: ['foo.com:8443/ygga/fuga [get]'], expected: [toEndpoint({ protocol: 'https:', host: 'foo.com', port: 8443, path: '/ygga/fuga', method: 'get' })] },
          { input: ['1.1.1.1'], expected: [toEndpoint({ protocol: 'https:', host: '1.1.1.1' })] },
          { input: ['::ffff:ff00'], expected: [toEndpoint({ protocol: 'https:', host: '::ffff:ff00' })] },
          { input: ['ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f:53'], expected: [toEndpoint({ protocol: 'https:', host: 'ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f', port: 53 })] },
          { input: ['udp://1.1.1.1'], expected: [toEndpoint({ protocol: 'udp4:', ipv4: '1.1.1.1' })] },
          { input: ['udp4://1.1.1.1'], expected: [toEndpoint({ protocol: 'udp4:', ipv4: '1.1.1.1' })] },
          { input: ['udp://1.1.1.1:53'], expected: [toEndpoint({ protocol: 'udp4:', ipv4: '1.1.1.1', port: 53 })] },
          { input: ['udp://ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f:53'], expected: [toEndpoint({ protocol: 'udp6:', ipv6: 'ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f', port: 53 })] },
          {
            input: (function * () {
              yield 'google'
              yield 'cloudflare'
            })(),
            expected: [endpoints.google, endpoints.cloudflare]
          },
          {
            input: function (endpoint) {
              return endpoint.name === 'google'
            },
            expected: [endpoints.google]
          },
          {
            input: 'dns',
            expected: wellknown.endpoints.filter(function (endpoint) {
              return endpoint.protocol === 'udp4:' || endpoint.protocol === 'upd6:'
            })
          },
          {
            input: 'doh',
            expected: wellknown.endpoints.filter(function (endpoint) {
              return endpoint.protocol === 'http:' || endpoint.protocol === 'https:'
            })
          },
          {
            input: null,
            expected: wellknown.endpoints
          },
          { input: Promise.resolve(['google']), expected: [endpoints.google] },
          { input: ['google'], expected: [endpoints.google] },
          { input: [], expected: [] }
        ]
        return Promise.all(fixtures.map(function (fixture, index) {
          return dohQuery.loadEndpoints(session, fixture.input).catch(err => {
            return Object.assign(err, { fixture, index })
          })
        })).then(function (results) {
          results.forEach(function (res, index) {
            const fixture = fixtures[index]
            t.equals(res.length, fixture.expected.length)
            res.forEach(function (resEntry, resIndex) {
              const fixtureEntry = fixture.expected[resIndex]
              t.deepEquals(resEntry, fixtureEntry, `#${index}[${resIndex}] ${resEntry} ?? ${fixtureEntry}`)
            })
          })
          t.pass('fixtures done.')
        })
      })
      .then(function () {
        const fixtures = [
          { input: 'hello', expected: /needs to be iterable/i },
          { input: {}, expected: /needs to be iterable/i },
          { input: ['xx://funny'], expected: /unsupported protocol/ },
          { input: [{ protocol: 'https:' }], expected: /host "undefined"/ },
          { input: [{ protocol: 'https:', host: 'hi', port: false }], expected: /needs to be a number/ },
          { input: [{ protocol: 'udp4:' }], expected: /Invalid Endpoint: .ipv4 "undefined" needs to be set/ },
          { input: [{ protocol: 'udp6:' }], expected: /Invalid Endpoint: .ipv6 "undefined" needs to be set/ }
        ]
        return Promise.all(fixtures.map(function (fixture) {
          return dohQuery.loadEndpoints(session, fixture.input).then(
            failSuccess(t),
            err => Promise.resolve(err)
          )
        })).then(function (results) {
          results.forEach(function (error, index) {
            const fixture = fixtures[index]
            t.match(error.message, fixture.expected, `error #${index} ... ${fixture.expected}`)
          })
          t.pass('errors done.')
        })
      })
  })
})

test('dns query using the default servers', {
  skip: isBrowser
}, function (t) {
  return query({ question: { type: 'A', name: 'google.com' } }, { endpoints: 'dns' })
    .then(data => {
      t.deepEquals(data.answers[0], {
        name: 'google.com',
        type: 'A',
        ttl: data.answers[0].ttl,
        class: 'IN',
        flush: false,
        data: data.answers[0].data
      })
    })
})

test('default endpoint/wellknown apis', function (t) {
  function firstWithName (list) {
    return list.find(entry => entry.name)
  }
  return Promise.all([
    dohQuery.wellknown(),
    dohQuery.endpoints()
  ]).then(function (parts) {
    const [wellknown, endpoints] = parts
    const endpoint = firstWithName(endpoints)
    const resolver = firstWithName(wellknown.resolvers)
    t.equals(wellknown.endpoints, endpoints, 'wellknown.endpoints === endpoints')
    t.equals(wellknown.endpointByName[endpoint.name], endpoint, 'first endpoint is in the lookup')
    t.equals(wellknown.resolverByName[resolver.name], resolver, 'first resolver is in the lookup')
    t.equals(resolver.endpoint, wellknown.endpointByName[resolver.endpoint.name], 'wellknown.endpoint is in endpoint lookup')
    t.ok(Array.isArray(endpoints), 'endpoints is array')
    endpoints.forEach((ep, index) => {
      t.ok(ep instanceof dohQuery.BaseEndpoint, `Endpoint#${index} is a BaseEndpoint`)
    })
  })
})

test('custom resolver URL', { skip: typeof URL === 'undefined' }, function (t) {
  const session = new Session({
    maxAge: Number.MAX_VALUE,
    updateURL: new URL('/resolvers', LOCAL_ENDPOINT_URI)
  })
  return getLog().then(function () {
    return session.endpoints()
      .then(endpoints => {
        t.deepEqual(endpoints[0], parseEndpoint('some.domain [cors] [name=some-name]'))
        // repeat lookup, shouldn't trigger load
        return getLog()
          .then(data => {
            t.deepEqual(data, [{ method: 'GET', url: '/resolvers' }])
            return session.endpoints()
          })
          .then(repeatEndpoints => {
            t.equals(repeatEndpoints, endpoints, 'same endpoints, since maxAge is active')
            return getLog(true)
          })
          .then(data => {
            t.deepEqual(data, [], 'no server requested with update')
            // undocumented API, will force a request
            session._wellknown(true)
            return session.endpoints()
          })
          .then(onceMore => {
            t.notEquals(onceMore, endpoints, 'now the endpoints should have been updated')
            return getLog(true)
          })
          .then(log => {
            t.deepEqual(log, [{ method: 'GET', url: '/resolvers' }], 'only after force, another request should be run')
          })
      })
  })
})

test('resolvers error', { skip: typeof URL === 'undefined' }, function (t) {
  const session = new Session({
    updateURL: new URL('/broken-resolvers', LOCAL_ENDPOINT_URI)
  })
  return getLog()
    .then(() => session.endpoints())
    .then(endpoints => {
      t.notEqual(endpoints.length, 0)
      return getLog(true)
    })
    .then(log => {
      t.deepEqual(log, [{ method: 'GET', url: '/broken-resolvers' }])
    })
})

test('query without endpoints', function (t) {
  return query({ question: {} }, { endpoints: [] })
    .then(
      failSuccess(t),
      function (error) {
        t.match(error.message, /no endpoints/i)
      }
    )
})

function persistHelperBrowser () {
  const key = 'dnsquery_resolvers.json'
  return {
    clear: () => {
      globalThis.localStorage.removeItem(key)
    },
    verify: (t) => {
      t.notEqual(globalThis.localStorage.getItem(key), null, 'something has been stored')
      return Promise.resolve()
    }
  }
}
function persistHelperNode () {
  const filename = decodeURI(import.meta.url).replace(/^file:\/\/(\/(\w+:))?/, '$2').replace(/\//g, path.sep)
  const cacheFolder = path.join(filename, '..', '..', '.cache')
  const resolversFile = path.join(cacheFolder, 'resolvers.json')
  return {
    clear: (t) => {
      try {
        fs.unlinkSync(resolversFile)
        fs.rmdirSync(cacheFolder)
      } catch (err) {
        // not so important
      }
      t.equals(fs.existsSync(resolversFile), false, 'cache file doesnt exist before running')
    },
    verify: (t) => {
      t.equals(fs.existsSync(resolversFile), true, 'cache file created')
    }
  }
}

const persistHelpers = isBrowser ? persistHelperBrowser() : persistHelperNode()

test('persisting resolvers', function (t) {
  persistHelpers.clear(t)
  const session = new Session({
    persist: true
  })
  return Promise.all([
    session._wellknown(),
    dohQuery.backup
  ])
    .then(function (results) {
      const [wellknown, backup] = results
      persistHelpers.verify(t)
      t.notEqual(wellknown.time, backup.time, 'not serving the backup')
      const session2 = new Session({
        persist: true
      })
      return session2._wellknown().then(function (wellknown2) {
        t.equals(wellknown2.time, wellknown.time, 'The filesystem cache is used if available')
        return results
      })
    })
    .then(function (results) {
      const [wellknown] = results
      const session3 = new Session({
        maxAge: 1,
        persist: true
      })
      return session3._wellknown().then(function (wellknown3) {
        t.ok(wellknown3.time > wellknown.time, `The filesystem cache is skipped if old (${wellknown3.time} > ${wellknown.time} (${wellknown3.time - wellknown.time}))`)
      })
    })
})

test('internal reduceError helper', { skip: typeof BigInt === 'undefined' }, function (t) {
  t.deepEqual(reduceError('hello'), { message: 'hello' })
  t.deepEqual(reduceError({ hello: 'world' }), { hello: 'world' })
  t.deepEqual(reduceError({ foo: 'hello', code: BigInt(123) }), { message: '[object Object]', code: '123' })
  t.deepEqual(reduceError({ message: BigInt(123), code: 123 }), { message: '123', code: '123' })
  t.end()
})

function getLog (filter) {
  const reqs = req('/log', 'GET', 'json')
  if (filter) {
    return reqs.then(log => log.filter(function (req) { return req.method !== 'OPTIONS' }))
  }
  return reqs
}

function req (path, method, responseType, data) {
  return new Promise(function (resolve, reject) {
    const xhr = new XHR()
    const uri = `${LOCAL_ENDPOINT_URI}${path}`
    if (!method) {
      method = 'POST'
    }
    if (!responseType) {
      responseType = 'text'
    }
    xhr.responseType = responseType
    xhr.open(method, uri, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState > 1 && xhr.status !== 200) {
        reject(new Error('Status: ' + xhr.status))
      } else if (xhr.readyState === 4) {
        resolve(xhr.response)
      }
    }
    xhr.onerror = reject
    xhr.send(data)
  })
}

function failSuccess (t) {
  return function () { t.fail('Unexpected success') }
}

function localQuery (paths, opts, endpointOpts) {
  if (!Array.isArray(paths)) {
    paths = [paths]
  }
  return query(
    { question: { type: 'A', name: 'google.com' } },
    Object.assign(
      {
        endpoints: paths.map(function (path) { return Object.assign({ path }, LOCAL_ENDPOINT, endpointOpts) }),
        retries: 0
      },
      opts
    )
  )
}
