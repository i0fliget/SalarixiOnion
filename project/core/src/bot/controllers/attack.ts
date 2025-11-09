import mineflayer from 'mineflayer';

import { Bot } from '../architecture.js';
import BotFlags from '../architecture.js';

interface IncomingData {
  useLongDelays: boolean;
	useSmoothness: boolean;
  useAntiDetect: boolean;
	useImprovedStrikes: boolean;
}

// Контроллер для управления движением
class AttackController {
 	constructor(
		public bot: mineflayer.Bot,
		public object: Bot,
		public flags: BotFlags
	) {
		this.bot = bot;
		this.object = object;
		this.flags = flags;
	}

	public async attack({ state, data }: {
		state: 'start' | 'stop';
		data?: IncomingData;
	}): Promise<void> {
		if (state === 'start') {
			if (this.flags.ACTIVE_ATTACKING) return;

			if (!data) return;

			try {
				this.object.updateLoad('+', 4.8);

				this.flags.ACTIVE_ATTACKING = true;

				while (this.flags.ACTIVE_ATTACKING) {
					if (data.useLongDelays) {
						await new Promise(resolve => setTimeout(resolve, 400, 800));
					} else {
						await new Promise(resolve => setTimeout(resolve, 100, 400));
					}

					let target; 

					await new Promise(resolve => setTimeout(resolve, 1000, 2000));

					if (!this.flags.ACTIVE_ATTACKING) return;

				  target = this.bot.nearestEntity();

					if (target) this.bot.lookAt(target.position, false);

					if (data.useLongDelays) {
						await new Promise(resolve => setTimeout(resolve, 500, 1000));
					} else {
						await new Promise(resolve => setTimeout(resolve, 100, 500));
					}

					target = this.bot.nearestEntity();

					if (target) {
						this.bot.lookAt(target.position, true);
						await new Promise(resolve => setTimeout(resolve, 60, 100));
						this.bot.attack(target);
					}
				}
			} catch {
				return;
			}
		} else if (state === 'stop') {
			if (!this.flags.ACTIVE_ATTACKING) return;

			this.flags.ACTIVE_ATTACKING = false;

			this.object.updateLoad('-', 4.8);
		}
	}
}

export default AttackController;