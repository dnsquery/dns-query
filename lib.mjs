import dns from 'dns'
import dgram from 'dgram'
import { DNSSocket } from '@leichtgewicht/dns-socket'
import * as codec from '@leichtgewicht/ip-codec'
import https from 'https'
import http from 'http'
import {
  AbortError, HTTPStatusError, TimeoutError, Endpoint
} from 'dns-query/common.js'

const contentType = 'application/dns-message'

// https://tools.ietf.org/html/rfc8484
function toRFC8484 (buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

let socket4
let socket6

function clearSocketMaybe (socket) {
  if (socket.inflight === 0) {
    socket.destroy()
    if (socket === socket4) {
      socket4 = null
    } else {
      socket6 = null
    }
  }
}

const MAX_32BIT_INT = 2147483647

function getSocket (protocol) {
  if (protocol === 'udp4:') {
    if (!socket4) {
      socket4 = new DNSSocket({ timeout: MAX_32BIT_INT, timeoutChecks: MAX_32BIT_INT, retries: 0, socket: dgram.createSocket('udp4') })
      socket4.on('error', (error) => {
        console.log({ error })
      })
      socket4.on('warning', (warning) => {
        console.log({ warning })
      })
    }
    return socket4
  }
  if (!socket6) {
    socket6 = new DNSSocket({ timeout: MAX_32BIT_INT, timeoutChecks: MAX_32BIT_INT, retries: 0, socket: dgram.createSocket('udp6') })
    socket6.on('error', (error) => {
      console.log({ error })
    })
    socket6.on('warning', (warning) => {
      console.log({ warning })
    })
  }
  return socket6
}

export function queryDns (protocol, host, port, pk, query, timeout, signal) {
  return new Promise((resolve, reject) => {
    const socket = getSocket(protocol)
    if (pk) {
      // TODO: add dnscrypt support to @leichtgewicht/dns-socket
      return reject(new Error('dnscrypt servers currently not supported'))
    }
    const t = setTimeout(onTimeout, timeout)
    const done = (err, res) => {
      if (signal) {
        signal.removeEventListener('abort', onAbort)
      }
      clearSocketMaybe(socket)
      clearTimeout(t)
      if (err) return reject(err)
      resolve(res)
    }
    const requestId = socket.query(query, port, host, done)
    if (signal) {
      signal.addEventListener('abort', onAbort)
    }
    function onAbort () {
      done(new AbortError())
      socket.cancel(requestId)
      clearSocketMaybe(socket)
    }
    function onTimeout () {
      done(new TimeoutError(timeout))
      socket.cancel(requestId)
      clearSocketMaybe(socket)
    }
  })
}

function requestRaw (url, method, body, timeout, abortSignal, headers) {
  return new Promise((resolve, reject) => {
    let timer
    const client = url.protocol === 'https:' ? https : http
    let finish = (error, data, response) => {
      finish = null
      clearTimeout(timer)
      if (abortSignal) {
        abortSignal.removeEventListener('abort', onabort)
      }
      if (error) {
        reject(error)
      } else {
        resolve({
          data,
          response
        })
      }
    }
    const pth = `${url.pathname}${method === 'GET' && body ? '?dns=' + toRFC8484(body) : ''}`
    const uri = `${url.protocol}//${url.host}:${url.port}${pth}`
    const req = client.request({
      host: url.host,
      port: url.port,
      path: pth,
      method,
      headers
    }, onresponse)
    if (abortSignal) {
      abortSignal.addEventListener('abort', onabort)
    }
    req.on('error', onerror)
    if (method === 'POST') {
      req.end(body)
    } else {
      req.end()
    }
    resetTimeout()

    function onabort () {
      req.destroy(new AbortError())
    }

    function onresponse (res) {
      if (res.statusCode !== 200) {
        const error = new HTTPStatusError(uri, res.statusCode, method)
        finish(error, null, res)
        res.destroy(error)
        return
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
          finish(null, Buffer.concat(result), res)
        }
      }
    }

    function onerror (error) {
      if (finish !== null) {
        if (error instanceof Error) {
          finish(error)
        } else {
          finish(error ? new Error(error) : new Error('Unknown Error.'))
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
  })
}

export async function request (url, method, packet, timeout, abortSignal) {
  const headers = {
    Accept: contentType
  }
  if (method === 'POST') {
    headers['Content-Type'] = contentType
    headers['Content-Length'] = packet.byteLength
  }
  return await requestRaw(url, method, packet, timeout, abortSignal, headers)
}

export async function loadJSON (url, useCache, timeout, abortSignal) {
  const { data } = await requestRaw(url, 'GET', null, timeout, abortSignal)
  return JSON.parse(data)
}

export function nativeEndpoints () {
  return dns.getServers().map(host => new Endpoint({
    protocol: codec.familyOf(host) === 1 ? 'udp4:' : 'udp6:',
    host
  }))
}
