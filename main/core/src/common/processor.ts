/*
import fs from 'fs';

import { bots } from '../bot/base.js';
import { mutateText } from '../bot/utils/mutator.js';
import { chooseRandomElementFromArray } from '../bot/utils/generator.js';

export let active = false;

export class Processor {
  public async start(options: any) {
    try {
      if (active && bots.size > 0) {
        return { type: 'warning', info: {
          success: false,
          message: 'Предупреждение (start-bots-process): Существуют активные боты, запуск невозможен'
        }};
      }

      changeActive(true);

      if (fs.existsSync('./data')) fs.rmSync('./data', { recursive: true, force: true });
      fs.mkdirSync('./data');

      let proxies: string[] = [];

      if (options.proxyList) {
        proxies = String(options.proxyList).trim().split('\n');
      }

      let index = 0;

      for (let i = 0; i < options.quantity; i++) {
        if (!active) break;

        await new Promise(resolve => setTimeout(resolve, options.delay));

        const version = mutateText({ text: options.version, advanced: false, data: null });
        const username = mutateText({ text: options.username, advanced: false, data: null });
        const password = mutateText({ text: options.password, advanced: false, data: null });
        const registerCommand = mutateText({ text: options.registerCommand, advanced: false, data: null });
        const registerTemplate = mutateText({ text: options.registerTemplate, advanced: false, data: null });
        const loginCommand = mutateText({ text: options.loginCommand, advanced: false, data: null });
        const loginTemplate = mutateText({ text: options.loginTemplate, advanced: false, data: null });

        let proxy;

        if (proxies.length >= i) {
          proxy = proxies[index];
        } else {
          proxy = chooseRandomElementFromArray(proxies);
        }

        index++;

        await createBot({
          address: options.address,
          version: version,
          quantity: options.quantity,
          username: username,
          password: password,
          distance: options.distance,
          timeout: options.timeout,
          skipValidation: options.skipValidation,
          registerCommand: registerCommand,
          registerTemplate: registerTemplate,
          registerMinDelay: options.registerMinDelay,
          registerMaxDelay: options.registerMaxDelay,
          loginCommand: loginCommand,
          loginTemplate: loginTemplate,
          loginMinDelay: options.loginMinDelay,
          loginMaxDelay: options.loginMaxDelay,
          rejoinQuantity: options.rejoinQuantity,
          rejoinDelay: options.rejoinDelay,
          dataUpdateFrequency: options.dataUpdateFrequency,
          proxy: proxy,
          useKeepAlive: options.useKeepAlive,
          usePhysics: options.usePhysics,
          useProxy: options.useProxy,
          useAutoRegister: options.useAutoRegister,
          useAutoLogin: options.useAutoLogin,
          useAutoRejoin: options.useAutoRejoin,
          useLogDeath: options.useLogDeath,
          useSaveChat: options.useSaveChat,
          useSavePlayers: options.useSavePlayers,
          useOptimization: options.useOptimization,
          useExtendedLogs: options.useExtendedLogs
        });

        const bot = new Bot(
          options.address,
          version,
          options.quantity,
          nickname,
          password,
          options.distance,
          options.timeout,
          skipValidation,
          registerCommand,
          registerTemplate,
          options.registerMinDelay,
          options.registerMaxDelay,
          loginCommand,
          loginTemplate,
          options.loginMinDelay,
          options.loginMaxDelay,
          options.rejoinQuantity,
          options.rejoinDelay,
          options.dataUpdateFrequency,
          proxy,
          options.useKeepAlive,
          options.usePhysics,
          options.useProxy,
          options.useAutoRegister,
          options.useAutoLogin,
          options.useAutoRejoin,
          options.useLogDeath,
          options.useSaveChat,
          options.useSavePlayers,
          options.useOptimization,
          options.useExtendedLogs
        );

        await bot.join(false);
      }

      await new Promise(resolve => setTimeout(resolve, options.delay));

      return { type: 'info', info: {
        success: true,
        message: `Запуск ботов завершён`
      }};
    } catch (error) {
      return { type: 'error', info: {
        success: false,
        message: `Ошибка (start-bots-process): ${error}`
      }};
    }
  }

  public async stop() {
    try {
      if (!bots) {
        return { type: 'error', info: {
          success: false,
          message: 'Ошибка (stop-bots-process): Unable to get active bots'
        }};
      }

      changeActive(false);

      bots.forEach(async bot => bot.end('@salarixi:disconnect'));
      
      bots.clear();

      return { type: 'info', info: {
        success: true,
        message: 'Боты успешно остановленны'
      }};
    } catch (error) {
      return { type: 'error', info: {
        success: false,
        message: `Ошибка (stop-bots-process): ${error}`
      }};
    }
  }

  public checkActive() {
    if (active || bots.size > 0) {
      return true;
    } else {
      return false;
    }
  }
}

export function changeActive(state: boolean) { active = state };
*/