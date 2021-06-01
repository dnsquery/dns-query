# doh-query

Node & Browser tested, Non-JSON DNS over HTTPS fetching with minimal dependencies.

> DNS over HTTPS (DoH) is protocol designed for performing remote Domain Name System
> resolution over HTTPS. Requests are made of HTTP to increase user security and privacy.
> See [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) for more
> information.

This package provides simple function to make DoH queries both in node and the browser.

## Important note about endpoints

**TL;DR: It is recommended to choose what endpoints to use for doh!**

To use DoH someone needs to host a DoH server.

This server **can** filter, log or limit the requests!

_Filtering_ can be useful in case you want to avoid malware/ads/adult-content. _Logging_ may be required in some countries and limiting may be part of a business model.

Furthermore the different endpoints may or may not be distributed around the globe, making requests slower/faster depending on the client's location.

This package comes with a pretty long list of well-known and tested endpoints. By default it will use the known endpoints that promise to not apply filters or logs.

```js
const endpoints = require('doh-query/endpoints')
```

You can also pick one specific endpoint by name such as:

```js
const { cloudflare, google, opendns,  } = require('doh-query/endpoints')
```

All available endpoints are listed in [`endpoints.md`](./endpoints.md).

If you are presenting this library to your user, you may want to pass
the offer _what_ endpoint they want to use as it has privacy and usage implications!

_Note:_ Not all endpoints supply _CORS_ headers which means that the list
is severly reduced if you use this library in the browser.

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
    retry: 3, // (optional) retries if a given endpoint fails
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
