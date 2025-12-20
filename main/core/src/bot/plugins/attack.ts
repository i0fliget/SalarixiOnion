import { ControlState, Bot } from 'mineflayer';
import { Vec3 } from 'vec3';

import { flow, updateBotTask } from '../base.js';
import { generateNumber, chooseRandomElementFromArray } from '../tools/generator.js';
import { sleep } from '../tools/timer.js';


export class AttackPlugin {
  private before: any = {};

  public async flow(username: string, bot: Bot, options: any) {
    await this.attack(username, bot, options);
  }

  private setup(username: string, bot: Bot) {
    if (!bot) return;

    this.before[username] = {
      pitch: bot.entity.pitch,
      yaw: bot.entity.yaw
    };

    const items = bot.inventory.items();

    for (const item of items) {
      if (!bot) return;
      
      if (item.name.includes('sword') || item.name.includes('axe')) {
        if (item.slot > 8) {
          bot.moveSlotItem(item.slot, 0);
          bot.setQuickBarSlot(0);
        } else {
          bot.setQuickBarSlot(item.slot);
        }

        break;
      }
    }
  }

  private reset(username: string, bot: Bot) {
    if (!bot) return;

    bot.setControlState('jump', false);
    bot.setControlState('sneak', false);

    const current = this.before[username];

    if (current) {
      bot.look(current.yaw, current.pitch, false);
    }
  }

  private async aiming(username: string, bot: Bot, type: any) {
    const interval = setInterval(() => {
      if (!flow[username]?.profile?.tasks.attack.status) {
        clearInterval(interval);
        return;
      }

      if (!bot) return;

      const target = bot.nearestEntity();

      if (target) {
        if ((type === 'all' && (target.type === 'mob' || target.type === 'player')) || type === target.type) {
          const impreciseVector = new Vec3(target.position.x + generateNumber('float', -0.6, 0.6), target.position.y + generateNumber('float', -0.1, 0.1), target.position.z + generateNumber('float', -0.6, 0.6));

          bot.lookAt(impreciseVector, Math.random() > 0.5 ? true : false);
        }
      }
    }, generateNumber('float', 1000, 2500));
  }

  private dodging(username: string, bot: Bot) {
    const interval = setInterval(async () => {
      if (!flow[username]?.profile?.tasks.attack.status) {
        clearInterval(interval);
        return;
      }

      if (!bot) return;

      const directions1: ControlState[] = ['forward', 'back'];
      const directions2: ControlState[] = ['left', 'right'];

      const direction1: ControlState = chooseRandomElementFromArray(directions1);
      const direction2: ControlState = chooseRandomElementFromArray(directions2);

      bot.setControlState(direction1, true);
      bot.setControlState(direction2, true);

      await sleep(false, { min: 150, max: 300 });

      bot.setControlState(direction1, false);
      bot.setControlState(direction2, false);
    }, generateNumber('float', 400, 600));
  }

  private async hit(bot: Bot, options: any) {
    if (!bot) return;

    const target = bot.nearestEntity();

    if (!target) return;

    if ((options.target === 'all' && (target.type === 'mob' || target.type === 'player')) || options.target === target.type) {
      if (bot.entities[target.id]) {
        if (options.useImitationOfMisses && Math.random() > 0.9) {
          bot.lookAt(target.position.offset(0, target.height ?? 1.6, 0), options.useNeatness ? false : true);
          bot.swingArm('right');
        } else {
          if (bot.entity.position.distanceTo(target.position) <= options.distance) {
            if (options.useImprovedStrikes) {
              bot.setControlState('back', true);
              await sleep(false, { min: 200, max: 300 });
              bot.setControlState('back', false);
              bot.setControlState('forward', true);
            }

            bot.lookAt(target.position.offset(0, target.height ?? 1.6, 0), options.useNeatness ? false : true);
            await sleep(false, { min: 50, max: 150 });
            bot.lookAt(target.position.offset(0, target.height ?? 1.6, 0), true);
            bot.attack(target);

            if (bot.getControlState('forward')) {
              bot.setControlState('back', false);
            }
          }
        }
      }
    }
  }

  private async attack(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;
      if (flow[username]?.profile?.tasks.attack.status) return;

      if (!options) return;

      updateBotTask(username, 'attack', true, 4.8);

      if (options.useDodging) this.dodging(username, bot);

      this.setup(username, bot);
      this.aiming(username, bot, options.target);

      while (flow[username]?.profile?.tasks.attack.status) {
        await sleep(false, { min: options.minDelay, max: options.maxDelay });

        if (!flow[username]?.profile?.tasks.attack.status) return;

        this.hit(bot, options);

        await sleep(false, { min: options.useLongDelays ? 700 : 500, max: options.useLongDelays ? 900 : 650 });

        if (options.useImprovedStrikes) {
          const action: ControlState = chooseRandomElementFromArray(['jump', 'sneak']);

          bot.setControlState(action, true);
          this.hit(bot, options);
          await sleep(false, { min: options.useLongDelays ? 500 : 300, max: options.useLongDelays ? 700 : 450 });
          bot.setControlState(action, false);
        }
      }
    } else if (options.state === 'stop') {
      if (!bot) return;
      if (!flow[username]?.profile?.tasks.attack.status) return;

      this.reset(username, bot);

      updateBotTask(username, 'attack', false);
    }
  }
}