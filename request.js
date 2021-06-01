const { AbortError, HTTPStatusError, TimeoutError } = require('./error.js')
const contentType = 'application/dns-message'

module.exports = function request (protocol, host, port, path, packet, timeout, abortSignal, cb) {
  let timer
  const client = protocol === 'https:' ? require('https') : require('http')
  const finish = (error, data) => {
    clearTimeout(timer)
    if (abortSignal) {
      abortSignal.removeEventListener('abort', onabort)
    }
    cb(error, data)
  }
  const uri = `${protocol}//${host}:${port}${path}`
  const req = client.request({
    host: host,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      Accept: contentType,
      'Content-Type': contentType,
      'Content-Length': packet.byteLength
    }
  }, onresponse)
  if (abortSignal) {
    abortSignal.addEventListener('abort', onabort)
  }
  req.on('error', finish)
  req.end(packet)
  resetTimeout()

  function onabort () {
    req.destroy(new AbortError())
  }

  function onresponse (res) {
    if (res.statusCode !== 200) {
      return res.destroy(new HTTPStatusError(uri, res.statusCode, 'POST'))
    }
    const result = []
    res.on('error', finish)
    res.on('data', data => {
      resetTimeout()
      result.push(data)
    })
    res.on('end', () => finish(null, Buffer.concat(result)))
  }

  function resetTimeout () {
    clearTimeout(timer)
    timer = setTimeout(ontimeout, timeout)
  }

  function ontimeout () {
    req.destroy(new TimeoutError(timeout))
  }
}
