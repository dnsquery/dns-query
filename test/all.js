'use strict'
const test = require('fresh-tape')
const pmap = require('p-map')
const query = require('..')
const all = require('../endpoints.js').all
const XHR = require('xhr2')

const IPV4 = /^[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}$/
var LOCAL_ENDPOINT = {
  https: process.env.TEST_HTTPS === 'true',
  host: process.env.TEST_HOST,
  port: process.env.TEST_PORT
}

test(`Looking up all Endpoints`, function (t) {
  return pmap(all, function (endpoint) {
    return query(
      { questions: [{ type: 'A', name: 'google.com' }] },
      { endpoints: endpoint }
    ).then(
      function (result) {
        const answers = result.answers
        const title = 'Endpoint: ' + endpoint.name
        t.pass('───╼━┳━' + repeat('━', title.length) + '━┳━╾───')
        t.pass('───╼━┫ ' + title + ' ┣━╾───')
        t.equals(result.endpoint, endpoint, 'endpoint correctly supplied')
        t.not(answers.length, 0, 'answers > 0')
        t.pass('answer count: ' + answers.length)
        const answer = answers[0]
        t.equals(answer.name, 'google.com', 'name=google.com')
        if (answer.type === 'A') {
          t.match(answer.data, IPV4, 'uses IPV4 address: ' + answer.data)
        } else {
          t.equals(answer.type, 'CNAME', 'uses CNAME')
          t.equals(answer.data, 'forcesafesearch.google.com', 'redirects to safesearch google')
        }
        t.equals(answer.class, 'IN', 'class=IN')
        t.equals(answer.flush, false, 'flush=false')
        t.ok(typeof answer.ttl, 'ttl=' + answer.ttl + ' is number')
      },
      failErr(t)
    )
  }, { concurrency: 14 })
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
        t.end()
      }
    )
})
// Note: this needs to be the first local request!
test('local /text causes ResponseError, with retry=0, once!', function (t) {
  return localQuery('/text').then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'ResponseError')
      return req('/log', 'GET', 'json').then(
        function (data) {
          t.deepEquals(
            data.filter(function (req) { return req.method !== 'OPTIONS' }),
            [
              { method: 'POST', url: '/text' }
            ]
          )
          t.end()
        },
        failErr(t)
      )
    }
  )
})
test('local /text causes ResponseError, with retry=3, several times', function (t) {
  return localQuery('/text', { retry: 3 }).then(
    failSuccess(t),
    function (err) {
      t.equals(err.name, 'ResponseError')
      return req('/log', 'GET', 'json').then(
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
          t.end()
        },
        failErr(t)
      )
    }
  )
})
test('local /dns-packet endpoint', function (t) {
  return localQuery('/dns-packet').then(
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
      return req('/log', 'GET', 'json').then(
        function (data) {
          t.deepEquals(
            data.filter(function (req) { return req.method !== 'OPTIONS' }),
            [
              { method: 'POST', url: '/dns-packet' }
            ]
          )
          t.end()
        },
        failErr(t)
      )
    },
    failErr(t)
  )
})
test('local /404 causes StatusError', function (t) {
  return localQuery('/404').then(
    failSuccess(t),
    function (err) {
      t.equals(err.code, 'HTTP_STATUS')
      t.end()
    }
  )
})
test('local /500 causes StatusError', function (t) {
  return localQuery('/500').then(
    failSuccess(t),
    function (err) {
      t.equals(err.code, 'HTTP_STATUS')
      t.end()
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
      t.end()
    }
  )
})
test('processing incomplete output', function (t) {
  return localQuery('/incomplete').then(
    failSuccess(t),
    function (error) {
      t.not(error, null)
      t.end()
    }
  )
})
test('processing timeout', function (t) {
  const timeout = 120
  return localQuery('/timeout', { timeout }).then(
    failSuccess(t),
    function (error) {
      t.equals(error.timeout, timeout)
      t.equals(error.name, 'TimeoutError')
    }
  )
})

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

function failErr (t) {
  return function (error) { t.error(error) }
}

function localQuery (path, opts) {
  return query(
    { questions: [{ type: 'A', name: 'google.com' }] },
    Object.assign(
      {
        endpoints: [Object.assign({ path: path }, LOCAL_ENDPOINT)],
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