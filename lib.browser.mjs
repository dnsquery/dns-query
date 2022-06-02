/* global XMLHttpRequest, localStorage */
import * as utf8Codec from 'utf8-codec'
import { base64URL } from '@leichtgewicht/base64-codec'
import {
  AbortError,
  HTTPStatusError,
  TimeoutError,
  URL
} from './common.mjs'
const contentType = 'application/dns-message'

function noop () { }

export function queryDns () {
  throw new Error('Only "doh" endpoints are supported in the browser')
}

export async function loadJSON (url, cache, timeout, abortSignal) {
  const cacheKey = cache ? cache.localStoragePrefix + cache.name : null
  if (cacheKey) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey))
      if (cached && cached.time > cache.maxTime) {
        return cached
      }
    } catch (err) {}
  }
  const { data } = await requestRaw(url, 'GET', null, timeout, abortSignal)
  const result = {
    time: Date.now(),
    data: JSON.parse(utf8Codec.decode(data))
  }
  if (cacheKey) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result))
    } catch (err) {
      result.time = null
    }
  }
  return result
}

function requestRaw (url, method, data, timeout, abortSignal) {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    if (method === 'GET' && data) {
      target.search = '?dns=' + base64URL.decode(data)
    }
    const uri = target.toString()
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
    if (method === 'POST') {
      xhr.send(data)
    } else {
      xhr.send()
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
        let buf
        if (typeof xhr.response === 'string') {
          buf = utf8Codec.encode(xhr.response)
        } else if (xhr.response instanceof Uint8Array) {
          buf = xhr.response
        } else if (Array.isArray(xhr.response) || xhr.response instanceof ArrayBuffer) {
          buf = new Uint8Array(xhr.response)
        } else {
          throw new Error('Unprocessable response ' + xhr.response)
        }
        finish(null, buf)
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
        resolve({
          error,
          response: xhr
        })
      } else {
        resolve({
          data,
          response: xhr
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

export function request (url, method, packet, timeout, abortSignal) {
  return requestRaw(url, method, packet, timeout, abortSignal)
}

export function processResolvers (resolvers) {
  return resolvers.filter(resolver => resolver.cors || resolver.endpoint.cors)
}
