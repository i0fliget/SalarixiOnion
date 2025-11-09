import mineflayer, { ControlState } from 'mineflayer';
import { Movements } from 'mineflayer-pathfinder';
import { goals } from 'mineflayer-pathfinder';

import { Bot } from '../architecture.js';
import Generator from '../../tools/generator.js';
import BotFlags from '../architecture.js';

interface IncomingData {
  'hybrid': {
    useSmoothness: boolean;
    useLongDelays: boolean;
    useLooking: boolean;
    useWaving: boolean;
    useMultitasking: boolean;
	};
	'walking': {
		useSmoothness: boolean;
    useLongDelays: boolean;
    useSmartRoutes: boolean;
    useSprint: boolean;
    useMultitasking: boolean;
	};
}

let LATEST_DATA = {
	imitation: {
		hybrid: {
			chains: [] as string[],
			multitaskingAlgorithms: [] as string[]
		},
		walking: {
			chains: [] as string[],
			multitaskingAlgorithms: [] as string[]
		}
	}
} 

const generator = new Generator();

// Контроллер для управления имитацией
class ImitationController {
	constructor(
		public bot: mineflayer.Bot,
		public object: Bot,
		public flags: BotFlags
	) {
		this.bot = bot;
		this.object = object;
		this.flags = flags;
	}

	private async generateHybridChain(multitasking: boolean): Promise<string> {
		let chain = '';

		const actions = [
			'sneak',
			'jump',
			'forward',
			'back',
			'left',
			'right'
		];

		this.object.updateLoad('+', 0.3);

		for (let i = 0; i < 15; i++) {
			if (i !== 0) chain += '&';

			if (multitasking) {
				if (Math.random() >= 0.8) {
					chain += generator.chooseRandomValueFromArray(actions);
				} else {
					let string = '';

					while (true) {
						let generatedActions: string[] = [];

						for (let k = 0; k < generator.generateRandomNumberBetween(2, 6); k++) {
							let generate = '';

							while (true) {
								generate = generator.chooseRandomValueFromArray(actions);

								let valid = true;

								generatedActions.forEach((element) => {
									if (generate === element) {
										valid = false;
									}
								})

								if (valid) break;
							}

							generatedActions.push(generate);

							if (k !== 0) string += '-';
							
							string += generate;
						}

						generatedActions.length = 0;

						let valid = true;

						LATEST_DATA.imitation.hybrid.multitaskingAlgorithms.forEach(element => {
							if (string === element) {
								valid = false;
							}
						})

						if (valid) {
							LATEST_DATA.imitation.hybrid.multitaskingAlgorithms.push(string);

							if (LATEST_DATA.imitation.hybrid.multitaskingAlgorithms.length > 8) {
								LATEST_DATA.imitation.hybrid.multitaskingAlgorithms.length = 0;
							}

							chain += string;

							break;
						}
					}
				}
			} else {
				chain += generator.chooseRandomValueFromArray(actions);
			}

			if (Math.random() <= 0.1) {
				chain += `:${generator.chooseRandomValueFromArray(['0', '1', '2'])}:${generator.generateRandomNumberBetween(200, 4000)}`;
			} else {
				chain += `:${generator.chooseRandomValueFromArray(['0', '1', '2'])}:${generator.generateRandomNumberBetween(100, 200)}`;
			}
		}

		this.object.updateLoad('-', 0.3);

		return chain;
	}

	private async generateWalkingChain(multitasking: boolean): Promise<string> {
		let chain = '';

		const actions = [
			'forward',
			'back',
			'left',
			'right'
		];

		this.object.updateLoad('+', 0.3);

		for (let i = 0; i < 15; i++) {
			if (i !== 0) chain += '&';

			if (multitasking) {
				if (Math.random() >= 0.8) {
					chain += generator.chooseRandomValueFromArray(actions);
				} else {
					let string = '';

					while (true) {
						let generatedActions: string[] = [];

						for (let k = 0; k < generator.generateRandomNumberBetween(2, 4); k++) {
							let generate = '';

							while (true) {
								generate = generator.chooseRandomValueFromArray(actions);

								let valid = true;

								generatedActions.forEach(element => generate === element ? valid = false : valid = valid);
								
								if (valid) break;
							}

							generatedActions.push(generate);

							if (k !== 0) string += '-';
							
							string += generate;
						}

						generatedActions.length = 0;

						let valid = true;

						LATEST_DATA.imitation.walking.multitaskingAlgorithms.forEach(element => string === element ? valid = false : valid = valid);

						if (valid) {
							LATEST_DATA.imitation.walking.multitaskingAlgorithms.push(string);

							if (LATEST_DATA.imitation.walking.multitaskingAlgorithms.length > 8) {
								LATEST_DATA.imitation.walking.multitaskingAlgorithms.length = 0;
							}

							chain += string;

							break;
						}
					}
				}
			} else {
				chain += generator.chooseRandomValueFromArray(actions);
			}

			if (Math.random() <= 0.1) {
				chain += `:${generator.generateRandomNumberBetween(2000, 4000)}`;
			} else {
				chain += `:${generator.generateRandomNumberBetween(500, 2300)}`;
			}
		}

		this.object.updateLoad('-', 0.3);

		return chain;
	}

