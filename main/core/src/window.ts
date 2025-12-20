import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { setup } from './api/setup.js';
    

const __dirname = dirname(fileURLToPath(import.meta.url));

let port = setup();

app.commandLine.appendSwitch('no-sandbox');

const client = {
  version: '1.0.2',
  type: 'Expert',
  releaseDate: '20.12.2025'
};

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    title: 'Salarixi Onion',
    width: 1060,
    height: 680,
    titleBarStyle: 'hidden',
    resizable: false,
    fullscreen: false,
    fullscreenable: false,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: false,
      spellcheck: false
    }
  });

  win.setMenuBarVisibility(false);

  win.loadFile(path.join(__dirname, 'interface', 'index.html'));
}

class Configurator {
  private path: string | null = null;

  public async init() {
    await this.check();
  }

  private async check() {
    const paths = [
      './config/salarixi.config.json',
      './salarixi.config.json',
      './cfg/salarixi.config.json',
      './salarixi.cfg.json',
      './config/salarixi.cfg.json',
      '../config/salarixi.config.json',
      '../cfg/salarixi.config.json',
      '../config/salarixi.cfg.json'
    ];

    for (const path of paths) {
      if (fs.existsSync(path)) {
        this.path = path;
        break;
      }
    }

    if (!this.path || !fs.existsSync(this.path)) {
      await this.create('./config/salarixi.config.json');
    }
  }

  private async create(path: string) {
    fs.writeFileSync(path, JSON.stringify({}, null, 2), { encoding: 'utf-8' });
    this.path = path;
  }

  public async load() {
    try {
      let config = null;

      for (let attempts = 0; attempts < 8; attempts++) {
        if (this.path && fs.existsSync(this.path)) {
          const data = JSON.parse(fs.readFileSync(this.path, { encoding: 'utf-8' }));
          config = data;
          break;
        } else {
          await this.check();
          continue;
        }
      }

      return config;
    } catch {
      return null;
    }
  }

  public async save(config: any) {
    for (let attempts = 0; attempts < 4; attempts++) {
      if (this.path && fs.existsSync(this.path)) {
        fs.writeFileSync(this.path, JSON.stringify(config, null, 2), { encoding: 'utf-8' });
        break;
      } else {
        await this.check();
        continue;
      }
    }
  }
}

const configurator = new Configurator();

async function startProxyCollect(options: any) {
  try {
    let cmd = '';

    if (os.platform() === 'linux') {
      cmd = './collector';
    } else if (os.platform() === 'win32') {
      cmd = './collector.exe';
    }

    const args = [options.algorithm, options.protocol, options.country, options.count];

    const proc = spawn(cmd, args);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', chunk => { stdout += chunk.toString(); });
    proc.stderr.on('data', chunk => { stderr += chunk.toString(); });

    const exitCode = await new Promise((resolve, reject) => {
      proc.on('error', reject);
      proc.on('close', resolve);
    });

    if (exitCode !== 0) {
      return null;
    }

    return stdout;
  } catch (err) {
    return null;
  }
}

ipcMain.handle('client', async (_, cmd, options) => {
  try {
    let result;

    switch (cmd) {
      case 'port':
        result = port; break;
      case 'get-info':
        result = client; break;
      case 'window':
        if (options.action === 'minimize') {
          win.minimize()
        } else if (options.action === 'close') {
          win.close();
          app.quit();
        }; break;
      case 'open-file':
        await dialog.showOpenDialog(win, { properties: ['openFile'] }).then(r => {
          result = r.filePaths[0];
        }); break;
      case 'open-url':
        result = await shell.openExternal(options.url); break;
      case 'load-config':
        result = await configurator.load(); break;
      case 'save-config':
        result = await configurator.save(options.config); break;
      case 'scrape-proxies':
        result = await startProxyCollect(options); break;
    }

    return { success: true, result: result };
  } catch (error) {
    return { success: false, error: error };
  }
});


app.whenReady().then(async () => {
  createWindow();

  await configurator.init();
});
