'use strict'
const errors = require('./error.js')
const AbortError = errors.AbortError
const HTTPStatusError = errors.HTTPStatusError
const contentType = 'application/dns-message'

module.exports = function request (protocol, host, port, path, packet, abortSignal, cb) {
  const finish = function (error, data) {
    if (abortSignal) {
      abortSignal.removeEventListener('abort', onabort)
    }
    cb(error, data)
  }
  const xhr = new XMLHttpRequest()
  const uri = `${protocol}//${host}:${port}${path}`
  const method = 'POST'
  xhr.open(method, uri, true)
  xhr.setRequestHeader('Accept', contentType)
  xhr.setRequestHeader('Content-Type', contentType)
  xhr.responseType = 'arraybuffer'
  xhr.onreadystatechange = function () {
    if (xhr.readyState > 1) {
      if (xhr.status !== 200) {
        finish(new HTTPStatusError(uri, xhr.status, method))
        try {
          xhr.abort()
        } catch (e) {}
        return
      }
    }
    if (xhr.readyState === 4) {
      finish(null, xhr.response)
    }
  }
  xhr.onerror = error =>finish(error || new Error('Unknown XHR Error'))
  xhr.send(packet)
  if (abortSignal) {
    abortSignal.addEventListener('abort', onabort)
  }
  function onabort () {
    try {
      xhr.abort()
    } catch (e) {}
    finish(new AbortError())
  }
}
