import aiohttp
import random
import sys
import asyncio
import json


apic_services = {
  'proxyscrape': 'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=json',
  'proxifly': 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/all/data.json',
  'jetkai-proxy-list': 'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/json/proxies-advanced.json',
  'monosans-proxy-list': 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_pretty.json',
  'vakhov-proxy-list': 'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/refs/heads/master/proxylist.json',
  'geonode': [
    'https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc',
    'https://proxylist.geonode.com/api/proxy-list?limit=500&page=2&sort_by=lastChecked&sort_type=desc',
    'https://proxylist.geonode.com/api/proxy-list?limit=500&page=3&sort_by=lastChecked&sort_type=desc'
  ]
}

user_agents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0'
]


async def request(name: str, url: str):
  try:
    async with aiohttp.ClientSession(headers={'User-Agent': random.choice(user_agents)}) as session:
      async with session.get(url) as response:
        if response.status == 200:
          text = await response.text()
          data = json.loads(text)
          return { 'success': True, 'name': name, 'data': data }
        else:
          return { 'success': False, 'name': name, 'error': 'Некорректный код ответа' }
  except Exception as e:
    return { 'success': False, 'name': name, 'error': str(e) }
  

async def createTaskFlow(urls: dict[str, str]):
  tasks = []

  for name, url in urls.items():
    if name == 'geonode':
      for u in url:
        tasks.append(request(name, u))
    else:
      tasks.append(request(name, url))

  return tasks
  

async def APIc(protocol: str, country: str):
  tasks = await createTaskFlow(apic_services)

  results = await asyncio.gather(*tasks)

  proxies = []

  for result in results:
    if result['success']:
      data = result['data']

      if result['name'] == 'proxyscrape':
        for proxy in data['proxies']:
          if country == 'any' or proxy['ip_data']['countryCode'] == country.upper():
            if protocol == 'any' or str(proxy['protocol']).lower() == protocol:
              proxies.append(proxy['proxy'])
      elif result['name'] == 'proxifly':
        for proxy in data:
          if country == 'any' or proxy['geolocation']['country'] == country.upper():
            if protocol == 'any' or str(proxy['protocol']).lower() == protocol:
              proxies.append(proxy['proxy'])
      elif result['name'] == 'jetkai-proxy-list':
        for proxy in data:
          if country == 'any' or proxy['location']['isocode'] == country.upper():
            if protocol == 'any' or str(proxy['protocols'][0]['type']).lower() == protocol:
              proxies.append(f"{proxy['protocols'][0]['type']}://{proxy['ip']}:{proxy['port']}")
      elif result['name'] == 'monosans-proxy-list':
        for proxy in data:
          if proxy['username'] == None and proxy['password'] == None:
            if country == 'any' or proxy['geolocation']['country']['iso_code'] == country.upper():
              if protocol == 'any' or str(proxy['protocol']).lower() == protocol:
                proxies.append(f"{proxy['protocol']}://{proxy['host']}:{proxy['port']}")
      elif result['name'] == 'vakhov-proxy-list':
        for proxy in data:
          if country == 'any' or proxy['country_code'] == country.upper():
            if protocol == 'any':
              protocols = ['socks5', 'socks4', 'http']
              for p in protocols:
                if int(proxy[p]) != 0:
                  proxies.append(f"{p}://{proxy['ip']}:{proxy['port']}")
            else:
              if int(proxy[protocol]) != 0:
                proxies.append(f"{protocol}://{proxy['ip']}:{proxy['port']}")
      elif result['name'] == 'geonode':
        for proxy in data['data']:
          if country == 'any' or proxy['country'] == country.upper():
            if protocol == 'any':
              protocols = [p.lower() for p in proxy['protocols']]

              for p in protocols:
                proxies.append(f"{p}://{proxy['ip']}:{proxy['port']}")
            else:
              protocols = [p.lower() for p in proxy['protocols']]

              for p in protocols:
                if p == protocol:
                  proxies.append(f"{p}://{proxy['ip']}:{proxy['port']}")

  return proxies


async def file(options: dict[str, any]):
  try:
    if options['mode'] == 'write':
      with open(options['path'], 'w') as f:
        if isinstance(options['data'], dict):
          f.write(json.dumps(options['data']))
        else:
          f.write(str(options['data']))

        f.close()
    elif options['mode'] == 'read':
      result = ''

      with open(options['path'], 'r') as f:
        result += f.read()
        f.close()

      return result
    
  except Exception:
    return None


async def collect(options: dict[str, str]):
  try:
    latest_options = await file({
      'mode': 'read',
      'path': './collector.options.txt'
    })

    if latest_options:
      latest_result = await file({
          'mode': 'read',
          'path': './collector.result.txt'
        })

      if options == json.loads(latest_options) and latest_result != None:
        return latest_result

    await file({
      'mode': 'write',
      'path': './collector.options.txt',
      'data': options
    })

    proxy_list = []

    if options['algorithm'] == 'apic':
      proxy_list = await APIc(options['protocol'], options['country'])

    if options['count'] != 'max':
      proxy_list = proxy_list[:int(options['count'])]

    proxy_list = [str(p) for p in dict.fromkeys(proxy_list)]

    string = '\n'.join(proxy_list)

    await file({
      'mode': 'write',
      'path': './collector.result.txt',
      'data': string
    })

    return string
    
  except Exception as err:
    return err


async def main():
  args = sys.argv

  algorithm = args[1]
  protocol = args[2]
  country = args[3]
  count = args[4]

  result = await collect({ 
    'algorithm': algorithm,
    'protocol': protocol,
    'country': country,
    'count': count
  })

  print(result)

    
if __name__ == '__main__':
  asyncio.run(main())