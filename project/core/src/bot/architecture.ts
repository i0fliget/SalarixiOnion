import mineflayer from 'mineflayer';
import { pathfinder } from 'mineflayer-pathfinder';
import fs from 'fs';

import connection from './connection/connection.js';
import Generator from '../tools/generator.js';
import ChatController from './controllers/chat.js';
import ActionController from './controllers/action.js';
import MovementController from './controllers/movement.js';
import ImitationController from './controllers/imitation.js';
import AttackController from './controllers/attack.js';
import GhostController from './controllers/ghost.js';
import FlightController from './controllers/flight.js';

let bots: Map<string, Bot> = new Map();

let STATISTICS = {
	activeBotsObjects: new Map() as Map<string, Bot>,
	offlineBotsObjects: new Map() as Map<string, Bot>,
	kickedBotsObjects: new Map() as Map<string, Bot>
}

// Структура профиля бота
interface BotProfile {
	nickname: string;
	password: string;
	version: string;
	registered: boolean;
	reputation: number;
	rejoinProcess: 'active' | 'sleep';
	rejoinQuantity: number;
	proxyType: 'socks5' | 'socks4' | 'http' | '-';
	proxy: string;
	status: { text: 'Активен', color: '#22ed17ff' } | { text: 'Соединение...', color: '#8f8f8fff' } | { text: 'Оффлайн', color: '#ed1717ff' };
	load: number;
	ping: number;
	pingChecker: any;
	playerSaver: any;
}

// Структура флажков бота
interface BotFlags {
	ACTIVE_SPAMMING: boolean;
	ACTIVE_JUMPING: boolean;
	ACTIVE_SHIFTING: boolean;
	ACTIVE_MOVEMENT: boolean;
	ACTIVE_ATTACKING: boolean;
	ACTIVE_LOOKING: boolean;
	ACTIVE_WAVING: boolean;
	ACTIVE_SPINNING: boolean;
	ACTIVE_HYBRID_IMITATION: boolean;
	ACTIVE_WALKING_IMITATION: boolean;
	ACTIVE_FLIGHT: boolean;
	ACTIVE_GHOST: boolean;
}

const generator = new Generator();

// Основной класс с архитектурой Minecraft бота
class Bot {
	private bot: mineflayer.Bot | undefined = undefined;

	private chatController: ChatController | undefined = undefined;
	private actionController: ActionController | undefined = undefined;
	private movementController: MovementController | undefined = undefined;
	private imitationController: ImitationController | undefined = undefined;
	private attackController: AttackController | undefined = undefined;
	private ghostController: GhostController | undefined = undefined;
	private flightController: FlightController | undefined = undefined;
	private chatHistory: any[] = [];

	public profile: BotProfile;
	public flags: BotFlags;

	constructor(
		public transmitter: any,
		public address: string,
		public version: string,
		public quantity: number,
		public nickname: string,
		public password: string,
		public timeout: number,
		public distance: string,
		public registerCommand: string,
		public registerTemplate: string,
		public loginCommand: string,
		public loginTemplate: string,
		public rejoinQuantity: number,
		public rejoinDelay: number,
		public proxy: string | undefined,
		public useKeepAlive: boolean,
		public usePhysics: boolean,
		public useProxy: boolean,
		public useProxyChecker: boolean,
		public useAutoRegister: boolean,
		public useAutoLogin: boolean,
		public useAutoRejoin: boolean,
		public useLogDeath: boolean,
		public useSaveChat: boolean,
		public useSavePlayers: boolean,
		public useOptimization: boolean
	) {
		this.profile = {
			nickname: this.nickname,
			password: this.password,
			version: this.version,
			registered: false,
			rejoinProcess: 'sleep',
			status: { text: 'Соединение...', color: '#8f8f8fff' },
			reputation: 100,
			rejoinQuantity: 0,
			proxyType: '-',
			proxy: '-',
			load: 0,
			ping: 0,
			pingChecker: undefined,
			playerSaver: undefined
		};

		this.flags = {
			ACTIVE_SPAMMING: false,
			ACTIVE_JUMPING: false,
			ACTIVE_SHIFTING: false,
			ACTIVE_MOVEMENT: false,
			ACTIVE_ATTACKING: false,
			ACTIVE_LOOKING: false,
			ACTIVE_WAVING: false,
			ACTIVE_SPINNING: false,
			ACTIVE_HYBRID_IMITATION: false,
			ACTIVE_WALKING_IMITATION: false,
			ACTIVE_FLIGHT: false,
			ACTIVE_GHOST: false
		};
	}

