import mineflayer from 'mineflayer';

import { Bot } from '../architecture.js';
import BotFlags from '../architecture.js';

// Структура входящих данных
interface IncomingData {
	type: 'default' | 'jump-fly' | 'velocity';
}

// Контроллер для управления призраком
class FlightController {
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

  public async enableFlight({ state, data }: {
    state: 'start' | 'stop',
    data: IncomingData
  }) {
    try {
      if (state === 'start') {
        if (!data) return;

        this.flags.ACTIVE_FLIGHT = true;
        
        switch (data.type) {
          case 'jump-fly':
            await this.enableJumpFly();
        }
      } else if (state === 'stop') {
        if (!this.bot) return;
        if (!this.flags.ACTIVE_FLIGHT) return;

        this.flags.ACTIVE_FLIGHT = false;
      }
    } catch {
      this.flags.ACTIVE_FLIGHT = false;
    }
  }

  private async enableJumpFly() {
    this.bot.setControlState('jump', true);
    await this.sleep(100 + Math.random() * 50);
    this.bot.setControlState('jump', false);

    const interval = setInterval(async () => {
      if (!this.flags.ACTIVE_FLIGHT) {
        clearInterval(interval);
        return;
      }

      await this.microLift();
    }, 10 + Math.random() * 50);
  }
    
  private async microLift() {
    const startY = this.bot.entity.position.y;

    this.bot.entity.position.y = startY + 0.2;
  }
    
  /*
  private async hover() {
    const hoverY = this.bot.entity.position.y;
    const hoverDuration = 50 + Math.random() * 100;
    const startTime = Date.now();
        
    while (Date.now() - startTime < hoverDuration) {
      this.bot.entity.position.y = hoverY + (Math.random() - 0.5) * 0.1;
      await this.sleep(20);
    }
  }
    */
}

export default FlightController;