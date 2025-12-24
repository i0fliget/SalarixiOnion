import { Bot } from 'mineflayer';

import { flow, updateBotTask } from '../base.js';
import { sleep } from '../tools/timer.js';


export class MovePlugin {
  public async flow(username: string, bot: Bot, options: any) {
    await this.move(username, bot, options);
  }

  private async move(username: string, bot: Bot, options: any) {
    let name: any;

    switch (options.direction) {
      case 'forward':
        name = 'moveForward'; break;
      case 'back':
        name = 'moveBack'; break;
      case 'left':
        name = 'moveLeft'; break;
      case 'right':
        name = 'moveRight'; break;
    }

    if (options.state === 'start') {
      if (!name) return;
      if (!bot) return;

      updateBotTask(username, name, true, 1.8);

      try {
        if (options.useImpulsiveness) {
          while (flow[username]?.profile?.tasks[name].status) {
            await sleep(options.useSync, { min: 400, max: 2000, key: name });

            if (!flow[username]?.profile?.tasks[name].status) break;

            bot.setControlState(options.direction, true);
            await sleep(options.useSync, { min: 400, max: 2000, key: name });
            bot.setControlState(options.direction, false);
            await sleep(options.useSync, { min: 400, max: 2000, key: name });

            if (Math.random() >= 0.58) {
              if (!flow[username]?.profile?.tasks[name].status) break;

              bot.setControlState(options.direction, true);
              await sleep(options.useSync, { min: 400, max: 2000, key: name });
              bot.setControlState(options.direction, false);
              await sleep(options.useSync, { min: 400, max: 2000, key: name });
            }
          }
        } else {
          bot.setControlState(options.direction, true);
        }
      } catch {
        bot.setControlState(options.direction, false);
        updateBotTask(username, name, false);
      }
    } else if (options.state === 'stop') {
      if (!name) return;
      if (!bot) return;
      if (!flow[username]?.profile?.tasks[name].status) return;

      bot.setControlState(options.direction, false);
      updateBotTask(username, name, false);
    }
  }
}