	private async sleep(delay: number) {
		await new Promise(resolve => setTimeout(resolve, delay));
	}
	
	private async create() {
		try {
			this.profile.status = { text: 'Соединение...', color: '#8f8f8fff' };

			let viewDistance: 'tiny' | 'short' | 'normal' | 'far';

			if (this.distance !== 'tiny' && this.distance !== 'short' && this.distance !== 'normal' && this.distance !== 'far') {
				viewDistance = 'short';
			} else {
				viewDistance = this.distance;
			}

			let options: mineflayer.BotOptions = {
				host: this.address.split(':')[0],
				username: this.nickname,
				auth: 'offline',
				port: parseInt(this.address.split(':')[1]),     
				version: this.version,
				viewDistance: viewDistance,
				keepAlive: this.useKeepAlive,
				physicsEnabled: this.usePhysics,
				closeTimeout: this.timeout,
				hideErrors: true
			};

			if (this.useOptimization) {
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

			if (this.useProxy && this.proxy) {
				let proxyType: 'socks5' | 'socks4' | 'http' | '@none';

				if (this.proxy?.startsWith('socks5://')) {
					proxyType = 'socks5';
				} else if (this.proxy?.startsWith('socks4://')) {
					proxyType = 'socks4';
				} else if (this.proxy?.startsWith('http://')) {
					proxyType = 'http';
				} else {
					proxyType = '@none';
				}

				if (proxyType === '@none') return;

				if (proxyType === 'socks5' || proxyType === 'socks4') {
					console.log(`Бот ${this.nickname} использует ${proxyType.toUpperCase()}-прокси: ${this.proxy}`);

					this.profile.proxyType = proxyType;

					const url = new URL(this.proxy);
					const host = url.hostname;
					const port = parseInt(url.port) || 80;

					if (!host || !port) return;

					this.profile.proxy = `${host}:${port}`;

					const socket: any = await connection({ 
						type: proxyType,
						host: host,
						port: port,
						timeout: this.timeout,
						address: this.address
					});

					const bot = mineflayer.createBot({
						...options,
						skipValidation: true,
						connect: (client) => {
							client.setSocket(socket);
							client.emit('connect');
						}
					});
					
					return bot;
				} else if (proxyType === 'http') {
					console.log(`Бот ${this.nickname} использует HTTP-прокси: ${this.proxy}`);

					this.profile.proxyType = 'http';

					const url = new URL(this.proxy);
          const host = url.hostname;
          const port = parseInt(url.port) || 80;
          const username = url.username;
          const password = url.password;

					if (!host || !port) return;

					this.profile.proxy = `${host}:${port}`;

					const socket: any = await connection({ 
						type: proxyType,
						host: host,
						port: port,
						timeout: this.timeout,
						address: this.address,
						username: username,
						password: password
					});

					const bot = mineflayer.createBot({
						...options,
						skipValidation: true,
						connect: (client) => {
							client.setSocket(socket);
							client.emit('connect');
						}
					});

					return bot;
				} 
			} else {
				this.profile.proxyType = '-';
				this.profile.proxy = 'Не использует';
				
				const bot = mineflayer.createBot(options);

				return bot;
			}
		} catch (error) {
			console.log(`Ошибка создания бота ${this.nickname}: ${error}`);
		}
	}
	
	public async join() {
		try {
			const bot = await this.create();

			if (!bot) {
				return {
					success: false,
					message: `Ошибка создания %hn${this.nickname}%sc: Bot object damaged`
				}
			}

			this.bot = bot;

			await this.setup();
			await this.handling({ type: 'join' });

			return {
				success: true,
				message: `Бот %hn${this.nickname}%sc успешно создан`
			}
		} catch (error) {
			this.transmitter.send({ type: 'error', data: {
      	message: `Ошибка создания %hn${this.nickname}%sc: ${error}`
    	}});

			return {
				success: false,
				message: `Ошибка создания %hn${this.nickname}%sc: ${error}`
			}
		}
  }   

	private async rejoin() {
		try {
			this.profile.status = { text: 'Соединение...', color: '#8f8f8fff' };
			this.profile.rejoinProcess = 'active';
			this.profile.rejoinQuantity++;

			this.clean();

			STATISTICS.activeBotsObjects.delete(this.profile.nickname);
			STATISTICS.offlineBotsObjects.delete(this.profile.nickname);
			STATISTICS.kickedBotsObjects.delete(this.profile.nickname);

			await this.sleep(generator.generateRandomNumberBetween(1000, 2800));

			this.bot = await this.create();

			if (!this.bot) return false;

			await this.setup();
			await this.handling({ type: 'rejoin' });

			return true;
		} catch (error) {
			return false;
		}
	}

	private async setup() {
		if (!this.bot) return;

		bots.set(this.nickname, this);

		STATISTICS.activeBotsObjects.set(this.nickname, this);
		STATISTICS.offlineBotsObjects.delete(this.nickname);
		STATISTICS.kickedBotsObjects.delete(this.nickname);

		this.bot.loadPlugin(pathfinder);

		this.chatController = new ChatController(this.bot, this, this.flags);
		this.actionController = new ActionController(this.bot, this, this.flags);
		this.imitationController = new ImitationController(this.bot, this, this.flags);
		this.movementController = new MovementController(this.bot, this, this.flags);
		this.attackController = new AttackController(this.bot, this, this.flags);
		this.flightController = new FlightController(this.bot, this, this.flags);
		this.ghostController = new GhostController(this.bot, this, this.flags);

		this.profile.pingChecker = setInterval(() => {
			if (!this.bot?.player) return;
			this.profile.ping = this.bot.player.ping;
		}, 3000);

		this.profile.status = { text: 'Активен', color: '#22ed17ff' };

		if (this.useOptimization) {
			this.updateLoad('+', 0.8);
		} else {
			this.updateLoad('+', 1.3);
		}
	}

	private async auth({ type }: {
		type: 'register' | 'login'
	}) {
		try {
			if (!this.bot) return;
			if (!this.chatController) return;

			if (type === 'register') {
				if (!this.profile.registered) {
					const text = this.registerTemplate
						.replace(/@command/g, this.registerCommand)
						.replace(/@cmd/g, this.registerCommand)
						.replace(/@c/g, this.registerCommand)
						.replace(/@register/g, this.registerCommand)
						.replace(/@reg/g, this.registerCommand)
						.replace(/@password/g, this.password)
						.replace(/@pass/g, this.password)
						.replace(/@p/g, this.password);

					await this.sleep(generator.generateRandomNumberBetween(1000, 2500));

					await this.chatController.send({ 
						from: this.nickname,
						message: text, 
						useMagicText: false,
						useTextMutation: false,
						useSync: false
					});

					this.profile.registered = true;

					this.transmitter.send({
						type: 'info',
						data: {
							message: `Бот %hn${this.nickname}%sc зарегистрировался: ${text}`
						}
					});
				}
			} else if (type === 'login') {
				if (this.profile.registered) {
					const text = this.loginTemplate
						.replace(/@command/g, this.loginCommand)
						.replace(/@cmd/g, this.loginCommand)
						.replace(/@c/g, this.loginCommand)
						.replace(/@login/g, this.loginCommand)
						.replace(/@l/g, this.loginCommand)
						.replace(/@password/g, this.password)
						.replace(/@pass/g, this.password)
						.replace(/@p/g, this.password);

					await this.sleep(generator.generateRandomNumberBetween(1000, 2500));

					await this.chatController.send({ 
						from: this.nickname,
						message: text, 
						useMagicText: false,
						useTextMutation: false,
						useSync: false
					});

					this.transmitter.send({
						type: 'info',
						data: {
							message: `Бот %hn${this.nickname}%sc залогинился: ${text}`
						}
					})
				}
			}
		} catch (error) {
			console.log(`( ${this.nickname} / auth ) Ошибка: ${error}`);
		}
	}

	private async handling({ type }: {
		type: 'join' | 'rejoin'
	}) {
		try {
			if (!this.bot) return;

			this.bot.once('spawn', async () => {
				try {
					await this.sleep(generator.generateRandomNumberBetween(1000, 2000));

					if (type === 'join') {
						this.transmitter.send({ type: 'info', data: {
							message: `Создан новый бот: %hn${this.nickname}%sc`
						}});

						if (this.useAutoRegister) await this.auth({ type: 'register' });
					} else if (type === 'rejoin') {
						this.transmitter.send({ type: 'info', data: {
							message: `Бот %hn${this.nickname}%sc переподключился`
						}});

						this.profile.rejoinProcess = 'sleep';

						if (!this.profile.registered) {
							if (this.useAutoRegister) await this.auth({ type: 'register' });
						} else {
							if (this.useAutoLogin) await this.auth({ type: 'login' });
						}
					}
				} catch (error) {
					console.log(`( ${this.nickname} / spawn ) Ошибка: ${error}`);
				}
  		});

			this.bot.on('resourcePack', async (url, hash) => {
				this.bot?.emit('resourcePack', url, hash);
			});

			if (this.useLogDeath) {
				this.bot.on('death', async () => {
					this.transmitter.send({ type: 'info', data: {
						message: `Бот %hn${this.nickname}%sc умер`
					}});
				});
			}

			if (this.useSaveChat) {
				this.bot.on('chat', async (username, message) => {
					if (username !== this.nickname) {
						fs.appendFileSync(`./data/chat_history_${this.nickname}.txt`, `${username}: ${message}\n`);
					}
				});
			}

			if (this.useSavePlayers) {
				this.profile.playerSaver = setInterval(() => {
					if (!this.bot) return;

					const players = Object.keys(this.bot.players);

					fs.writeFileSync(`./data/players_${this.nickname}.txt`, `---------- ${this.nickname} / ОКРУЖАЮЩИЕ ИГРОКИ ----------\n`);

					for (const player of players) {
						fs.appendFileSync(`./data/players_${this.nickname}.txt`, player + '\n');
					}
				}, 5000);
			}

			this.bot.on('message', async (message, position) => {
				try {
					this.updateLoad('+', 0.2);

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

					STATISTICS.activeBotsObjects.forEach((_, element) => nickname === element ? isBot = true : isBot = isBot);

					const msg = {
						type: position,
						text: isBot ? `%hb[ БОТ ]%sc ${text}` : text
					}

					if (!isBot) {
						const valid = !this.chatHistory.some(existingMsg => 
							existingMsg.type === msg.type &&
							existingMsg.text === msg.text
						);

						if (!valid) {
							this.updateLoad('-', 0.2); return;
						}
					}

					this.chatHistory.push(msg);

					if (this.chatHistory.length > 6) this.chatHistory.shift();

					this.updateLoad('-', 0.2);
				} catch (error) {
					this.updateLoad('-', 0.2);
					console.log(`( ${this.nickname} / message ) Ошибка: ${error}`);
				}
			});

			this.bot.on('end', async (reason) => {
				try {
					if (reason === '@force-disconnect') return;
					if (this.profile.rejoinProcess === 'active') return;

					this.clean();

					this.profile.status = { text: 'Оффлайн', color: '#ed1717ff' };

					this.transmitter.send({ type: 'info', data: {
						message: `%hn${this.nickname}%sc отключился: ${reason}`
					}});

					STATISTICS.activeBotsObjects.delete(this.nickname);

					let valid = true;

					STATISTICS.offlineBotsObjects.forEach((_, nickname) => this.nickname === nickname ? valid = false : valid = valid);
					
					if (valid) STATISTICS.offlineBotsObjects.set(this.nickname, this);
				} catch (error) {
					console.log(`( ${this.nickname} / end ) Ошибка: ${error}`);
				}
			});

			this.bot.on('kicked', async (reason) => {
				try {
					if (reason === '@force-disconnect') return;

					this.transmitter.send({ type: 'error', data: {
						message: `%hn${this.nickname}%sc кикнут: ${JSON.stringify(reason)}`
					}});

					if (this.useAutoRejoin && this.profile.rejoinQuantity < this.rejoinQuantity) {
						this.transmitter.send({ type: 'info', data: {
							message: `Переподключение %hn${this.nickname}%sc...`
						}});

						const status = await this.rejoin();

						if (!status) {
							this.transmitter.send({ type: 'error', data: {
								message: `Бот %hn${this.nickname}%sc не смог переподключиться`
							}});
						} else {
							return;
						}
					}

					this.clean();

					this.profile.status = { text: 'Оффлайн', color: '#ed1717ff' };

					STATISTICS.activeBotsObjects.delete(this.nickname);
					
					let valid = true;

					STATISTICS.kickedBotsObjects.forEach((_, nickname) => this.nickname === nickname ? valid = false : valid = valid);

					if (valid) STATISTICS.kickedBotsObjects.set(this.nickname, this);
				} catch (error) {
					console.log(`( ${this.nickname} / kicked ) Ошибка: ${error}`);
				}
			});

			this.bot.on('error', async (error) => {
				try {
					STATISTICS.activeBotsObjects.delete(this.nickname);

					this.clean();

					this.profile.status = { text: 'Оффлайн', color: '#ed1717ff' };
					
					let valid = true;

					STATISTICS.offlineBotsObjects.forEach((_, nickname) => this.nickname === nickname ? valid = false : valid = valid);

					if (valid) STATISTICS.offlineBotsObjects.set(this.nickname, this);

					this.transmitter.send({ type: 'error', data: {
						message: `Ошибка у %hn${this.nickname}%sc: ${error.message || 'Invalid incoming data'}`
					}});
				} catch (error) {
					console.log(`( ${this.nickname} / error ) Ошибка: ${error}`);
				}
			});
		} catch (error) {
			console.log(`( ${this.nickname} ) Ошибка: ${error}`);
		}
	}

	public updateLoad(operation: '+' | '-', num: number) {
		let result = 0;

		if (operation === '+') {
			result = Number((this.profile.load + num).toFixed(1));
		} else if (operation === '-') {
			result = Number((this.profile.load - num).toFixed(1));
		}

		if (result < 0) {
			this.profile.load = 0;
		} else {
			this.profile.load = result;
		}
	}

	public async disconnect() {
		if (!this.bot) return;

		this.bot.end('@force-disconnect');

		STATISTICS.activeBotsObjects.delete(this.nickname);
		STATISTICS.offlineBotsObjects.delete(this.nickname);
		STATISTICS.kickedBotsObjects.delete(this.nickname);

		this.clean();

		this.profile.status = { text: 'Оффлайн', color: '#ed1717ff' };
	}

	public clean() {
		if (!this.bot) return;

		this.flags.ACTIVE_JUMPING = false;
		this.flags.ACTIVE_LOOKING = false;
		this.flags.ACTIVE_WAVING = false;
		this.flags.ACTIVE_SHIFTING = false;
		this.flags.ACTIVE_SPAMMING = false;
		this.flags.ACTIVE_MOVEMENT = false;
		this.flags.ACTIVE_ATTACKING = false;
		this.flags.ACTIVE_SPINNING = false;
		this.flags.ACTIVE_HYBRID_IMITATION = false;
		this.flags.ACTIVE_WALKING_IMITATION = false;
		this.flags.ACTIVE_FLIGHT = false;
		this.flags.ACTIVE_GHOST = false;

		this.profile.load = 0;
		this.profile.ping = 0;

		clearInterval(this.profile.pingChecker);
		clearInterval(this.profile.playerSaver);

		this.profile.pingChecker = undefined;
		this.profile.playerSaver = undefined;
	}

	public get(type: 'bot-object' | 'chat-history') {
		switch (type) {
			case 'bot-object':
				if (this.bot) return this.bot; break;
			case 'chat-history':
				if (this.bot) return this.chatHistory; break;
		}
	}

  public async chat({ type, data }: {
		type: string;
		data: any;
	}) {
		if (!this.chatController) return;

  	if (type === 'default') {
			await this.chatController.send(data);
		} else if (type === 'spamming') {
			await this.chatController.spamming(data);
		}
  } 

	public async action({ state, action, data }: {
		state: 'start' | 'stop';
		action: 'jumping' | 'shifting' | 'waving' | 'looking' | 'spinning'; 
		data: any;
	}) {
		if (!this.actionController) return;

		switch (action) {
			case 'jumping':
				await this.actionController.jumping({ state: state, data: data }); break;
			case 'shifting':
				await this.actionController.shifting({ state: state, data: data }); break;
			case 'spinning':
				await this.actionController.spinning({ state: state, data: data }); break;
		}
	}

	public async movement({ state, direction, data }: {
		state: 'start' | 'stop';
		direction: 'forward' | 'back' | 'left' | 'right'; 
		data: any;
	}) {
		if (!this.movementController) return;

		await this.movementController.movement({ state: state, direction: direction, data: data });
	}

	public async imitation({ state, type, data }: {
		state: 'start' | 'stop';
		type: 'hybrid' | 'walking' | 'looking' | 'speaking';
		data: any;
	}) {
		if (!this.imitationController) return;

		switch (type) {
			case 'hybrid':
				await this.imitationController.hybridImitation({ state: state, data: data }); break;
			case 'walking':
				await this.imitationController.walkingImitation({ state: state, data: data }); break;
		}
	}

	public async attack({ state, data }: {
		state: 'start' | 'stop';
		data: any;
	}) {
		if (!this.attackController) return;

		await this.attackController.attack({ state: state, data: data });
	}

	public async ghost({ state, data }: {
		state: 'start' | 'stop';
		data: any;
	}) {
		if (!this.ghostController) return;

		await this.ghostController.enableGhost({ state: state, data: data });
	}

	public async flight({ state, data }: {
		state: 'start' | 'stop';
		data: any;
	}) {
		if (!this.flightController) return;

		await this.flightController.enableFlight({ state: state, data: data });
	}
}

process.on('uncaughtException', err => {
	console.log('uncaughtException', err);
});

export default BotFlags;
export { Bot, STATISTICS, bots };