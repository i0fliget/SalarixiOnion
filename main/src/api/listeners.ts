import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { transmit } from './transfer.js';
import { add, del, msg } from './session.js';
import { replenishProxyList, startBots, stopBots, manipulateBot, flow } from '../bot/base.js'
import { pool } from '../common/pool.js';

export const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

function clear(response: any) {
  transmit(response, 'system', {
    success: true,
    message: 'Данные очищены'
  });
}

async function botting(action: 'start' | 'stop', request: any, response: any) {
  try {
    if (action === 'start') {
      const options = request.body;

      transmit(response, 'system', {
        success: true,
        message: 'Начало запуска...'
      });

      del('process:botting');

      setTimeout(async () => await startBots(options), 100);
    } else if (action === 'stop') {
      const result = await stopBots();

      transmit(response, result.type, {
        success: result.info.success,
        message: result.info.message
      });
    }
  } catch (error) {
    transmit(response, 'error', {
      success: false,
      message: error
    });
  }
}

function stream(response: any) {
  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('Access-Control-Allow-Origin', '*');
}

async function sessionBotting(request: any, response: any) {
  try {
    stream(response);

    add('process:botting', response);

    msg('process:botting', {
      type: 'system',
      success: true,
      message: 'SSE-соединение установлено'
    });

    request.on('close', () => del('process:botting'));
  } catch {
    del('process:botting');
  }
}

async function sessionGraphicActiveBots(request: any, response: any) {
  try {
    stream(response);

    add('graphic:active-bots', response);

    const interval = setInterval(() => {
      const activeBotsQuantity = Object.keys(flow).length;

      msg('graphic:active-bots', {
        activeBotsQuantity: activeBotsQuantity
      });
    }, 2000);

    request.on('close', () => {
      del('graphic:active-bots');
      clearInterval(interval);
    });
  } catch {
    del('graphic:active-bots');
  }
}

async function sessionGraphicAverageLoad(request: any, response: any) {
  try {
    stream(response);

    add('graphic:average-load', response);

    const interval = setInterval(() => {
      let num = 0;
      let quantity = 0;

      Object.values(flow).forEach(e => {
        const profile = e.profile;
        num += profile ? profile.load : 0;
        quantity += 1;
      });

      const averageLoad = parseFloat((num / quantity).toFixed(2));

      msg('graphic:average-load', {
        averageLoad: averageLoad
      });
    }, 2000);

    request.on('close', () => {
      del('graphic:average-load');
      clearInterval(interval);
    });
  } catch {
    del('graphic:average-load');
  }
}

app.get('/salarixi/session/botting', async (req, res) => await sessionBotting(req, res));
app.get('/salarixi/session/graphic/active-bots', async (req, res) => await sessionGraphicActiveBots(req, res));
app.get('/salarixi/session/graphic/average-load', async (req, res) => await sessionGraphicAverageLoad(req, res));
app.get('/salarixi/session/monitoring/profile-data', async (_, res) => add('monitoring:profile-data', res));
app.get('/salarixi/session/monitoring/chat-history', async (_, res) => add('monitoring:chat-history', res));

app.post('/salarixi/system/data/clear', (_, res) => clear(res));
app.post('/salarixi/system/proxy-list/update', (req, res) => replenishProxyList(req.body.list, req.body.clean, res));

app.post('/salarixi/botting/start', async (req, res) => await botting('start', req, res));
app.post('/salarixi/botting/stop', async (_, res) => await botting('stop', null, res));

app.post('/salarixi/control/chat', (req, res) => pool('chat', req.body, res));
app.post('/salarixi/control/action', (req, res) => pool('action', req.body, res));
app.post('/salarixi/control/move', (req, res) => pool('move', req.body, res));
app.post('/salarixi/control/imitation', (req, res) => pool('imitation', req.body, res));
app.post('/salarixi/control/anti-afk', (req, res) => pool('anti-afk', req.body, res));
app.post('/salarixi/control/attack', (req, res) => pool('attack', req.body, res));
app.post('/salarixi/control/flight', (req, res) => pool('flight', req.body, res));
app.post('/salarixi/control/sprinter', (req, res) => pool('sprinter', req.body, res));
app.post('/salarixi/control/ghost', (req, res) => pool('ghost', req.body, res));
app.post('/salarixi/control/spoofing', (req, res) => pool('spoofing', req.body, res));
app.post('/salarixi/control/anti-fall', (req, res) => pool('anti-fall', req.body, res));

app.post('/salarixi/advanced/recreate', async (req, res) => {
  const result = await manipulateBot('recreate', { username: req.body.username });

  if (result) {
    transmit(res, result.type, {
      success: result.success,
      message: result.message
    });
  }
});

app.post('/salarixi/advanced/send-message', async (req, res) => {
  const result = await manipulateBot('message', { username: req.body.username, message: req.body.message });

  if (result) {
    transmit(res, result.type, {
      success: result.success,
      message: result.message
    });
  }
});