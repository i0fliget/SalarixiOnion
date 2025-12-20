import mineflayer, { Bot } from 'mineflayer';
import fs from 'fs';

import { msg, del } from '../api/session.js';
import { connection } from './connection/connection.js';
import { mutateText } from './tools/mutator.js';
import { generateNumber } from './tools/generator.js';

import { updateBotProfileData, updateBotChatHistory } from './update/update.js';

export interface BotProfile {
	fresh: boolean;
	status: { text: string, color: string };
	version: string;
	password: string;
	registered: boolean;
	rejoinProcess: 'active' | 'sleep';
	rejoinQuantity: number;
	proxyType: string;
	proxy: string;
	load: number;
	ping: number;
	tasks: any;
	intervals: Map<string, NodeJS.Timeout> | null;
}

interface FlowItem {
	bot: Bot | null;
	profile: BotProfile | null;
}

let active = false;

export let flow: Record<string, FlowItem> = {};

let settings: Map<string, any> = new Map();

async function sleep(delay: number) {
	await new Promise(resolve => setTimeout(resolve, delay));
}

export async function startBots(options: any) {
	try {
		if (active && flow && Object.keys(flow).length > 0) {
			return { type: 'warning', info: {
				success: false,
				message: 'Предупреждение (start-bots-process): Существуют активные боты, запуск невозможен'
			}};
		}

		active = true;

		if (fs.existsSync('./data')) {
			fs.rmSync('./data', { recursive: true, force: true });
		}

		fs.mkdirSync('./data');

		let proxies: string[] = [];
		
		if (options.proxyList) {
			proxies = String(options.proxyList).trim().split('\n');
		}
		
		let count = 0;
		
		for (let i = 0; i < options.quantity; i++) {
			await sleep(options.delay);

			if (!active) break;

			let username = null;
			
			for (let attempts = 0; attempts < 6; attempts++) {
				username = mutateText({ text: options.username, advanced: false, data: null });
				if (!Object.keys(flow).includes(username)) break;
				username = null;
			}

			if (username) {
				const version = mutateText({ text: options.version, advanced: false, data: null });
				const password = mutateText({ text: options.password, advanced: false, data: null });
				const registerCommand = mutateText({ text: options.registerCommand, advanced: false, data: null });
				const registerTemplate = mutateText({ text: options.registerTemplate, advanced: false, data: null });
				const loginCommand = mutateText({ text: options.loginCommand, advanced: false, data: null });
				const loginTemplate = mutateText({ text: options.loginTemplate, advanced: false, data: null });

				if (count >= proxies.length) count = 0;

				const proxy = proxies[count] || null;
			
				count++;

				settings.set(username, {
					address: options.address, version: version, quantity: options.quantity,
					username: username, password: password, distance: options.distance,
					timeout: options.timeout, skipValidation: options.skipValidation,
					registerCommand: registerCommand, registerTemplate: registerTemplate,
					registerMinDelay: options.registerMinDelay, registerMaxDelay: options.registerMaxDelay,
					loginCommand: loginCommand, loginTemplate: loginTemplate,
					loginMinDelay: options.loginMinDelay, loginMaxDelay: options.loginMaxDelay,
					rejoinQuantity: options.rejoinQuantity, rejoinDelay: options.rejoinDelay,
					dataUpdateFrequency: options.dataUpdateFrequency, proxy: proxy,
					useKeepAlive: options.useKeepAlive, usePhysics: options.usePhysics,
					useProxy: options.useProxy, useAutoRegister: options.useAutoRegister,
					useAutoLogin: options.useAutoLogin, useAutoRejoin: options.useAutoRejoin,
					useLogDeath: options.useLogDeath, useSaveChat: options.useSaveChat,
					useSavePlayers: options.useSavePlayers, useOptimization: options.useOptimization,
					useExtendedLogs: options.useExtendedLogs
				});

				flow[username] = { bot: null, profile: null };
			
				const bot = await createBot(username);

				if (bot) {
					msg('process:botting', {
						type: 'info',
						message: `Бот ${username} успешно создан`
					});

					flow[username]!.bot = bot;

					await setupBot(username, bot);
				}
			}
		}
		
		await sleep(options.delay);
		
		return { type: 'info', info: {
			success: true,
			message: `Запуск ботов завершён`
		}};
	} catch (error) {
		return { type: 'error', info: {
      success: false,
      message: `Ошибка (start-bots-process): ${error}`
    }};
	}
}

