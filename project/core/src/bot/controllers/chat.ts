import mineflayer from 'mineflayer';

import { Bot } from '../architecture.js';
import Generator from '../../tools/generator.js';
import Mutator from '../../tools/mutator.js';
import BotFlags from '../architecture.js';

let sync = {
	spamming: {
		use: 0,
		delay: 0
	}
}

const mutator = new Mutator();
const generator = new Generator();

// Структура входящих данных
interface IncomingData {
	'default': {
		from: string;
		message: string;
    useMagicText: boolean;
		useTextMutation: boolean;
    useSync: boolean;
	};
	'spamming': {
		state: 'start' | 'stop';
		from: string;
    message: string;
    minDelay: number;
		maxDelay: number;
    useMagicText: boolean;
    useTextMutation: boolean;
    useSync: boolean;
    useAntiRepetition: boolean;
	};
}

// Контроллер для управления чатом
class ChatController {
	constructor(
		public bot: mineflayer.Bot,
		public object: Bot,
		public flags: BotFlags
	) {
		this.bot = bot;
		this.object = object;
		this.flags = flags;
	}

	private createMagicText(text: string) {
		let magicText = '';

		const words = text.split(' ');

		for (const word of words) {
			const randomChance = Math.random();

			magicText += ' ';

			if (word.includes('http://') || word.includes('https://')) {
				magicText += word;
			} else {
				if (randomChance >= 0.9) {
					magicText += word.toLowerCase();
				} else if (randomChance < 0.9 && randomChance > 0.75) {
					magicText += word.toUpperCase();
				} else {
					for (const char of word) {
						const randomChance = Math.random();

						if (randomChance >= 0.70) {
							magicText += char.toLowerCase()
								.replace(/o/g, () => Math.random() > 0.5 ? '0' : '@')
								.replace(/о/g, () => Math.random() > 0.5 ? '0' : '@')
								.replace(/a/g, '4')
								.replace(/а/g, '4')
								.replace(/z/g, '3')
								.replace(/з/g, '3')
								.replace(/e/g, '3')
								.replace(/е/g, '3')
								.replace(/i/g, () => Math.random() > 0.5 ? '1' : '!')
								.replace(/l/g, () => Math.random() > 0.5 ? '1' : '!')
								.replace(/л/g, () => Math.random() > 0.5 ? '1' : '!')
								.replace(/и/g, () => Math.random() > 0.5 ? '1' : '!')
								.replace(/п/g, '5')
								.replace(/p/g, '5')
								.replace(/v/g, () => Math.random() > 0.5 ? '8' : '&')
								.replace(/в/g, () => Math.random() > 0.5 ? '8' : '&')
								.replace(/б/g, '6')
								.replace(/b/g, '6')
								.replace(/с/g, '$')
								.replace(/s/g, '$');
						} else if (randomChance < 0.70 && randomChance >= 0.5) {
							magicText += char.toUpperCase()
						} else {
							magicText += char;
						}
					}
				}
			}
		}

		return magicText;
	} 

	public async send(data: IncomingData['default']) {
		if (!this.bot) return;

		try {
			this.object.updateLoad('+', 0.3);

			let text = '';

			if (data.useTextMutation) {
				const players = Object.keys(this.bot.players);
						
				text = mutator.mutateString({ 
					type: 'message', 
					input: data.message, 
					data: { 
						players: players
					} 
				});
			} else {
				text = data.message;
			}

			if (!data.useSync) await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(200, 4000)));

			if (data.useMagicText) text = this.createMagicText(text);

			if (data.from === '@all') {
				this.bot.chat(text);
			} else {
				if (this.object.nickname === data.from) this.bot.chat(text);
			}

			this.object.updateLoad('-', 0.3);
		} catch {
			return;
		}
	}

	public async spamming(data: IncomingData['spamming']) {
		if (data.state === 'start') {
			if (!this.bot) return;
			if (this.flags.ACTIVE_SPAMMING) return;

			try {
				this.object.updateLoad('+', 3.4);

				this.flags.ACTIVE_SPAMMING = true;

				let lastTexts: string[] = [];

				while (this.flags.ACTIVE_SPAMMING) {
					let text = '';

					if (data.useTextMutation) {
						const players = Object.keys(this.bot.players);
						
						text = mutator.mutateString({ 
							type: 'message', 
							input: data.message, 
							data: { 
								players: players
							} 
						});
					} else {
						text = data.message;
					}

					if (!data.useSync) {
						await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(data.minDelay, data.maxDelay)));
					} else {
						if (sync.spamming.use >= this.object.quantity) {
							sync.spamming.delay = 0;
							sync.spamming.use = 0;
						}
						
						if (!sync.spamming.delay) sync.spamming.delay = generator.generateRandomNumberBetween(data.minDelay, data.maxDelay);

						sync.spamming.use++;

						await new Promise(resolve => setTimeout(resolve, sync.spamming.delay));
					}
			
					if (data.useMagicText) text = this.createMagicText(text);

					if (this.flags.ACTIVE_SPAMMING) {
						let valid = true;

						if (data.useAntiRepetition) {
							lastTexts.forEach(element => text === element ? valid = false : valid = valid);

							if (valid) {
								lastTexts.push(text);
								if (lastTexts.length > 5) lastTexts.shift();
							}
						} 

						if (valid) {
							if (data.from === '@all') {
								this.bot.chat(text);
							} else {
								if (this.object.nickname === data.from) this.bot.chat(text);
							}
						}
					}
				}
			} catch {
				return;
			}
		} else if (data.state === 'stop') {
			if (!this.flags.ACTIVE_SPAMMING) return;
			this.flags.ACTIVE_SPAMMING = false;

			this.object.updateLoad('-', 3.4);
		}
	}
}

export default ChatController;