	private async looking({ useSmoothness, useLongDelays }: {
		useSmoothness: boolean;
		useLongDelays: boolean;
	}): Promise<void> {
		if (!this.bot) return;
		if (this.flags.ACTIVE_LOOKING) return;

		try {
			this.object.updateLoad('+', 4.5);

			this.flags.ACTIVE_LOOKING = true;

			while (this.flags.ACTIVE_LOOKING) {
				if (Math.random() >= 0.8) {
					const players = Object.values(this.bot.players); 
					let closestPlayer = null;
					let closestDistance = Infinity;

					for (const player of players) {
						if (player.entity) {
							const distance = this.bot.entity.position.distanceTo(player.entity.position);
							if (distance < closestDistance) {
								closestDistance = distance;
								closestPlayer = player;
							}
						}
					}

					if (closestPlayer) {
						const target = closestPlayer.entity;
						this.bot.lookAt(target.position.offset(Number(generator.chooseRandomValueFromArray([Math.random() / 3, -(Math.random() / 3)])), target.height, Number(generator.chooseRandomValueFromArray([Math.random() / 3, -(Math.random() / 3)]))), !useSmoothness);
					}
				} else {
					const yaw = Math.random();
					const pitch = Math.random() / 3;

					if (Math.random() >= 0.5) {
						this.bot.look(yaw, pitch, !useSmoothness);
					} else {
						this.bot.look(-yaw, -pitch, !useSmoothness);
					}
				}

				if (useLongDelays) {
					await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(1000, 2200)));
				} else {
					await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(250, 1000)));
				}
			}

			this.object.updateLoad('-', 4.5);
		} catch {
			return;
		}
	}

	private async waving({ useLongDelays }: { 
		useLongDelays: boolean;
	}): Promise<void> {
		if (!this.bot) return;
		if (this.flags.ACTIVE_WAVING) return;

		try {
			this.object.updateLoad('+', 3.2);

			this.flags.ACTIVE_WAVING = true;

			while (this.flags.ACTIVE_WAVING) {
				const randomChance = Math.random();

				if (randomChance >= 0.6) {
					this.bot.swingArm('right');
				} else if (randomChance < 0.6 && randomChance >= 0.3) {
					this.bot.swingArm('right');

					if (useLongDelays) {
						await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(250, 800)));
					} else {
						await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(50, 250)));
					}

					this.bot.swingArm('right');
				}

				if (useLongDelays) {
					await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(1800, 2500)));
				} else {
					await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(800, 1800)));
				}
			}

			this.object.updateLoad('-', 3.2);
		} catch {
			return;
		}
	}

	public async hybridImitation({ state, data }: {
		state: 'start' | 'stop';
		data: IncomingData['hybrid'] | undefined;
	}): Promise<void> {
		if (!this.bot) return;

		if (state === 'start') {
			if (this.flags.ACTIVE_HYBRID_IMITATION) return;
			if (this.flags.ACTIVE_JUMPING || this.flags.ACTIVE_SHIFTING || this.flags.ACTIVE_MOVEMENT) return;

			if (!data) return;

			try {
				this.object.updateLoad('+', 4.4);

				this.flags.ACTIVE_JUMPING = true;
				this.flags.ACTIVE_SHIFTING = true;
				this.flags.ACTIVE_MOVEMENT = true;
				this.flags.ACTIVE_HYBRID_IMITATION = true;

				while (this.flags.ACTIVE_HYBRID_IMITATION) {
					let chain = '';

					while (true) {
						chain = await this.generateHybridChain(data.useMultitasking);

						let valid = true;

						LATEST_DATA.imitation.hybrid.chains.forEach(element => chain === element ? valid = false : valid = valid);

						if (valid) break;
					}

					LATEST_DATA.imitation.hybrid.chains.push(chain);

					if (LATEST_DATA.imitation.hybrid.chains.length > 20) {
						LATEST_DATA.imitation.hybrid.chains.shift();
					}

					const operations = chain.split('&');

					if (data.useLooking) this.looking({ useSmoothness: data.useSmoothness, useLongDelays: data.useLongDelays });
					if (data.useWaving) this.waving({ useLongDelays: data.useLongDelays });
						
					for (const operation of operations) {
						const actions = operation.split(':')[0].split('-');
						const mode = Number(operation.split(':')[1]);
						const delay = Number(operation.split(':')[2]);

						let usedActions: ControlState[] = [];

						for (const action of actions) {
							if (!this.flags.ACTIVE_HYBRID_IMITATION || !this.flags.ACTIVE_MOVEMENT || !this.flags.ACTIVE_SHIFTING || !this.flags.ACTIVE_JUMPING) break;

							this.bot.setControlState(action as ControlState, true);
							usedActions.push(action as ControlState);

							if (data.useLongDelays) {
								await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(200, 800)));
							} else {
								await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(100, 200)));
							}
						}

						if (mode === 1) {
							if (usedActions.includes('forward')) {
								this.bot.setControlState('sprint', true);
								usedActions.push('sprint');
							}

							await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(1000, 4000)));
						} else if (mode === 2) {
							if (usedActions.includes('forward')) {
								if (Math.random() > 0.5) {
									this.bot.setControlState('sprint', true);
									usedActions.push('sprint');
								}
							}

							await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(3000, 6000)));
						} else {
							await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(500, 2000)));
						}

						usedActions.forEach(action => this.bot.setControlState(action, false));
						usedActions.length = 0;

						await new Promise(resolve => setTimeout(resolve, delay));
					}
				}
			} catch {
				return;
			}
		} else if (state === 'stop') {
			if (!this.flags.ACTIVE_HYBRID_IMITATION) return;

			this.flags.ACTIVE_HYBRID_IMITATION = false;
			this.flags.ACTIVE_JUMPING = false;
			this.flags.ACTIVE_SHIFTING = false;
			this.flags.ACTIVE_MOVEMENT = false;
			this.flags.ACTIVE_LOOKING = false;
			this.flags.ACTIVE_WAVING = false;

			LATEST_DATA.imitation.hybrid.chains.length = 0;

			this.object.updateLoad('-', 4.4);
		}
	}

	public async walkingImitation({ state, data }: {
		state: 'start' | 'stop';
		data: IncomingData['walking'] | undefined;
	}): Promise<void> {
		if (!this.bot) return;
		
		if (state === 'start') {
			if (this.flags.ACTIVE_WALKING_IMITATION) return;
			if (this.flags.ACTIVE_MOVEMENT) return;

			if (!data) return;

			try {
				this.object.updateLoad('+', 3.8);

				this.flags.ACTIVE_MOVEMENT = true;
				this.flags.ACTIVE_WALKING_IMITATION = true;

				while (this.flags.ACTIVE_WALKING_IMITATION) {
					if (data.useSmartRoutes) {
						const defaultMove = new Movements(this.bot);

						defaultMove.canDig = false;
						defaultMove.allowParkour = false;
						defaultMove.allowEntityDetection = false;
						defaultMove.allowFreeMotion = false;

						this.bot.pathfinder.setMovements(defaultMove);

						const x = this.bot.entity.position.x + generator.generateRandomNumberBetween(-5, 5);
						const z = this.bot.entity.position.z + generator.generateRandomNumberBetween(-5, 5);

						const goal = new goals.GoalNear(x, this.bot.entity.position.y, z, 1);

						this.bot.pathfinder.setGoal(goal);

						if (!this.flags.ACTIVE_WALKING_IMITATION) break;

						if (data.useLongDelays) {
							await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(8000, 20000)));
						} else {
							await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(5000, 15000)));
						}
					} else {
						let chain = '';

						while (true) {
							chain = await this.generateWalkingChain(data.useMultitasking);

							let valid = true;

							LATEST_DATA.imitation.walking.chains.forEach(element => chain === element ? valid = false : valid = valid);

							if (valid) break;
						}

						if (!this.flags.ACTIVE_WALKING_IMITATION) break;

						LATEST_DATA.imitation.walking.chains.push(chain);

						if (LATEST_DATA.imitation.walking.chains.length > 20) {
							LATEST_DATA.imitation.walking.chains.shift();
						}

						const operations = chain.split('&');
							
						for (const operation of operations) {
							if (!this.flags.ACTIVE_WALKING_IMITATION) break;

							const actions = operation.split(':')[0].split('-');
							const delay = Number(operation.split(':')[1]);

							let usedActions: ControlState[] = [];

							for (const action of actions) {
								if (!this.flags.ACTIVE_WALKING_IMITATION) break;

								this.bot.setControlState(action as ControlState, true);
								usedActions.push(action as ControlState);

								if (data.useLongDelays) {
									await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(200, 800)));
								} else {
									await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(100, 200)));
								}
							}

							if (data.useSprint) {
								if (usedActions.includes('forward') && Math.random() > 0.7) {
									this.bot.setControlState('sprint', true);
									usedActions.push('sprint');
								}
							}

							await new Promise(resolve => setTimeout(resolve, generator.generateRandomNumberBetween(1000, 5000)));

							usedActions.forEach((action) => {
								this.bot.setControlState(action, false);
							})

							usedActions.length = 0;

							await new Promise(resolve => setTimeout(resolve, delay));
						}
					}
				}
			} catch {
				return;
			}
		} else if (state === 'stop') {
			if (!this.flags.ACTIVE_WALKING_IMITATION) return;

			this.flags.ACTIVE_WALKING_IMITATION = false;
			this.flags.ACTIVE_MOVEMENT = false;

			this.bot.pathfinder.stop();

			this.object.updateLoad('-', 3.8);
		}
	}
}

export default ImitationController;