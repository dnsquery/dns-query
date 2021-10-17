# Endpoints

To use DoH someone needs to host a DoH server.

A server **may** filter, log or limit the requests it receives!

_Filtering_ can be useful in case you want to avoid malware/ads/adult-content.

_Logging_ may be required in some countries and limiting may be part of a business model.

Furthermore the different endpoints may or may not be distributed around the globe,
making requests slower/faster depending on the client's location.

This package comes with a pretty long list of well-known and tested endpoints, listed below.
By default it will use the known endpoints that promise to not apply filters or logs.

If you are presenting this library to an end-user, you may want to pass the offer _what_
endpoint they want to use as it has privacy and usage implications!

_Note:_ Not all endpoints supply _CORS_ headers which means that the list is severly
reduced if you use this library in the browser.

| name                        | host(:port=443)(/path=/dns-query)          | loc    | filter | log | cors | method |
|-----------------------------|--------------------------------------------|-------------|---|---|---|------|
| [cloudflare][]              | cloudflare-dns.com                         | ?           | 𐄂 | 𐄂 | ✓ | GET |
| [cloudflareFamily][]        | family.cloudflare-dns.com                  | ?           | ✓ | 𐄂 | ✓ | GET |
| [cloudflareSecurity][]      | security.cloudflare-dns.com                | ?           | ✓ | 𐄂 | ✓ | GET |
| [cloudflareEth][]           | eth.resolver.cloudflare-eth.com            | ?           | ✓ | 𐄂 | ✓ | GET |
| [aAndA][]                   | dns.aa.net.uk                              | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [usablePrivacy][]           | adfree.usableprivacy.net                   | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [adguard][]                 | dns.adguard.com                            | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [adguardFamily][]           | dns-family.adguard.com                     | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [adguardUnfiltered][]       | dns-unfiltered.adguard.com                 | ?           | 𐄂 | 𐄂 | 𐄂 | GET |
| [ahadnsIn][ahadns]          | doh.in.ahadns.net                          | India       | ✓ | 𐄂 | ✓ | GET |
| [ahadnsIt][ahadns]          | doh.it.ahadns.net                          | Italy       | ✓ | 𐄂 | ✓ | GET |
| [ahadnsEs][ahadns]          | doh.es.ahadns.net                          | Spain       | ✓ | 𐄂 | ✓ | GET |
| [ahadnsNo][ahadns]          | doh.no.ahadns.net                          | Norway      | ✓ | 𐄂 | ✓ | GET |
| [ahadnsNl][ahadns]          | doh.nl.ahadns.net                          | Netherlands | ✓ | 𐄂 | ✓ | GET |
| [ahadnsPl][ahadns]          | doh.pl.ahadns.net                          | Poland      | ✓ | 𐄂 | ✓ | GET |
| [ahadnsNy][ahadns]          | doh.ny.ahadns.net                          | New York    | ✓ | 𐄂 | ✓ | GET |
| [ahadnsChi][ahadns]         | doh.chi.ahadns.net                         | Chicago     | ✓ | 𐄂 | ✓ | GET |
| [ahadnsAu][ahadns]          | doh.au.ahadns.net                          | Australia   | ✓ | 𐄂 | ✓ | GET |
| [ahadnsLa][ahadns]          | doh.la.ahadns.net                          | Los Angeles | ✓ | 𐄂 | ✓ | GET |
| [alidns][]                  | dns.alidns.com                             | China       | ✓ | 𐄂 | ✓ | GET |
| [amsNl][ams]                | dnsnl.alekberg.net                         | Amsterdam   | 𐄂 | 𐄂 | 𐄂 | GET |
| [amsSe][ams]                | dnsse.alekberg.net                         | Sweden      | 𐄂 | 𐄂 | 𐄂 | GET |
| [amsEs][ams]                | dnses.alekberg.net                         | Spain       | 𐄂 | 𐄂 | 𐄂 | GET |
| [arapurayil][]              | dns.arapurayil.com                         | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [digitaleGesellschaft][]    | dns.digitale-gesellschaft.ch               | Switzerland | 𐄂 | 𐄂 | ✓ | GET |
| [dnsForFamily][]            | dns-doh.dnsforfamily.com                   | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [dnsHome][]                 | dns.dnshome.de                             | Germany     | 𐄂 | 𐄂 | 𐄂 | GET |
| [blahDnsCh][blahDns]        | doh-ch.blahdns.com                         | Switzerland | ✓ | 𐄂 | ✓ | GET |
| [blahDnsJp][blahDns]        | doh-jp.blahdns.com                         | Japan       | ✓ | 𐄂 | ✓ | GET |
| [blahDnsDe][blahDns]        | doh-de.blahdns.com                         | Germany     | ✓ | 𐄂 | ✓ | GET |
| [blahDnsFi][blahDns]        | doh-fi.blahdns.com                         | Finland     | ✓ | 𐄂 | ✓ | GET |
| [cleanBrowsingSecurity][cb] | doh.cleanbrowsing.org/doh/security-filter/ | ?           | ✓ | 𐄂 | ✓ | GET |
| [cleanBrowsingFamily][cb]   | doh.cleanbrowsing.org/doh/family-filter/   | ?           | ✓ | 𐄂 | ✓ | GET |
| [cleanBrowsingAdult][cb]    | doh.cleanbrowsing.org/doh/adult-filter/    | ?           | ✓ | 𐄂 | ✓ | GET |
| [appliedPrivacy][]          | doh.applied-privacy.net/query              | Austria     | 𐄂 | 𐄂 | 𐄂 | GET |
| [ffmuc][]                   | doh.ffmuc.net                              | Germany     | 𐄂 | 𐄂 | 𐄂 | GET |
| [tiarap][]                  | doh.tiar.app                               | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [tiarapJp][]                | jp.tiar.app                                | Japan       | ✓ | 𐄂 | 𐄂 | GET |
| [google][]                  | dns.google                                 | ?           | 𐄂 | 𐄂 | ✓ | GET |
| [he][]                      | ordns.he.net                               | ?           | 𐄂 | ✓ | 𐄂 | GET |
| [iij][]                     | public.dns.iij.jp                          | Japan       | ✓ | ✓ | 𐄂 | GET |
| [libredns][]                | doh.libredns.gr                            | Germany     | 𐄂 | 𐄂 | 𐄂 | GET |
| [librednsAds][libredns]     | doh.libredns.gr/ads                        | Germany     | ✓ | 𐄂 | 𐄂 | GET |
| [njalla][]                  | dns.njal.la                                | Sweden      | 𐄂 | 𐄂 | 𐄂 | GET |
| [opendns][]                 | doh.opendns.com                            | ?           | 𐄂 | 𐄂 | 𐄂 | GET |
| [opendnsFamily][opendns]    | doh.familyshield.opendns.com               | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [sebyVultr][seby]           | doh.seby.io:8443                           | Sydney      | ✓ | 𐄂 | ✓ | GET |
| [sebyOVH][seby]             | doh-2.seby.io                              | Sydney      | ✓ | 𐄂 | ✓ | GET |
| [quad9][]                   | dns10.quad9.net                            | ?           | 𐄂 | 𐄂 | 𐄂 | GET |
| [quad9Ads][quad9]           | dns.quad9.net                              | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [switchCh][]                | dns.switch.ch                              | Switzerland | ✓ | 𐄂 | 𐄂 | GET |
| [yepdns][]                  | sg.yepdns.com                              | Singapore   | ✓ | 𐄂 | 𐄂 | GET |
| [lavaDnsEU1][lavaDns]       | eu1.dns.lavate.ch                          | Helsinki    | 𐄂 | 𐄂 | 𐄂 | GET |
| [controlId][]               | freedns.controld.com/p0                    | ?           | 𐄂 | 𐄂 | 𐄂 | GET |
| [controlIdMw][controlId]    | freedns.controld.com/p1                    | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [controlIdAds][controlId]   | freedns.controld.com/p2                    | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [controlIdSoc][controlId]   | freedns.controld.com/p3                    | ?           | ✓ | 𐄂 | 𐄂 | GET |
| [uncensoredAny][uncensored] | anycast.censurfridns.dk                    | ?           | 𐄂 | 𐄂 | 𐄂 | GET |
| [uncensoredUni][uncensored] | unicast.censurfridns.dk                    | Copenhagen  | 𐄂 | 𐄂 | 𐄂 | GET |
| [dnssbGlobal][dnssb]        | doh.dns.sb                                 | ?           | 𐄂 | 𐄂 | ✓ | GET |
| [dbssbDeDus][dnssb]         | de-dus.doh.sb                              | Düsseldorf  | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbDeFra][dnssb]         | de-fra.doh.sb                              | Frankfurt   | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbNlAms][dnssb]         | nl-ams.doh.sb                              | Amsterdam   | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbNlAms2][dnssb]        | nl-ams2.doh.sb                             | Amsterdam   | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbEeTll][dnssb]         | ee-tll.doh.sb                              | Tallinn     | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbJpKix][dnssb]         | jp-kix.doh.sb                              | Osaka       | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbHkHkg][dnssb]         | hk-hkg.doh.sb                              | Hong Kong   | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbAuSyd][dnssb]         | au-syd.doh.sb                              | Sydney      | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbUsChi][dnssb]         | us-chi.doh.sb                              | Chicago     | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbInBlr][dnssb]         | in-blr.doh.sb                              | Bengaluru   | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbSgSin][dnssb]         | sg-sin.doh.sb                              | Singapore   | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbKrSel][dnssb]         | kr-sel.doh.sb                              | Seoul       | 𐄂 | 𐄂 | ✓ | GET |
| [dnssbRuMow][dnssb]         | ru-mow.doh.sb                              | Moscow      | 𐄂 | 𐄂 | ✓ | GET |
| [ethlink][]                 | eth.link                                   | ?           | 𐄂 | 𐄂 | ✓ | GET |
| [handshake][]               | query.hdns.io                              | ?           | 𐄂 | 𐄂 | ✓ | GET |

