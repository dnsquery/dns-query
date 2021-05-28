'use strict'
const serversRaw = require('./endpoints.node.js')
const all = Object.freeze(serversRaw.all.filter(server => server.cors !== false))
const unfiltered = Object.freeze(all.filter(entry => entry.filtered === false))
const servers = {}
all.forEach(server => servers[server.name] = server)
servers.all = all
servers.unfiltered = unfiltered
module.exports = Object.freeze(servers)
