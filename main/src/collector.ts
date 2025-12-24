import { randomInt } from 'crypto';

interface Options { 
  algorithm: string; 
  protocol: string; 
  country: string; 
  count: string;
};

const apicServices = {
  'proxyscrape': 'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=json',
  'proxifly': 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/all/data.json',
  'jetkai-proxy-list': 'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/json/proxies-advanced.json',
  'monosans-proxy-list': 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_pretty.json',
  'vakhov-proxy-list': 'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/refs/heads/master/proxylist.json',
  'geonode': [
    'https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc',
    'https://proxylist.geonode.com/api/proxy-list?limit=500&page=2&sort_by=lastChecked&sort_type=desc',
    'https://proxylist.geonode.com/api/proxy-list?limit=500&page=3&sort_by=lastChecked&sort_type=desc',
  ]
};

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0',
];

function randomUserAgent() {
  return String(userAgents[randomInt(0, userAgents.length)]);
}

async function request(name: string, url: string) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': randomUserAgent() } });
    if (res.ok) {
      const data = await res.json();
      return { success: true, name, data };
    } else {
      return { success: false, name, error: `HTTP ${res.status}` };
    }
  } catch (error) {
    return { success: false, name, error: String(error) };
  }
}

function createTaskFlow(urls: any) {
  const tasks = [];

  for (const [name, url] of Object.entries(urls)) {
    if (Array.isArray(url)) {
      for (const u of url) tasks.push(request(name, u));
    } else {
      tasks.push(request(name, url as string));
    }
  }

  return tasks;
}

async function APIc(protocol: string, country: string) {
  const tasks = createTaskFlow(apicServices);
  const results = await Promise.all(tasks);

  const proxies: string[] = [];

  for (const result of results) {
    if (!result.success) continue;
    const data = result.data;
    const name = result.name;

    if (name === 'proxyscrape') {
      for (const proxy of data.proxies ?? []) {
        if (country === 'any' || proxy.ip_data?.countryCode === country.toUpperCase()) {
          if (protocol === 'any' || String(proxy.protocol).toLowerCase() === protocol) proxies.push(proxy.proxy);
        }
      }
    } else if (name === 'proxifly') {
      for (const proxy of data ?? []) {
        if (country === 'any' || proxy.geolocation?.country === country.toUpperCase()) {
          if (protocol === 'any' || String(proxy.protocol).toLowerCase() === protocol) proxies.push(proxy.proxy);
        }
      }
    } else if (name === 'jetkai-proxy-list') {
      for (const proxy of data ?? []) {
        if (country === 'any' || proxy.location?.isocode === country.toUpperCase()) {
          const type = proxy.protocols?.[0]?.type;
          if (protocol === 'any' || String(type).toLowerCase() === protocol) {
            proxies.push(`${type}://${proxy.ip}:${proxy.port}`);
          }
        }
      }
    } else if (name === 'monosans-proxy-list') {
      for (const proxy of data ?? []) {
        if (proxy.username == null && proxy.password == null) {
          if (country === 'any' || proxy.geolocation?.country?.iso_code === country.toUpperCase()) {
            if (protocol === 'any' || String(proxy.protocol).toLowerCase() === protocol) {
              proxies.push(`${proxy.protocol}://${proxy.host}:${proxy.port}`);
            }
          }
        }
      }
    } else if (name === 'vakhov-proxy-list') {
      for (const proxy of data ?? []) {
        if (country === 'any' || proxy.country_code === country.toUpperCase()) {
          if (protocol === 'any') {
            for (const p of ['socks5', 'socks4', 'http']) {
              if (Number(proxy[p]) !== 0) proxies.push(`${p}://${proxy.ip}:${proxy.port}`);
            }
          } else {
            if (Number(proxy[protocol]) !== 0) proxies.push(`${protocol}://${proxy.ip}:${proxy.port}`);
          }
        }
      }
    } else if (name === 'geonode') {
      for (const proxy of data?.data ?? []) {
        if (country === 'any' || proxy.country === country.toUpperCase()) {
          const protocols = (proxy.protocols ?? []).map((p: string) => p.toLowerCase());
          if (protocol === 'any') {
            for (const p of protocols) proxies.push(`${p}://${proxy.ip}:${proxy.port}`);
          } else {
            for (const p of protocols) if (p === protocol) proxies.push(`${p}://${proxy.ip}:${proxy.port}`);
          }
        }
      }
    }
  }

  return proxies;
}

export async function collect(options: Options) {
  try {
    let proxy_list: string[] = [];

    if (options.algorithm === 'apic') {
      proxy_list = await APIc(options.protocol, options.country);
    }

    if (options.count !== 'max') {
      proxy_list = proxy_list.slice(0, Number(options.count));
    }

    proxy_list = Array.from(new Set(proxy_list.map(String)));

    const out = proxy_list.join('\n');

    return out;
  } catch (err: any) {
    return err;
  }
}