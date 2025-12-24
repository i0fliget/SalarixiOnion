import { Bot } from 'mineflayer';

import { flow, updateBotTask } from '../base.js';
import { randint } from '../tools/generator.js';
import { sleep } from '../tools/timer.js';


export class FlightPlugin {
  private minDelay: number = 0;
  private maxDelay: number = 0;

  private minChangeY: number = 0;
  private maxChangeY: number = 0;

  public async flow(username: string, bot: Bot, options: any) {
    try {
      if (options.state === 'start') {
        if (flow[username]?.profile?.tasks.flight.status) return;

        updateBotTask(username, 'flight', true, 3.8);

        options.minDelay ? this.minDelay = options.minDelay : this.minDelay = 100;
        options.maxDelay ? this.maxDelay = options.maxDelay : this.maxDelay = 150;

        options.minChangeY ? this.minChangeY = options.minChangeY : this.minChangeY = 0.00001;
        options.maxChangeY ? this.maxChangeY = options.maxChangeY : this.maxChangeY = 0.000015;

        switch (options.type) {
          case 'default':
            await this.defaultFlight(username, bot, options); break;
          case 'jump':
            await this.jumpFlight(username, bot, options); break;
          case 'glitch':
            await this.glitchFlight(username, bot, options); break;
          case 'inertia':
            await this.inertiaFlight(username, bot, options); break;
        }
      } else if (options.state === 'stop') {
        if (!flow[username]?.profile?.tasks.flight.status) return;

        updateBotTask(username, 'flight', false);

        this.minDelay = 0;
        this.maxDelay = 0;
        this.minChangeY = 0;
        this.maxChangeY = 0;
      }
    } catch {
      updateBotTask(username, 'flight', false);
    }
  }

  private async defaultFlight(username: string, bot: Bot, options: any) {
    if (!bot) return;

    while (flow[username]?.profile?.tasks.flight.status) {
      this.boost(bot);

      for (let i = 0; i < randint('int', 1, options.useHighPower ? 3 : 2); i++) {
        this.smoothLift(bot);
        await sleep(false, { min: 5, max: 10 });
      }

      if (options.useHovering) {
        await this.hover(bot);
      }
      
      await sleep(false, { min: this.minDelay, max: this.maxDelay });
    }
  }

  private async jumpFlight(username: string, bot: Bot, options: any) {
    if (!bot) return;

    let isFirst = true;

    while (flow[username]?.profile?.tasks.flight.status) {
      this.boost(bot);

      bot.setControlState('jump', true);
        
      if (isFirst) {
        for (let i = 0; i < randint('int', 1, options.useHighPower ? 3 : 2); i++) {
          this.smoothLift(bot);
          await sleep(false, { min: 5, max: 10 });
        }

        isFirst = false;
      }

      bot.setControlState('jump', false);

      if (options.useHovering) {
        await this.hover(bot);
      }
      
      await sleep(false, { min: this.minDelay, max: this.maxDelay });
    }
  }

  private async glitchFlight(username: string, bot: Bot, options: any) {
    if (!bot) return;

    let isFirst = true;

    while (flow[username]?.profile?.tasks.flight.status) {
      this.boost(bot);

      if (isFirst) {
        for (let i = 0; i < randint('int', 1, options.useHighPower ? 3 : 2); i++) {
          this.smoothLift(bot);
          await sleep(false, { min: 5, max: 10 });
        }

        isFirst = false;
      }

      this.glitch(bot);

      if (options.useHovering) {
        await this.hover(bot);
      }

      await sleep(false, { min: this.minDelay, max: this.maxDelay });
    }
  }

  private async inertiaFlight(username: string, bot: Bot, options: any) {
    if (!bot) return;

    let isFirst = true;

    while (flow[username]?.profile?.tasks.flight.status) {
      this.velocityBoost(bot);

      if (isFirst) {
        for (let i = 0; i < randint('int', 1, options.useHighPower ? 3 : 2); i++) {
          this.smoothInertiaLift(bot);
          await sleep(false, { min: 5, max: 10 });
        }

        isFirst = false;
      }

      if (options.useHovering) {
        await this.hover(bot);
      }

      await sleep(false, { min: this.minDelay, max: this.maxDelay });
    }
  }

  private boost(bot: Bot) {
    if (!bot) return;

    for (let i = 0; i < randint('int', 2, 3); i++) {
      bot.entity.position.y = + bot.entity.position.y + randint('float', this.minChangeY, this.maxChangeY);
    }
  }

  private async velocityBoost(bot: Bot) {
    if (!bot) return;

    const velocityY = bot.entity.velocity.y;

    bot.entity.velocity.y = + bot.entity.velocity.y + randint('float', this.minChangeY, this.maxChangeY);
    setTimeout(() => bot.entity.velocity.y = velocityY, randint('int', 80, 120));
  }

  private async smoothLift(bot: Bot) {
    if (!bot) return;

    if (Math.random() > 0.5) {
      bot.entity.position.y = bot.entity.position.y + randint('float', this.minChangeY, this.maxChangeY);
    } else {
      bot.entity.position.y = bot.entity.position.y + randint('float', this.minChangeY, this.maxChangeY);
      await sleep(false, { min: 30, max: 60 });
      bot.entity.position.y = bot.entity.position.y + randint('float', this.minChangeY, this.maxChangeY);
    }
  }

  private async smoothInertiaLift(bot: Bot) {
    if (!bot) return;

    const velocityY = bot.entity.velocity.y;

    bot.entity.velocity.y = bot.entity.velocity.y + randint('float', this.minChangeY, this.maxChangeY);
    setTimeout(() => bot.entity.velocity.y = velocityY, randint('int', 100, 150));
  }
  
  private async glitch(bot: Bot) {
    if (!bot) return;

    const x = bot.entity.position.x;
    const z = bot.entity.position.z;

    const glitchDuration = randint('float', 10, 50);

    const startTime = Date.now();
        
    while (Date.now() - startTime < glitchDuration) {
      bot.entity.position.x = x + randint('float', -0.0012, 0.0012);
      bot.entity.position.z = z + randint('float', -0.0012, 0.0012);

      await sleep(false, { min: 10, max: 15 });
    }

    this.boost(bot);

    bot.entity.position.x = x;
    bot.entity.position.z = z;
  }
  
  private async hover(bot: Bot) {
    if (!bot) return;

    const startTime = Date.now();
    const duration = randint('float', 80, 100);
    const y = bot.entity.position.y;

    while (Date.now() - startTime < duration) {
      bot.entity.position.y = y + randint('float', -0.0005, 0.0007);
      await sleep(false, { min: 5, max: 10 });
    }
  }
}