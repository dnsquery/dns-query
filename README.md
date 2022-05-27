# dns-query

Node & Browser tested, Non-JSON DNS over HTTPS (and DNS) fetching with minimal dependencies.

> DNS over HTTPS (DoH) is protocol designed for performing remote Domain Name System
> resolution over HTTPS. Requests are made of HTTP to increase user security and privacy.
> See [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) for more
> information.

This package provides simple function to make DoH queries both in node and the browser.

## Important Note before getting started

By default `dns-query` uses well-known public dns-over-https servers to execute
queries [automatically compiled][] by the data from the [DNSCrypt][] project.

[automatically compiled]: https://github.com/martinheidegger/dns-query/actions/workflows/update.yml
[DNSCrypt]: https://dnscrypt.info/

The npm package comes with the list that was/is current on the time of the publication.
It will will try to automatically download the list from [the dns-query website][] unless
you set the `.update` property on a `Session` object.

[the dns-query website]: https://martinheidegger.github.io/dns-query/resolvers.json

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

## DNS support

Node.js's dns support is limited, primary example being: `lookupTXT` does not support `ttl`
results. For that reason, when using `dns-query` in node you can also specify `dns` endpoints.

## JavaScript API

```js
const { query, endpoints: defaultEndpoints } = require('dns-query')
const { cloudflare, google, opendns } = defaultEndpoints

let endpoints // If undefined endpoints will be assumed to use one of the dns or doh endpoints!
endpoints = 'doh' // Use any of the given defaultEndpoints to resolve
endpoints = 'dns' // Use the system default dns servers to resolve (Node.js only!)
endpoints = [cloudflare, google, opendns] // Use predefined, well-known endpoints
endpoints = ['cloudflare', 'google', 'opendns'] // Use predefined, well-known endpoints by their name
endpoints = ['https://cloudflare-dns.com/dns-query'] // Use a custom endpoint
endpoints = [{ host: 'cloudflare-dns.com' }] // Specify using properties
try {
  const { answers } = await query({
    question: {type: 'A', name: 'google.com'}
  }, {
    /* Options (optional) */
    endpoints: endpoints,
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
      '{ ["question": { "type": "TXT", "name": "ipfs.io" } }]'

  # Pass the query through stdin
  $ echo '{ "question": { "type": "A", "name": "google.com" } }' \
      | dns-query --stdin --endpoint cloudflare

OPTIONS:

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
  --timeout ........ Timeout for the request in milliseconds, default: 30000
```

## Endpoints

For an endpoint to work, it needs to satisfy this interface:

```typescript
interface EndpointProps {
  /* https is the default for DoH endpoints, udp4:/udp6: for regular dns endpoints and http for debug only! defaults to https: */
  protocol?: 'http:' | 'https:' | 'udp4:' | 'udp6:';
  /* Host to look up */
  host: string;
  /* Path, prefixed with /, defaults to /dns-query for the http/https protocol, ignored for udp */
  path?: string;
  /* https port, defaults to 443 for https, 80 for http and 53 for udp*/
  port?: number;
  /* true, if endpoint is known to log requests, defaults to false */
  log?: boolean;
  /* true, if endpoint supports http/https CORS headers, defaults to false */
  cors?: boolean;
  /* true, if endpoint is known to filters/redirects DNS packets, defaults to false */
  filter?: boolean;
  /* link to documentation, if available */
  docs?: string;
  /* Known geographical location */
  location?: string;
  /* Method to request in case of http/https, defaults to GET */
  method?: 'post' | 'Post' | 'POST' | 'get' | 'Get' | 'GET';
}
```

### String endpoints

Instead of passing an object you can also pass a string. If the string matches the name
of one of the endpoints, that endpoint will be used. If it doesnt match any endpoint,
then it will be parsed using the `parseEndpoint` method understands an URL like structure
with additional properties defined like flags (`[<name>]`).

_Examples:_

`foo.com` → `{ host: 'foo.com' }`

`http://bar.com:81/query [post]` →
  `{ host: 'bar.com', path: '/query', port: 81, method: 'post', protocol: 'http:' }`

_Note:_ If no path is given, such as `foo.com`, the path will be assumed as `/dns-query`, but
if a path is given such as `foo.com/` it will assume that path `/`!

To specify DNS endpoints you need to prefix them using `udp:` (or `udp4:`, `udp6`)

`udp://1.1.1.1` → `{ host: '1.1.1.1', protocol: 'udp4' }`


## See Also

- [dns-packet](https://github.com/mafintosh/dns-packet)
- [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS)
- [1.1.1.1](https://developers.cloudflare.com/1.1.1.1/dns-over-https/)
- [Google Public DNS](https://dns.google.com/)

## License

[MIT](./LICENSE)
