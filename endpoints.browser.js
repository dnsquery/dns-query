'use strict'
const serversRaw = require('./endpoints.node.js')
const all = Object.freeze(serversRaw.all.filter(function (server) { return server.cors !== false }))
const unfiltered = Object.freeze(all.filter(function (entry) { return entry.filtered === false }))
const servers = {}
all.forEach(function (server) { servers[server.name] = server })
servers.all = all
servers.unfiltered = unfiltered
module.exports = Object.freeze(servers)
