/* global XMLHttpRequest */
import { Buffer } from 'buffer'
import {
  AbortError,
  HTTPStatusError,
  TimeoutError
} from './common.js'
const contentType = 'application/dns-message'

// https://tools.ietf.org/html/rfc8484
function toRFC8484 (buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function noop () { }

export function queryDns () {
  throw new Error('Only "doh" endpoints are supported in the browser')
}

export function request (protocol, host, port, path, method, packet, timeout, abortSignal) {
  return new Promise((resolve, reject) => {
    const uri = protocol + '//' + host + ':' + port + path + (method === 'GET' ? '?dns=' + toRFC8484(packet) : '')
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
      } catch (e) { }
    }

    function onload () {
      if (xhr.status !== 200) {
        finish(new HTTPStatusError(uri, xhr.status, method))
      } else {
        finish(null, Buffer.from(xhr.response))
      }
    }

    function onreadystatechange () {
      if (xhr.readyState > 1 && xhr.status !== 200 && xhr.status !== 0) {
        finish(new HTTPStatusError(uri, xhr.status, method))
        try {
          xhr.abort()
        } catch (e) { }
      }
    }

    let finish = function (error, data) {
      finish = noop
      if (abortSignal) {
        abortSignal.removeEventListener('abort', onabort)
      }
      if (error) {
        reject(error)
      } else {
        resolve({
          data,
          xhr
        })
      }
    }

    function onerror () {
      finish(xhr.status === 200 ? new Error('Inexplicable XHR Error') : new HTTPStatusError(uri, xhr.status, method))
    }

    function onabort () {
      finish(new AbortError())
      try {
        xhr.abort()
      } catch (e) { }
    }
  })
}

export function nativeEndpoints () {
  return []
}