export async function stopBots() {
	try {
		if (!flow) {
			return { type: 'error', info: {
				success: false,
				message: 'Ошибка (stop-bots-process): Unable to get active bots'
			}};
		}
	
		Object.keys(flow).forEach(k => {
			flow[k]?.profile?.intervals?.clear();
			flow[k]?.bot?.end('@salarixi:disconnect');
			delete flow[k];
			settings.delete(k);
		});

		flow = {};
		settings.clear();

		active = false;

		del('process:botting');
	
		return { type: 'info', info: {
			success: true,
			message: 'Боты успешно остановленны'
		}};
	} catch (error) {
		return { type: 'error', info: {
			success: false,
			message: `Ошибка (stop-bots-process): ${error}`
		}};
	}
}

export async function manipulateBot(action: string, options: any) {
	switch (action) {
		case 'recreate':
			const result = await recreateBot(options.username);
			if (result) {
				return { type: 'info', success: true, message: `Бот ${options.username} пересоздан` };
			} else {
				return { type: 'error', success: false, message: `Не удалось пересоздать бота ${options.username}` };
			}
	}

	return null;
}

export function updateBotTask(username: string, task: string, status: boolean, load?: number) {
	const profile = flow[username]?.profile;

	if (!profile) return;

	profile.tasks[task].status = status;

	if (!status && !load) {
		profile.tasks[task].load = 0;
	} else {
		profile.tasks[task].load = Number(load);
	}

	let globalLoad = 0;

	for (const element in profile.tasks) {
		const current = profile.tasks[element];
		globalLoad += current.load;
	}

	profile.load = parseFloat(globalLoad.toFixed(1));
}

