import { query, AbortError, HTTPStatusError, ResponseError, TimeoutError, endpoints, Endpoint, EndpointProps } from 'dns-query';
import { Packet } from 'dns-packet';

const { google, cloudflare, switchCh } = endpoints;

// $ExpectError
query('');

const c = new AbortController();

const p: Promise<Packet> = query({ id: 1 }, {
  endpoints: [
    {
      protocol: 'https:',
      host: '0.0.0.0',
      cors: true
    },
    google,
    cloudflare,
    switchCh,
    'https://google.com/dns-query'
  ] as Array<Endpoint | EndpointProps | string>,
  signal: c.signal,
  retries: 5,
  timeout: 1000
});

p.catch(error => {
  if (
    error instanceof ResponseError ||
    error instanceof HTTPStatusError
  ) {
    console.log(error.name, error.code, error.response, error.endpoint);
  } else if (
    error instanceof AbortError ||
    error instanceof TimeoutError
  ) {
    console.log(error.name, error.code);
  } else {
    console.log('Unknown error');
  }
});
