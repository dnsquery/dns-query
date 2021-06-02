'use strict'
const { AbortError, HTTPStatusError, TimeoutError } = require('./error.js')
const contentType = 'application/dns-message'
const endpoints = Object.values(require('./endpoints.json')).filter(function (endpoint) {
  return !endpoint.filter && !endpoint.log
})

// https://tools.ietf.org/html/rfc8484
function toRFC8484 (buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function request (protocol, host, port, path, method, packet, timeout, abortSignal, cb) {
  let timer
  const client = protocol === 'https:' ? require('https') : require('http')
  let finish = (error, data) => {
    finish = null
    clearTimeout(timer)
    if (abortSignal) {
      abortSignal.removeEventListener('abort', onabort)
    }
    cb(error, data)
  }
  const pth = `${path}${method === 'GET' ? '?dns=' + toRFC8484(packet) : ''}`
  const uri = `${protocol}//${host}:${port}${pth}`
  const headers = {
    Accept: contentType
  }
  if (method === 'POST') {
    headers['Content-Type'] = contentType
    headers['Content-Length'] = packet.byteLength
  }
  const req = client.request({
    host: host,
    port: port,
    path: pth,
    method: method,
    headers: headers
  }, onresponse)
  if (abortSignal) {
    abortSignal.addEventListener('abort', onabort)
  }
  req.on('error', finish)
  if (method === 'POST') {
    req.end(packet)
  } else {
    req.end()
  }
  resetTimeout()

  function onabort () {
    req.destroy(new AbortError())
  }

  function onresponse (res) {
    if (res.statusCode !== 200) {
      return res.destroy(new HTTPStatusError(uri, res.statusCode, method))
    }
    const result = []
    res.on('error', onerror)
    res.on('data', data => {
      resetTimeout()
      result.push(data)
    })
    res.on('end', onclose)
    res.on('close', onclose)

    function onclose () {
      if (finish !== null) {
        finish(null, Buffer.concat(result))
      }
    }

    function onerror (error) {
      if (finish !== null) {
        finish(error || new Error('Unknown Error.'))
      }
    }
  }

  function resetTimeout () {
    clearTimeout(timer)
    timer = setTimeout(ontimeout, timeout)
  }

  function ontimeout () {
    req.destroy(new TimeoutError(timeout))
  }
}

module.exports = {
  request: request,
  endpoints: endpoints
}
