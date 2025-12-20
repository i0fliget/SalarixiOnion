import { Bot } from 'mineflayer';

import { flow, updateBotTask } from '../base.js';
import { generateNumber } from '../tools/generator.js';
import { sleep } from '../tools/timer.js';

export class GhostPlugin {
  private activePacketIgnore: any = {};
  private originalWrite: any = {};
  private packetBuffer: any = {};

  public async flow(username: string, bot: Bot, options: any) {
    await this.ghost(username, bot, options);
  }

  private reset(username: string, bot: Bot) {
    this.clearPacketBuffer(bot);

    this.activePacketIgnore[username] = false;
    this.originalWrite[username] = null;
    this.packetBuffer[username] = null;
  }

  private packetBuffering(bot: Bot, packetName: string, packetData: any) {
    const packetId = Date.now() + Math.random();

    this.packetBuffer[bot.username].set(packetId, {
      name: packetName,
      data: packetData
    });
  }

  private async clearPacketBuffer(bot: Bot) {
    if (!bot) return;
    if (this.packetBuffer[bot.username].size === 0) return;
    
    for (const [id, packet] of this.packetBuffer[bot.username].entries()) {
      this.originalWrite[bot.username].call(bot._client, packet.name, packet.data);
      this.packetBuffer[bot.username].delete(id);
    }
  }

  private async temperatePacketIgnore(username: string, bot: Bot, options: any) {
    try {
      if (!bot) return;

      if (!this.originalWrite[bot.username]) {
        this.originalWrite[bot.username] = bot._client.write;
      }

      bot._client.write = async (packetName, packetData) => {
        if (!bot) return;

        if (flow[username]?.profile?.tasks.ghost.status) {
          if (Math.random() > 0.5) {
            if (packetName === 'keep_alive' || packetName === 'position' || packetName === 'position_look' && Math.random() > 0.8) {
              if (options.useBuffering) this.packetBuffering(bot, packetName, packetData);
              return;
            } else {
              this.originalWrite[bot.username].call(bot._client, packetName, packetData);
            }

            if (Math.random() > 0.65) this.clearPacketBuffer(bot);
          } else {
            this.originalWrite[bot.username].call(bot._client, packetName, packetData);
          }
        } else {
          this.clearPacketBuffer(bot);
          this.originalWrite[bot.username].call(bot._client, packetName, packetData);
        }
      }
    } catch {
      this.reset(username, bot);
      updateBotTask(username, 'ghost', false);
    }
  }

  private async normalPacketIgnore(username: string, bot: Bot, options: any) {
    try {
      if (!bot) return;

      if (!this.originalWrite[bot.username]) {
        this.originalWrite[bot.username] = bot._client.write;
      }
          
      bot._client.write = (packetName, packetData) => {
        if (!bot) return;

        if (flow[username]?.profile?.tasks.ghost.status && this.activePacketIgnore[bot.username]) {         
          if (packetName === 'keep_alive' || packetName === 'position' || packetName === 'position_look' && Math.random() > 0.6) {
            if (options.useBuffering) this.packetBuffering(bot, packetName, packetData);
            return;
          }

          if (options.useBuffering) this.packetBuffering(bot, packetName, packetData);

          if (Math.random() > 0.85) this.clearPacketBuffer(bot);
        } else {
          this.clearPacketBuffer(bot);
          this.originalWrite[bot.username].call(bot._client, packetName, packetData);
        }
      }
    } catch {
      this.reset(username, bot);
      updateBotTask(username, 'ghost', false);
    }
  }

  private async aggressivePacketIgnore(username: string, bot: Bot, options: any) {
    try {
      if (!bot) return;

      if (!this.originalWrite[bot.username]) {
        this.originalWrite[bot.username] = bot._client.write;
      }

      bot._client.write = async (packetName, packetData) => {
        if (!bot) return;

        if (flow[username]?.profile?.tasks.ghost.status && this.activePacketIgnore[bot.username]) {
          if (packetName === 'keep_alive' || packetName === 'position' || packetName === 'position_look' && Math.random() > 0.3) {
            if (options.useBuffering) this.packetBuffering(bot, packetName, packetData);
            return;
          }

          if (options.useBuffering && Math.random() > 0.2) this.packetBuffering(bot, packetName, packetData);

          if (Math.random() > 0.95) {
            this.clearPacketBuffer(bot);
          }
        } else {
          this.clearPacketBuffer(bot);
          this.originalWrite[bot.username].call(bot._client, packetName, packetData);
        }
      }
    } catch {
      this.reset(username, bot);
      updateBotTask(username, 'ghost', false);
    }
  }

  public async ghost(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;

      updateBotTask(username, 'ghost', true, 3.5);

      this.activePacketIgnore[bot.username] = false;
      this.packetBuffer[bot.username] = new Map();

      if (options.type === 'temperate') {
        await this.temperatePacketIgnore(username, bot, options);
      } else  if (options.type === 'normal') {
        await this.normalPacketIgnore(username, bot, options);

        const interval = setInterval(async () => {
          if (!flow[username]?.profile?.tasks.ghost.status) {
            clearInterval(interval);
            return;
          }

          this.activePacketIgnore[bot.username] = true;
          await sleep(false, { min: 1000, max: 2000 });
          this.activePacketIgnore[bot.username] = false;
        }, generateNumber('float', 3000, 4000));
      } else if (options.type === 'aggressive') {
        await this.aggressivePacketIgnore(username, bot, options);

        const interval = setInterval(async () => {
          if (!flow[username]?.profile?.tasks.ghost.status) {
            clearInterval(interval);
            return;
          }

          this.activePacketIgnore[bot.username] = true;
          await sleep(false, { min: 2000, max: 2400 });
          this.activePacketIgnore[bot.username] = false;
        }, generateNumber('float', 2500, 3000));
       }
    } else if (options.state === 'stop') {
      if (!flow[username]?.profile?.tasks.ghost.status) return;

      this.reset(username, bot);

      updateBotTask(username, 'ghost', false);
    }
  }
}