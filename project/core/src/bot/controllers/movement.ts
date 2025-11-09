import mineflayer from 'mineflayer';

import { Bot } from '../architecture.js';
import Generator from '../../tools/generator.js';
import BotFlags from '../architecture.js';

interface IncomingData {
  useSync: boolean;
  useAntiDetect: boolean;
	useImpulsiveness: boolean;
}

const generator = new Generator();

// Контроллер для управления движением
class MovementController {
 	constructor(
		public bot: mineflayer.Bot,
		public object: Bot,
		public flags: BotFlags
	) {
		this.bot = bot;
		this.object = object;
		this.flags = flags;
	}

	public async movement({ state, direction, data }: {
		state: 'start' | 'stop';
		direction?: 'forward' | 'back' | 'left' | 'right';
		data: IncomingData;
	}): Promise<void> {
		if (state === 'start') {
			if (this.flags.ACTIVE_MOVEMENT) return;

			if (!data) return;

			try {
				this.object.updateLoad('+', 2.8);

				this.flags.ACTIVE_MOVEMENT = true;

				if (data.useImpulsiveness) {
					const generateDelay = (): number => {
						const randomChance = Math.random();

						if (data.useSync) {
							if (randomChance >= 0.5) {
								return 600;
							} else {
								return 900;
							}
						} else {
							if (randomChance >= 0.5) {
								return generator.generateRandomNumberBetween(400, 1000);
							} else {
								return generator.generateRandomNumberBetween(1000, 2000);
							}
						}
					}

					while (this.flags.ACTIVE_MOVEMENT) {
						await new Promise(resolve => setTimeout(resolve, generateDelay()));

						if (!this.flags.ACTIVE_MOVEMENT) return;

						if (!direction) return;

						this.bot.setControlState(direction, true);
						await new Promise(resolve => setTimeout(resolve, generateDelay()));
						this.bot.setControlState(direction, false);
						await new Promise(resolve => setTimeout(resolve, generateDelay()));

						if (Math.random() >= 0.58) {
							if (!this.flags.ACTIVE_MOVEMENT) return;

							this.bot.setControlState(direction, true);
							await new Promise(resolve => setTimeout(resolve, generateDelay()));
							this.bot.setControlState(direction, false);
							await new Promise(resolve => setTimeout(resolve, generateDelay()));
						}
					}
				} else {
					if (!direction) return;
					
					this.bot.setControlState(direction, true);
				}
			} catch {
				return;
			}
		} else if (state === 'stop') {
			if (!this.flags.ACTIVE_MOVEMENT) return;

			this.flags.ACTIVE_MOVEMENT = false;

			this.object.updateLoad('-', 2.8);
		}
	}
}

export default MovementController;