'use strict'
const servers = {
  cloudflare: {
    // Docs: https://developers.cloudflare.com/1.1.1.1/dns-over-https
    host: 'cloudflare-dns.com',
    filtered: false
  },
  cloudflareFamily: {
    // Docs: https://developers.cloudflare.com/1.1.1.1/1.1.1.1-for-families/setup-instructions/dns-over-https
    host: 'family.cloudflare-dns.com'
  },
  cloudflareSecurity: {
    // Docs: https://developers.cloudflare.com/1.1.1.1/1.1.1.1-for-families/setup-instructions/dns-over-https
    host: 'security.cloudflare-dns.com'
  },
  aAndA: {
    // Docs: https://www.aa.net.uk/legal/dohdot-disclaimer/
    host: 'dns.aa.net.uk',
    cors: false
  },
  usablePrivacy: {
    // Docs: 'https://docs.usableprivacy.com'
    host: 'adfree.usableprivacy.net',
    cors: false
  },
  adguard: {
    // Docs: https://adguard.com/en/adguard-dns/overview.html
    // Note: un-filtered and parental dns also available
    host: 'dns.adguard.com',
    cors: false
  },
  adguardFamily: {
    // Docs: https://adguard.com/en/adguard-dns/overview.html
    // Note: un-filtered and filtered dns also available
    host: 'dns-family.adguard.com',
    cors: false
  },
  adguardUnfiltered: {
    // Docs: https://adguard.com/en/adguard-dns/overview.html
    // Note: filtered and parental dns also available
    host: 'dns-unfiltered.adguard.com',
    filtered: false,
    cors: false
  },
  ahadnsIn: {
    // Location: India
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.in.ahadns.net'
  },
  ahadnsIt: {
    // Location: Italy
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.it.ahadns.net'
  },
  ahadnsEs: {
    // Location: Spain
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.es.ahadns.net'
  },
  ahadnsNo: {
    // Location: Norway
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.no.ahadns.net',
    filtered: true
  },
  ahadnsNl: {
    // Location: Los Angeles
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.la.ahadns.net'
  },
  ahadnsPl: {
    // Location: Poland
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.pl.ahadns.net'
  },
  ahadnsNy: {
    // Location: New York
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.ny.ahadns.net'
  },
  ahadnsChi: {
    // Location: Chicago
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.chi.ahadns.net'
  },
  ahadnsAu: {
    // Location: Australia
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.au.ahadns.net'
  },
  ahadnsLa: {
    // Location: Los Angeles
    // Docs: https://ahadns.com/dns-over-https/
    host: 'doh.la.ahadns.net'
  },
  alidns: {
    // Location: China (Warning: Great Firewall filter!)
    // Docs: https://alidns.com/knowledge?type=SETTING_DOCS#umpt6
    host: 'dns.alidns.com',
    cors: false
  },
  amsNl: {
    // Location: Amsterdam
    // Docs: https://alekberg.net/doh
    host: 'dnsnl.alekberg.net',
    filtered: false,
    cors: false
  },
  amsSe: {
    // Location: Sweden
    // Docs: https://alekberg.net/doh
    host: 'dnsse.alekberg.net',
    filtered: false,
    cors: false
  },
  amsEs: {
    // Location: Spain
    // Docs: https://alekberg.net/doh
    host: 'dnses.alekberg.net',
    filtered: false,
    cors: false
  },
  arapurayil: {
    // Docs: https://www.dns.arapurayil.com/
    host: 'dns.arapurayil.com',
    cors: false
  },
  /* >> HTTPStatusError (status=404)
  bortzmeyer: {
    // Docs: doh.bortzmeyer.fr
    host: 'doh.bortzmeyer.fr',
    filtered: false
  },
  */
  /* >> socket hang up
  cznic: {
    // Location: Czech Republic
    // Docs: https://www.nic.cz/odvr/
    host: 'odvr.nic.cz'
  },
  */
  digitaleGesellschaft: {
    // Location: Switzerland
    // Docs: https://www.digitale-gesellschaft.ch/dns
    host: 'dns.digitale-gesellschaft.ch',
    filtered: false,
    cors: false
  },
  dnsCrypt1: {
    // Location: Canada
    // Docs: https://dnscrypt.ca/
    host: 'dns1.dnscrypt.ca',
    port: 453,
    filtered: false
  },
  dnsCrypt2: {
    // Location: Canada
    // Docs: https://dnscrypt.ca/
    host: 'dns2.dnscrypt.ca',
    port: 453,
    filtered: false
  },
  dnsForFamily: {
    // Docs: https://dnsforfamily.com/
    host: 'dns-doh.dnsforfamily.com',
    cors: false
  },
  dnsForge: {
    // Location: Germany
    // Docs: https://dnsforge.de/
    host: 'dnsforge.de',
    cors: false
  },
  dnsHome: {
    // Location: Germany
    // Docs: https://www.dnshome.de/doh-dot-public-resolver.php
    host: 'dns.dnshome.de',
    filtered: false,
    cors: false
  },
  dnsPod: {
    // Location: China
    // Docs: https://www.dnspod.cn/Products/Public.DNS?lang=en
    host: 'doh.pub',
    cors: false
  },
  blahDnsCh: {
    // Location: Switzerland
    // Docs: https://blahdns.com/
    host: 'doh-ch.blahdns.com'
  },
  blahDnsSg: {
    // Location: Singapore
    // Docs: https://blahdns.com/
    host: 'doh-sg.blahdns.com'
  },
  blahDnsJp: {
    // Location: Japan
    // Docs: https://blahdns.com/
    host: 'doh-jp.blahdns.com'
  },
  blahDnsDe: {
    // Location: Germany
    // Docs: https://blahdns.com/
    host: 'doh-de.blahdns.com'
  },
  blahDnsFi: {
    // Location: Finnland
    // Docs: https://blahdns.com/
    host: 'doh-fi.blahdns.com'
  },
  cleanBrowsingSecurity: {
    // Docs: https://cleanbrowsing.org/guides/dnsoverhttps
    host: 'doh.cleanbrowsing.org',
    path: '/doh/security-filter/',
    cors: false
  },
  cleanBrowsingFamily: {
    // Docs: https://cleanbrowsing.org/guides/dnsoverhttps
    host: 'doh.cleanbrowsing.org',
    path: '/doh/family-filter/',
    cors: false
  },
  cleanBrowsingAdult: {
    // Docs: https://cleanbrowsing.org/guides/dnsoverhttps
    host: 'doh.cleanbrowsing.org',
    path: '/doh/adult-filter/',
    cors: false
  },
  appliedPrivacy: {
    // Location: Austria
    // Docs: https://applied-privacy.net/services/dns/
    host: 'doh.applied-privacy.net',
    path: '/query',
    filtered: false,
    cors: false
  },
  ffmuc: {
    // Location: Germany
    // Docs: https://ffmuc.net/wiki/doku.php?id=knb:dohdot
    host: 'doh.ffmuc.net',
    filtered: false,
    cors: false
  },
  tiarap: {
    // Docs: https://tiarap.org/
    host: 'doh.tiar.app',
    cors: false
  },
  tiarapJp: {
    // Location: Japan
    // Docs: https://jp.tiar.app/
    host: 'jp.tiar.app',
    cors: false
  },
  /* >> socket hang up
  emeraldOnion: {
    // Location: US
    // Docs: https://emeraldonion.org/faq/,
    host: 'dns.emeraldonion.org',
  },
  */
  google: {
    // Docs: https://developers.google.com/speed/public-dns/docs/doh/
    host: 'dns.google',
    cors: false
  },
  he: {
    // Docs: https://dns.he.net/
    host: 'ordns.he.net',
    filtered: false,
    logging: true,
    cors: false
  },
  iij: {
    // Location: Japan
    // Docs: https://public.dns.iij.jp/
    host: 'public.dns.iij.jp',
    logging: true,
    cors: false
  },
  libredns: {
    // Location: Germany
    // Docs: https://libredns.gr/
    host: 'doh.libredns.gr',
    filtered: false,
    cors: false
  },
  librednsAds: {
    // Location: Germany
    // Docs: https://libredns.gr/
    host: 'doh.libredns.gr',
    path: '/ads',
    cors: false
  },
  linuxSec: {
    // Location: Indonesia
    // Docs: https://doh.linuxsec.org/
    host: 'doh.linuxsec.org'
  },
  linuxSecAdGuard: {
    // Location: Indonesia
    // Docs: https://doh.linuxsec.org/
    host: 'doh.linuxsec.org'
  },
  meganerd: {
    // Location: Amsterdam
    // Docs: https://www.meganerd.nl/encrypted-dns-server
    host: 'chewbacca.meganerd.nl',
    path: '/doh',
    filtered: false,
    cors: false
  },
  moulticast: {
    // Docs: https://moulticast.net/dnscrypt/
    host: 'dns.moulticast.net',
    filtered: false,
    cors: false
  },
  /* >> socket hang up
  mullvad: {
    // Docs: https://mullvad.net/en/help/dns-over-https-and-dns-over-tls/
    host: 'doh.mullvad.net',
    filtered: false
  },
  mullvadAds: {
    // Docs: https://mullvad.net/en/help/dns-over-https-and-dns-over-tls/
    host: 'adblock.doh.mullvad.net',
    filtered: false
  },
  */
  njalla: {
    // Location: Sweden
    // Docs: https://dns.njal.la/
    host: 'dns.njal.la',
    filtered: false,
    cors: false
  },
  opendns: {
    // Docs: https://support.opendns.com/hc/en-us/articles/360038086532-Using-DNS-over-HTTPS-DoH-with-OpenDNS
    host: 'doh.opendns.com',
    cors: false
  },
  opendnsFamily: {
    // Docs: https://support.opendns.com/hc/en-us/articles/360038086532-Using-DNS-over-HTTPS-DoH-with-OpenDNS
    host: 'doh.familyshield.opendns.com',
    cors: false
  },
  plan9NJ: {
    // Location: New Jersey
    // Docs: https://jlongua.github.io/plan9-dns/
    host: 'hydra.plan9-ns1.com'
  },
  /* >> socket hang up
  plan9Fl: {
    // Location: Florida
    // Docs: https://jlongua.github.io/plan9-dns/
    host: 'draco.plan9-ns2.com'
  },
  */
  powerDNS: {
    // Docs: https://powerdns.org/
    host: 'doh.powerdns.org',
    cors: false
  },
  sebyVultr: {
    // Location: Sydney
    // Docs: https://dns.seby.io/
    host: 'doh.seby.io',
    port: 8443
  },
  sebyOVH: {
    // Location: Sydney
    // Docs: https://dns.seby.io/
    host: 'doh-2.seby.io'
  },
  /* >> Error: connect ETIMEDOUT 101.102.103.104:443
  quad101: {
    // Location: Taiwan
    // Docs: https://101.101.101.101/index_en.html
    host: 'dns.twnic.tw',
    filtered: false
  },
  */
  quad9: {
    // Docs: https://quad9.net/service/service-addresses-and-features
    host: 'dns10.quad9.net',
    filtered: false,
    cors: false
  },
  quad9Ads: {
    // Docs: https://quad9.net/service/service-addresses-and-features
    host: 'dns.quad9.net',
    cors: false
  },
  switch: {
    // Location: Switzerland
    // Docs: https://www.switch.ch/security/info/public-dns/
    host: 'dns.switch.ch',
    cors: false
  },
  yepdns: {
    // Location: Singapore
    // Docs: https://get.yepdns.com/
    host: 'sg.yepdns.com',
    cors: false
  }
}
Object.entries(servers).forEach((entry) => {
  const endpoint = entry[1]
  endpoint.name = entry[0]
  endpoint.cors = !!entry[1].cors
  endpoint.filtered = !!entry[1].filtered
  if (!endpoint.port) {
    endpoint.port = 443
  }
  if (!endpoint.path) {
    endpoint.path = '/dns-query'
  }
  Object.freeze(entry[1])
})
servers.all = Object.freeze(Object.values(servers))
servers.unfiltered = Object.freeze(servers.all.filter(entry => entry.filtered === false))
module.exports = Object.freeze(servers)
