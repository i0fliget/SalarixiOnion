import { Bot } from 'mineflayer';

import { flow, updateBotTask } from '../base.js';
import { randint } from '../tools/generator.js';


export class AntiFallPlugin {
  public async flow(username: string, bot: Bot, options: any) {
    try {
      if (options.state === 'start') {
        const listener = () => {
          if (flow[username]?.profile?.tasks.antiFall.status) {
            if (!bot.entity.onGround && bot.entity.velocity.y < options.fallVelocity ? options.fallVelocity : -0.5) {
              const blockBelow = this.findGroundBelow(bot);
              if (blockBelow) {
                const fallHeight = bot.entity.position.y - blockBelow.position.y;
                  
                if (fallHeight <= options.trigger) {
                  const velocityY = bot.entity.velocity.y;
                  bot.entity.velocity.y = velocityY < 0 ? (velocityY - velocityY) + randint('float', options.minInertialJerk ? options.minInertialJerk : 0.0000001, options.maxInertialJerk ? options.maxInertialJerk : 0.0000002) : velocityY + velocityY * 0.3;
                  setTimeout(() => bot.entity.velocity.y = velocityY, randint('float', 100, 150));
                }
              }
            }
          } else {
            bot.removeListener('physicsTick', listener);
            updateBotTask(username, 'antiFall', false);
          }
        }

        bot.on('physicsTick', listener);

        updateBotTask(username, 'antiFall', true, 2.3);
      } else {
        updateBotTask(username, 'antiFall', false);
      }
    } catch {
      updateBotTask(username, 'antiFall', false);
    }
  }

  private findGroundBelow(bot: Bot) {
    for (let i = 1; i < 50; i++) {
      const checkPos = bot.entity.position.offset(0, -i, 0);
      const block = bot.blockAt(checkPos);

      if (block && block.boundingBox === 'block') {
        return block;
      }
    }

    return null;
  }
}