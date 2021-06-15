# doh-query

Node & Browser tested, Non-JSON DNS over HTTPS fetching with minimal dependencies.

> DNS over HTTPS (DoH) is protocol designed for performing remote Domain Name System
> resolution over HTTPS. Requests are made of HTTP to increase user security and privacy.
> See [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) for more
> information.

This package provides simple function to make DoH queries both in node and the browser.

## Important Note before getting started

By default `doh-query` uses well-known public dns-over-https servers to execute
queries! These servers come with caveats, please look at [`./endpoints.md`](./endpoints.md)
for more information.

## JavaScript API

```js
const { query, endpoints } = require('doh-query')
const { cloudflare, google, opendns } = endpoints
try {
  const { answers } = await query({
    questions: [
      {type: 'A', name: 'google.com'},
      {type: 'A', name: 'twitter.com'}
    ]
  }, {
    /* Options (optional) */
    endpoints: [cloudflare, google, opendns], // (optional) all known working unfiltered endpoints
    retry: 3, // (optional) retries if a given endpoint fails; -1 = infinite retries; 0 = no retry
    timeout: 4000, // (optional, default=30000) timeout for single requests
    signal, // (optional) an AbortSignal to abort the request
  })
} catch (error) {
  switch (error.code) {
    case 'HTTP_STATUS': // request failed, http status error
    case 'RESPONSE_ERR': // request failed, invalid response
    case 'ABORT_ERR': // request aborted
    default: // Unexpected error
  }
}
```

## CLI

You can install `doh-query` as a command-line tool using `npm i doh-query -g`
or by running `npx doh-query`.

```sh
$ doh-query <options> <input>

Execute a dns query over https.

Examples:

  $ doh-query --json -e google \
      '{ "questions": [{ "type": "A", "name": "google.com" }] }'

  $ echo '{ "questions": [{ "type": "A", "name": "google.com" }] }' \
      | doh-query --stdin --endpoint cloudflare

--help, -h ....... Show this help
--version, -v .... Show the version
--json ........... --type=json
--base64 ......... --type=base64
--binary ......... --type=binary
--type ........... Input type. Options: json, base64, binary; Default: json
--out ............ Output type. Defaults to the input --type.
--stdin .......... Get <input> from stdin instead of cli arguments
--endpoint, -e ... Use a specific endpoint. Can be either the name of a known
    endpoint, a json object or an url. By default uses one of the known endpoints.
    If multiple are provided, one at random will be used.
--endpoints ...... Lists all known endpoints as json.
--retry .......... Number of retries to do in case a request fails, default: 3
--timeout ........ Timeout for the request in milliseconds, default: 30000
```

## Endpoints

For an endpoint to work, it needs to satisfy this interface:

```typescript
interface Endpoint {
  /* Domain name, required! */
  host: string
  /* Path, prefixed with /, defaults to /dns-query */
  path?: string
  /* https port, defaults to 443 */
  port?: number
  /* true, if endpoint logs requests, defaults to false */
  log?: boolean
  /* true, if endpoint support CORS headers, defaults to false */
  cors?: boolean
  /* true, if endpoint filters/redirects DNS packets, defaults to false */
  filter?: boolean
  /* link to documentation, if available */
  docs?: string
  /* Known geographical location */
  location?: string
  /* Method to request dns, defaults to GET */
  method?: 'post' | 'Post' | 'POST' | 'get' | 'Get' | 'GET'
  /* DEBUG ONLY! false to use http to connect instead of https, defaults to true */
  https?: boolean
}
```

Instead of passing an object you can also pass an endpoint matching a url, with an 
amendmend as to whether its a POST or GET endpoint.

Examples:

`foo.com` → `{ host: 'foo.com' }`

`http://bar.com:81/query [post]` →
  `{ host: 'bar.com', path: '/query', port: 81, method: 'post', https: false }`

## See Also

- [dns-packet](https://github.com/mafintosh/dns-packet)
- [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS)
- [1.1.1.1](https://developers.cloudflare.com/1.1.1.1/dns-over-https/)
- [Google Public DNS](https://dns.google.com/)

## License

[MIT](./LICENSE)
