import { ControlState, Bot } from 'mineflayer';
import { Vec3 } from 'vec3';

import { flow, updateBotTask } from '../base.js';
import { randint, randelem } from '../tools/generator.js';
import { sleep } from '../tools/timer.js';


export class ImitationPlugin {
  private readonly CHAIN_LENGTH: number = 15;
  private latestData = {
    hybrid: {
			chains: [] as string[],
			multitasking: [] as string[]
		},
		walking: {
			chains: [] as string[],
			multitasking: [] as string[]
		}
  };

  public async flow(username: string, bot: Bot, options: any) {
    switch (options.type) {
      case 'hybrid':
        await this.hybridImitation(username, bot, options); break;
      case 'walking':
        await this.walkingImitation(username, bot, options); break;
    }
  }

  private async generateHybridChain(multitasking: boolean) {
    let chain = '';

    const actions = [
      'sneak',
      'jump',
      'forward',
      'back',
      'left',
      'right'
    ];

    for (let i = 0; i < this.CHAIN_LENGTH; i++) {
      if (i !== 0) chain += '&';

      if (multitasking) {
        if (Math.random() >= 0.8) {
          chain += randelem(actions);
        } else {
          let string = '';

          while (true) {
            string = '';

            let generatedActions: string[] = [];

            for (let k = 0; k < randint('int', 2, 6); k++) {
              let generate = '';

              while (true) {
                generate = randelem(actions);
                let valid = true;
                generatedActions.forEach(e => generate === e ? valid = false : null);
                if (valid) break;
              }

              generatedActions.push(generate);

              if (k !== 0) string += '-';
              
              string += generate;
            }

            generatedActions = [];

            let valid = true;

            this.latestData.hybrid.multitasking.forEach(e => string === e ? valid = false : null);

            if (valid) {
              this.latestData.hybrid.multitasking.push(string);

              if (this.latestData.hybrid.multitasking.length > 12) {
                this.latestData.hybrid.multitasking = [];
              }

              chain += string;

              break;
            }
          }
        }
      } else {
        chain += randelem(actions);
      }

      if (Math.random() <= 0.1) {
        chain += `:${randelem(['0', '1', '2'])}:${randint('float', 200, 4000)}`;
      } else {
        chain += `:${randelem(['0', '1', '2'])}:${randint('float', 100, 200)}`;
      }
    }

    return chain;
  }

  private async generateWalkingChain(multitasking: boolean) {
    let chain = '';

    const actions = [
      'forward',
      'back',
      'left',
      'right'
    ];

    for (let i = 0; i < this.CHAIN_LENGTH; i++) {
      if (i !== 0) chain += '&';

      if (multitasking) {
        if (Math.random() >= 0.8) {
          chain += randelem(actions);
        } else {
          let string = '';

          while (true) {
            string = '';

            let generatedActions: string[] = [];

            for (let k = 0; k < randint('int', 2, 4); k++) {
              let generate = '';

              while (true) {
                generate = randelem(actions);
                let valid = true;
                generatedActions.forEach(e => generate === e ? valid = false : null);
                if (valid) break;
              }

              generatedActions.push(generate);

              if (k !== 0) string += '-';
              
              string += generate;
            }

            generatedActions = [];

            let valid = true;

            this.latestData.walking.multitasking.forEach(e => string === e ? valid = false : null);

            if (valid) {
              this.latestData.walking.multitasking.push(string);

              if (this.latestData.walking.multitasking.length > 12) {
                this.latestData.walking.multitasking = [];
              }

              chain += string;

              break;
            }
          }
        }
      } else {
        chain += randelem(actions);
      }

      if (Math.random() <= 0.1) {
        chain += `:${randint('float', 2000, 4000)}`;
      } else {
        chain += `:${randint('float', 500, 2300)}`;
      }
    }

    return chain;
  }

  private async looking(username: string, bot: Bot, useSmoothness: boolean, useLongDelays: boolean) {
    if (!bot) return;
    if (flow[username]?.profile?.tasks.looking.status) return;

    try {
      updateBotTask(username, 'looking', true, 3.5);

      while (flow[username]?.profile?.tasks.looking.status) {
        if (Math.random() >= 0.8) { 
          const entity = bot.nearestEntity();

          if (entity && entity.type === 'player') {
            bot.lookAt(entity.position.offset(randelem([Math.random() / 3, -(Math.random() / 3)]), entity.height, randelem([Math.random() / 3, -(Math.random() / 3)])), !useSmoothness);
          }
        } else {
          const vector = new Vec3(bot.entity.position.x + randint('float', -1, 1), bot.entity.position.y + randint('float', -0.1, 0.1), bot.entity.position.z + randint('float', -1, 1));

          bot.lookAt(vector, !useSmoothness);
        }

        if (useLongDelays) {
          await new Promise(resolve => setTimeout(resolve, randint('float', 700, 1200)));
        } else {
          await new Promise(resolve => setTimeout(resolve, randint('float', 250, 600)));
        }
      }
    } catch {
      updateBotTask(username, 'looking', false);
    } finally {
      updateBotTask(username, 'looking', false);
    }
  }

