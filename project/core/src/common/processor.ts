import fs from 'fs';

import { Bot, bots, STATISTICS } from '../bot/architecture.js';
import Mutator from '../tools/mutator.js';

// Структура конфига бота
interface BotConfig {
  address: string;
  version: string;
  quantity: number;
  delay: number;
  nickname: string;
  password: string;
  timeout: number;
  distance: string;
  registerCommand: string;
  registerTemplate: string;
  loginCommand: string;
  loginTemplate: string;
  rejoinQuantity: number;
  rejoinDelay: number;
  proxyList: string;
  useKeepAlive: boolean;
  usePhysics: boolean;
  useProxy: boolean;
  useProxyChecker: boolean;
  useAutoRegister: boolean;
  useAutoRejoin: boolean;
  useAutoLogin: boolean;
  useLogDeath: boolean;
  useSaveChat: boolean;
  useSavePlayers: boolean;
  useAiAgent: boolean;
  useDataAnalysis: boolean;
  useOptimization: boolean;
  useErrorCorrector: boolean;
}

let ACTIVE = false;

const mutator = new Mutator();

// Класс, отвечающий за основные процессы
class Processor {
  public async start({ transmitter, config }: {
    transmitter: any,
    config: BotConfig
  }) {
    try {
      if (ACTIVE && STATISTICS.activeBotsObjects.size > 0) {
        return {
          type: 'warning', 
          info: {
            success: true,
            message: 'Предупреждение (start-bots-process): Существуют активные боты, запуск невозможен'
          }
        }
      }

      changeActive(true);

      let statuses: boolean[] = [];

      if (fs.existsSync('./data')) fs.rmSync('./data', { recursive: true, force: true });
      fs.mkdirSync('./data');

      const proxies = config.proxyList.split('\n');

      for (let i = 0; i < config.quantity; i++) {
        if (!ACTIVE) break;

        await new Promise(resolve => setTimeout(resolve, config.delay));

        const version = mutator.mutateString({ type: 'any', input: config.version, data: null });
        const nickname = mutator.mutateString({ type: 'nickname', input: config.nickname, data: null });
        const password = mutator.mutateString({ type: 'password', input: config.password, data: null });
        const registerCommand = mutator.mutateString({ type: 'any', input: config.registerCommand, data: null });
        const registerTemplate = mutator.mutateString({ type: 'any', input: config.registerTemplate, data: null });
        const loginCommand = mutator.mutateString({ type: 'any', input: config.loginCommand, data: null });
        const loginTemplate = mutator.mutateString({ type: 'any', input: config.loginTemplate, data: null });

        let proxy;

        if (proxies.length >= i) {
          proxy = proxies[i];
        } else {
          proxy = proxies[Math.floor(Math.random() * proxies.length)];
        }

        const bot = new Bot(
          transmitter,
          config.address,
          version,
          config.quantity,
          nickname,
          password,
          config.timeout,
          config.distance,
          registerCommand,
          registerTemplate,
          loginCommand,
          loginTemplate,
          config.rejoinQuantity,
          config.rejoinDelay,
          proxy,
          config.useKeepAlive,
          config.usePhysics,
          config.useProxy,
          config.useProxyChecker,
          config.useAutoRegister,
          config.useAutoLogin,
          config.useAutoRejoin,
          config.useLogDeath,
          config.useSaveChat,
          config.useSavePlayers,
          config.useOptimization
        );

        bot.join().then(({ success }) => statuses.push(success));
      }

      await new Promise(resolve => setTimeout(resolve, config.delay));

      return {
        type: 'info', 
        info: {
          success: true,
          message: `Запуск ботов завершён`
        }
      }
    } catch (error) {
      return {
        type: 'error', 
        info: {
          success: false,
          message: `Ошибка (start-bots-process): ${error}`
        }
      }
    }
  }

  public async stop() {
    try {
      if (!STATISTICS.activeBotsObjects) {
        return {
          type: 'error', 
          info: {
            success: false,
            message: 'Ошибка (stop-bots-process): Unable to get active bots'
          }
        }
      }

      changeActive(false);

      for (const [_, bot] of STATISTICS.activeBotsObjects) { 
        bot.clean();
        bot.disconnect();
      }
      
      bots.clear();

      STATISTICS.activeBotsObjects.clear();
      STATISTICS.offlineBotsObjects.clear();
      STATISTICS.kickedBotsObjects.clear();

      return {
        type: 'info', 
        info: {
          success: true,
          message: 'Боты успешно остановленны'
        }
      }
    } catch (error) {
      return {
        type: 'error', 
        info: {
          success: false,
          message: `Ошибка (stop-bots-process): ${error}`
        }
      }
    }
  }
}

// Функция для смены флага ACTIVE
function changeActive(state: boolean) { ACTIVE = state };

export default Processor;
export { ACTIVE, changeActive };