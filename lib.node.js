'use strict'
const dns = require('dns')
const dgram = require('dgram')
const createDnsSocket = require('dns-socket')
const codec = require('@leichtgewicht/ip-codec')
const { AbortError, HTTPStatusError, TimeoutError, Endpoint, endpoints } = require('./common.js')
const contentType = 'application/dns-message'
const dohEndpoints = Object.values(endpoints).filter(function (endpoint) {
  return !endpoint.filter && !endpoint.log
})

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

function queryDns (endpoint, query, timeout, signal) {
  return new Promise((resolve, reject) => {
    let socket
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
    if (endpoint.protocol === 'udp4:') {
      if (!socket4) {
        socket4 = createDnsSocket({ timeout: MAX_32BIT_INT, timeoutChecks: MAX_32BIT_INT, retries: 0, socket: dgram.createSocket('udp4') })
      }
      socket = socket4
    } else if (endpoint.protocol === 'udp6:') {
      if (!socket6) {
        socket6 = createDnsSocket({ timeout: MAX_32BIT_INT, timeoutChecks: MAX_32BIT_INT, retries: 0, socket: dgram.createSocket('udp6') })
      }
      socket = socket6
    }
    const requestId = socket.query(query, endpoint.port || 53, endpoint.host, done)
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

function request (protocol, host, port, path, method, packet, timeout, abortSignal, cb) {
  let timer
  const client = protocol === 'https:' ? require('https') : require('http')
  let finish = (error, data, response) => {
    finish = null
    clearTimeout(timer)
    if (abortSignal) {
      abortSignal.removeEventListener('abort', onabort)
    }
    cb(error, data, response)
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
  req.on('error', onerror)
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
      finish(error || new Error('Unknown Error.'))
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
  queryDns: queryDns,
  request: request,
  endpoints: opts => {
    if (opts.dns) {
      const servers = dns.getServers().map(host => new Endpoint({
        protocol: codec.familyOf(host) === 1 ? 'udp4:' : 'udp6:',
        host
      }))

      return opts.doh ? servers.concat(dohEndpoints) : servers
    }
    if (opts.doh) {
      return dohEndpoints
    }
  }
}
