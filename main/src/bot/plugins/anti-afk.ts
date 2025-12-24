import { Bot, ControlState } from 'mineflayer';
import { Vec3 } from 'vec3';

import { flow, updateBotTask } from '../base.js';
import { randint, randelem } from '../tools/generator.js';


export class AntiAfkPlugin {
  private intervals: Map<string, any> = new Map();

  public async flow(username: string, bot: Bot, options: any) {
    try {
      if (options.state === 'start') {
        updateBotTask(username, 'antiAfk', true, 2.1);

        this.intervals.set(username, setInterval(() => {
          if (!flow[username]?.profile?.tasks.antiAfk.status) {
            clearInterval(this.intervals.get(username));
            return;
          }

          this.randomize(username, bot);
        }, randint('float', options.minDelay ? options.minDelay : 2000, options.maxDelay ? options.maxDelay : 5000)));
      } else {
        if (flow[username]?.profile?.tasks) {
          clearInterval(this.intervals.get(username));
          flow[username].profile.tasks.antiAfk.status = false;
          updateBotTask(username, 'antiAfk', false);
        }
      }
    } catch {
      updateBotTask(username, 'antiAfk', false);
    }
  }

  private randomize(username: string, bot: Bot) {
    if (!bot) return;
    if (flow[username]?.profile?.tasks.jumping.status) return;

    const randomChance = randint('float', 0, 1);

    let states: ControlState[] = [];

    if (randomChance >= 0.8) {
      bot.setControlState('jump', true);
      bot.setControlState('sneak', true);
      states.push('jump', 'sneak');
    } else if (randomChance < 0.8 && randomChance >= 0.5) {
      const x = bot.entity.position.x + randint('float', -5, 5);
      const y = bot.entity.position.y + randint('float', -(bot.entity.position.y * 0.2), bot.entity.position.y * 0.2);
      const z = bot.entity.position.z + randint('float', -5, 5);
      const vector = new Vec3(x, y, z);
      bot.lookAt(vector);
    } else {
      const directions: ControlState[] = ['forward', 'back', 'left', 'right'];
      const direction = randelem(directions);
      bot.setControlState(direction, true);
      states.push(direction);
    }

    if (states.length > 0) {
      setTimeout(() => states.forEach(s => bot.setControlState(s, false)), randint('float', 500, 800));
    }
  }
}
