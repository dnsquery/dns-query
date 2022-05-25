'use strict'
const test = require('fresh-tape')
const dohQuery = require('..')
const query = dohQuery.query
const Endpoint = dohQuery.Endpoint
const parseEndpoints = dohQuery.parseEndpoints
const isBrowser = typeof window !== 'undefined'
const XHR = require('xhr2')
const AbortController = require('abort-controller')
const { TimeoutError } = require('../common.cjs')

const LOCAL_ENDPOINT = {
  protocol: process.env.TEST_HTTPS === 'true' ? 'https:' : 'http:',
  host: process.env.TEST_HOST,
  port: parseInt(process.env.TEST_PORT, 10),
  method: 'POST'
}

test('Abort before start (doh)', function (t) {
  const c = new AbortController()
  c.abort()
  return query(
    { questions: [{ type: 'A', name: 'google.com' }] },
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
    { questions: [{ type: 'A', name: 'google.com' }], endpoints: 'dns' },
    { signal: c.signal }
  ).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'AbortError')
    }
  )
})
test('local /text causes ResponseError, with retries=0, once!', function (t) {
  return getLog().then(localQuery.bind(null, '/text')).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'ResponseError')
      t.equals(err.message, 'Invalid packet (cause=Header must be 12 bytes)')
      t.notEqual(err.cause, undefined)
      t.notEqual(err.cause, null)
      t.deepEqual(err.endpoint, new Endpoint(Object.assign({}, LOCAL_ENDPOINT, { path: '/text' })))
      t.notEqual(err.response, undefined)
      return getLog().then(
        function (data) {
          t.deepEquals(
            data.filter(function (req) { return req.method !== 'OPTIONS' }),
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
      t.deepEqual(err.endpoint, new Endpoint(Object.assign({}, LOCAL_ENDPOINT, { path: '/text' })))
      t.notEquals(err.response, undefined)
      return getLog().then(
        function (data) {
          t.deepEquals(
            data.filter(function (req) { return req.method !== 'OPTIONS' }),
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
      return getLog().then(
        function (data) {
          t.deepEquals(
            data.filter(function (req) { return req.method !== 'OPTIONS' }),
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
      t.deepEqual(err.endpoint, new Endpoint(Object.assign({}, LOCAL_ENDPOINT, { path: '/404' })))
      t.notEqual(err.response, undefined)
      t.equals(err.code, 'HTTP_STATUS')
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
  const p = query({ questions: [{ type: 'A', name: 'google.com' }] }, { signal: c.signal, endpoints: 'dns' })
  setImmediate(() => { c.abort() })
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
    }
  )
})
test('randomness of endpoint choice', function (t) {
  const paths = ['/dns-packet', '/dns-packet-b', '/dns-packet-c', '/dns-packet-d']
  return getLog().then(function () {
    return Promise.all((new Array(100)).map(function () {
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
      t.equals(err.name, 'AbortError')
      return getLog()
    }
  ).then(function (data) {
    t.ok(data.length > 2, data.length + ' requests') // There should be at least ~400 requests, using 2 to account for slow computers/connections
  })
})
test('timeout on udp6 sockets', {
  skip: isBrowser
}, function (t) {
  return query({ questions: [] }, { timeout: 100, endpoints: ['udp6://' + LOCAL_ENDPOINT.host + ':' + LOCAL_ENDPOINT.port] }).then(
    failSuccess(t),
    function (err) {
      t.equals(err.message, (new TimeoutError(100)).message)
    }
  )
})
test('parsing of endpoints', function (t) {
  const endpoints = dohQuery.endpoints
  t.deepEquals(parseEndpoints([endpoints.google]), [endpoints.google])
  t.deepEquals(parseEndpoints(['google', 'cloudflare']), [dohQuery.endpoints.google, dohQuery.endpoints.cloudflare])
  t.deepEquals(parseEndpoints([{ protocol: 'https:', host: 'abcd.com' }]), [new Endpoint({ protocol: 'https:', host: 'abcd.com' })])
  t.deepEquals(parseEndpoints(['https://abcd.com']), [new Endpoint({ protocol: 'https:', host: 'abcd.com' })])
  t.deepEquals(parseEndpoints(['https://abcd.com:8443/']), [new Endpoint({ protocol: 'https:', host: 'abcd.com', port: 8443, path: '/' })])
  t.deepEquals(parseEndpoints(['http://foo.com:123/ygga [post]']), [new Endpoint({ protocol: 'http:', host: 'foo.com', port: 123, path: '/ygga', method: 'post' })])
  t.deepEquals(parseEndpoints(['http://foo.com/ygga/fuga [get]']), [new Endpoint({ protocol: 'http:', host: 'foo.com', path: '/ygga/fuga', method: 'get' })])
  t.deepEquals(parseEndpoints(['foo.com:8443/ygga/fuga [get]']), [new Endpoint({ protocol: 'https:', host: 'foo.com', port: 8443, path: '/ygga/fuga', method: 'get' })])
  t.deepEquals(parseEndpoints(['1.1.1.1']), [new Endpoint({ protocol: 'https:', host: '1.1.1.1' })])
  t.deepEquals(parseEndpoints(['::ffff:ff00']), [new Endpoint({ protocol: 'https:', host: '::ffff:ff00' })])
  t.deepEquals(parseEndpoints(['ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f:53']), [new Endpoint({ protocol: 'https:', host: 'ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f', port: 53 })])
  t.deepEquals(parseEndpoints(['udp://1.1.1.1']), [new Endpoint({ protocol: 'udp4:', host: '1.1.1.1' })])
  t.deepEquals(parseEndpoints(['udp4://1.1.1.1']), [new Endpoint({ protocol: 'udp4:', host: '1.1.1.1' })])
  t.deepEquals(parseEndpoints(['udp://1.1.1.1:53']), [new Endpoint({ protocol: 'udp4:', host: '1.1.1.1', port: 53 })])
  t.deepEquals(parseEndpoints(['udp://ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f:53']), [new Endpoint({ protocol: 'udp6:', host: 'ffff:ff00:0000:00ff:f000:000f:f0f0:0f0f', port: 53 })])
  t.deepEquals(parseEndpoints([]), [])
  t.throws(function () { parseEndpoints('hello') }, /needs to be iterable/i)
  t.throws(function () { parseEndpoints({}) }, /needs to be iterable/i)
  t.throws(function () { parseEndpoints(['xx://funny']) }, /unsupported protocol/)
  t.throws(function () { parseEndpoints([{ protocol: 'https:' }]) }, /host "undefined"/)
  t.throws(function () { parseEndpoints([{ protocol: 'https:', host: 'hi', port: false }]) }, /needs to be a number/)
  t.end()
})
test('dns query using the default servers', {
  skip: isBrowser
}, function (t) {
  return query({ questions: [{ type: 'A', name: 'google.com' }] }, { endpoints: 'dns' })
    .then(data => {
      t.deepEquals(data.answers, [{
        name: 'google.com',
        type: 'A',
        ttl: data.answers[0].ttl,
        class: 'IN',
        flush: false,
        data: data.answers[0].data
      }])
    })
})

test('query without endpoints', function (t) {
  return query({}, { endpoints: [] })
    .then(
      failSuccess(t),
      function (error) {
        t.match(error.message, /no endpoints/i)
      }
    )
})

function getLog () {
  return req('/log', 'GET', 'json')
}

function req (path, method, responseType, data) {
  return new Promise(function (resolve, reject) {
    const xhr = new XHR()
    const uri = `${LOCAL_ENDPOINT.https ? 'https' : 'http'}://${LOCAL_ENDPOINT.host}:${LOCAL_ENDPOINT.port}${path}`
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

function localQuery (paths, opts) {
  if (!Array.isArray(paths)) {
    paths = [paths]
  }
  return query(
    { questions: [{ type: 'A', name: 'google.com' }] },
    Object.assign(
      {
        endpoints: paths.map(function (path) { return Object.assign({ path: path }, LOCAL_ENDPOINT) }),
        retries: 0
      },
      opts
    )
  )
}
