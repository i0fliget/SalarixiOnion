import { Bot } from 'mineflayer';

import { flow, updateBotTask } from '../base.js';
import { generateNumber } from '../tools/generator.js';
import { sleep } from '../tools/timer.js';


export class FlightPlugin {
  public async flow(username: string, bot: Bot, options: any) {
    await this.flight(username, bot, options);
  }

  public async flight(username: string, bot: Bot, options: any) {
    try {
      if (options.state === 'start') {
        if (flow[username]?.profile?.tasks.flight.status) return;

        updateBotTask(username, 'flight', true, 3.8);
        
        switch (options.type) {
          case 'default':
            await this.defaultFlight(username, bot, options); break;
          case 'jump':
            await this.jumpFlight(username, bot, options); break;
          case 'glitch':
            await this.glitchFlight(username, bot, options); break;
        }
      } else if (options.state === 'stop') {
        if (!flow[username]?.profile?.tasks.flight.status) return;

        updateBotTask(username, 'flight', false);
      }
    } catch {
      updateBotTask(username, 'flight', false);
    }
  }

  private async defaultFlight(username: string, bot: Bot, options: any) {
    if (!bot) return;

    while (flow[username]?.profile?.tasks.flight.status) {
      this.boost(bot);

      for (let i = 0; i < generateNumber('int', 1, options.useHighPower ? 3 : 2); i++) {
        this.smoothLift(bot);
        await sleep(false, { min: 5, max: 10 });
      }

      if (options.useHovering) {
        await this.hover(bot);
      }
      
      await sleep(false, { min: 100, max: 150 });
    }
  }

  private async jumpFlight(username: string, bot: Bot, options: any) {
    if (!bot) return;

    let isFirst = true;

    while (flow[username]?.profile?.tasks.flight.status) {
      this.boost(bot);

      bot.setControlState('jump', true);
        
      if (isFirst) {
        for (let i = 0; i < generateNumber('int', 1, options.useHighPower ? 3 : 2); i++) {
          this.smoothLift(bot);
          await sleep(false, { min: 5, max: 10 });
        }

        isFirst = false;
      }

      bot.setControlState('jump', false);

      if (options.useHovering) {
        await this.hover(bot);
      }
      
      await sleep(false, { min: 100, max: 150 });
    }
  }

  private async glitchFlight(username: string, bot: Bot, options: any) {
    if (!bot) return;

    let isFirst = true;

    while (flow[username]?.profile?.tasks.flight.status) {
      this.boost(bot);

      if (isFirst) {
        for (let i = 0; i < generateNumber('int', 1, options.useHighPower ? 3 : 2); i++) {
          this.smoothLift(bot);
          await sleep(false, { min: 5, max: 10 });
        }

        isFirst = false;
      }

      this.glitch(bot);

      if (options.useHovering) {
        await this.hover(bot);
      }

      await sleep(false, { min: 100, max: 150 });
    }
  }

  private boost(bot: Bot) {
    if (!bot) return;

    for (let i = 0; i < generateNumber('int', 2, 3); i++) {
      bot.entity.position.y = + bot.entity.position.y + generateNumber('float', 0.0004, 0.00055);
    }
  }

  private async smoothLift(bot: Bot) {
    if (!bot) return;

    if (Math.random() > 0.5) {
      bot.entity.position.y = bot.entity.position.y + generateNumber('float', 0.0000001, 0.00000015);
    } else {
      bot.entity.position.y = bot.entity.position.y + generateNumber('float', 0.0000001, 0.00000015);
      await sleep(false, { min: 30, max: 60 });
      bot.entity.position.y = bot.entity.position.y + generateNumber('float', 0.0000001, 0.00000015);
    }
  }
  
  private async glitch(bot: Bot) {
    if (!bot) return;

    const x = bot.entity.position.x;
    const z = bot.entity.position.z;

    const glitchDuration = generateNumber('float', 10, 50);

    const startTime = Date.now();
        
    while (Date.now() - startTime < glitchDuration) {
      bot.entity.position.x = x + generateNumber('float', -0.0012, 0.0012);
      bot.entity.position.z = z + generateNumber('float', -0.0012, 0.0012);

      await sleep(false, { min: 10, max: 15 });
    }

    this.boost(bot);

    bot.entity.position.x = x;
    bot.entity.position.z = z;
  }
  
  private async hover(bot: Bot) {
    if (!bot) return;

    const startTime = Date.now();
    const duration = generateNumber('float', 80, 100);
    const y = bot.entity.position.y;

    while (Date.now() - startTime < duration) {
      bot.entity.position.y = y + generateNumber('float', -0.0005, 0.0007);
      await sleep(false, { min: 5, max: 10 });
    }
  }
}