'use strict'
const test = require('fresh-tape')
const query = require('.')
const pmap = require('p-map')
const all = require('./endpoints.js').all

const IPV4 = /^[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}$/

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
      function (error) {
        t.fail(error)
      })
  }, { concurrency: 14 })
})

function repeat (char, count) {
  let res = ''
  for (let i = 0; i < count; i++) {
    res += char
  }
  return res
}