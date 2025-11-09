import { SocksClient } from 'socks'
import net from 'net';

// Структура входящих данных
interface ConnectionData {
  type: 'socks5' | 'socks4' | 'http' | '-';
  host: string;
  port: number;
  timeout: number;
  address: string;
  username?: string;
  password?: string;
}

async function connection(data: ConnectionData) {
  return new Promise((resolve, reject) => {
    if (data.type === 'socks5' || data.type === 'socks4') {
      SocksClient.createConnection({
        proxy: {
          host: data.host,
          port: data.port,
          type: data.type === 'socks5' ? 5 : 4
        },
        timeout: data.timeout,
        command: 'connect',
        destination: {
          host: data.address.split(':')[0],
          port: parseInt(data.address.split(':')[1])
        }
      }, 
      (error, info) => {
        if (error) return reject(error.message);
        
        resolve(info?.socket);
      });
    } else {
      const socket = net.connect({
				host: data.host,
			  port: data.port
			});
						
			socket.on('connect', () => {
				try {
					let req = `CONNECT ${data.address.split(':')[0]}:${parseInt(data.address.split(':')[1])} HTTP/1.1\r\n` +
                    `Host: ${data.address.split(':')[0]}:${parseInt(data.address.split(':')[1])}\r\n`;
          
          if (data.username && data.password) {
            req += `Proxy-Authorization: Basic ${Buffer.from(`${data.username}:${data.password}`).toString('base64')}\r\n` + `\r\n`;
          }

					socket.write(req);

					let res = '';
							
					function handler(chunk: Buffer) {
						res += chunk.toString();

						if (res.includes('200')) {
							socket.removeListener('data', handler);
							const payload = res.split('\r\n\r\n')[1] || '';

							if (payload) console.log('There is extra data left in the buffer:', payload);

              resolve(socket);
						} else if (res.includes('\r\n\r\n')) {
							console.log('Proxy returned an error:', res.trim());
							socket.destroy();
              reject(new Error('Proxy returned an error:' + res.trim()));
						}
					}
									
					socket.on('data', handler);
				} catch (error) {
					reject(error);
				}
			});

      socket.setTimeout(data.timeout, () => {
        socket.destroy();
        reject(new Error('Proxy connection timeout'));
      });

      socket.on('close', () => {
        reject(new Error('Proxy connection closed'));
      });

			socket.on('error', (error) => {
				console.log('Proxy error:', error);
				reject(error);
			});
    }
  });
}

export default connection;