'use strict'
const errors = require('./error.js')
const AbortError = errors.AbortError
const HTTPStatusError = errors.HTTPStatusError
const TimeoutError = errors.TimeoutError
const contentType = 'application/dns-message'

module.exports = function request (protocol, host, port, path, packet, timeout, abortSignal, cb) {
  const uri = `${protocol}//${host}:${port}${path}`
  const method = 'POST'
  const xhr = new XMLHttpRequest()
  xhr.open(method, uri, true)
  xhr.setRequestHeader('Accept', contentType)
  xhr.setRequestHeader('Content-Type', contentType)
  xhr.responseType = 'arraybuffer'
  xhr.timeout = timeout
  xhr.ontimeout = ontimeout
  xhr.onreadystatechange = onreadystatechange
  xhr.onerror = onerror
  xhr.onload = onload
  xhr.send(packet)

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

  function onerror (error) {
    if (error instanceof ProgressEvent) {
      error = xhr.status === 200 ? new Error('Inexplicable XHR Error') : new HTTPStatusError(uri, xhr.status, method)
    }
    finish(error || new Error('Unknown XHR Error'))
  }

  function onabort () {
    finish(new AbortError())
    try {
      xhr.abort()
    } catch (e) {}
  }
}
