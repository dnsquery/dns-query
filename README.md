# dns-query

Low-level DNS requests using JavaScript in the Browser and Node.js.

```js
import { query } from 'dns-query'

const { answers, rcode } = await query(
  { question: { type: 'TXT', name: 'google.com' } },
  { endpoints: ['1.1.1.1'] }
)
```

#### Why use it?

- You get the **same API both on Node.js and the Browser** _(and React-Native)_.
- You need DNS information not exposed through high-level APIs _(eg. [`ttl` for `TXT` entries](#dns-support))_.
- You want to **use [DNS-over-HTTPS][]** _(DoH)_ servers.

[DNS-over-HTTPS]: https://en.wikipedia.org/wiki/DNS_over_HTTPS

#### What is in the package?

- [DoH][DNS-over-HTTPS] implementation in Node.js and the browser.
- Low level implementation of classic DNS in Node.js.
- ESM modules, CommonJS modules and typescript definitions.
- A list of well-known DoH endpoints.
- A parser for compact definitions of DoH and DNS endpoints.
- A command line tool to run DNS requests.

## Contents

- [JavaScript API](#javascript-api)
    - [Endpoints](#endpoints)
        - [Endpoint Properties](#endpoint-properties)
    - [Well-known Endpoints](#well-known-endpoints)
        - [DNS Support](#dns-support)
        - [Controlled Updates](#controlled-updates)
        - [Persist Node.js](#persist-nodejs)
        - [Persist Browser](#persist-browser)
        - [Note about public servers](#note-about-the-public-servers)
    - [Error Responses](#error-responses)
    - [Txt Helper](#txt-helper)
- [CLI](#cli)
    - [String Endpoints](#string-endpoints)
- [See also](#see-also)
- [License](#license)

## JavaScript API

```js
import { query } from 'dns-query'
try {
  const { answers } = await query({
    question: {type: 'A', name: 'google.com'}
  }, {
    /* REQUIRED! */
    endpoints: ['dns.google', 'dns.switch.ch'], // See more about endpoints below!

    /* (optional) */
    retries: 3, // retries if a given endpoint fails; -1 = infinite retries; 0 = no retry
    timeout: 4000, // (default=30000) timeout for single requests
    signal, // An AbortSignal to abort the request
  })
} catch (error) {
  switch (error.code) {
    case 'HTTP_STATUS': // request failed, http status error
    case 'RESPONSE_ERR': // request failed, invalid response
    case 'ABORT_ERR': // request aborted
    default: // Unexpected error
  }
}

import { query, lookupTxt, wellknown } from 'dns-query'

// Use well-known endpoints to request
await query(/* ... */, { endpoints: wellknown.endpoints() })

// Shorthand for loading txt entries
await lookupTxt('domain.com', { endpoints: wellknown.endpoints() })
```

### Endpoints

You can define the endpoints in a variety of ways:

```js
let endpoints
endpoints = ['dns.google'] // Simple definition of an endpoint, protocol defaults to https:
endpoints = ['dns.google', 'dns.switch.ch'] // Defining multiple endpoints will use one at random.
endpoints = Promise.resolve(['dns.google']) // A promise will be resolved
endpoints = ['https://dns.google:443/dns-query'] // You can specify a url with detail props
endpoints = ['udp://8.8.8.8'] // You can also specify DNS endpoints
endpoints = ['udp://[::]'] // IPV6 endpoints need braces [] around the address.
endpoints = ['http://localhost'] // http endpoints are supported for tests!
endpoints = ['localhost [post]'] // some endpoints require POST requests
endpoints = ['dns.google [name=google]'] // you can give endpoints a name find them
endpoints = ['dns.google [ipv4=8.8.8.8]'] // you can specify the ipv4/ipv6 url as backup
endpoints = [{
  protocol: 'https:',
  host: 'dns.google'
}] // You can also specify a set of properties (see the next section)

// It will internally use toEndpoint to create endpoints
import { toEndpoint } from 'dns-query'

endpoints = [toEndpoint('dns.google')] // To speed things up, pass in preprocess endpoints.
```

#### Endpoint Properties

For an endpoint to work, it needs to satisfy this interface:

```typescript
type EndpointProps = {
  /* https is the default for DoH endpoints and http for debug only! defaults to https: */
  protocol?: 'https:' | 'http:'
  /* https port, defaults to 443 for https, 80 for http */
  port?: number | string | null
  /* Host to look up */
  host: string
  /* Known IPV4 address that can be used for the lookup */
  ipv4?: string
  /* Known IPV6 address that can be used for the lookup */
  ipv6?: string
  /* Path, prefixed with /, defaults to /dns-query for the http/https protocol */
  path?: string
  /* Method to request in case of http/https, defaults to GET */
  method?: 'POST' | 'GET'
  /* name of the endpoint () */
  name?: string
} | {
  protocol: 'udp4:'
  /* ipv4 endpoint to connect-to */
  ipv4: string
  /* https port, defaults to 53; 443 if pk is present */
  port?: number | string | null
  /* dnscrypt public key */
  pk?: string | null
  /* name of the endpoint () */
  name?: string
} | {
  protocol: 'udp6:'
  /* ipv4 endpoint to connect-to */
  ipv6: string
  /* https port, defaults to 53; 443 if pk is present */
  port?: number | string | null
  /* dnscrypt public key */
  pk?: string | null
  /* name of the endpoint () */
  name?: string
}
```

### Well-known Endpoints

To make your life easier, `dns-query` comes with a list of well-known public dns-over-https
servers to execute queries.

```js
import { wellknown } from 'dns-query'

let endpoints = await wellknown.endpoints()
```

This list is **[automatically compiled][]** using the data from the [DNSCrypt][] project!

[automatically compiled]: https://github.com/martinheidegger/dns-query/actions/workflows/update.yml
[DNSCrypt]: https://dnscrypt.info/

The npm package comes with the list that was/is current on the time of it's publication.
By default `await wellknown.data()` will try to automatically download the newest list from [the dns-query website][]
and fall back to the list at publication if downloading fails.

[the dns-query website]: https://martinheidegger.github.io/dns-query/resolvers.json

Using the argument for `wellknown.endpoints(...)` you can specify which endpoints
you want to use:

```js
let options
options = 'doh' // Filter to use only doh endpoints
options = 'dns' // Filter to use only dns servers (Node.js only!)
options = ['@cloudflare', '@google', '@opendns'] // Use specific named endpoints
options = ['https://cloudflare-dns.com/dns-query'] // For a convenient API, you can also define regular endpoints...
options = [{ host: 'cloudflare-dns.com' }] // ... and bypass the well-known entries.
options = (endpoint) => endpoint.protocol === 'https:' // Use a filter against the well-known endpoints
options = Promise.resolve('doh') // The endpoints can also be a promise

await wellknown.endpoints(options)
```

#### DNS support

Node.js's dns support is limited, primary example being: [`resolveTxt`][node-resolveTxt]
does not support `ttl` results. For that reason, when using `dns-query` in node you can also
specify `dns` endpoints that should be helpful in the node environment.

```js
const dnsServers = await wellknown.endpoints('dns') // all the known dns servers
const dohServers = await wellknown.endpoints('doh') // all the known doh servers
```

[node-resolveTxt]: https://nodejs.org/api/dns.html#dnsresolvetxthostname-callback

#### Controlled Updates

If we loaded the resolvers/endpoints for every request, both the server load and
your application's responsiveness will suffer. Because of that the `wellknown` object
will **cache** the known resolvers.

You can customize the behavior by creating a new `Wellknown` instance with a different
configuration:

```js
import { Wellknown } from 'dns-query'
const wk = new Wellknown({
  update: true, // Will load latest definitions from updateURL.
  updateURL: new URL(), // URL to load the latest definitions. (default: project URL)
  persist: false, // True to persist the loaded definitions (nodejs: in filesystem, browser: localStorage)
  localStoragePrefix: 'dnsquery_', // Prefix for files persisted.
  maxAge: 300000, // Max age of persisted data to be used in ms.
  timeout: 5000 // Timeout when loading updates.
})
```

`persist: true` is useful when you restart a node process or refresh a browser.
The persisted data will then be available making subsequent requests faster still.

#### Persist: Node.js

If you set `persist: true` in Node.js, it will try to persist the list of resolvers relative to
the `node_modules` directory.

#### Persist: Browser

In the browser, setting `persist: true` will use `localStorage` to store the copy of resolvers.
By default it will use the `localStoragePrefix = 'dnsquery_'` option.

You will be able to find the persisted resolvers under
`localStorage.getItem('dnsquery_resolvers.json')`.

```js
query(..., {
  localStoragePrefix: 'my_custom_prefix'
})
```

### Note about the public servers.

These servers come with caveats that you should be aware of:

- A server may filter, log or limit the requests it receives!
- Filtering can be useful in case you want to avoid malware/ads/adult-content.
- Logging may be required in some countries and limiting may be part of a business model.
- Furthermore the different endpoints may or may not be distributed around the globe,
    making requests slower/faster depending on the client's location.
- Not all endpoints supply CORS headers which means that the list is severly reduced if you use this
    library in the browser.

If you are presenting this library to an end-user, you may want to allow them to decide what endpoint
they want to use as it has privacy and usage implications!

### Error Responses

By default `query(...)` will return the packet as received by the endpoints, even if
that package was flagged as an error. The `validateResponse` helper will give a
well readable error message.

```js
import { validateResponse, query } from 'dns-query'

const respone = validateResponse(await query(/* ... */))
```

By default, `query` will try load the latest definitions (`update: true`) but will
persist them only in memory. Subsequent requests will only update the list if
it is old.

### Txt Helper

The default `TXT` response of dns-queries is a list of `Uint8Array`'s. If you have a
`TXT` response you can use the `combineTXT` API to combine the requests.

```js
import { combineTXT } from 'dns-query'

const response = await query(/* ... */)
if (response.question.type === 'TXT') {
  const txt = response.answers.map(answer => combineTXT(answer.data))
}
```

More convenient still is the `lookupTxt` API that allows you to simple request
the TXT entries for a domain.

```js
import { lookupTxt } from 'dns-query'

const { entries, endpoint } = await lookupTxt('google.com')
```

## CLI

You can install `dns-query` as a command-line tool using `npm i dns-query -g`
or by running `npx dns-query`.

```sh
$ dns-query <options> <input>

dns-query - Execute a dns query over https.

USAGE:

  dns-query <Options> <Input>

EXAMPLES:

  # Fetch from the google dns-over-https endpoint the A-name of google.com
  $ dns-query --json -e google \
      '{ "question": { "type": "A", "name": "google.com" } }'

  # Fetch TXT entries for ipfs.io through regular dns
  $ dns-query --json --dns \
      '{ "question": { "type": "TXT", "name": "ipfs.io" } }'

  # Pass the query through stdin
  $ echo '{ "question": { "type": "A", "name": "google.com" } }' \
      | dns-query --stdin --endpoint cloudflare
  
  # Process binary packages as base64
  $ dns-query --base64 AAAAAAABAAAAAAAABGlwZnMCaW8AABAAAQ==

  # Load the txt data for a domain
  $ dns-query --mode=txt ipfs.io

OPTIONS:

  --mode ........... Mode consume/process data.
    ---mode=free ... Free query input (default)
    ---mode=txt .... TXT data loading shortcut
  --help, -h ....... Show this help
  --version, -v .... Show the version
  --json ........... --type=json
  --base64 ......... --type=base64
  --binary ......... --type=binary
  --type ........... Input type. Options: json, base64, binary; Default: json
  --out ............ Output type. Defaults to the input --type.
  --stdin .......... Get <input> from stdin instead of cli arguments
  --dns ............ Use dns endpoints
  --doh ............ Use doh endpoints
  --endpoint, -e ... Use a specific endpoint. Can be either the name of a known
      endpoint, a json object or an url. By default uses one of the known endpoints.
      If multiple are provided, one at random will be used.
  --endpoints ...... Lists all known endpoints as json.
  --resolvers ...... List all known resolvers as json.
  --response ....... Show the http response in the result.
  --retries ........ Number of retries to do in case requests fails, default: 5
  --timeout ........ Timeout for the request in milliseconds, default: 30000 (5 sec)
  --max-age ........ Max age of the persisted data, default: 300000 (5 min)
  --no-persist ..... Dont persist the the latest resolvers
  --offline ........ Do not update the resolver list
```

### String endpoints

The input of endpoints are passed to the `toEndpoint` helper. See [Endpoints](#endpoints)
for the supported formats.

## See Also

- [dns-packet](https://github.com/mafintosh/dns-packet)
- [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS)
- [1.1.1.1](https://developers.cloudflare.com/1.1.1.1/dns-over-https/)
- [Google Public DNS](https://dns.google.com/)

## License

[MIT](./LICENSE)
