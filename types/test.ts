import { query, AbortError, HTTPStatusError, ResponseError, TimeoutError, wellknown, Endpoint, EndpointOpts, ResolverLookup, SessionOpts, Session } from 'index';
import { Packet } from '@leichtgewicht/dns-packet';

// $ExpectError
query('');

const c = new AbortController();

(async () => {
  const lookup: ResolverLookup = await wellknown();

  try {
    let p: Packet = await query({ id: 1, question: { type: 'A', name: 'google.com' } }, {
      endpoints: [
        {
          protocol: 'https:',
          host: '0.0.0.0',
          cors: true
        },
        lookup.endpointByName.google,
        lookup.endpoints[0],
        lookup.resolvers[0].endpoint,
        lookup.resolverByName.google.endpoint,
        'https://google.com/dns-query'
      ] as Array<Endpoint | EndpointOpts | string>,
      signal: c.signal,
      retries: 5,
      timeout: 1000
    });
    let sessionOpts: SessionOpts = {};
    sessionOpts = {
      maxAge: 500,
      persist: true,
      timeout: 5000,
      update: false,
      updateURL: new URL('https://hello.com'),
      retries: 5
    };
    const session = new Session(sessionOpts);
    p = await session.query({
      id: 2,
      question: { type: 'A', name: 'google.com' }
    }, {});
  } catch (error) {
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
  }
})();
