import { Bot } from 'mineflayer';

import { updateBotTask } from '../base.js';
import { generateNumber } from '../tools/generator.js';


interface PacketQueue {
  [x: string]: Map<number, { name: string; meta: any }> | null;
}

interface PacketRate {
  [x: string]: {
    received: number;
    buffered: number;
  } | null;
}

const packetTypesForTemperate = ['keep_alive', 'ping', 'transaction'];
const packetTypesForAggressive = ['keep_alive', 'ping', 'transaction', 'entity_velocity', 'entity_status', 'position'];

export class SpoofingPlugin {
  private options: any = null;
  private original: Record<string, any> = {};
  private packetQueue: PacketQueue = {};
  private packetRate: PacketRate = {};
  private clearRateIntervals: Record<string, NodeJS.Timeout> = {};

  public async flow(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      this.options = options;

      if (options.settings === 'adaptive') {
        this.options.mode = 'temperate';
      }

      await this.enablePacketSpoofing(username, bot);
    } else {
      this.options = null;
      await this.disablePacketSpoofing(username, bot);
    }
  }

  private async enablePacketSpoofing(username: string, bot: Bot) {
    updateBotTask(username, 'spoofing', true, 5.8);

    this.original[username] = bot._client.write;
    this.packetQueue[username] = new Map();
    this.packetRate[username] = { received: 0, buffered: 0 };

    this.clearRateIntervals[username] = setInterval(() => {
      this.packetRate[username]!.received = 0;
      this.packetRate[username]!.buffered = 0;
    }, 2000);

    bot._client.write = (packetName, packetMeta) => this.packetSpoofing(username, bot, { name: packetName, meta: packetMeta });
  }

  private async disablePacketSpoofing(username: string, bot: Bot) {
    updateBotTask(username, 'spoofing', false);

    bot._client.write = this.original[username];
    this.clearPacketQueue(username, bot);

    clearInterval(this.clearRateIntervals[username]);

    delete this.packetQueue[username];
    delete this.packetRate[username];
    delete this.original[username];
    delete this.clearRateIntervals[username];
  }

  private packetSpoofing(username: string, bot: Bot, data: any) {
    if (!this.packetRate[username]) {
      this.original[username].call(bot._client, data.name, data.meta);
      return;
    }

    this.packetRate[username].received++;

    if (this.validatePacket(data.name)) {
      this.bufferPacket(username, bot, data.name, data.meta);
    } else {
      this.original[username].call(bot._client, data.name, data.meta);
    }
  }

  private validatePacket(name: string) {
    if (this.options.mode === 'temperate') {
      return packetTypesForTemperate.includes(name);
    } else {
      return packetTypesForAggressive.includes(name);
    }
  }

  private bufferPacket(username: string, bot: Bot, name: string, meta: any) {
    const packetId = Date.now() + generateNumber('int', 10000, 50000);

    this.packetQueue[username]?.set(packetId, { name: name, meta: meta });

    this.packetRate[username]!.buffered++;

    let delay = 0;

    if (this.options.settings === 'adaptive') {
      if (this.packetRate[username]!.buffered > this.packetRate[username]!.received / 2) {
        delay = generateNumber('float', 150, 300);
      } else {
        delay = generateNumber('float', 400, 700);
      }
    } else {
      delay = generateNumber('float', this.options.minPing, this.options.maxPing);
    }

    setTimeout(() => {
      if (this.original[username]) {
        this.original[username].call(bot._client, name, meta);
      } else {
        bot._client.write.call(bot._client, name, meta);
      }

      this.packetQueue[username]?.delete(packetId);
    }, delay);
  }

  private clearPacketQueue(username: string, bot: Bot) {
    if (this.packetQueue[username]) {
      for (const [packetId, packetData] of this.packetQueue[username]) {
        this.original[username].call(bot._client, packetData.name, packetData.meta);
        this.packetQueue[username].delete(packetId);
      }
    }
  }
}