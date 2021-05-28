const test = require('tape')
const query = require('.')
const all = require('./endpoints.js').all

const IPV4 = /^[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}$/

for (const endpoint of all) {
  test(`Endpoint lookup: ${endpoint.name}`, async t => {
    const answers = (await query({ questions: [{ type: 'A', name: 'google.com' }] }, { endpoint: endpoint })).answers
    t.not(answers.length, 0)
    const [ answer ] = answers
    t.equals(answer.name, 'google.com')
    if (answer.type === 'A') {
      t.match(answer.data, IPV4)
    } else {
      t.equals(answer.type, 'CNAME')
      t.equals(answer.data, 'forcesafesearch.google.com')
    }
    t.equals(answer.class, 'IN')
    t.equals(answer.flush, false)
    t.ok(typeof answer.ttl, 'number')
    t.pass(`${answers.length} answers`)
  })
}