async function createBot(username: string) {
	try {
		const options = settings.get(username);

		if (options.useExtendedLogs) msg('process:botting', {
			type: 'system',
			message: `Создание бота ${username}...`
		});

		if (!flow[username]) {
      flow[username] = { bot: null, profile: null };
    }

		if (!flow[username].profile) {
			flow[username].profile = {
				fresh: true,
				status: { text: 'Соединение...', color: '#8f8f8fff' },
				version: options.version,
				password: options.password,
				registered: false,
				rejoinProcess: 'sleep',
				rejoinQuantity: 0,
				proxyType: '─',
				proxy: '─',
				load: 0,
				ping: 0,
				tasks: {
					basic: { status: false, load: 0 },
					auth: { status: false, load: 0 },
					analysis: { status: false, load: 0 },
					message: { status: false, load: 0 },
					spamming: { status: false, load: 0 },
					jumping: { status: false, load: 0 },
					shifting: { status: false, load: 0 },
					waving: { status: false, load: 0 },
					spinning: { status: false, load: 0 },
					looking: { status: false, load: 0 },
					moveForward: { status: false, load: 0 },
					moveBack: { status: false, load: 0 },
					moveLeft: { status: false, load: 0 },
					moveRight: { status: false, load: 0 },
					hybridImitation: { status: false, load: 0 },
					walkingImitation: { status: false, load: 0 },
					attack: { status: false, load: 0 },
					flight: { status: false, load: 0 },
					sprinter: { status: false, load: 0 },
					ghost: { status: false, load: 0 },
					spoofing: { status: false, load: 0 }
				},
				intervals: new Map()
			};
		} else {
			flow[username].profile.status = { text: 'Соединение...', color: '#8f8f8fff' };
		}

		const profile = flow[username].profile;

		if (!profile.intervals?.has('update-profile-data')) {
			profile.intervals?.set('update-profile-data', setInterval(() => {
				if (!active) {
					clearInterval(profile.intervals?.get('update-profile-data'));
					return;
				}

				updateBotProfileData({ username: username, profile: profile });
			}, options.dataUpdateFrequency));
		}

		let viewDistance: 'tiny' | 'short' | 'normal' | 'far' = 'tiny';

		if (options.distance !== 'tiny' && options.distance !== 'short' && options.distance !== 'normal' && options.distance !== 'far') {
			viewDistance = 'short';
		} else {
			viewDistance = options.distance;
		}

		const [host, port] = String(options.address).split(':');

		if (!host || !port) return null;

		let opts: mineflayer.BotOptions = {
			host: host,
			username: username,
			auth: 'offline',
			port: parseInt(port),     
			version: options.version,
			viewDistance: viewDistance,
			keepAlive: options.useKeepAlive,
			physicsEnabled: options.usePhysics,
			closeTimeout: options.timeout,
			hideErrors: true,
			skipValidation: options.skipValidation
		};

		if (options.useOptimization) {
			options.plugins = {
        anvil: false,
        book: false,
        boss_bar: false,
        breath: false,
        conversions: false,
        digging: false,
        enchantment_table: false,
        explosion: false,
        fishing: false,
        furnace: false,
        generic_place: false,
        loader: false,
        painting: false,
        particle: false,
        rain: false,
        ray_trace: false,
        scoreboard: false,
        sound: false,
        team: false,
        title: false,
        villager: false
      };
		}

		if (options.useProxy && options.proxy) {
			const url = new URL(options.proxy);
			const proxyHost = url.hostname;
			const proxyPort = parseInt(url.port);
			const proxyUsername = url.username;
			const proxyPassword = url.password;

			profile.proxy = proxyHost;

			let proxyType: 'socks5' | 'socks4' | 'http' | '@none';

			if (options.proxy.startsWith('socks5://')) {
				proxyType = 'socks5';
			} else if (options.proxy.startsWith('socks4://')) {
				proxyType = 'socks4';
			} else if (options.proxy.startsWith('http://')) {
				proxyType = 'http';
			} else {
				proxyType = '@none';
			}

			if (proxyType === '@none') return null;
			if (!proxyHost || !proxyPort) return null;

			profile.proxyType = proxyType;
			profile.proxy = `${proxyHost}:${proxyPort}`;

			const socket = await connection({ 
				type: proxyType,
				host: proxyHost,
				port: proxyPort,
				timeout: options.timeout,
				address: options.address,
				username: proxyUsername,
				password: proxyPassword
			});

			return mineflayer.createBot({
				...opts,
				connect: (client) => {
					client.setSocket(socket as any);
					client.emit('connect');
				}
			});
		} else {
			profile.proxyType = '─';
			profile.proxy = '─';
				
			return mineflayer.createBot(opts);
		}
	} catch (error) {
		msg('process:botting', {
			type: 'error',
			message: `Ошибка создания бота ${username}: ${error}`
		});

		return null;
	}
}

