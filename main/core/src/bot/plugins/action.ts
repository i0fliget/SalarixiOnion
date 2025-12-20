import { Bot } from 'mineflayer';

import { flow, updateBotTask } from '../base.js';
import { generateNumber, chooseRandomElementFromArray } from '../tools/generator.js';
import { sleep } from '../tools/timer.js';


export class ActionPlugin {
  private before: Record<string, { pitch: number, yaw: number }> = {};

  public async flow(username: string, bot: Bot, options: any) {
    switch (options.type) {
      case 'jumping':
        await this.jumping(username, bot, options); break;
      case 'shifting':
        await this.shifting(username, bot, options); break;
      case 'waving':
        await this.waving(username, bot, options); break;
      case 'spinning':
        await this.spinning(username, bot, options); break;
    }
  }

  private async jumping(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;
      if (flow[username]?.profile?.tasks.jumping.status) return;

      try {
        updateBotTask(username, 'jumping', true, 2.8);

        if (options.useImpulsiveness) {
          while (flow[username]?.profile?.tasks.jumping.status) {
            await sleep(options.useSync, { min: 1000, max: 1800, key: 'jumping' });

            if (flow[username].profile.tasks.jumping.status) {
              bot.setControlState('jump', true);
              await sleep(options.useSync, { min: options.minDelay, max: options.maxDelay, key: 'jumping' });
              bot.setControlState('jump', false);

              if (Math.random() > 0.7) {
                for (let i = 0; i < generateNumber('int', 2, 4); i++) {
                  await sleep(options.useSync, { min: 400, max: 800, key: 'jumping' });
                  bot.setControlState('jump', true);
                  await sleep(options.useSync, { min: options.minDelay, max: options.maxDelay, key: 'jumping' });
                  bot.setControlState('jump', false);
                }
              }
            }
          }
        } else {
          await sleep(options.useSync, { min: 1000, max: 1800, key: 'jumping' });
          bot.setControlState('jump', true);
        }
      } catch {
        updateBotTask(username, 'jumping', false);
      }
    } else if (options.state === 'stop') {
      if (!bot) return;
      if (!flow[username]?.profile?.tasks.jumping.status) return;

      bot.setControlState('jump', false);
      updateBotTask(username, 'jumping', false);
    }
  }

  private async shifting(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;
      if (flow[username]?.profile?.tasks.shifting.status) return;

      try {
        updateBotTask(username, 'shifting', true, 2.8);

        if (options.useImpulsiveness) {
          while (flow[username]?.profile?.tasks.shifting.status) {
            await sleep(options.useSync, { min: 1000, max: 1800, key: 'shifting' });

            if (flow[username]?.profile?.tasks.shifting.status) {
              bot.setControlState('sneak', true);
              await sleep(options.useSync, { min: options.minDelay, max: options.maxDelay, key: 'shifting' });
              bot.setControlState('sneak', false);

              if (Math.random() > 0.7) {
                for (let i = 0; i < generateNumber('int', 2, 4); i++) {
                  await sleep(options.useSync, { min: 400, max: 800, key: 'shifting' });
                  bot.setControlState('sneak', true);
                  await sleep(options.useSync, { min: options.minDelay, max: options.maxDelay, key: 'shifting' });
                  bot.setControlState('sneak', false);
                }
              }
            }
          }
        } else {
          await sleep(options.useSync, { min: 1000, max: 1800, key: 'shifting' });
          bot.setControlState('sneak', true);
        }
      } catch {
        updateBotTask(username, 'shifting', false);
      }
    } else if (options.state === 'stop') {
      if (!bot) return;
      if (!flow[username]?.profile?.tasks.shifting.status) return;

      bot.setControlState('sneak', false);
      updateBotTask(username, 'shifting', false);
    }
  }

  private async waving(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;
      if (flow[username]?.profile?.tasks.waving.status) return;

      try {
        updateBotTask(username, 'waving', true, 2.2);

        if (options.useRandomizer) {
          while (flow[username]?.profile?.tasks.waving.status) {
            await sleep(options.useSync, { min: 1000, max: 3000, key: 'waving' });

            bot.swingArm('right');

            if (Math.random() > 0.5) {
              await sleep(options.useSync, { min: 300, max: 1000, key: 'waving' });
              bot.swingArm('right');
            }
          }
        } else {
          while (flow[username]?.profile?.tasks.waving.status) {
            await sleep(options.useSync, { min: 300, max: 350, key: 'waving' });
            bot.swingArm('right');
          }
        }
      } catch {
        updateBotTask(username, 'waving', false);
      }
    } else if (options.state === 'stop') {
      if (!flow[username]?.profile?.tasks.waving.status) return;

      updateBotTask(username, 'waving', false);
    }
  }

  private async spinning(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;
      if (flow[username]?.profile?.tasks.spinning.status) return;

      try {
        updateBotTask(username, 'spinning', true, 2.8);

        this.before[username] = { pitch: bot.entity.pitch, yaw: bot.entity.yaw };

        if (options.useRealism) {
          while (flow[username]?.profile?.tasks.spinning.status) {
            await sleep(options.useSync, { min: 300, max: 500, key: 'spinning' });

            bot.entity.yaw += chooseRandomElementFromArray([0.2, 0.4, 0.5, 0.6, 0.8, 0.9]);

            bot.entity.pitch = (generateNumber('float', -5, 5) + Math.random() * 2) / 6;

            bot.look(bot.entity.yaw, bot.entity.pitch, true);
          }
        } else {
          while (flow[username]?.profile?.tasks.spinning.status) {
            await sleep(options.useSync, { min: 130, max: 200, key: 'spinning' });

            bot.entity.yaw += chooseRandomElementFromArray([0.2, 0.4, 0.5, 0.6, 0.8]);

            bot.look(bot.entity.yaw, bot.entity.pitch, true);
          }
        }
      } catch {
        updateBotTask(username, 'spinning', false);
      } finally {
        if (this.before[username]?.pitch && this.before[username]?.yaw) {
          bot.look(this.before[username].yaw, this.before[username].pitch, false);
        }
      }
    } else if (options.state === 'stop') {
      if (!flow[username]?.profile?.tasks.spinning.status) return;

      updateBotTask(username, 'spinning', false);
    }
  }
}
