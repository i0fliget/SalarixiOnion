import { flow } from '../base.js';
import { generateNumber } from './generator.js';


let sync = {
	spamming: { use: 0, delay: 0 },
  jumping: { delay: 0, use: 0 },
	shifting: { delay: 0, use: 0 },
	waving: { delay: 0, use: 0 },
	spinning: { delay: 0, use: 0 },
  moveForward: { delay: 0, use: 0 },
  moveBack: { delay: 0, use: 0 },
  moveLeft: { delay: 0, use: 0 },
  moveRight: { delay: 0, use: 0 },
  hybridImitation: { delay: 0, use: 0 },
  walkingImitation: { delay: 0, use: 0 },
  attack: { delay: 0, use: 0}
};

type SyncKeys = 'spamming' | 'jumping' | 'shifting' | 'waving' | 'spinning' | 'moveForward' | 'moveBack'
                | 'moveLeft' | 'moveRight' | 'hybridImitation' | 'walkingImitation' | 'attack';

export async function sleep(synchronize: boolean, options: { min: number, max: number, key?: SyncKeys }) {
  if (synchronize) {
    if (!options.key) return;

    if (sync[options.key].use >= Object.keys(flow).length) {
      sync[options.key].delay = 0;
      sync[options.key].use = 0;
    }
                
    if (!sync[options.key].delay) {
      sync[options.key].delay = generateNumber('float', options.min, options.max);
    }

    sync[options.key].use++;

    const delay = sync[options.key].delay;

    await new Promise(resolve => setTimeout(resolve, delay));
  } else {
    await new Promise(resolve => setTimeout(resolve, generateNumber('float', options.min, options.max)));
  }
}