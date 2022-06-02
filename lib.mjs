import dns from 'dns'
import dgram from 'dgram'
import { DNSSocket } from '@leichtgewicht/dns-socket'
import * as codec from '@leichtgewicht/ip-codec'
import { base64URL } from '@leichtgewicht/base64-codec'
import https from 'https'
import http from 'http'
import * as common from './common.mjs'
import fs from 'fs'
import * as path from 'path'
import { Buffer } from 'buffer'
const { AbortError, HTTPStatusError, TimeoutError, UDP4Endpoint, UDP6Endpoint, URL } = common

// Node 6 support
const writeFile = (path, data) => new Promise(
  (resolve, reject) => fs.writeFile(path, data, err => { err ? reject(err) : resolve() })
)
const readFile = (path, opts) => new Promise(
  (resolve, reject) => fs.readFile(path, opts, (err, data) => { err ? reject(err) : resolve(data) })
)
const mkdir = path => new Promise(
  (resolve, reject) => fs.mkdir(path, err => { err ? reject(err) : resolve() })
)
const stat = path => new Promise(
  (resolve, reject) => fs.stat(path, (err, stats) => { err ? reject(err) : resolve(stats) })
)

const filename = decodeURI(import.meta.url).replace(/^file:\/\/(\/(\w+:))?/, '$2').replace(/\//g, path.sep)
const contentType = 'application/dns-message'

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
    }
    return socket4
  }
  if (!socket6) {
    socket6 = new DNSSocket({ timeout: MAX_32BIT_INT, timeoutChecks: MAX_32BIT_INT, retries: 0, socket: dgram.createSocket('udp6') })
  }
  return socket6
}

export function queryDns (endpoint, query, timeout, signal) {
  return new Promise((resolve, reject) => {
    const socket = getSocket(endpoint.protocol)
    if (endpoint.pk) {
      // TODO: add dnscrypt support to @leichtgewicht/dns-socket
      return reject(new Error('dnscrypt servers currently not supported'))
    }
    const done = (err, res) => {
      if (signal) {
        signal.removeEventListener('abort', onAbort)
      }
      clearSocketMaybe(socket)
      clearTimeout(t)
      if (err) return reject(err)
      resolve(res)
    }
    const requestId = socket.query(query, endpoint.port, endpoint.ipv4 || endpoint.ipv6, (err, res) => {
      // Done for sturdier tests, some DNS servers return very, very fast.
      setTimeout(done, 10, err, res)
    })
    const t = setTimeout(onTimeout, timeout)
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
        if (response) {
          resolve({
            error,
            response
          })
        } else {
          reject(error)
        }
      } else {
        resolve({
          data,
          response
        })
      }
    }
    const target = new URL(url)
    if (method === 'GET' && body) {
      target.search = '?dns=' + base64URL.decode(body)
    }
    const req = client.request(
      {
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        method,
        headers
      },
      onresponse
    )
    if (abortSignal) {
      abortSignal.addEventListener('abort', onabort)
    }
    req.on('error', onerror)
    if (method === 'POST') {
      req.end(Buffer.from(body))
    } else {
      req.end()
    }
    resetTimeout()

    function onabort () {
      req.destroy(new AbortError())
    }

    function onresponse (res) {
      if (res.statusCode !== 200) {
        const error = new HTTPStatusError(target.toString(), res.statusCode, method)
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

export function request (url, method, packet, timeout, abortSignal) {
  const headers = {
    Accept: contentType
  }
  if (method === 'POST') {
    headers['Content-Type'] = contentType
    headers['Content-Length'] = packet.byteLength
  }
  return requestRaw(url, method, packet, timeout, abortSignal, headers)
}

function loadCache (cache, cachePath) {
  if (!cachePath) {
    return Promise.resolve()
  }
  return stat(cachePath).then(function (stats) {
    const time = stats.mtime.getTime()
    if (stats.isFile && time > cache.maxTime) {
      return readFile(cachePath, 'utf8').then(function (raw) {
        const data = JSON.parse(raw)
        return { time, data }
      })
    }
  }).catch(noop)
}

function storeCache (folder, cachePath, data) {
  if (!cachePath) {
    return Promise.resolve(null)
  }
  return mkdir(folder)
    .catch(function () {}) // mkdir is okay to fail!
    .then(function () {
      return writeFile(cachePath, data)
    })
    .then(function () {
      return stat(cachePath)
    })
    .then(
      function (stat) {
        return stat.mtime.getTime()
      },
      function () {
        return null
      }
    )
}

function noop () {}

export function loadJSON (url, cache, timeout, abortSignal) {
  const folder = path.join(filename, '..', '.cache')
  const cachePath = cache ? path.join(folder, cache.name) : null
  return loadCache(cache, cachePath)
    .then(function (cached) {
      if (cached) {
        return cached
      }
      return requestRaw(url, 'GET', null, timeout, abortSignal)
        .then(function (response) {
          if (response.error) {
            return Promise.reject(response.error)
          }
          const data = response.data
          return storeCache(folder, cachePath, data).then(function (time) {
            return {
              time,
              data: JSON.parse(data.toString())
            }
          })
        })
    })
}

export function processResolvers (resolvers) {
  return resolvers.concat(
    dns.getServers()
      .map((host, index) => {
        const name = `local#${index}`
        return {
          name,
          endpoint: codec.familyOf(host) === 1
            ? new UDP4Endpoint({ protocol: 'udp4:', ipv4: host })
            : new UDP6Endpoint({ protocol: 'udp6:', ipv6: host })
        }
      })
  )
}
