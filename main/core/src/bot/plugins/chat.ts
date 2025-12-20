import { Bot } from 'mineflayer';

import { flow, updateBotTask } from '../base.js';
import { generateString, generateNumber, chooseRandomElementFromArray } from '../tools/generator.js';
import { mutateText } from '../tools/mutator.js';
import { sleep } from '../tools/timer.js';


export class ChatPlugin {
  public async flow(username: string, bot: Bot, options: any) {
    switch (options.type) {
      case 'message':
        await this.message(username, bot, options); break;
      case 'spamming':
        await this.spamming(username, bot, options); break;
    }
  }
  
  private createMagicText(text: string) {
    let magicText = '';

    const words = text.split(' ');

    for (const word of words) {
      const randomChance = Math.random();

      magicText += ' ';

      if (word.includes('http://') || word.includes('https://')) {
        magicText += word;
      } else {
        if (randomChance >= 0.9) {
          magicText += word.toLowerCase();
        } else if (randomChance < 0.9 && randomChance > 0.75) {
          magicText += word.toUpperCase();
        } else {
          for (const char of word) {
            const randomChance = Math.random();

            if (randomChance >= 0.70) {
              magicText += char.toLowerCase()
                .replace(/o/g, () => Math.random() > 0.5 ? '0' : '@')
                .replace(/о/g, () => Math.random() > 0.5 ? '0' : '@')
                .replace(/a/g, '4')
                .replace(/а/g, '4')
                .replace(/z/g, '3')
                .replace(/з/g, '3')
                .replace(/e/g, '3')
                .replace(/е/g, '3')
                .replace(/i/g, () => Math.random() > 0.5 ? '1' : '!')
                .replace(/l/g, () => Math.random() > 0.5 ? '1' : '!')
                .replace(/л/g, () => Math.random() > 0.5 ? '1' : '!')
                .replace(/и/g, () => Math.random() > 0.5 ? '1' : '!')
                .replace(/п/g, '5')
                .replace(/p/g, '5')
                .replace(/v/g, () => Math.random() > 0.5 ? '8' : '&')
                .replace(/в/g, () => Math.random() > 0.5 ? '8' : '&')
                .replace(/б/g, '6')
                .replace(/b/g, '6')
                .replace(/с/g, '$')
                .replace(/s/g, '$');
            } else if (randomChance < 0.70 && randomChance >= 0.5) {
              magicText += char.toUpperCase()
            } else {
              magicText += char;
            }
          }
        }
      }
    }

    return magicText;
  } 

  private async message(username: string, bot: Bot, options: any) {
    try {
      if (!bot) return;

      updateBotTask(username, 'message', true, 0.3);

      let text = '';

      if (options.useTextMutation) {
        const players = Object.keys(bot.players);
              
        text = mutateText({ 
          text: options.message, 
          advanced: true, 
          data: { players: players } 
        });
      } else {
        text = options.message;
      }

      if (!options.useSync) {
        await sleep(false, { min: 200, max: 4000 });
      }

      if (options.useMagicText) {
        text = this.createMagicText(text);
      }

      if (options.from === '@all') {
        bot.chat(text);
      } else {
        if (bot.username === options.from) {
          bot.chat(text);
        }
      }
    } finally {
      updateBotTask(username, 'message', false);
    }
  }

  private async spamming(username: string, bot: Bot, options: any) {
    if (!bot) return;

    if (options.state === 'start') {
      updateBotTask(username, 'spamming', true, 3.4);

      let lastTexts: string[] = [];

      while (flow[username]?.profile?.tasks.spamming.status) {
        let text = '';

        if (options.useTextMutation) {
          const players = Object.keys(bot.players);
              
          text = mutateText({ 
            text: options.message, 
            advanced: true, 
            data: { players: players } 
          });
        } else {
          text = options.message;
        }

        await sleep(options.useSync, { min: options.minDelay, max: options.maxDelay, key: 'spamming' });

        if (options.useMagicText) {
          text = this.createMagicText(text);
        }

        if (flow[username]?.profile?.tasks.spamming.status) {
          let valid = true;

          if (options.useAntiRepetition) {
            lastTexts.forEach(element => text === element ? valid = false : valid = valid);

            if (valid) {
              lastTexts.push(text);

              if (lastTexts.length > 5) {
                lastTexts.shift();
              }
            }
          } 
              
          if (options.useBypass) {
            text += chooseRandomElementFromArray([' : ', ' | ', ' / ']) + generateString('special', generateNumber('int', 3, 6));
          }

          if (valid) {
            if (options.from === '@all') {
              bot.chat(text);
            } else {
              if (bot.username === options.from) {
                bot.chat(text);
              }
            }
          }
        }
      }
    } else {
      updateBotTask(username, 'spamming', false);
    }
  }
}