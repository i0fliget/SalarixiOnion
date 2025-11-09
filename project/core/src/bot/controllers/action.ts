import mineflayer from 'mineflayer';

import { Bot } from '../architecture.js';
import Generator from '../../tools/generator.js';
import BotFlags from '../architecture.js';

interface IncomingData {
  'jumping': {
		state: 'start' | 'stop';
    useSync: boolean;
    useAntiDetect: boolean;
		useImpulsiveness: boolean;
    minDelay: number;
		maxDelay: number;
	};
	'shifting': {
		state: 'start' | 'stop';
    useSync: boolean;
    useAntiDetect: boolean;
		useImpulsiveness: boolean;
		minDelay: number;
		maxDelay: number;
	};
	'spinning': {
		state: 'start' | 'stop';
    useImpulsiveness: boolean;
    useSync: boolean;
    useAntiDetect: boolean;
    minDelay: number;
		maxDelay: number;
	};
}

const generator = new Generator();

// Контроллер для управления действиями
class ActionController {
	constructor(
		public bot: mineflayer.Bot,
		public object: Bot,
		public flags: BotFlags
	) {
		this.bot = bot;
		this.object = object;
		this.flags = flags;
	}

	private async sleep(delay: number) {
		await new Promise(resolve => setTimeout(resolve, delay));
	}

	public async jumping({ state, data }: {
		state: 'start' | 'stop';
		data: IncomingData['jumping'] | undefined;
	}): Promise<void> {
		if (state === 'start') {
			if (!this.bot) return;
			if (this.flags.ACTIVE_JUMPING) return;

			if (!data) return;

			try {
				this.object.updateLoad('+', 2.8);

				this.flags.ACTIVE_JUMPING = true;

				if (data.useImpulsiveness) {
					while (this.flags.ACTIVE_JUMPING) {
						if (data.useSync) {
							await this.sleep(1200);
						} else {
							await this.sleep(generator.generateRandomNumberBetween(1000, 1800));
						}

						if (this.flags.ACTIVE_JUMPING) {
							this.bot.setControlState('jump', true);
							await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
							this.bot.setControlState('jump', false);

							if (data.useAntiDetect) {
								if (Math.random() > 0.5) {
									this.bot.setControlState('jump', true);
									await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
									this.bot.setControlState('jump', false);
								} else {
									this.bot.setControlState('jump', true);
									await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
									this.bot.setControlState('jump', false);

									this.bot.setControlState('jump', true);
									await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
									this.bot.setControlState('jump', false);
								}
							}
						}
					}
				} else {
					this.bot.setControlState('jump', true);
				}
			} catch {
				return;
			}
		} else if (state === 'stop') {
			if (!this.flags.ACTIVE_JUMPING) return;
			this.flags.ACTIVE_JUMPING = false;
			this.bot.setControlState('jump', false);

			this.object.updateLoad('-', 2.8);
		}
	}

	public async shifting({ state, data }: {
		state: 'start' | 'stop';
		data: IncomingData['shifting'] | undefined;
	}): Promise<void> {
		if (state === 'start') {
			if (!this.bot) return;
			if (this.flags.ACTIVE_SHIFTING) return;

			if (!data) return;

			try {
				this.object.updateLoad('+', 2.8);

				this.flags.ACTIVE_SHIFTING = true;

				if (data.useImpulsiveness) {
					while (this.flags.ACTIVE_SHIFTING) {
						if (data.useSync) {
							await this.sleep(1200);
						} else {
							await this.sleep(generator.generateRandomNumberBetween(1000, 1800));
						}

						if (this.flags.ACTIVE_SHIFTING) {
							this.bot.setControlState('sneak', true);
							await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
							this.bot.setControlState('sneak', false);

							if (data.useAntiDetect) {
								if (Math.random() > 0.5) {
									this.bot.setControlState('sneak', true);
									await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
									this.bot.setControlState('sneak', false);
								} else {
									this.bot.setControlState('sneak', true);
									await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
									this.bot.setControlState('sneak', false);

									this.bot.setControlState('sneak', true);
									await this.sleep(generator.generateRandomNumberBetween(data.minDelay, data.maxDelay));
									this.bot.setControlState('sneak', false);
								}
							}
						}
					}
				} else {
					this.bot.setControlState('sneak', true);
				}
			} catch {
				return;
			}
		} else if (state === 'stop') {
			if (!this.flags.ACTIVE_SHIFTING) return;
			this.flags.ACTIVE_SHIFTING = false;
			this.bot.setControlState('sneak', false);

			this.object.updateLoad('-', 2.8);
		}
	}

	public async spinning({ state, data }: {
		state: 'start' | 'stop';
		data: IncomingData['spinning'] | undefined;
	}): Promise<void> {
		if (state === 'start') {
			if (!this.bot) return;
			if (this.flags.ACTIVE_SPINNING) return;

			if (!data) return;

			try {
				this.object.updateLoad('+', 2.8);

				this.flags.ACTIVE_SPINNING = true;

				const spinSpeed = 5;

				if (data.useAntiDetect) {
					while (this.flags.ACTIVE_SPINNING) {
						if (data.useSync) {
							await new Promise(resolve => setTimeout(resolve, 1200));
						} else {
							await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(600, 1500)));
						}

						let currentSpeed = 1;

						if (Math.random() > 0.5) {
							currentSpeed = spinSpeed + generator.generateRandomNumberBetween(1, 3);
						} else {
							currentSpeed = spinSpeed - generator.generateRandomNumberBetween(1, 3);
						}

						if (Math.random() > 0.5) {
            	this.bot.entity.yaw += currentSpeed * Math.PI;
						} else {
							this.bot.entity.yaw += (currentSpeed * Math.PI) + 1;
						}

						this.bot.entity.pitch += generator.generateRandomNumberBetweenFloat(-0.04, 0.04);
						this.bot.entity.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.bot.entity.pitch));

            this.bot.look(this.bot.entity.yaw, this.bot.entity.pitch, true);
					}
				} else {
					while (this.flags.ACTIVE_SPINNING) {
						let currentSpeed = 1;

						await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(700, 1000)));

						if (Math.random() > 0.5) {
							currentSpeed = spinSpeed + generator.generateRandomNumberBetween(1, 3);
						} else {
							currentSpeed = spinSpeed - generator.generateRandomNumberBetween(1, 3);
						}

            this.bot.entity.yaw += (currentSpeed * Math.PI) + 1;

            this.bot.look(this.bot.entity.yaw, this.bot.entity.pitch, false);
					}
				}
			} catch {
				return;
			}
		} else if (state === 'stop') {
			if (!this.flags.ACTIVE_SPINNING) return;
			this.flags.ACTIVE_SPINNING = false;

			this.object.updateLoad('-', 2.8);
		}
	}
}

export default ActionController;