  private async waving(username: string, bot: Bot, useLongDelays: boolean) {
    if (!bot) return;
    if (flow[username]?.profile?.tasks.waving.status) return;

    try {
      updateBotTask(username, 'waving', true, 3.2);

      while (flow[username]?.profile?.tasks.waving.status) {
        const randomChance = Math.random();

        if (randomChance >= 0.6) {
          bot.swingArm('right');
        } else if (randomChance < 0.6 && randomChance >= 0.3) {
          bot.swingArm('right');

          if (useLongDelays) {
            await new Promise(resolve => setTimeout(resolve, randint('float', 250, 800)));
          } else {
            await new Promise(resolve => setTimeout(resolve, randint('float', 50, 250)));
          }

          bot.swingArm('right');
        }

        if (useLongDelays) {
          await new Promise(resolve => setTimeout(resolve, randint('float', 1800, 2500)));
        } else {
          await new Promise(resolve => setTimeout(resolve, randint('float', 800, 1800)));
        }
      }
    } catch {
      updateBotTask(username, 'waving', false);
    } finally {
      updateBotTask(username, 'waving', false);
    }
  }

  private async hybridImitation(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;
      if (flow[username]?.profile?.tasks.hybridImitation.status) return;
      if (flow[username]?.profile?.tasks.jumping.status || flow[username]?.profile?.tasks.shifting.status || flow[username]?.profile?.tasks.moveForward.status || flow[username]?.profile?.tasks.moveBack.status || flow[username]?.profile?.tasks.moveLeft.status || flow[username]?.profile?.tasks.moveRight.status) return;

      if (!options) return;

      try {
        updateBotTask(username, 'hybridImitation', true, 4.4);
        updateBotTask(username, 'jumping', true, 0.8);
        updateBotTask(username, 'shifting', true, 0.8);
        updateBotTask(username, 'moveForward', true, 0.5);
        updateBotTask(username, 'moveBack', true, 0.5);
        updateBotTask(username, 'moveLeft', true, 0.5);
        updateBotTask(username, 'moveRight', true, 0.5);

        let isFirst = true;

        while (flow[username]?.profile?.tasks.hybridImitation.status) {
          if (isFirst) {
            await sleep(options.useSync, { min: 1000, max: 2800, key: 'hybridImitation' });
            if (options.useLooking) this.looking(username, bot, options.useSmoothness, options.useLongDelays);
            if (options.useWaving) this.waving(username, bot, options.useLongDelays);
            isFirst = false;
          }

          let chain = '';

          let attempts = 0;

          while (attempts < 20) {
            chain = await this.generateHybridChain(options.useMultitasking);

            let valid = true;

            this.latestData.hybrid.chains.forEach(element => chain === element ? valid = false : valid = valid);

            if (valid) break;

            attempts++;
          }

          this.latestData.hybrid.chains.push(chain);

          if (this.latestData.hybrid.chains.length > 20) {
            this.latestData.hybrid.chains.shift();
          }

          const operations = chain.split('&');
            
          for (const operation of operations) {
            const actions = String(operation.split(':')[0]).split('-');
            const mode = Number(operation.split(':')[1]);
            const delay = Number(operation.split(':')[2]);

            let usedActions: ControlState[] = [];

            for (const action of actions) {
              if (!flow[username]?.profile?.tasks.hybridImitation.status || !flow[username]?.profile?.tasks.jumping.status || !flow[username]?.profile?.tasks.shifting.status || !flow[username]?.profile?.tasks.moveForward.status || !flow[username]?.profile?.tasks.moveBack.status || !flow[username]?.profile?.tasks.moveLeft.status || !flow[username]?.profile?.tasks.moveRight.status) break;

              bot.setControlState(action as ControlState, true);
              usedActions.push(action as ControlState);

              if (options.useLongDelays) {
                await sleep(options.useSync, { min: 300, max: 800, key: 'hybridImitation' });
              } else {
                await sleep(options.useSync, { min: 100, max: 200, key: 'hybridImitation' });
              }
            }

            if (mode === 1) {
              if (usedActions.includes('forward')) {
                bot.setControlState('sprint', true);
                usedActions.push('sprint');
              }

              await sleep(options.useSync, { min: 1000, max: 4000, key: 'hybridImitation' });
            } else if (mode === 2) {
              if (usedActions.includes('forward')) {
                if (Math.random() > 0.5) {
                  bot.setControlState('sprint', true);
                  usedActions.push('sprint');
                }
              }

              await sleep(options.useSync, { min: 3000, max: 6000, key: 'hybridImitation' });
            } else {
              await sleep(options.useSync, { min: 500, max: 2000, key: 'hybridImitation' });
            }

            usedActions.forEach(action => {
              if (!bot) return;
              bot.setControlState(action, false);
            });

            usedActions = [];

            await sleep(options.useSync, { min: delay, max: delay, key: 'hybridImitation' });
          }
        }
      } finally {
        updateBotTask(username, 'hybridImitation', false);
        updateBotTask(username, 'jumping', false);
        updateBotTask(username, 'shifting', false);
        updateBotTask(username, 'looking', false);
        updateBotTask(username, 'waving', false);
        updateBotTask(username, 'moveForward', false);
        updateBotTask(username, 'moveBack', false);
        updateBotTask(username, 'moveLeft', false);
        updateBotTask(username, 'moveRight', false);
      }
    } else if (options.state === 'stop') {
      if (!flow[username]?.profile?.tasks.hybridImitation.status) return;

      updateBotTask(username, 'hybridImitation', false);
      updateBotTask(username, 'jumping', false);
      updateBotTask(username, 'shifting', false);
      updateBotTask(username, 'looking', false);
      updateBotTask(username, 'waving', false);
      updateBotTask(username, 'moveForward', false);
      updateBotTask(username, 'moveBack', false);
      updateBotTask(username, 'moveLeft', false);
      updateBotTask(username, 'moveRight', false);

      this.latestData.hybrid.chains = [];
    }
  }

  private async walkingImitation(username: string, bot: Bot, options: any) {
    if (options.state === 'start') {
      if (!bot) return;
      if (flow[username]?.profile?.tasks.walkingImitation.status) return;
      if (flow[username]?.profile?.tasks.moveForward.status || flow[username]?.profile?.tasks.moveBack.status || flow[username]?.profile?.tasks.moveLeft.status || flow[username]?.profile?.tasks.moveRight.status || flow[username]?.profile?.tasks.looking.status) return;

      if (!options) return;

      try {
        updateBotTask(username, 'walkingImitation', true, 3.8);
        updateBotTask(username, 'moveForward', true, 0.5);
        updateBotTask(username, 'moveBack', true, 0.5);
        updateBotTask(username, 'moveLeft', true, 0.5);
        updateBotTask(username, 'moveRight', true, 0.5);

        let isFirst = true;

        while (flow[username]?.profile?.tasks.walkingImitation.status) {
          if (isFirst) {
            this.looking(username, bot, options.useSmoothness, options.useLongDelays);
            await sleep(options.useSync, { min: 1000, max: 2800, key: 'walkingImitation' });
            isFirst = false;
          }

          let chain = '';

          let attempts = 0;

          while (attempts < 20) {
            chain = await this.generateWalkingChain(options.useMultitasking);

            let valid = true;

            this.latestData.walking.chains.forEach(element => chain === element ? valid = false : valid = valid);

            if (valid) break;

            attempts++;
          }

          if (!flow[username]?.profile?.tasks.walkingImitation.status || !flow[username]?.profile?.tasks.moveForward.status || !flow[username]?.profile?.tasks.moveBack.status || !flow[username]?.profile?.tasks.moveLeft.status || !flow[username]?.profile?.tasks.moveRight.status) break;

          this.latestData.walking.chains.push(chain);

          if (this.latestData.walking.chains.length > 20) {
            this.latestData.walking.chains.shift();
          }

          const operations = chain.split('&');
              
          for (const operation of operations) {
            const actions = String(operation.split(':')[0]).split('-');
            const delay = Number(operation.split(':')[1]);

            let usedActions: ControlState[] = [];

            for (const action of actions) {
              if (!flow[username]?.profile?.tasks.walkingImitation.status || !flow[username]?.profile?.tasks.moveForward.status || !flow[username]?.profile?.tasks.moveBack.status || !flow[username]?.profile?.tasks.moveLeft.status || !flow[username]?.profile?.tasks.moveRight.status) break;

              bot.setControlState(action as ControlState, true);
              usedActions.push(action as ControlState);

              if (options.useLongDelays) {
                await sleep(options.useSync, { min: 300, max: 800, key: 'walkingImitation' });
              } else {
                await sleep(options.useSync, { min: 100, max: 200, key: 'walkingImitation' });
              }
            }

            if (options.useSprint) {
              if (usedActions.includes('forward') && Math.random() > 0.7) {
                bot.setControlState('sprint', true);
                usedActions.push('sprint');
              }
            }

            await sleep(options.useSync, { min: 1000, max: 5000, key: 'walkingImitation' });

            usedActions.forEach(action => {
              if (!bot) return;
              bot.setControlState(action, false);
            });

            usedActions = [];

            await sleep(options.useSync, { min: delay, max: delay, key: 'walkingImitation' });
          }
        }
      } finally {
        updateBotTask(username, 'walkingImitation', false);
        updateBotTask(username, 'looking', false);
        updateBotTask(username, 'moveForward', false);
        updateBotTask(username, 'moveBack', false);
        updateBotTask(username, 'moveLeft', false);
        updateBotTask(username, 'moveRight', false);
      }
    } else if (options.state === 'stop') {
      if (!flow[username]?.profile?.tasks.walkingImitation.status) return;

      updateBotTask(username, 'walkingImitation', false);
      updateBotTask(username, 'looking', false);
      updateBotTask(username, 'moveForward', false);
      updateBotTask(username, 'moveBack', false);
      updateBotTask(username, 'moveLeft', false);
      updateBotTask(username, 'moveRight', false);

      this.latestData.walking.chains = [];
    }
  }
}