import { Bot } from 'mineflayer';

import { updateBotTask } from '../base.js';


export class SprinterPlugin {
  public async flow(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      await this.enableSprinter(username, bot);
    } else {
      await this.disableSprinter(username, bot);
    }
  }

  private async enableSprinter(username: string, bot: Bot) {
    updateBotTask(username, 'sprinter', true, 2.1);
    bot.physics.sprintSpeed = bot.physics.sprintSpeed + 0.8;
    bot.physics.yawSpeed = bot.physics.yawSpeed + 0.8;
    bot.physics.maxGroundSpeed = bot.physics.maxGroundSpeed + 0.8;
  }

  private async disableSprinter(username: string, bot: Bot) {
    updateBotTask(username, 'sprinter', false);
    bot.physics.sprintSpeed = bot.physics.sprintSpeed - 0.8;
    bot.physics.yawSpeed = bot.physics.yawSpeed - 0.8;
    bot.physics.maxGroundSpeed = bot.physics.maxGroundSpeed - 0.8;
  }
}