async function setupBot(username: string, bot: Bot) {
	try {
		const options = settings.get(username);

		if (options.useExtendedLogs) msg('process:botting', {
			type: 'system',
			message: `Настройка бота ${username}...`
		});

		const current = flow[username];
		const profile = flow[username]?.profile;

		if (!current || !profile) return;

		if (!profile.intervals?.has('update-ping')) {
			profile.intervals?.set('update-ping', setInterval(() => {
				if (!active) {
					clearInterval(profile.intervals?.get('update-ping'));
					return;
				}

				const bot = flow[username]?.bot;

				if (bot && bot.player.ping) {
					profile.ping = bot.player.ping;
				}
			}, options.dataUpdateFrequency));
		}

		bot.once('spawn', async () => {
			try {
				profile.status = { text: 'Активен', color: '#22ed17ff' };

				updateBotTask(username, 'basic', true, 1.2);

				await sleep(generateNumber('float', 1000, 2000));

				if (profile.fresh) {
					msg('process:botting', {
						type: 'info',
						message: `Бот ${username} создан`
					});

					profile.fresh = false;

					if (options.useAutoRegister) {
						await authorizeBot(username, bot, 'register');
					}
				} else {
					profile.rejoinProcess = 'sleep';

					if (!profile.registered) {
						if (options.useAutoRegister) {
							await authorizeBot(username, bot, 'register');
						}
					} else {
						if (options.useAutoLogin) {
							await authorizeBot(username, bot, 'login');
						}
					}
				}
			} catch (error) {
				msg('process:botting', {
					type: 'error',
					message: `Ошибка у бота ${username} в событии 'spawn': ${error}`
				});
			}
  	});

		if (options.useLogDeath) {
			bot.on('death', async () => {
				msg('process:botting', {
					type: 'info',
					message: `Бот ${username} умер`
				});
			});
		}

		if (options.useSaveChat) {
			bot.on('chat', async (nickname, message) => {
				if (nickname !== username) {
					fs.appendFileSync(`./data/chat_history_${username}.txt`, `${username}: ${message}\n`);
				}
			});
		}

		bot.on('message', async (message, position) => {
			try {
				const messageString = String(message).trim();
				const text = message.toHTML();
				let nickname;

				if (position === 'system') {
					nickname = 'anonymous';
				} else if (position === 'chat') {
					const nicknameMatch = messageString.match(/<(.+?)>/);
					nickname = nicknameMatch ? nicknameMatch[1] : 'anonymous';
				} else {
					nickname = 'unknown';
				}

				let isBot = false;

				if (nickname && Object.keys(flow).includes(nickname)) {
					isBot = true;
				}

				updateBotChatHistory({
					username: username,
					type: position,
					text: isBot ? `%hb( бот )%sc ${text}` : text
				});
			} catch (error) {
				if (error instanceof TypeError) return;

				msg('process:botting', {
					type: 'error',
					message: `Ошибка у бота ${username} в событии 'message': ${error}`
				});
			}
		});

		bot.on('end', async (reason) => {
			try {
				if (reason === '@salarixi:disconnect') return;
				if (profile.rejoinProcess === 'active') return;

				if (options.useAutoRejoin && profile.rejoinQuantity < options.rejoinQuantity) {
					const result = await recreateBot(username);
					if (result) return;
				}

				await resetBot(username);

				profile.status = { text: 'Оффлайн', color: '#ed1717ff' };

				msg('process:botting', {
					type: 'info',
					message: `${username} отключился: ${reason}`
				});

				current.bot = null;
			} catch (error) {
				msg('process:botting', {
					type: 'error',
					message: `Ошибка у бота ${username} в событии 'end': ${error}`
				});
			}
		});

		bot.on('kicked', async (reason) => {
			try {
				if (reason === '@salarixi:disconnect') return;

				msg('process:botting', {
					type: 'error',
					message: `${username} кикнут: ${JSON.stringify(reason)}`
				});

				if (options.useAutoRejoin && profile.rejoinQuantity < options.rejoinQuantity && profile.rejoinProcess === 'sleep') {
					const result = await recreateBot(username);
					if (result) return;
				}

				await resetBot(username);

				profile.status = { text: 'Оффлайн', color: '#ed1717ff' };

				current.bot = null;
			} catch (error) {
				msg('process:botting', {
					type: 'error',
					message: `Ошибка у бота ${username} в событии 'kicked': ${error}`
				});
			}
		});

		bot.on('error', async (error) => {
			try {
				current.bot = null;

				await resetBot(username);

				profile.status = { text: 'Повреждён', color: '#ed1717ff' };

				msg('process:botting', {
					type: 'error',
					message: `Ошибка у ${username}: ${error.message || 'Invalid incoming data'}`
				});
			} catch (error) {
				msg('process:botting', {
					type: 'error',
					message: `Ошибка у бота ${username} в событии 'error': ${error}`
				});
			}
		});

		if (options.useExtendedLogs) msg('process:botting', {
			type: 'system',
			message: `Настройка бота ${username} окончена`
		});
	} catch (error) {
		msg('process:botting', {
			type: 'error',
			message: `Ошибка настройки бота ${username}: ${error}`
		});
	}
}

