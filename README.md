# doh-query

Node & Browser tested, Non-JSON DNS over HTTPS fetching with minimal dependencies.

> DNS over HTTPS (DoH) is protocol designed for performing remote Domain Name System
> resolution over HTTPS. Requests are made of HTTP to increase user security and privacy.
> See [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) for more
> information.

This package provides simple function to make DoH queries both in node and the browser.

## Important Note before getting started

By default `doh-query` uses well-known public dns-over-https servers to execute
queries! These servers come with caveats, please look at [`./endpoints.md`](./endpoints)
for more information.

## Usage

```js
const { query } = require('doh-query')
try {
  const { answers } = await query({
    questions: [
      {type: 'A', name: 'google.com'},
      {type: 'A', name: 'twitter.com'}
    ]
  }, {
    /* Options (optional) */
    endpoints: require('doh-query/endpoints').unfiltered, // (optional) all known working unfiltered endpoints
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

## See Also

- [dns-packet](https://github.com/mafintosh/dns-packet)
- [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS)
- [1.1.1.1](https://developers.cloudflare.com/1.1.1.1/dns-over-https/)
- [Google Public DNS](https://dns.google.com/)

## License

[MIT](./LICENSE)