[cloudflare]: https://developers.cloudflare.com/1.1.1.1/dns-over-https
[cloudflareFamily]: https://developers.cloudflare.com/1.1.1.1/1.1.1.1-for-families/setup-instructions/dns-over-https
[cloudflareSecurity]: https://developers.cloudflare.com/1.1.1.1/1.1.1.1-for-families/setup-instructions/dns-over-https
[cloudflareEth]: https://www.cloudflare.com/distributed-web-gateway/#ethereum-gateway
[aAndA]: https://www.aa.net.uk/legal/dohdot-disclaimer/
[usablePrivacy]: https://docs.usableprivacy.com
[adguard]: https://adguard.com/en/adguard-dns/overview.html
[adguardFamily]: https://adguard.com/en/adguard-dns/overview.html
[adguardUnfiltered]: https://adguard.com/en/adguard-dns/overview.html
[ahadns]: https://ahadns.com/dns-over-https/
[alidns]: https://alidns.com/knowledge?type=SETTING_DOCS#umpt6
[ams]: https://alekberg.net/doh
[arapurayil]: https://www.dns.arapurayil.com/
[digitaleGesellschaft]: https://www.digitale-gesellschaft.ch/dns
[dnsCrypt]: https://dnscrypt.ca/
[dnsForFamily]: https://dnsforfamily.com/
[dnsForge]: https://dnsforge.de/
[dnsHome]: https://www.dnshome.de/doh-dot-public-resolver.php
[dnsPod]: https://www.dnspod.cn/Products/Public.DNS?lang=en
[blahDns]: https://blahdns.com/
[cb]: https://cleanbrowsing.org/guides/dnsoverhttps
[appliedPrivacy]: https://applied-privacy.net/services/dns/
[ffmuc]: https://ffmuc.net/wiki/doku.php?id=knb:dohdot
[tiarap]: https://tiarap.org/
[tiarapJp]: https://jp.tiar.app/
[google]: https://developers.google.com/speed/public-dns/docs/doh/
[he]: https://dns.he.net/
[iij]: https://public.dns.iij.jp/
[libredns]: https://libredns.gr/
[linuxSec]: https://doh.linuxsec.org/
[meganerd]: https://www.meganerd.nl/encrypted-dns-server
[moulticast]: https://moulticast.net/dnscrypt/
[njalla]: https://dns.njal.la/
[opendns]: https://support.opendns.com/hc/en-us/articles/360038086532-Using-DNS-over-HTTPS-DoH-with-OpenDNS
[plan9NJ]: https://jlongua.github.io/plan9-dns/
[powerDNS]: https://powerdns.org/
[seby]: https://dns.seby.io/
[quad9]: https://quad9.net/service/service-addresses-and-features
[switchCh]: https://www.switch.ch/security/info/public-dns/
[yepdns]: https://get.yepdns.com/
[dnsOverHttps]: https://dns-over-https.com/
[lavaDns]: https://dns.lavate.ch/
[controlId]: https://controld.com/
[rubyfish]: https://www.rubyfish.cn/dns/solutions/
[uncensored]: https://blog.uncensoreddns.org/
[dnssb]: https://dns.sb/doh/
[ethlink]: https://eth.link/
[irisden]: https://iriseden.fr/
[handshake]: https://docs.namebase.io/guides-1/resolving-handshake-1/hdns.io#dns-over-https-doh

