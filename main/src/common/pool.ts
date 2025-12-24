import { transmit } from '../api/transfer.js';
import { flow } from '../bot/base.js';
import { ChatPlugin } from '../bot/plugins/chat.js';
import { ActionPlugin } from '../bot/plugins/action.js';
import { MovePlugin } from '../bot/plugins/move.js';
import { ImitationPlugin } from '../bot/plugins/imitation.js';
import { AntiAfkPlugin } from '../bot/plugins/anti-afk.js';
import { AttackPlugin } from '../bot/plugins/attack.js';
import { FlightPlugin } from '../bot/plugins/flight.js';
import { SprinterPlugin } from '../bot/plugins/sprinter.js';
import { GhostPlugin } from '../bot/plugins/ghost.js';
import { SpoofingPlugin } from '../bot/plugins/spoofing.js';
import { AntiFallPlugin } from '../bot/plugins/anti-fall.js';

const chat = new ChatPlugin();
const action = new ActionPlugin();
const move = new MovePlugin();
const imitation = new ImitationPlugin();
const antiAfk = new AntiAfkPlugin();
const attack = new AttackPlugin();
const flight = new FlightPlugin();
const sprinter = new SprinterPlugin();
const ghost = new GhostPlugin();
const spoofing = new SpoofingPlugin();
const antiFall = new AntiFallPlugin();

export function pool(type: string, body: any, response: any) {
  try {
    let plugin: any = undefined;
    let name = '';

    switch (type) {
      case 'chat':
        name = 'Чат';
        plugin = chat;
        break;
      case 'action':
        name = 'Действия';
        plugin = action; 
        break;
      case 'move':
        name = 'Движение';
        plugin = move;
        break;
      case 'imitation':
        name = 'Имитация';
        plugin = imitation;
        break;
      case 'anti-afk':
        name = 'Анти-АФК';
        plugin = antiAfk;
        break;
      case 'attack':
        name = 'Атака';
        plugin = attack;
        break;
      case 'flight':
        name = 'Полёт';
        plugin = flight;
        break;
      case 'sprinter':
        name = 'Спринтер';
        plugin = sprinter;
        break;
      case 'ghost':
        name = 'Призрак';
        plugin = ghost;
        break;
      case 'spoofing':
        name = 'Спуфинг';
        plugin = spoofing;
        break;
      case 'anti-fall':
        name = 'Анти-Падение';
        plugin = antiFall;
        break;
    }

    if (plugin) {
      Object.values(flow).forEach(e => e.bot ? plugin.flow(e.bot.player.username, e.bot, body) : null);

      transmit(response, 'info', {
        success: true,
        message: `Управление / ${name} ==> Команда принята (входящие данные: ${JSON.stringify(body)})`
      });
    } else {
      transmit(response, 'error', {
        success: false,
        message: `Управление / ${name} ==> Не удалось принять команду (входящие данные: ${JSON.stringify(body)})`
      });
    }
  } catch (error) {
    transmit(response, 'error', {
      success: false,
      message: error
    });
  }
}