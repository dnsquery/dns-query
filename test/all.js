'use strict'
const test = require('fresh-tape')
const pmap = require('p-map')
const dohQuery = require('..')
const query = dohQuery.query
let all = Object.entries(require('../endpoints.json')).map(function (parts) {
  parts[1].name = parts[0]
  return parts[1]
})
if (typeof window !== 'undefined') { // Browser
  all = all.filter(function (endpoint) {
    return endpoint.cors
  })
}
const XHR = require('xhr2')
const AbortController = require('abort-controller')

const IPV4 = /^[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}$/
const LOCAL_ENDPOINT = {
  https: process.env.TEST_HTTPS === 'true',
  host: process.env.TEST_HOST,
  port: process.env.TEST_PORT,
  method: 'POST'
}

test('Looking up all Endpoints', function (t) {
  return pmap(Object.values(all), function (endpoint) {
    let once = false
    return query(
      { id: '\x7f\xfe\xff\xfe' /* to test + and / encoding */, questions: [{ type: 'A', name: 'google.com' }] },
      { endpoints: endpoint }
    )
      .then(function (result) {
        const answers = result.answers
        once = writeHeader(endpoint, once)
        t.equals(result.endpoint, endpoint, 'endpoint correctly supplied')
        if (answers.length === 0) {
          t.fail('No answers.')
          return
        }
        t.pass('answer count: ' + answers.length)
        const answer = answers[0]
        t.match(answer.name, /^google.com$/i, 'name=google.com')
        if (answer.type === 'A') {
          t.match(answer.data, IPV4, 'uses IPV4 address: ' + answer.data)
        } else {
          t.equals(answer.type, 'CNAME', 'uses CNAME')
          t.equals(answer.data, 'forcesafesearch.google.com', 'redirects to safesearch google')
        }
        t.equals(answer.class, 'IN', 'class=IN')
        t.equals(answer.flush, false, 'flush=false')
        t.ok(typeof answer.ttl, 'ttl=' + answer.ttl + ' is number')
      })
      .catch(function (err) {
        once = writeHeader(endpoint, once)
        t.error(err)
      })
  }, { concurrency: 14 })

  function writeHeader (endpoint, once) {
    if (!once) {
      const title = 'Endpoint: ' + endpoint.name
      t.pass('───╼━┳━' + repeat('━', title.length) + '━┳━╾───')
      t.pass('───╼━┫ ' + title + ' ┣━╾───')
    }
    return true
  }
})
test('Abort before start', function (t) {
  const c = new AbortController()
  c.abort()
  return query(
    { questions: [{ type: 'A', name: 'google.com' }] },
    { signal: c.signal }
  ).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'AbortError')
    }
  )
})
test('local /text causes ResponseError, with retry=0, once!', function (t) {
  return getLog().then(localQuery.bind(null, '/text')).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'ResponseError')
      t.equals(err.message, 'Invalid packet (cause=Header must be 12 bytes)')
      t.notEqual(err.cause, undefined)
      t.notEqual(err.cause, null)
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
test('local /text causes ResponseError, with retry=3, several times', function (t) {
  return localQuery('/text', { retry: 3 }).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'ResponseError')
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
test('aborting /infinite requests while running', function (t) {
  const c = new AbortController()
  const p = localQuery('/infinite', { signal: c.signal })
  setTimeout(() => {
    c.abort()
  }, 300)
  return p.then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'AbortError')
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
      return pmap(new Array(100), function () {
        return localQuery(paths)
      })
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
        retry: 0
      },
      opts
    )
  )
}

function repeat (char, count) {
  let res = ''
  for (let i = 0; i < count; i++) {
    res += char
  }
  return res
}
