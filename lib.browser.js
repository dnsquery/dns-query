'use strict'
/* global XMLHttpRequest */
const errors = require('./error.js')
const AbortError = errors.AbortError
const HTTPStatusError = errors.HTTPStatusError
const TimeoutError = errors.TimeoutError
const contentType = 'application/dns-message'
const endpoints = Object.values(require('./endpoints.json')).filter(function (endpoint) {
  return !endpoint.filter && !endpoint.logging && endpoint.cors
})

function request (protocol, host, port, path, method, packet, timeout, abortSignal, cb) {
  const uri = protocol + '//' + host + ':' + port + path + (method === 'GET' ? '?dns=' + packet.toString('base64').replace(/=*/g, '') : '')
  const xhr = new XMLHttpRequest()
  xhr.open(method, uri, true)
  xhr.setRequestHeader('Accept', contentType)
  if (method === 'POST') {
    xhr.setRequestHeader('Content-Type', contentType)
  }
  xhr.responseType = 'arraybuffer'
  xhr.timeout = timeout
  xhr.ontimeout = ontimeout
  xhr.onreadystatechange = onreadystatechange
  xhr.onerror = onerror
  xhr.onload = onload
  if (method === 'GET') {
    xhr.send()
  } else {
    xhr.send(packet)
  }

  if (abortSignal) {
    abortSignal.addEventListener('abort', onabort)
  }

  function ontimeout () {
    finish(new TimeoutError(timeout))
    try {
      xhr.abort()
    } catch (e) {}
  }

  function onload () {
    if (xhr.status !== 200) {
      finish(new HTTPStatusError(uri, xhr.status, method))
    } else {
      finish(null, xhr.response)
    }
  }

  function onreadystatechange () {
    if (xhr.readyState > 1 && xhr.status !== 200 && xhr.status !== 0) {
      finish(new HTTPStatusError(uri, xhr.status, method))
      try {
        xhr.abort()
      } catch (e) {}
    }
  }

  function finish (error, data) {
    if (abortSignal) {
      abortSignal.removeEventListener('abort', onabort)
    }
    cb(error, data)
  }

  function onerror () {
    finish(xhr.status === 200 ? new Error('Inexplicable XHR Error') : new HTTPStatusError(uri, xhr.status, method))
  }

  function onabort () {
    finish(new AbortError())
    try {
      xhr.abort()
    } catch (e) {}
  }
}

module.exports = {
  request: request,
  endpoints: endpoints
}
