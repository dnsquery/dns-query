namespace endpoints {
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
}

const endpoints: {
  cloudflare: Endpoint
  cloudflareFamily: Endpoint
  cloudflareSecurity: Endpoint
  aAndA: Endpoint
  usablePrivacy: Endpoint
  adguard: Endpoint
  adguardFamily: Endpoint
  adguardUnfiltered: Endpoint
  ahadnsIn: Endpoint
  ahadnsIt: Endpoint
  ahadnsEs: Endpoint
  ahadnsNo: Endpoint
  ahadnsNl: Endpoint
  ahadnsPl: Endpoint
  ahadnsNy: Endpoint
  ahadnsChi: Endpoint
  ahadnsAu: Endpoint
  ahadnsLa: Endpoint
  alidns: Endpoint
  amsNl: Endpoint
  amsSe: Endpoint
  amsEs: Endpoint
  arapurayil: Endpoint
  digitaleGesellschaft: Endpoint
  dnsCrypt1: Endpoint
  dnsCrypt2: Endpoint
  dnsForFamily: Endpoint
  dnsForge: Endpoint
  dnsHome: Endpoint
  dnsPod: Endpoint
  blahDnsCh: Endpoint
  blahDnsSg: Endpoint
  blahDnsJp: Endpoint
  blahDnsDe: Endpoint
  blahDnsFi: Endpoint
  cleanBrowsingSecurity: Endpoint
  cleanBrowsingFamily: Endpoint
  cleanBrowsingAdult: Endpoint
  appliedPrivacy: Endpoint
  ffmuc: Endpoint
  tiarap: Endpoint
  tiarapJp: Endpoint
  google: Endpoint
  he: Endpoint
  iij: Endpoint
  libredns: Endpoint
  librednsAds: Endpoint
  linuxSec: Endpoint
  linuxSecAdGuard: Endpoint
  meganerd: Endpoint
  moulticast: Endpoint
  njalla: Endpoint
  opendns: Endpoint
  opendnsFamily: Endpoint
  plan9NJ: Endpoint
  powerDNS: Endpoint
  sebyVultr: Endpoint
  sebyOVH: Endpoint
  quad9: Endpoint
  quad9Ads: Endpoint
  switch: Endpoint
  yepdns: Endpoint
}

export = endpoints