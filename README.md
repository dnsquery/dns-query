# doh-query

Node & Browser tested, Non-JSON DNS over HTTPS fetching with minimal dependencies.

> DNS over HTTPS (DoH) is protocol designed for performing remote Domain Name System
> resolution over HTTPS. Requests are made of HTTP to increase user security and privacy.
> See [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) for more
> information.

This package provides simple function to make DoH queries both in node and the browser.

## Endpoints

To use DoH someone needs to host a DoH server. This server **can** filter, log or limit the
requets! Filtering can be useful in case you want to avoid malware/ads/adult-content.
Logging may be required ins some countries and limiting may be part of a busines model.

This package comes with a pretty long list of well-known endpoints, which you can get
via:

```js
const endpoints = require('doh-query/endpoints')
endpoints.all // all endpoints know to work in this environment
endpoints.unfiltered // all endpoints known to return results unfiltered
```

You can also pick one specific endpoint by name such as:

```js
const { cloudflare } = require('doh-query/endpoints')
```

If you are presenting this library to your user, you may want to pass
the offer _what_ endpoint they want to use as it has privacy and usage implications!

_Note:_ Not all endpoints supply _CORS_ headers which means that the list
is severly reduced if you use this library in the browser.

## Usage

```js
const query = require('doh-query')
try {
  const { answers } = await query({
    questions: [
      {type: 'A', name: 'google.com'},
      {type: 'A', name: 'twitter.com'}
    ]
  }, {
    /* Options (optional) */
    endpoints: require('doh-query/endpoints').unfiltered, // (optional) all known working unfiltered endpoints
    retry: 3 // (optional) retries if a given endpoint fails
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

## See Also

- [dns-packet](https://github.com/mafintosh/dns-packet)
- [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS)
- [1.1.1.1](https://developers.cloudflare.com/1.1.1.1/dns-over-https/)
- [Google Public DNS](https://dns.google.com/)

## License

[MIT](./LICENSE)
