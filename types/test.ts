import { query, AbortError, HTTPStatusError, ResponseError, TimeoutError, endpoints } from 'doh-query';
import { Packet } from 'dns-packet';

const { google, cloudflare, switchCh } = endpoints;

// $ExpectError
query('');

const c = new AbortController();

const p: Promise<Packet> = query({ id: 1 }, {
  endpoints: [{
    host: '0.0.0.0',
    cors: true
  }, google, cloudflare, switchCh],
  signal: c.signal,
  retry: 5,
  timeout: 1000
});

p.catch(error => {
  if (
    error instanceof AbortError ||
    error instanceof HTTPStatusError ||
    error instanceof ResponseError ||
    error instanceof TimeoutError
  ) {
    console.log(error.name, error.code);
  } else {
    console.log('Unknown error');
  }
});
