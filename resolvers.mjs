export const resolvers = {
  data: [
    {
      name: 'adfree.usableprivacy.net',
      endpoint: {
        protocol: 'https:',
        host: 'adfree.usableprivacy.net'
      },
      description: 'Public updns DoH service with advertising, tracker and malware filters.\nHosted in Europe by @usableprivacy, details see: https://docs.usableprivacy.com',
      country: 'Germany',
      location: {
        lat: 51.2993,
        long: 9.491
      },
      filter: true
    },
    {
      name: 'adguard-dns-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dns.adguard.com',
        ipv4: '94.140.15.15'
      },
      description: 'Remove ads and protect your computer from malware (over DoH)',
      country: 'France',
      location: {
        lat: 48.8582,
        long: 2.3387
      },
      filter: true
    },
    {
      name: 'adguard-dns-family-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dns-family.adguard.com',
        ipv4: '94.140.15.16'
      },
      description: 'Adguard DNS with safesearch and adult content blocking (over DoH)',
      country: 'France',
      location: {
        lat: 48.8582,
        long: 2.3387
      },
      filter: true
    },
    {
      name: 'adguard-dns-unfiltered-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dns-unfiltered.adguard.com',
        ipv4: '94.140.14.140'
      },
      description: 'AdGuard public DNS servers without filters (over DoH)',
      country: 'France',
      location: {
        lat: 48.8582,
        long: 2.3387
      }
    },
    {
      name: 'ahadns-doh-chi',
      endpoint: {
        protocol: 'https:',
        host: 'doh.chi.ahadns.net',
        cors: true
      },
      description: 'A zero logging DNS with support for DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT). Blocks ads, malware, trackers, viruses, ransomware, telemetry and more. No persistent logs. DNSSEC. Hosted in Chicago, USA. By https://ahadns.com/\nServer statistics can be seen at: https://statistics.ahadns.com/?server=chi',
      country: 'United States',
      location: {
        lat: 41.8483,
        long: -87.6517
      },
      filter: true,
      cors: true
    },
    {
      name: 'ahadns-doh-in',
      endpoint: {
        protocol: 'https:',
        host: 'doh.in.ahadns.net',
        cors: true
      },
      description: 'A zero logging DNS with support for DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT). Blocks ads, malware, trackers, viruses, ransomware, telemetry and more. No persistent logs. DNSSEC. Hosted in Mumbai, India. By https://ahadns.com/\nServer statistics can be seen at: https://statistics.ahadns.com/?server=in',
      country: 'India',
      location: {
        lat: 19.0748,
        long: 72.8856
      },
      filter: true,
      cors: true
    },
    {
      name: 'ahadns-doh-la',
      endpoint: {
        protocol: 'https:',
        host: 'doh.la.ahadns.net',
        cors: true
      },
      description: 'A zero logging DNS with support for DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT). Blocks ads, malware, trackers, viruses, ransomware, telemetry and more. No persistent logs. DNSSEC. Hosted in Los Angeles, USA. By https://ahadns.com/\nServer statistics can be seen at: https://statistics.ahadns.com/?server=la',
      country: 'United States',
      location: {
        lat: 34.0549,
        long: -118.2578
      },
      filter: true,
      cors: true
    },
    {
      name: 'ahadns-doh-nl',
      endpoint: {
        protocol: 'https:',
        host: 'doh.nl.ahadns.net',
        cors: true
      },
      description: 'A zero logging DNS with support for DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT). Blocks ads, malware, trackers, viruses, ransomware, telemetry and more. No persistent logs. DNSSEC. Hosted in Amsterdam, Netherlands. By https://ahadns.com/\nServer statistics can be seen at: https://statistics.ahadns.com/?server=nl',
      country: 'Netherlands',
      location: {
        lat: 52.3824,
        long: 4.8995
      },
      filter: true,
      cors: true
    },
    {
      name: 'ahadns-doh-ny',
      endpoint: {
        protocol: 'https:',
        host: 'doh.ny.ahadns.net',
        cors: true
      },
      description: 'A zero logging DNS with support for DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT). Blocks ads, malware, trackers, viruses, ransomware, telemetry and more. No persistent logs. DNSSEC. Hosted in New York. By https://ahadns.com/\nServer statistics can be seen at: https://statistics.ahadns.com/?server=ny',
      country: 'United States',
      location: {
        lat: 40.7308,
        long: -73.9975
      },
      filter: true,
      cors: true
    },
    {
      name: 'ahadns-doh-pl',
      endpoint: {
        protocol: 'https:',
        host: 'doh.pl.ahadns.net',
        cors: true
      },
      description: 'A zero logging DNS with support for DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT). Blocks ads, malware, trackers, viruses, ransomware, telemetry and more. No persistent logs. DNSSEC. Hosted in Poland. By https://ahadns.com/\nServer statistics can be seen at: https://statistics.ahadns.com/?server=pl',
      country: 'Netherlands',
      location: {
        lat: 52.3824,
        long: 4.8995
      },
      filter: true,
      cors: true
    },
    {
      name: 'alidns-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dns.alidns.com',
        ipv4: '223.5.5.5',
        cors: true
      },
      description: 'A public DNS resolver that supports DoH/DoT in mainland China, provided by Alibaba-Cloud.\nWarning: GFW filtering rules are applied by that resolver.\nHomepage: https://alidns.com/',
      country: 'China',
      location: {
        lat: 34.7725,
        long: 113.7266
      },
      filter: true,
      log: true,
      cors: true
    },
    {
      name: 'ams-ads-doh-nl',
      endpoint: {
        protocol: 'https:',
        host: 'dnsnl-noads.alekberg.net'
      },
      description: 'Resolver in Amsterdam. DoH protocol. Non-logging. Blocks ads, malware and trackers. DNSSEC enabled.',
      country: 'Romania',
      location: {
        lat: 45.9968,
        long: 24.997
      },
      filter: true
    },
    {
      name: 'ams-doh-nl',
      endpoint: {
        protocol: 'https:',
        host: 'dnsnl.alekberg.net'
      },
      description: 'Resolver in Amsterdam. DoH protocol. Non-logging, non-filtering, DNSSEC.',
      country: 'Romania',
      location: {
        lat: 45.9968,
        long: 24.997
      }
    },
    {
      name: 'att',
      endpoint: {
        protocol: 'https:',
        host: 'dohtrial.att.net'
      },
      description: 'AT&T test DoH server.',
      log: true
    },
    {
      name: 'bcn-ads-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dnses-noads.alekberg.net'
      },
      description: 'Resolver in Spain. DoH protocol. Non-logging, remove ads and malware, DNSSEC.',
      country: 'Spain',
      location: {
        lat: 41.3891,
        long: 2.1611
      },
      filter: true
    },
    {
      name: 'bcn-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dnses.alekberg.net'
      },
      description: 'Resolver in Spain. DoH protocol. Non-logging, non-filtering, DNSSEC.',
      country: 'Spain',
      location: {
        lat: 41.3891,
        long: 2.1611
      }
    },
    {
      name: 'brahma-world',
      endpoint: {
        protocol: 'https:',
        host: 'dns.brahma.world'
      },
      description: 'DNS-over-HTTPS server. Non Logging, filters ads, trackers and malware. DNSSEC ready, QNAME Minimization, No EDNS Client-Subnet.\nHosted in Stockholm, Sweden. (https://dns.brahma.world)',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      filter: true
    },
    {
      name: 'cisco-doh',
      endpoint: {
        protocol: 'https:',
        host: 'doh.opendns.com',
        ipv4: '146.112.41.2'
      },
      description: 'Remove your DNS blind spot (DoH protocol)\nWarning: modifies your queries to include a copy of your network\naddress when forwarding them to a selection of companies and organizations.',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      filter: true,
      log: true
    },
    {
      name: 'cloudflare',
      endpoint: {
        protocol: 'https:',
        host: 'dns.cloudflare.com',
        ipv4: '1.0.0.1',
        cors: true
      },
      description: 'Cloudflare DNS (anycast) - aka 1.1.1.1 / 1.0.0.1',
      country: 'Australia',
      location: {
        lat: -33.494,
        long: 143.2104
      },
      cors: true
    },
    {
      name: 'cloudflare-family',
      endpoint: {
        protocol: 'https:',
        host: 'family.cloudflare-dns.com',
        ipv4: '1.0.0.3',
        cors: true
      },
      description: 'Cloudflare DNS (anycast) with malware protection and parental control - aka 1.1.1.3 / 1.0.0.3',
      country: 'Australia',
      location: {
        lat: -33.494,
        long: 143.2104
      },
      filter: true,
      cors: true
    },
    {
      name: 'cloudflare-ipv6',
      endpoint: {
        protocol: 'https:',
        host: '1dot1dot1dot1.cloudflare-dns.com',
        cors: true
      },
      description: 'Cloudflare DNS over IPv6 (anycast)',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      cors: true
    },
    {
      name: 'cloudflare-security',
      endpoint: {
        protocol: 'https:',
        host: 'security.cloudflare-dns.com',
        ipv4: '1.0.0.2',
        cors: true
      },
      description: 'Cloudflare DNS (anycast) with malware blocking - aka 1.1.1.2 / 1.0.0.2',
      country: 'Australia',
      location: {
        lat: -33.494,
        long: 143.2104
      },
      filter: true,
      cors: true
    },
    {
      name: 'controld-block-malware',
      endpoint: {
        protocol: 'https:',
        host: 'freedns.controld.com',
        path: '/p1'
      },
      description: 'ControlD Free DNS. Take CONTROL of your Internet. Block unwanted content, bypass geo-restrictions and be more productive. DoH protocol and No logging. - https://controld.com/free-dns\nThis DNS blocks Malware domains.',
      country: 'Canada',
      location: {
        lat: 43.6319,
        long: -79.3716
      },
      filter: true
    },
    {
      name: 'controld-block-malware-ad',
      endpoint: {
        protocol: 'https:',
        host: 'freedns.controld.com',
        path: '/p2'
      },
      description: 'ControlD Free DNS. Take CONTROL of your Internet. Block unwanted content, bypass geo-restrictions and be more productive. DoH protocol and No logging. - https://controld.com/free-dns\nThis DNS blocks Malware, Ads & Tracking domains.',
      country: 'Canada',
      location: {
        lat: 43.6319,
        long: -79.3716
      },
      filter: true
    },
    {
      name: 'controld-block-malware-ad-social',
      endpoint: {
        protocol: 'https:',
        host: 'freedns.controld.com',
        path: '/p3'
      },
      description: 'ControlD Free DNS. Take CONTROL of your Internet. Block unwanted content, bypass geo-restrictions and be more productive. DoH protocol and No logging. - https://controld.com/free-dns\nThis DNS blocks Malware, Ads & Tracking and Social Networks domains.',
      country: 'Canada',
      location: {
        lat: 43.6319,
        long: -79.3716
      },
      filter: true
    },
    {
      name: 'controld-family-friendly',
      endpoint: {
        protocol: 'https:',
        host: 'freedns.controld.com',
        path: '/family'
      },
      description: 'ControlD Free DNS. Take CONTROL of your Internet. Block unwanted content, bypass geo-restrictions and be more productive. DoH protocol and No logging. - https://controld.com/free-dns\nThis DNS blocks Malware, Ads & Tracking, Adult Content and Drugs domains.',
      country: 'Canada',
      location: {
        lat: 43.6319,
        long: -79.3716
      },
      filter: true
    },
    {
      name: 'controld-uncensored',
      endpoint: {
        protocol: 'https:',
        host: 'freedns.controld.com',
        path: '/uncensored'
      },
      description: 'ControlD Free DNS. Take CONTROL of your Internet. Block unwanted content, bypass geo-restrictions and be more productive. DoH protocol and No logging. - https://controld.com/free-dns\nThis DNS unblocks censored domains from various countries.',
      country: 'Canada',
      location: {
        lat: 43.6319,
        long: -79.3716
      }
    },
    {
      name: 'controld-unfiltered',
      endpoint: {
        protocol: 'https:',
        host: 'freedns.controld.com',
        path: '/p0'
      },
      description: 'ControlD Free DNS. Take CONTROL of your Internet. Block unwanted content, bypass geo-restrictions and be more productive. DoH protocol and No logging. - https://controld.com/free-dns\nThis is a Unfiltered DNS, no DNS record blocking or manipulation here, if you want to block Malware, Ads & Tracking or Social Network domains, use the other ControlD DNS configs.',
      country: 'Canada',
      location: {
        lat: 43.6319,
        long: -79.3716
      }
    },
    {
      name: 'dns.digitale-gesellschaft.ch',
      endpoint: {
        protocol: 'https:',
        host: 'dns.digitale-gesellschaft.ch'
      },
      description: 'Public DoH resolver operated by the Digital Society (https://www.digitale-gesellschaft.ch).\nHosted in Zurich, Switzerland.\nNon-logging, non-filtering, supports DNSSEC.',
      country: 'Switzerland',
      location: {
        lat: 47.1449,
        long: 8.1551
      }
    },
    {
      name: 'dns.ryan-palmer',
      endpoint: {
        protocol: 'https:',
        host: 'dns1.ryan-palmer.com'
      },
      description: 'Non-logging, non-filtering, DNSSEC DoH Server. Hosted in the UK.',
      country: 'United Kingdom',
      location: {
        lat: 51.5164,
        long: -0.093
      }
    },
    {
      name: 'dns.sb',
      endpoint: {
        protocol: 'https:',
        host: 'doh.sb',
        ipv4: '185.222.222.222',
        cors: true
      },
      description: 'DNSSEC-enabled DoH server by https://xtom.com/\nhttps://dns.sb/doh/',
      country: 'Unknown',
      location: {
        lat: 47,
        long: 8
      },
      cors: true
    },
    {
      name: 'dns.therifleman.name',
      endpoint: {
        protocol: 'https:',
        host: 'dns.therifleman.name'
      },
      description: 'DNS-over-HTTPS DNS forwarder from Mumbai, India. Blocks web and Android trackers and ads.\nIP addresses are not logged, but queries are logged for 24 hours for debugging.\nReport issues, send suggestions @ joker349 at protonmail.com.\nAlso supports DoT (for android) @ dns.therifleman.name and plain DNS @ 172.104.206.174',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      filter: true
    },
    {
      name: 'dnsforfamily-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dns-doh.dnsforfamily.com'
      },
      description: '(DoH Protocol) (Now supports DNSSEC). Block adult websites, gambling websites, malwares and advertisements.\nIt also enforces safe search in: Google, YouTube, Bing, DuckDuckGo and Yandex.\nSocial websites like Facebook and Instagram are not blocked. No DNS queries are logged.\nAs of 26-May-2022 5.9 million websites are blocked and new websites are added to blacklist daily.\nCompletely free, no ads or any commercial motive. Operating for 4 years now.\nProvided by: https://dnsforfamily.com',
      country: 'Finland',
      location: {
        lat: 60.1758,
        long: 24.9349
      },
      filter: true
    },
    {
      name: 'dnsforfamily-doh-no-safe-search',
      endpoint: {
        protocol: 'https:',
        host: 'dns-doh-no-safe-search.dnsforfamily.com'
      },
      description: '(DoH Protocol) (Now supports DNSSEC) Block adult websites, gambling websites, malwares and advertisements.\nUnlike other dnsforfamily servers, this one does not enforces safe search. So Google, YouTube, Bing, DuckDuckGo and Yandex are completely accessible without any restriction.\nSocial websites like Facebook and Instagram are not blocked. No DNS queries are logged.\nAs of 26-May-2022 5.9 million websites are blocked and new websites are added to blacklist daily.\nCompletely free, no ads or any commercial motive. Operating for 4 years now.\nWarning: This server is incompatible with anonymization.\nProvided by: https://dnsforfamily.com',
      country: 'Finland',
      location: {
        lat: 60.1758,
        long: 24.9349
      },
      filter: true
    },
    {
      name: 'dnsforge.de',
      endpoint: {
        protocol: 'https:',
        host: 'dnsforge.de',
        cors: true
      },
      description: 'Public DoH resolver running with Pihole for Adblocking (https://dnsforge.de).\nNon-logging, AD-filtering, supports DNSSEC. Hosted in Germany.',
      country: 'Germany',
      location: {
        lat: 52.2998,
        long: 9.447
      },
      filter: true,
      cors: true
    },
    {
      name: 'dnshome-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dns.dnshome.de'
      },
      description: 'https://www.dnshome.de/ public resolver in Germany'
    },
    {
      name: 'dnspod-doh',
      endpoint: {
        protocol: 'https:',
        host: 'doh.pub',
        cors: true
      },
      description: 'A public DNS resolver in mainland China provided by DNSPod (Tencent Cloud).\nhttps://www.dnspod.cn/Products/Public.DNS?lang=en',
      filter: true,
      log: true,
      cors: true
    },
    {
      name: 'dnswarden-asia-adblock-dohv4',
      endpoint: {
        protocol: 'https:',
        host: 'doh.asia.dnswarden.com',
        path: '/adblock'
      },
      description: 'Hosted in Singapore. For more information look [here](https://github.com/bhanupratapys/dnswarden) or [here](https://dnswarden.com).',
      country: 'Singapore',
      location: {
        lat: 1.2929,
        long: 103.8547
      },
      filter: true
    },
    {
      name: 'dnswarden-asia-adultfilter-dohv4',
      endpoint: {
        protocol: 'https:',
        host: 'doh.asia.dnswarden.com',
        path: '/adultfilter'
      },
      description: 'Hosted in Singapore. For more information look [here](https://github.com/bhanupratapys/dnswarden) or [here](https://dnswarden.com).',
      country: 'Singapore',
      location: {
        lat: 1.2929,
        long: 103.8547
      },
      filter: true
    },
    {
      name: 'dnswarden-asia-uncensor-dohv4',
      endpoint: {
        protocol: 'https:',
        host: 'doh.asia.dnswarden.com',
        path: '/uncensored'
      },
      description: 'Hosted in Singapore. For more information look [here](https://github.com/bhanupratapys/dnswarden) or [here](https://dnswarden.com).',
      country: 'Singapore',
      location: {
        lat: 1.2929,
        long: 103.8547
      }
    },
    {
      name: 'dnswarden-eu-adblock-dohv4',
      endpoint: {
        protocol: 'https:',
        host: 'doh.eu.dnswarden.com'
      },
      description: 'Hosted in Germany. For more information look [here](https://github.com/bhanupratapys/dnswarden) or [here](https://dnswarden.com).',
      country: 'Germany',
      location: {
        lat: 50.1103,
        long: 8.7147
      },
      filter: true
    },
    {
      name: 'dnswarden-us-adblock-dohv4',
      endpoint: {
        protocol: 'https:',
        host: 'doh.us.dnswarden.com'
      },
      description: 'Hosted in USA (Dallas) . For more information look [here](https://github.com/bhanupratapys/dnswarden) or [here](https://dnswarden.com).',
      country: 'United States',
      location: {
        lat: 32.7889,
        long: -96.8021
      },
      filter: true
    },
    {
      name: 'doh-ch-blahdns',
      endpoint: {
        protocol: 'https:',
        host: 'doh-ch.blahdns.com',
        cors: true
      },
      description: 'Blocks ad and Tracking, no Logging, DNSSEC, Hosted in Switzerland. By https://blahdns.com/',
      country: 'Netherlands',
      location: {
        lat: 52.3824,
        long: 4.8995
      },
      filter: true,
      cors: true
    },
    {
      name: 'doh-cleanbrowsing-adult',
      endpoint: {
        protocol: 'https:',
        host: 'doh.cleanbrowsing.org',
        path: '/doh/adult-filter/',
        cors: true
      },
      description: 'Blocks access to all adult, pornographic and explicit sites. It does\nnot block proxy or VPNs, nor mixed-content sites. Sites like Reddit\nare allowed. Google and Bing are set to the Safe Mode.\nBy https://cleanbrowsing.org/',
      filter: true,
      cors: true
    },
    {
      name: 'doh-cleanbrowsing-family',
      endpoint: {
        protocol: 'https:',
        host: 'doh.cleanbrowsing.org',
        path: '/doh/family-filter/',
        cors: true
      },
      description: 'Blocks access to all adult, pornographic and explicit sites. It also\nblocks proxy and VPN domains that are used to bypass the filters.\nMixed content sites (like Reddit) are also blocked. Google, Bing and\nYoutube are set to the Safe Mode.\nBy https://cleanbrowsing.org/',
      filter: true,
      cors: true
    },
    {
      name: 'doh-cleanbrowsing-security',
      endpoint: {
        protocol: 'https:',
        host: 'doh.cleanbrowsing.org',
        path: '/doh/security-filter/',
        cors: true
      },
      description: 'Block access to phishing, malware and malicious domains. It does not block adult content.\nBy https://cleanbrowsing.org/',
      filter: true,
      cors: true
    },
    {
      name: 'doh-crypto-sx',
      endpoint: {
        protocol: 'https:',
        host: 'doh.crypto.sx',
        cors: true
      },
      description: 'DNS-over-HTTPS server. Anycast, no logs, no censorship, DNSSEC.\nBackend hosted by Scaleway, globally cached via Cloudflare.\nMaintained by Frank Denis.',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      cors: true
    },
    {
      name: 'doh-crypto-sx-ipv6',
      endpoint: {
        protocol: 'https:',
        host: 'doh-ipv6.crypto.sx',
        cors: true
      },
      description: 'DNS-over-HTTPS server accessible over IPv6. Anycast, no logs, no censorship, DNSSEC.\nBackend hosted by Scaleway, globally cached via Cloudflare.\nMaintained by Frank Denis.',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      cors: true
    },
    {
      name: 'doh-de-blahdns',
      endpoint: {
        protocol: 'https:',
        host: 'doh-de.blahdns.com',
        cors: true
      },
      description: 'Blocks ad and Tracking, no Logging, DNSSEC, Hosted in Germany. By https://blahdns.com/',
      country: 'Germany',
      location: {
        lat: 51.2993,
        long: 9.491
      },
      filter: true,
      cors: true
    },
    {
      name: 'doh-fi-blahdns',
      endpoint: {
        protocol: 'https:',
        host: 'doh-fi.blahdns.com',
        cors: true
      },
      description: 'Blocks ad and Tracking, no Logging, DNSSEC, Hosted in Finland. By https://blahdns.com/',
      country: 'Finland',
      location: {
        lat: 60.1758,
        long: 24.9349
      },
      filter: true,
      cors: true
    },
    {
      name: 'doh-ibksturm',
      endpoint: {
        protocol: 'https:',
        host: 'ibksturm.synology.me'
      },
      description: 'DoH & DoT Server, No Logging, No Filters, DNSSEC\nRunning privately by ibksturm in Thurgau, Switzerland'
    },
    {
      name: 'doh-jp-blahdns',
      endpoint: {
        protocol: 'https:',
        host: 'doh-jp.blahdns.com',
        cors: true
      },
      description: 'Blocks ad and Tracking, no Logging, DNSSEC, Hosted in Japan. By https://blahdns.com/',
      country: 'Japan',
      location: {
        lat: 35.6882,
        long: 139.7532
      },
      filter: true,
      cors: true
    },
    {
      name: 'doh.ffmuc.net',
      endpoint: {
        protocol: 'https:',
        host: 'doh.ffmuc.net'
      },
      description: 'An open (non-logging, non-filtering, non-censoring) DoH resolver operated by Freifunk Munich with nodes in DE.\nhttps://ffmuc.net/',
      country: 'Germany',
      location: {
        lat: 51.2993,
        long: 9.491
      }
    },
    {
      name: 'doh.tiarap.org',
      endpoint: {
        protocol: 'https:',
        host: 'doh.tiarap.org'
      },
      description: 'Non-Logging DNS-over-HTTPS server, cached via Cloudflare.\nFilters out ads, trackers and malware, NO ECS, supports DNSSEC.',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      filter: true
    },
    {
      name: 'google',
      endpoint: {
        protocol: 'https:',
        host: 'dns.google',
        ipv4: '8.8.8.8',
        cors: true
      },
      description: 'Google DNS (anycast)',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      log: true,
      cors: true
    },
    {
      name: 'hdns',
      endpoint: {
        protocol: 'https:',
        host: 'query.hdns.io',
        cors: true
      },
      description: 'HDNS is a public DNS resolver that supports Handshake domains.\nhttps://www.hdns.io',
      country: 'United States',
      location: {
        lat: 37.7771,
        long: -122.406
      },
      cors: true
    },
    {
      name: 'he',
      endpoint: {
        protocol: 'https:',
        host: 'ordns.he.net'
      },
      description: 'Hurricane Electric DoH server (anycast)\nUnknown logging policy.',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      log: true
    },
    {
      name: 'id-gmail-doh',
      endpoint: {
        protocol: 'https:',
        host: 'doh.tiar.app'
      },
      description: 'Non-Logging DNS-over-HTTPS server located in Singapore.\nFilters out ads, trackers and malware, supports DNSSEC, provided by id-gmail.',
      country: 'Singapore',
      location: {
        lat: 1.2929,
        long: 103.8547
      },
      filter: true
    },
    {
      name: 'iij',
      endpoint: {
        protocol: 'https:',
        host: 'public.dns.iij.jp'
      },
      description: 'DoH server operated by Internet Initiative Japan in Tokyo.\nhttps://www.iij.ad.jp/',
      country: 'Japan',
      location: {
        lat: 35.69,
        long: 139.69
      },
      log: true
    },
    {
      name: 'iqdns-doh',
      endpoint: {
        protocol: 'https:',
        host: 'a.passcloud.xyz'
      },
      description: 'Non-logging DoH service runned by V2EX.com user johnsonwil.\nReturns "no such domain" for anti-Chinese government websites. Supports DNSSEC.\nFor more information: https://www.v2ex.com/t/785666',
      filter: true
    },
    {
      name: 'jp.tiar.app-doh',
      endpoint: {
        protocol: 'https:',
        host: 'jp.tiar.app'
      },
      description: 'Non-Logging, Non-Filtering DNS-over-HTTPS server in Japan.\nNo ECS, Support DNSSEC',
      country: 'Japan',
      location: {
        lat: 35.6882,
        long: 139.7532
      }
    },
    {
      name: 'jp.tiarap.org',
      endpoint: {
        protocol: 'https:',
        host: 'jp.tiarap.org'
      },
      description: 'DNS-over-HTTPS Server. Non-Logging, Non-Filtering, No ECS, Support DNSSEC.\nCached via Cloudflare.'
    },
    {
      name: 'libredns',
      endpoint: {
        protocol: 'https:',
        host: 'doh.libredns.gr'
      },
      description: 'DoH server in Germany. No logging, but no DNS padding and no DNSSEC support.\nhttps://libredns.gr/',
      country: 'Germany',
      location: {
        lat: 51.2993,
        long: 9.491
      }
    },
    {
      name: 'nextdns',
      endpoint: {
        protocol: 'https:',
        host: 'anycsast.dns.nextdns.io'
      },
      description: 'NextDNS is a cloud-based private DNS service that gives you full control\nover what is allowed and what is blocked on the Internet.\nDNSSEC, Anycast, Non-logging, NoFilters\nhttps://www.nextdns.io/',
      country: 'Netherlands',
      location: {
        lat: 52.3891,
        long: 4.6563
      }
    },
    {
      name: 'nextdns-ultralow',
      endpoint: {
        protocol: 'https:',
        host: 'dns.nextdns.io',
        path: '/dnscrypt-proxy'
      },
      description: 'NextDNS is a cloud-based private DNS service that gives you full control\nover what is allowed and what is blocked on the Internet.\nhttps://www.nextdns.io/\nTo select the server location, the "-ultralow" variant relies on bootstrap servers\ninstead of anycast.'
    },
    {
      name: 'njalla-doh',
      endpoint: {
        protocol: 'https:',
        host: 'dns.njal.la',
        cors: true
      },
      description: 'Non-logging DoH server in Sweden operated by Njalla.\nhttps://dns.njal.la/',
      country: 'Sweden',
      location: {
        lat: 59.3247,
        long: 18.056
      },
      cors: true
    },
    {
      name: 'odoh-cloudflare',
      endpoint: {
        protocol: 'https:',
        host: 'odoh.cloudflare-dns.com',
        cors: true
      },
      description: 'Cloudflare ODoH server.\nhttps://cloudflare.com',
      cors: true
    },
    {
      name: 'odoh-crypto-sx',
      endpoint: {
        protocol: 'https:',
        host: 'odoh.crypto.sx',
        cors: true
      },
      description: 'ODoH target server. Anycast, no logs.\nBackend hosted by Scaleway. Maintained by Frank Denis.',
      cors: true
    },
    {
      name: 'odoh-id-gmail',
      endpoint: {
        protocol: 'https:',
        host: 'doh.tiar.app',
        path: '/odoh'
      },
      description: 'ODoH target server. Based in Singapore, no logs.\nFilter ads, trackers and malware.',
      filter: true
    },
    {
      name: 'odoh-jp.tiar.app',
      endpoint: {
        protocol: 'https:',
        host: 'jp.tiar.app',
        path: '/odoh'
      },
      description: 'ODoH target server. no logs.'
    },
    {
      name: 'odoh-jp.tiarap.org',
      endpoint: {
        protocol: 'https:',
        host: 'jp.tiarap.org',
        path: '/odoh'
      },
      description: 'ODoH target server via Cloudflare, no logs.'
    },
    {
      name: 'odoh-resolver4.dns.openinternet.io',
      endpoint: {
        protocol: 'https:',
        host: 'resolver4.dns.openinternet.io'
      },
      description: "ODoH target server. no logs, no filter, DNSSEC.\nRunning on dedicated hardware colocated at Sonic.net in Santa Rosa, CA in the United States.\nUses Sonic's recusrive DNS servers as upstream resolvers (but is not affiliated with Sonic\nin any way). Provided by https://openinternet.io"
    },
    {
      name: 'odoh-tiarap.org',
      endpoint: {
        protocol: 'https:',
        host: 'doh.tiarap.org',
        path: '/odoh'
      },
      description: 'ODoH target server via Cloudflare, no logs.\nFilter ads, trackers and malware.',
      filter: true
    },
    {
      name: 'publicarray-au2-doh',
      endpoint: {
        protocol: 'https:',
        host: 'doh-2.seby.io',
        cors: true
      },
      description: 'DNSSEC • OpenNIC • Non-logging • Uncensored - hosted on ovh.com.au\nMaintained by publicarray - https://dns.seby.io',
      country: 'Australia',
      location: {
        lat: -33.8591,
        long: 151.2002
      },
      cors: true
    },
    {
      name: 'puredns-doh',
      endpoint: {
        protocol: 'https:',
        host: 'puredns.org',
        ipv4: '146.190.6.13',
        cors: true
      },
      description: 'Public uncensored DNS resolver in Singapore - https://puredns.org\n** Only available in Indonesia and Singapore **',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      cors: true
    },
    {
      name: 'quad101',
      endpoint: {
        protocol: 'https:',
        host: 'dns.twnic.tw',
        cors: true
      },
      description: 'DNSSEC-aware public resolver by the Taiwan Network Information Center (TWNIC)\nhttps://101.101.101.101/index_en.html',
      cors: true
    },
    {
      name: 'quad9-doh-ip4-port443-filter-ecs-pri',
      endpoint: {
        protocol: 'https:',
        host: 'dns11.quad9.net',
        ipv4: '149.112.112.11'
      },
      description: 'Quad9 (anycast) dnssec/no-log/filter/ecs 9.9.9.11 - 149.112.112.11',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      filter: true
    },
    {
      name: 'quad9-doh-ip4-port443-filter-pri',
      endpoint: {
        protocol: 'https:',
        host: 'dns.quad9.net',
        ipv4: '149.112.112.112'
      },
      description: 'Quad9 (anycast) dnssec/no-log/filter 9.9.9.9 - 149.112.112.9 - 149.112.112.112',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      filter: true
    },
    {
      name: 'quad9-doh-ip4-port443-nofilter-ecs-pri',
      endpoint: {
        protocol: 'https:',
        host: 'dns12.quad9.net',
        ipv4: '9.9.9.12'
      },
      description: 'Quad9 (anycast) no-dnssec/no-log/no-filter/ecs 9.9.9.12 - 149.112.112.12',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      }
    },
    {
      name: 'quad9-doh-ip4-port443-nofilter-pri',
      endpoint: {
        protocol: 'https:',
        host: 'dns10.quad9.net',
        ipv4: '149.112.112.10'
      },
      description: 'Quad9 (anycast) no-dnssec/no-log/no-filter 9.9.9.10 - 149.112.112.10',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      }
    },
    {
      name: 'quad9-doh-ip6-port5053-filter-pri',
      endpoint: {
        protocol: 'https:',
        host: 'dns9.quad9.net'
      },
      description: 'Quad9 (anycast) dnssec/no-log/filter 2620:fe::fe - 2620:fe::9 - 2620:fe::fe:9',
      country: 'United States',
      location: {
        lat: 37.751,
        long: -97.822
      },
      filter: true
    },
    {
      name: 'safesurfer-doh',
      endpoint: {
        protocol: 'https:',
        host: 'doh.safesurfer.io'
      },
      description: 'Family safety focused blocklist for over 2 million adult sites, as well as phishing and malware and more.\nFree to use, paid for customizing blocking for more categories+sites and viewing usage at my.safesurfer.io. Logs taken for viewing\nusage, data never sold - https://safesurfer.io',
      filter: true,
      log: true
    },
    {
      name: 'sth-ads-doh-se',
      endpoint: {
        protocol: 'https:',
        host: 'dnsse-noads.alekberg.net'
      },
      description: 'Resolver in Stockholm, Sweden. DoH server. Non-logging, remove ads and malware, DNSSEC.',
      country: 'Bulgaria',
      location: {
        lat: 42.696,
        long: 23.332
      },
      filter: true
    },
    {
      name: 'sth-doh-se',
      endpoint: {
        protocol: 'https:',
        host: 'dnsse.alekberg.net'
      },
      description: 'Resolver in Stockholm, Sweden. DoH server. Non-logging, non-filtering, DNSSEC.',
      country: 'Bulgaria',
      location: {
        lat: 42.696,
        long: 23.332
      }
    },
    {
      name: 'switch',
      endpoint: {
        protocol: 'https:',
        host: 'dns.switch.ch'
      },
      description: 'Public DoH service provided by SWITCH in Switzerland\nhttps://www.switch.ch\nProvides protection against malware, but does not block ads.',
      filter: true
    },
    {
      name: 'uncensoreddns-dk-ipv4',
      endpoint: {
        protocol: 'https:',
        host: 'unicast.uncensoreddns.org'
      },
      description: 'Also known as censurfridns.\nDoH, no logs, no filter, DNSSEC, unicast hosted in Denmark - https://blog.uncensoreddns.org',
      country: 'Denmark',
      location: {
        lat: 55.7123,
        long: 12.0564
      }
    },
    {
      name: 'uncensoreddns-ipv4',
      endpoint: {
        protocol: 'https:',
        host: 'anycast.uncensoreddns.org'
      },
      description: 'Also known as censurfridns.\nDoH, no logs, no filter, DNSSEC, anycast - https://blog.uncensoreddns.org',
      country: 'Denmark',
      location: {
        lat: 55.7123,
        long: 12.0564
      }
    },
    {
      name: 'v.dnscrypt.uk-doh-ipv4',
      endpoint: {
        protocol: 'https:',
        host: 'v.dnscrypt.uk'
      },
      description: 'DoH, no logs, uncensored, DNSSEC. Hosted in London UK on Digital Ocean\nhttps://www.dnscrypt.uk',
      country: 'United Kingdom',
      location: {
        lat: 51.4964,
        long: -0.1224
      }
    }
  ],
  time: 1654187067783
}