async function authorizeBot(username: string, bot: Bot, method: string) {
	try {
		const options = settings.get(username);

		if (options.useExtendedLogs) msg('process:botting', {
			type: 'system',
			message: `Аутентификация бота ${username}...`
		});

		const profile = flow[username]?.profile;

		if (!profile) return;

		updateBotTask(username, 'auth', true, 0.8);

		if (method === 'register') {
			if (!profile.registered) {
				const text = options.registerTemplate
					.replace(/@command/g, options.registerCommand)
					.replace(/@cmd/g, options.registerCommand)
					.replace(/@c/g, options.registerCommand)
					.replace(/@register/g, options.registerCommand)
					.replace(/@reg/g, options.registerCommand)
					.replace(/@password/g, options.password)
					.replace(/@pass/g, options.password)
					.replace(/@p/g, options.password);

				await sleep(generateNumber('float', options.registerMinDelay, options.registerMaxDelay));

				bot.chat(text);

				profile.registered = true;

				msg('process:botting', {
					type: 'info',
					message: `Бот ${username} зарегистрировался: ${text}`
				});
			} else {
				await authorizeBot(username, bot, 'login');
			}
		} else if (method === 'login') {
			if (profile.registered) {
				const text = options.loginTemplate
					.replace(/@command/g, options.loginCommand)
					.replace(/@cmd/g, options.loginCommand)
					.replace(/@c/g, options.loginCommand)
					.replace(/@login/g, options.loginCommand)
					.replace(/@l/g, options.loginCommand)
					.replace(/@password/g, options.password)
					.replace(/@pass/g, options.password)
					.replace(/@p/g, options.password);

				await sleep(generateNumber('float', options.loginMinDelay, options.loginMaxDelay));

				bot.chat(text);

				msg('process:botting', {
					type: 'info',
					message: `Бот ${username} залогинился: ${text}`
				});
			} else {
				await authorizeBot(username, bot, 'register');
			}
		}
	} catch (error) {
		msg('process:botting', {
			type: 'error',
			message: `Ошибка авторизации бота ${username}: ${error}`
		});
	} finally {
		updateBotTask(username, 'auth', false);
	}
}

async function recreateBot(username: string) {
	try {
		const options = settings.get(username);

		if (options.useExtendedLogs) msg('process:botting', {
			type: 'system',
			message: `Пересоздание бота ${username}...`
		});

		const current = flow[username];
		const profile = flow[username]?.profile;

		if (!current || !profile) return false;

		if (profile.status.text === 'Активен') {
			current.bot?.end('@salarixi:disconnect');
		}

		profile.status = { text: 'Соединение...', color: '#8f8f8fff' };
		profile.rejoinProcess = 'active';
		profile.rejoinQuantity++;

		await resetBot(username);

		current.bot = null;

		await sleep(generateNumber('float', 1000, 2800));

		const bot = await createBot(username);

		if (flow[username]) {
			flow[username].bot = bot;
		}

		if (!bot) return false;

		await setupBot(username, bot);

		profile.rejoinProcess = 'sleep';

		return true;
	} catch (error) {
		msg('process:botting', {
			type: 'error',
			message: `Ошибка пересоздания бота ${username}: ${error}`
		});

		return false;
	}
}

async function resetBot(username: string) {
	const options = settings.get(username);

	const profile = flow[username]?.profile;
	
	if (!profile) return;

	flow[username]?.bot?.removeAllListeners();

	for (const element in profile.tasks) {
		let current = profile.tasks[element];
		current.status = false;
		current.load = 0;
	}

	profile.load = 0;
	profile.ping = 0;

	if (options.useExtendedLogs) msg('process:botting', {
		type: 'system',
		message: `Данные бота ${username} очищены`
	});
}