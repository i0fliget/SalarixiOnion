import mineflayer from 'mineflayer';

import { Bot } from '../architecture.js';
import BotFlags from '../architecture.js';
import Generator from '../../tools/generator.js';

const generator = new Generator();

// Структура входящих данных
interface IncomingData {
	mode: 'temperate' | 'normal' | 'aggressive';
}

// Контроллер для управления призраком
class GhostController {
  private activeNormalPacketIgnore: boolean = false;
  private activeAggressivePacketIgnore: boolean = false;

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

  private async temperatePacketIgnore() {
    try {
      const originalWrite = this.bot._client.write;

      let count = 0;
        
      this.bot._client.write = (packetName, packetData) => {
        if (this.flags.ACTIVE_GHOST) {
          count++;

          if (packetName !== 'position' && packetName !== 'position_look' && packetName !== 'keep_alive') {
            if (count % generator.generateRandomNumberBetween(4, 6) !== 0) return;
          }
        }

        originalWrite.call(this.bot._client, packetName, packetData);
      }
    } catch (error) {
      console.log(`Ошибка: ${error}`);
    }
  }

  private async normalPacketIgnore() {
    try {
      const originalWrite = this.bot._client.write;

      let count = 0;
          
      this.bot._client.write = (packetName, packetData) => {
        if (this.flags.ACTIVE_GHOST && this.activeNormalPacketIgnore) {
          count++;
              
          if (packetName !== 'position' && packetName !== 'position_look') {
            if (packetName === 'keep_alive') {
              if (Math.random() > 0.90) {
                return;
              }
            }

            if (count % generator.generateRandomNumberBetween(4, 6) !== 0) {
              return;
            }
          }
        }

        originalWrite.call(this.bot._client, packetName, packetData);
      }
    } catch (error) {
      console.log(`Ошибка: ${error}`);
    }
  }

  private async aggressivePacketIgnore() {
    try {
      const originalWrite = this.bot._client.write;

      let count = 0;
        
      this.bot._client.write = (packetName, packetData) => {
        if (this.flags.ACTIVE_GHOST && this.activeAggressivePacketIgnore) {
          count++;

          if (packetName === 'keep_alive') {
            if (Math.random() > 0.70) {
              return;
            }
          }
                
          if (count % generator.generateRandomNumberBetween(10, 16) !== 0) {
            return;
          }
        }

        originalWrite.call(this.bot._client, packetName, packetData);
      }
    } catch (error) {
      console.log(`Ошибка: ${error}`);
    }
  }

  public async enableGhost({ state, data }: {
    state: 'start' | 'stop',
    data: IncomingData
  }) {
    try {
      if (state === 'start') {
        if (!data) return;

        this.flags.ACTIVE_GHOST = true;

        this.object.updateLoad('+', 2.5);

        if (data.mode === 'temperate') {
          await this.temperatePacketIgnore();
        } else  if (data.mode === 'normal') {
          await this.normalPacketIgnore();

          const interval = setInterval(async () => {
            if (!this.flags.ACTIVE_GHOST) {
              clearInterval(interval);
              return;
            }

            this.activeNormalPacketIgnore = true;
            await this.sleep(generator.generateRandomNumberBetween(1000, 2200));
            this.activeNormalPacketIgnore = false;
          }, generator.generateRandomNumberBetween(3000, 5000));
        } else if (data.mode === 'aggressive') {
          await this.aggressivePacketIgnore();

          const interval = setInterval(async () => {
            if (!this.flags.ACTIVE_GHOST) {
              clearInterval(interval);
              return;
            }

            this.activeAggressivePacketIgnore = true;
            await this.sleep(generator.generateRandomNumberBetween(2000, 3000));
            this.activeAggressivePacketIgnore = false;
          }, generator.generateRandomNumberBetween(2000, 3000));
        }
      } else if (state === 'stop') {
        if (!this.bot) return;
        if (!this.flags.ACTIVE_GHOST) return;

        this.flags.ACTIVE_GHOST = false;

        this.object.updateLoad('-', 2.5);
      }
    } catch (error) {
      console.log(`Ошибка: ${error}`);
    }
  }
}

export default GhostController;