## Known Broken Servers

| name                        | host(:port=443)(/path=/dns-query)          | loc    | filter | log | cors | method | issues |
|-----------------------------|--------------------------------------------|-------------|---|---|---|-----|----------------------------|
| [meganerd][]                | chewbacca.meganerd.nl/doh                  | Amsterdam   | 𐄂 | 𐄂 | 𐄂 | GET | Connection refused         |
| [moulticast][]              | dns.moulticast.net                         | ?           | 𐄂 | 𐄂 | 𐄂 | GET | Certificate Expired        |
| [dnsOverHttps][]            | dns.dns-over-https.com                     | ?           | 𐄂 | ✓ | ✓ | GET | Timeout                    |
| [lavaDnsUS1][lavaDns]       | us1.dns.lavate.ch                          | California  | 𐄂 | 𐄂 | 𐄂 | GET | Timeout                    |
| [plan9NJ][]                 | hydra.plan9-ns1.com                        | New Jersey  | 𐄂 | 𐄂 | ✓ | GET | Certificate Expired        |
| [dnsCrypt1][dnsCrypt]       | dns1.dnscrypt.ca:453                       | Canada      | 𐄂 | 𐄂 | ✓ | GET | Occassional 503 err        |
| [dnsCrypt2][dnsCrypt]       | dns2.dnscrypt.ca:453                       | Canada      | 𐄂 | 𐄂 | ✓ | GET | Occassional 503 err        |
| [irisden1][irisden]         | ns1.iriseden.fr                            | Paris       | 𐄂 | 𐄂 | ✓ | GET | Timeout                    |
| [irisden2][irisden]         | ns2.iriseden.fr                            | Paris       | 𐄂 | 𐄂 | ✓ | GET | Timeout                    |
| [dnsForge][]                | dnsforge.de                                | Germany     | ✓ | 𐄂 | ✓ | GET | Some TXT responses missing |
| [dnsPod][]                  | doh.pub                                    | China       | ✓ | 𐄂 | ✓ | GET | Some TXT responses missing |
| [blahDnsSg][blahDns]        | doh-sg.blahdns.com                         | Singapore   | ✓ | 𐄂 | ✓ | GET | Certificate expired        |
| [dnssbUkLon][dnssb]         | uk-lon.doh.sb                              | London      | 𐄂 | 𐄂 | ✓ | GET | Timeout (t=2000)           |
| [dnssb][]                   | doh.sb                                     | ?           | 𐄂 | 𐄂 | ✓ | GET | Timeout (t=2000)           |
| [linuxSec][]                | doh.linuxsec.org                           | Indonesia   | ✓ | 𐄂 | ✓ | GET | Timeout (t=2000)           |
| [linuxSecAdGuard][linuxSec] | doh.linuxsec.org/adguard                   | Indonesia   | ✓ | 𐄂 | ✓ | GET | Timeout (t=2000)           |
| [rubyfish][]                | rubyfish.cn                                | China       | ✓ | ✓ | ✓ | GET | 503 err                    |
| [powerDNS][]                | doh.powerdns.org                           | ?           | ✓ | 𐄂 | 𐄂 | GET | Timeout (t=2000)           |

- https://doh.bortzmeyer.fr (404)
- https://www.nic.cz/odvr/ (socket hangup)
- https://emeraldonion.org/faq/ (socket hangup) - dns.emeraldonion.org
- https://mullvad.net/en/help/dns-over-https-and-dns-over-tls/ (socket hangup)
- https://jlongua.github.io/plan9-dns/ (socket hangup) - FLORIDA! - draco.plan9-ns2.com
- https://101.101.101.101/index_en.html (timeout) - Taiwan 
