let statistics = {
  isInitialized: false,
  logIndex: 0,
  showSystemLogs: true,
  latestConfig: {},
  usernameList: [],
  latestControlContainer: null,
  listeners: new Map()
};

let activity = {
  botting: false,
  profileDataMonitoring: false,
  chatHistoryMonitoring: false
};

let localhost;

let globalContainers = [];
let controlContainers = [];

function date(format = 'H:M:S') {
  const date = new Date();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  if (format === 'H:M:S') {
    return `${hours}:${minutes}:${seconds}`;
  } else if (format === 'H:M') {
    return `${hours}:${minutes}`;
  } else if (format === 'M:S') {
    return `${minutes}:${seconds}`;
  } else {
    return `${hours}:${minutes}:${seconds}`;
  }
}

function log(text, type) {
  const logContent = document.getElementById('log-content');

  if (!logContent) return;

  if (statistics.logIndex >= 400) {
    statistics.logIndex = 399;
    logContent.firstChild.remove();
  }

  statistics.logIndex++;

  const container = document.createElement('div');

  container.className = 'log-line';

  if (type === 'log-system') {
    container.className += ' log-line-system';
  }

  text = text
    .replace(/%hcg/g, '<span style="color: #21d618ba;">')
    .replace(/%hcy/g, '<span style="color: #d6d018b6;">')
    .replace(/%hcr/g, '<span style="color: #d61b1893;">')
    .replace(/%sc/g, '</span>');

  container.innerHTML = `
    <div class="log-line-date">${date()}</div>
    <div class="log-line-content ${type}">${text}</div>
  `;

  if (!statistics.showSystemLogs) {
    container.style.display = 'none';
  }

  logContent.appendChild(container);
}

async function sendDataTo(options, data) {
  try {
    let structure;

    if (options.headers) {
      structure = {
        method: options.method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : null
      };
    } else {
      structure = { 
        method: options.method,
        body: data ? JSON.stringify(data) : null
      };
    }

    const response = await fetch(options.url, structure);

    if (!response.ok) {
      return { success: false, message: 'Server not available', answer: undefined };
    }

    const answer = await response.json();

    if (!answer) {
      return { success: false, message: 'Answer corrupted', answer: undefined };
    }

    return { success: true, message: 'Operation is successful', answer: answer };
  } catch (error) {
    return { success: false, message: error, answer: undefined };
  }
}

async function clear() {
  statistics.usernameList = [];

  listenerManager.cleanup();

  await fetch(`${localhost}/system/data/clear`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
}

function resetEventSource(e) {
  e.onmessage = null;
  e.onerror = null;
  e.close();
}

async function startBots() {
  log(`Запуск ботов на сервер...`, 'log-info');

  if (activity.botting) {
    log('Запуск невозможен, есть активные боты', 'log-warning'); return;
  }

  try {
    const address = document.getElementById('address').value;
    const version = document.getElementById('version').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const delay = parseInt(document.getElementById('delay').value);

    const username = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;
    const distance = String(document.getElementById('distance').value).toLowerCase();
    const timeout = parseInt(document.getElementById('timeout').value);
    const skipValidation = Boolean(document.getElementById('skip-validation').value);
    const registerCommand = document.getElementById('register-command').value;
    const registerTemplate = document.getElementById('register-template').value;
    const registerMinDelay = parseInt(document.getElementById('register-min-delay').value);
    const registerMaxDelay = parseInt(document.getElementById('register-max-delay').value);
    const loginCommand = document.getElementById('login-command').value;
    const loginTemplate = document.getElementById('login-template').value;
    const loginMinDelay = parseInt(document.getElementById('login-min-delay').value);
    const loginMaxDelay = parseInt(document.getElementById('login-max-delay').value);
    const rejoinQuantity = parseInt(document.getElementById('rejoin-quantity').value);
    const rejoinDelay = parseInt(document.getElementById('rejoin-delay').value);
    const dataUpdateFrequency = parseInt(document.getElementById('data-update-frequency').value);
    const chatHistoryLength = parseInt(document.getElementById('chat-history-length').value);

    const proxyList = String(document.getElementById('proxy-list').value).toLowerCase();

    const useKeepAlive = document.getElementById('use-keep-alive').checked;
    const usePhysics = document.getElementById('use-physics').checked;
    const useProxy = document.getElementById('use-proxy').checked;
    const useAutoRegister = document.getElementById('use-auto-register').checked;
    const useAutoRejoin = document.getElementById('use-auto-rejoin').checked;
    const useAutoLogin = document.getElementById('use-auto-login').checked;
    const useSaveChat = document.getElementById('use-save-chat').checked;
    const useSavePlayers = document.getElementById('use-save-players').checked;
    const useAiAgent = document.getElementById('use-ai-agent').checked;
    const useDataAnalysis = document.getElementById('use-data-analysis').checked;
    const useOptimization = document.getElementById('use-optimization').checked;
    const useErrorCorrector = document.getElementById('use-error-corrector').checked;
    const useExtendedLogs = document.getElementById('use-extended-logs').checked;

    monitoringManager.maxChatHistoryLength = chatHistoryLength;

    const operation = await sendDataTo({ url: `${localhost}/botting/start`, headers: true, method: 'POST' }, {
      address: address,
      version: version || false,
      quantity: quantity,
      delay: delay || 1000,
      username: username,
      password: password,
      distance: distance,
      timeout: timeout || 10000,
      skipValidation: skipValidation,
      registerCommand: registerCommand,
      registerTemplate: registerTemplate,
      registerMinDelay: registerMinDelay || 2000,
      registerMaxDelay: registerMaxDelay || 5000,
      rejoinQuantity: rejoinQuantity,
      rejoinDelay: rejoinDelay || 3000,
      loginCommand: loginCommand,
      loginTemplate: loginTemplate,
      loginMinDelay: loginMinDelay || 2000,
      loginMaxDelay: loginMaxDelay || 3000,
      dataUpdateFrequency: dataUpdateFrequency,
      proxyList: proxyList,
      useKeepAlive: useKeepAlive,
      usePhysics: usePhysics,
      useProxy: useProxy,
      useAutoRegister: useAutoRegister,
      useAutoRejoin: useAutoRejoin,
      useAutoLogin: useAutoLogin,
      useSaveChat: useSaveChat,
      useSavePlayers: useSavePlayers,
      useAiAgent: useAiAgent,
      useDataAnalysis: useDataAnalysis,
      useOptimization: useOptimization,
      useErrorCorrector: useErrorCorrector,
      useExtendedLogs: useExtendedLogs
    });
        
    if (!operation.success) {
      log('Ошибка сервера, перезапустите клиент', 'log-error'); return;
    }

    activity.botting = true;

    log('Включение мониторинга...', 'log-system');

    await monitoringManager.wait();

    log('Мониторинг включён', 'log-system');

    log('Установка SSE-соединения...', 'log-system');

    eventSource = new EventSource(`${localhost}/session/botting`);

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        log(data.message, `log-${data.type}`);

        if (data.message === 'SSE-соединение закрыто') {
          resetEventSource(eventSource);
          await clear();
        }
      } catch (error) {
        log(`Ошибка (start-bots-process): ${error}`, 'log-error');
        resetEventSource(eventSource);
        await clear();
      }
    }

    eventSource.onerror = async () => {
      log('Ошибка (start-bots-process): SSE-connection was dropped', 'log-error');
      resetEventSource(eventSource);
      await clear();
    }
  } catch (error) {
    log(`Ошибка (start-bots-process): ${error}`, 'log-error');
  }
}

async function stopBots() {
  log('Остановка ботов...', 'log-info');

  try {
    const operation = await sendDataTo({ url: `${localhost}/botting/stop`, headers: true, method: 'POST' }, null);

    if (!operation.success) {
      log('Ошибка сервера, перезапустите клиент', 'log-error'); return;
    }

    log(operation.answer.data.message, `log-${operation.answer.type}`);

    log('Выключение мониторинга...', 'log-system');

    await monitoringManager.clear();

    log('Мониторинг выключен', 'log-system');

    activity.botting = false;

    await clear();
  } catch (error) {
    log(`Ошибка (stop-bots-process): ${error}`, 'log-error');
  }
}

class ListenerManager {
  add(id, event, listener) {
    document.getElementById(id).addEventListener(event, listener);
    statistics.listeners.set(id, { event: event, listener: listener });
  }

  cleanup() {
    for (const [id, data] of statistics.listeners) {
      document.getElementById(id).removeEventListener(data.event, data.listener);
    }

    statistics.listeners.clear();
  }
}

class FunctionManager {
  async init() {
    const startBotsProcessBtn = document.getElementById('start');
    const stopBotsProcessBtn = document.getElementById('stop');
    const setRandomValuesBtn =  document.getElementById('random');
    const clearInputValuesBtn = document.getElementById('clear');

    const panelBtns = document.querySelectorAll('.panel-btn');
    const controlBtns = document.querySelectorAll('.control-btn');
    
    panelBtns.forEach(btn => {
      if (btn.id === 'main') btn.classList.add('selected');

      btn.addEventListener('click', () => {
        this.showGlobalContainer(btn.getAttribute('path'));
        panelBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
    
    controlBtns.forEach(btn => {
      if (btn.id === 'control-chat') btn.classList.add('selected');

      btn.addEventListener('click', () => {
        if (btn.getAttribute('path')) {
          this.showControlContainer(btn.getAttribute('path'));
          controlBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          statistics.latestControlContainer = document.getElementById(btn.getAttribute('path'));
        }
      });
    });

    document.querySelectorAll('[toggler="true"]').forEach(e => e.addEventListener('click', async () => await this.control(e.name, e.getAttribute('state'))));

    startBotsProcessBtn.addEventListener('click', async () => await startBots());
    stopBotsProcessBtn.addEventListener('click', async () => await stopBots());

    setRandomValuesBtn.addEventListener('click', () => {
      const versions = [
        '1.8.9', '1.12.2', '1.12',
        '1.14', '1.16.4', '1.16.5',
        '1.19', '1.20.1', '1.20.3',
        '1.21', '1.21.1', '1.21.3',
        '1.21.6', '1.21.5', '1.20.4'
      ];

      const setRandomValue = (e) => {
        let current = document.getElementById(e); 

        switch (e) {
          case 'version':
            const randomVersion = String(versions[Math.floor(Math.random() * versions.length)]);
            current.value = randomVersion; break;
          case 'quantity':
            const randomQuantity = Math.floor(Math.random() * (50 - 10 + 1) + 10);
            current.valueAsNumber = randomQuantity; break;
          case 'delay':
            const randomDelay = Math.floor(Math.random() * (7000 - 1000 + 1) + 1000);
            current.valueAsNumber = randomDelay; break;
        }
      }

      setRandomValue('version');
      setRandomValue('quantity');
      setRandomValue('delay');
    });

    clearInputValuesBtn.addEventListener('click', () => {
      document.getElementById('address').value = '';
      document.getElementById('version').value = '';
      document.getElementById('quantity').value = '';
      document.getElementById('delay').value = '';
    });
  }

  showGlobalContainer(id) {
    globalContainers.forEach(c => c && c.id === id ? c.el.style.display = 'flex' : c.el.style.display = 'none');
    controlContainers.forEach(c => c.el.style.display = 'none');

    if (id === 'control-container') {
      statistics.latestControlContainer ? statistics.latestControlContainer.style.display = 'flex' : document.getElementById('control-chat-container').style.display = 'flex';
    }
  }

  showControlContainer(id) {
    controlContainers.forEach(c => c && c.id === id ? c.el.style.display = 'flex' : c.el.style.display = 'none');
  }

  async control(name, state) {
    try {
      const elements = document.querySelectorAll(`[control="${name}"]`);

      let options = {};

      elements.forEach(e => {
        if (e.tagName.toLowerCase() === 'select') {
          options[e.name] = e.value;
        } else if (e.tagName.toLowerCase() === 'input') {
          if (e.type === 'checkbox') {
            options[e.name] = e.checked;
          } else {
            options[e.name] = e.type === 'number' ? Number(e.value) : e.value;
          }
        }
      });

      const operation = await sendDataTo({ url: `${localhost}/control/${name}`, headers: true, method: 'POST' }, {
        ...options,
        state: state
      });

      if (!operation.success) {
        log(`Ошибка управления (${name}): ${error}`, 'log-error'); return;
      }

      log(operation.answer.data.message, `log-${operation.answer.type}`);
    } catch (error) {
      log(`Ошибка управления (${name}): ${error}`, 'log-error');
    }
  }
}

class GraphicManager {
  chartActiveBots = undefined;
  chartAverageLoad = undefined;

  async init() {
    await this.createGraphicActiveBots();
    await this.createGraphicAverageLoad();
  }

  async enableGraphicActiveBots() {
    try {
      const eventSource = new EventSource(`${localhost}/session/graphic/active-bots`);

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          const activeBotsQuantity = data.activeBotsQuantity;
          await this.addGraphicDataActiveBots(activeBotsQuantity);
        } catch (error) {
          log(`Ошибка парсинга SSE-сообщения (graphic-active-bots): ${error}`, 'log-error');
        }
      }

      eventSource.onerror = async () => {
        log('Ошибка (graphic-active-bots): SSE-connection was dropped', 'log-error');
        resetEventSource(eventSource);
      }
    } catch (error) {
      log(`Ошибка инициализации графика активных ботов: ${error}`, 'log-error');
    }
  }

  async enableGraphicAverageLoad() {
    try {
      const eventSource = new EventSource(`${localhost}/session/graphic/average-load`);
      
      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          const averageLoad = data.averageLoad ? data.averageLoad : 0;
          await this.addGraphicDataAverageLoad(averageLoad);
        } catch (error) {
          log(`Ошибка парсинга SSE-сообщения (graphic-average-load): ${error}`, 'log-error');
        }
      }

      eventSource.onerror = async () => {
        log('Ошибка (graphic-average-load): SSE-connection was dropped', 'log-error');
        resetEventSource(eventSource);
      }
    } catch (error) {
      log(`Ошибка инициализации графика средней нагрузки ботов: ${error}`, 'log-error');
    }
  }
  
  async createGraphicActiveBots() {
    const context = document.getElementById('graphic-active-bots').getContext('2d');

    if (!context) return;

    const initialLabels = [];
    const initialDataActive = [];
    
    for (let i = 0; i < 31; i++) {
      initialLabels.push(date());
      initialDataActive.push(0);
    }

    this.chartActiveBots = new Chart(context, {
      type: 'line',
      data: {
        labels: initialLabels,
        datasets: [
          {
            label: ' Активные боты',
            data: initialDataActive,
            pointStyle: false,
            fill: true,
            borderWidth: 2,
            borderColor: '#4e64f3ff',
            backgroundColor: '#3b55ff23',
            tension: 0.1,
            pointStyle: 'circle',
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 400 },
        scales: {
          x: {
            ticks: { color: '#858585ff' },
            border: { color: '#383838ab' },
            grid: { color: '#383838ab' }
          },
          y: {
            min: 0,
            max: 500, 
            ticks: { color: '#a3a3a3ff' },
            border: { color: '#383838ab' },
            grid: { color: '#383838ab' }
          }
        },
        plugins: {
          title: {
            text: 'График активных ботов',
            display: true,
            color: '#a2a2a2ff'
          },
          legend: {
            display: false,
            position: 'top',
            labels: {
              color: '#979797ff',
              font: { size: 12 },
              usePointStyle: true
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(10, 10, 10, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff'
          }
        }
      }
    });
  }

  async createGraphicAverageLoad() {
    const context = document.getElementById('graphic-average-load').getContext('2d');

    if (!context) return;

    const initialLabels = [];
    const initialDataLoad = [];
    
    for (let i = 0; i < 31; i++) {
      initialLabels.push(date());
      initialDataLoad.push(0);
    }

    this.chartAverageLoad = new Chart(context, {
      type: 'line',
      data: {
        labels: initialLabels,
        datasets: [
          {
            label: ' Средняя нагрузка',
            data: initialDataLoad,
            pointStyle: false,
            fill: true,
            borderWidth: 2,
            borderColor: '#4e64f3ff',
            backgroundColor: '#3b55ff23',
            tension: 0.1,
            pointStyle: 'circle',
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 400 },
        scales: {
          x: {
            ticks: { color: '#858585ff' },
            border: { color: '#383838ab' },
            grid: { color: '#383838ab' }
          },
          y: {
            min: 0,
            max: 100, 
            ticks: {
              callback: (value) => { return value + '%' },
              color: '#a3a3a3ff',   
              font: { size: 12 },   
              maxRotation: 0,
              minRotation: 0
            },
            border: { color: '#383838ab' },
            grid: { color: '#383838ab' }
          }
        },
        plugins: {
          title: {
            text: 'График средней нагрузки ботов',
            display: true,
            color: '#a2a2a2ff'
          },
          legend: {
            display: false,
            position: 'top',
            labels: {
              color: '#979797ff',
              font: { size: 12 },
              usePointStyle: true
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(10, 10, 10, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff'
          }
        }
      }
    });
  }

  async addGraphicDataActiveBots(activeBotsQuantity) {
    this.chartActiveBots.data.labels?.push(date());
    this.chartActiveBots.data.datasets[0].data.push(activeBotsQuantity);

    if (this.chartActiveBots.data.labels && this.chartActiveBots.data.labels.length > 31) {
      this.chartActiveBots.data.labels.shift();
      this.chartActiveBots.data.datasets[0].data.shift();
    }
      
    this.chartActiveBots.update(); 
  }

  async addGraphicDataAverageLoad(averageLoad) {
    this.chartAverageLoad.data.labels?.push(date());
    this.chartAverageLoad.data.datasets[0].data.push(averageLoad);

    if (this.chartAverageLoad.data.labels && this.chartAverageLoad.data.labels.length > 31) {
      this.chartAverageLoad.data.labels.shift();
      this.chartAverageLoad.data.datasets[0].data.shift();
    }
      
    this.chartAverageLoad.update(); 
  }
}

class MonitoringManager {
  statusText = null;
  botCardsContainer = null;

  maxChatHistoryLength = null;
  chatMessageCounter = {};
  chatHistoryFilters = {};

  async init() {
    this.statusText = document.getElementById('monitoring-status-text');
    this.botCardsContainer = document.getElementById('bot-cards-container');

    this.statusText.innerText = 'Объекты ботов отсутствуют';
    this.statusText.style.color = '#646464f7';
    this.statusText.style.display = 'flex';
  }

  async wait() {
    this.statusText.innerText = 'Ожидание активных ботов...';
    this.statusText.style.color = '#646464f7';

    this.botCardsContainer.innerHTML = '';
    this.botCardsContainer.style.display = 'grid';
  }

  async clear() {
    const cards = document.querySelectorAll('bot-card');

    listenerManager.cleanup();

    this.chatMessageCounter = {};
    this.chatHistoryFilters = {};

    cards.forEach(card => card.remove());

    this.statusText.innerText = 'Объекты ботов отсутствуют';
    this.statusText.style.color = '#646464f7';
    this.statusText.style.display = 'flex';

    this.botCardsContainer.innerHTML = '';
    this.botCardsContainer.style.display = 'none';
  }

  initializeBotCard(username) {
    const chat = document.getElementById(`chat-${username}`);

    listenerManager.add(`open-chat-${username}`, 'click', () => chat.style.display = 'flex');
    listenerManager.add(`close-chat-${username}`, 'click', () => chat.style.display = 'none');

    listenerManager.add(`recreate-${username}`, 'click', async () => {
      try {
        const operation = await sendDataTo({ url: `${localhost}/advanced/recreate`, method: 'POST', headers: true }, { 
          username: username
        });

        log(operation.answer.data.message, `log-${operation.answer.type}`);
      } catch (error) {
        log(`Ошибка пересоздания бота ${username}: ${error}`, 'log-error');
      }
    });

    listenerManager.add(`filter-chat-${username}`, 'click', () => {
      try {
        const content = document.getElementById(`monitoring-chat-content-${username}`);
        const type = document.getElementById(`select-chat-filter-${username}`);

        const history = [...document.querySelectorAll(`#monitoring-message-${username}`).values()];
        
        content.innerHTML = '';

        this.chatHistoryFilters[username] = type.value;

        history.forEach(m => this.filterMessage(type.value, m.textContent) ? content.appendChild(m) : null);
      } catch (error) {
        log(`Ошибка фильтровки чата: ${error}`, 'log-error');
      }
    });

    listenerManager.add(`clear-chat-${username}`, 'click', () => {
      const messages = document.querySelectorAll(`#monitoring-message-${username}`);
      messages.forEach(msg => msg.remove());
      this.chatMessageCounter[username] = 0;
    });

    const sendMsg = async () => {
      const message = document.getElementById(`this-chat-message-${username}`);

      const operation = await sendDataTo({ url: `${localhost}/advanced/send-message`, method: 'POST', headers: true }, { 
        username: username,
        message: message.value
      });

      if (operation.answer.data.success) {
        message.value = '';
      }

      log(operation.answer.data.message, `log-${operation.answer.type}`);
    }

    listenerManager.add(`chat-${username}`, 'keydown', async (e) => e.key === 'Enter' ? await sendMsg() : null);
    listenerManager.add(`send-message-${username}`, 'click', async () => await sendMsg());
  }

  async enableProfileDataMonitoring() {
    try {
      const steveIconPath = document.getElementById('steve-img');

      const eventSource = new EventSource(`${localhost}/session/monitoring/profile-data`);

      const listener = async (event) => {
        try {
          if (!activity.botting) return;

          const data = JSON.parse(event.data);

          const { 
            username, status, statusColor, 
            version, password, proxyType, 
            proxy, load, loadColor, 
            ping, pingColor
          } = data;

          if (statistics.usernameList.length === 0) {
            this.statusText.style.display = 'none';
          }

          if (statistics.usernameList.includes(username)) {
            document.getElementById(`bot-status-${username}`).innerHTML = `<span style="color: ${statusColor};">• ${status}</span>`;
            document.getElementById(`bot-version-${username}`).innerHTML = `  ${version}`;
            document.getElementById(`bot-password-${username}`).innerHTML = `  ${password}`;
            document.getElementById(`bot-proxy-${username}`).innerHTML = `  ${proxy}`;
            document.getElementById(`bot-proxy-type-${username}`).innerHTML = `  ${proxyType}`;
            document.getElementById(`bot-load-${username}`).innerHTML = `<span style="color: ${loadColor};">  ${load}</span>`;
            document.getElementById(`bot-ping-${username}`).innerHTML = `<span style="color: ${pingColor};">  ${ping}</span>`;
          } else {
            const card = document.createElement('div');
            card.className = 'bot-card';

            card.innerHTML = `
              <div class="bot-card-head">
                <img src="${steveIconPath.src}" class="image" draggable="false">
                <div class="text">
                  <div class="bot-basic-info">
                    <div class="bot-nickname" style="user-select: text; -moz-user-select: text;">${username}</div>
                    <div class="bot-status"><span id="bot-status-${username}" style="color: ${statusColor};">• ${status}</span></div>
                  </div>
                </div>
              </div>

              <div class="bot-advanced-info">
                <p>Версия:<span id="bot-version-${username}">  ${version}</span></p>
                <p>Пароль:<span id="bot-password-${username}">  ${password}</span></p>
                <p>Прокси:<span id="bot-proxy-${username}">  ${proxy}</span></p>
                <p>Протокол:<span id="bot-proxy-type-${username}">  ${proxyType}</span></p>
                <p>Нагрузка:<span id="bot-load-${username}"><span style="color: ${loadColor};">  ${load}</span></span></p>
                <p>Пинг:<span id="bot-ping-${username}"><span style="color: ${pingColor};">  ${ping}</span></span></p>
              </div>

              <button class="btn spec" id="open-chat-${username}">Открыть чат</button>

              <button class="btn red spec" id="recreate-${username}" style="margin-bottom: 10px;">Пересоздать</button>

              <div class="chat-container" id="chat-${username}">
                <div class="chat-element-group">
                  <div class="left-group">
                    <div class="custom-select">
                      <select id="select-chat-filter-${username}">
                        <option value="all">Все сообщения</option>
                        <option value="bans">Блокировки</option>
                        <option value="mentions">Упоминания</option>
                        <option value="warnings">Предупреждения</option>
                        <option value="links">Ссылки</option>
                      </select>
                    </div>

                    <button class="btn green min" id="filter-chat-${username}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-funnel-fill" viewBox="0 0 16 16">
                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
                      </svg>
                    </button>
                  </div>

                  <div class="right-group">
                    <button class="btn red min" id="clear-chat-${username}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                      </svg>
                    </button>

                    <button class="btn min" id="close-chat-${username}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="chat-content">
                  <div class="monitoring-content" id="monitoring-chat-content-${username}"></div>
                </div>

                <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                  <p class="signature">${username}:</p>

                  <input type="text" control="this" id="this-chat-message-${username}" placeholder="Сообщение" style="height: 27px;">

                  <button class="btn green" id="send-message-${username}">Отправить</button>
                </div>
              </div>
            `;

            this.botCardsContainer.appendChild(card);
            this.chatHistoryFilters[username] = 'all';

            statistics.usernameList.push(username);

            setTimeout(() => this.initializeBotCard(username), 200);
          }
        } catch (error) {
          log(`Ошибка парсинга SSE-сообщения (bots-monitoring): ${error}`, 'log-error');
        }
      } 

      eventSource.onmessage = async (event) => await listener(event);

      eventSource.onerror = async () => {
        log('Ошибка (bots-monitoring): SSE-connection was dropped', 'log-error');
        eventSource.removeEventListener('message', listener);
        eventSource.close();

        this.botCardsContainer.innerHTML = '';

        this.statusText.innerText = 'Ошибка соединения с сервером\nПодробнее: SSE-connection was dropped';
        this.statusText.style.color = '#e32020ff';
        this.statusText.style.display = 'flex';
      }
    } catch (error) {
      log(`Ошибка инициализации мониторинга ботов: ${error}`, 'log-error');
    }
  }

  createTrigrams(word) {
    const trigrams = [];

    for (let i = 0; i <= word.length - 3; i++) {
      trigrams.push(word.substr(i, 3));
    }

    return trigrams;
  }

  checkPatterns(word, patterns) {
    if (word.length < 3) return false;

    let totalTrigrams = 0;
    let similarTrigrams = 0;

    const wts = this.createTrigrams(word);
    totalTrigrams = wts.length;

    for (const p of patterns) {
      const pts = this.createTrigrams(p);
      for (const wt of wts) {
        for (const pt of pts) {
          if (wt.toLowerCase() == pt.toLowerCase()) {
            similarTrigrams++;
          }
        }
      }
    }

    if (similarTrigrams >= totalTrigrams / 2) {
      return true;
    } 

    return false;
  }

  filterMessage(type, message) {
    if (type === 'all') {
      return true;
    } else if (type === 'links') {
      const patterns = [
        'http://', 'https://', 'socks5://', 'socks4://', 
        '.dev', '.com', '.org', '.io', '.ai', '.net',
        '.pro', '.gov', '.lv', '.ru', '.onion', '.ie',
        '.co', '.fun', '.gg', '.xyz', '.club', '.eu',
        '.me', '.us', '.online', '.br', '.cc', '.no'
      ];

      let result = false;
      
      patterns.forEach(p => message.toLowerCase().includes(p) ? result = true : null);

      return result;
    } else {
      const patterns = {
        bans: [
          'banned', 'ban', 'kicked',
          'kick', 'кикнут', 'заблокированный',
          'заблокирован', 'блокировка',
          'заблокировали', 'забанен', 
          'забанили', 'бан', 'blocked'
        ],
        warnings: [
          'предупреждение', 'warn', 'warning', 
          'важно', 'important', 'предупреждает', 
          'важная', 'уведомление', 'осведомление',
          'notice', 'уведомлять', 'замечание'
        ],
        mentions: [
          'упомянут', 'mention', 'reference', 
          'упоминает', 'упоминание', 'ссылаться'
        ]
      };

      let results = [];

      for (const word of message.split(' ')) {
        const result = this.checkPatterns(word, patterns[type]);
        results.push(result);
      }

      if (results.includes(true)) return true;
    }
      
    return false;
  }

  async enableChatHistoryMonitoring() {
    try {
      const eventSource = new EventSource(`${localhost}/session/monitoring/chat-history`);

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          const username = data.username;
          const type = data.type;
          const text = data.text;

          if (!this.chatHistoryFilters[username]) {
            this.chatHistoryFilters[username] = 'all';
          }

          if (!this.filterMessage(this.chatHistoryFilters[username], String(text))) return;

          const chat = document.getElementById(`monitoring-chat-content-${username}`);

          if (!chat) return;

          const container = document.createElement('div');

          container.className = 'monitoring-line';
          container.id = `monitoring-message-${username}`;

          container.innerHTML = `
            <div class="monitoring-line-time">${date()}</div>
            <div class="monitoring-line-content"><span class="monitoring-type">(${type})</span> ${String(text).replace('%hb', '<span style="color: #56dd30ff; font-weight: 600;">').replace('%sc', '</span>')}</div>
          `;

          chat.appendChild(container);

          if (!this.chatMessageCounter[username]) {
            this.chatMessageCounter[username] = 1;
          } else {
            this.chatMessageCounter[username] = this.chatMessageCounter[username] + 1;

            if (this.chatMessageCounter[username] > this.maxChatHistoryLength) {
              this.chatMessageCounter[username] = this.chatMessageCounter[username] - 1;
              chat.firstChild.remove();
            }
          }
        } catch (error) {
          log(`Ошибка парсинга SSE-сообщения (chat-monitoring): ${error}`, 'log-error');
        }
      }

      eventSource.onerror = async () => {
        log('Ошибка (chat-monitoring): SSE-connection was dropped', 'log-error');
        eventSource.close();

        this.chatMessageCounter = {};

        for (const username of statistics.usernameList) {
          const chat = document.getElementById(`monitoring-chat-content-${username}`);

          chat.innerHTML = '';
          chat.style.display = 'none';
          chat.remove();
        }
      }
    } catch (error) {
      log(`Ошибка инициализации мониторинга чата: ${error}`, 'log-error');
    }
  }
}

class ProxyManager {
  proxyList = null;
  proxyCount = { socks5: null, socks4: null, http: null, total: null };

  proxyFinderStatus = null;

  async init() {
    this.proxyList = document.getElementById('proxy-list');

    this.proxyFinderStatus = document.getElementById('proxy-finder-status');

    this.proxyCount.socks5 = document.getElementById('socks5-proxy-count');
    this.proxyCount.socks4 = document.getElementById('socks4-proxy-count');
    this.proxyCount.http = document.getElementById('http-proxy-count');
    this.proxyCount.total = document.getElementById('total-proxy-count');

    this.proxyList.addEventListener('input', () => this.updateCount());

    document.getElementById('load-proxy-file').addEventListener('click', async () => {
      const [path, data] = await client.openFile();

      if (!path || !data) return;

      const splitPath = String(path).split('.');

      if (splitPath[splitPath.length - 1] === 'txt') {
        const separators = ['\n', ',', ' ', ';', '-', '?'];
        let sep = null;

        for (const s of separators) {
          if (String(data).split(s).length > 1) {
            sep = s;
            break;
          }

          continue;
        }

        if (!sep) return;
        
        this.proxyList.value = String(data).split(sep).join('\n');
      } else if (splitPath[splitPath.length - 1] === 'json') {
        let isFirst = true;

        const protocols = ['http', 'socks4', 'socks5'];

        for (const protocol of protocols) {
          if (JSON.parse(data)[protocol]) {
            for (const proxy of JSON.parse(data)[protocol]) {
              isFirst ? isFirst = false : this.proxyList.value += '\n';
              this.proxyList.value += `${protocol}://${proxy}`;
            }
          }
        }
      } else {
        log(`Ошибка загрузки файла: Invalid file format`, 'log-error');
      }

      this.updateCount();
    });

    document.getElementById('clear-proxy-list').addEventListener('click', () => {
      this.proxyList.value = '';
      this.updateCount();
    });

    document.getElementById('find-proxy').addEventListener('click', () => this.collectProxy());

    this.updateCount();
  }

  updateCount() {
    let socks5 = 0;
    let socks4 = 0;
    let http = 0;

    String(this.proxyList.value).split('\n').forEach(element => {
      if (element.startsWith('socks5://')) socks5++;
      if (element.startsWith('socks4://')) socks4++;
      if (element.startsWith('http://')) http++;
    });

    this.proxyCount.socks5.innerText = socks5;
    this.proxyCount.socks4.innerText = socks4;
    this.proxyCount.http.innerText = http;
    this.proxyCount.total.innerText = socks5 + socks4 + http;
  }
  
  async collectProxy() {
    try {
      const algorithm = document.getElementById('proxy-finder-algorithm').value;
      const protocol = document.getElementById('proxy-finder-protocol').value;
      const country = document.getElementById('proxy-finder-country').value;
      const count = document.getElementById('proxy-finder-count').value;

      this.proxyFinderStatus.innerText = 'Поиск прокси...';

      const proxies = await client.scrapeProxies({
        algorithm: algorithm,
        protocol: protocol,
        country: country,
        count: count
      });

      if (proxies) {
        this.proxyFinderStatus.style.color = '#0cd212ff';
        this.proxyFinderStatus.innerText = 'Поиск окончен';
        this.proxyList.value = Array.from(String(proxies).split('\n')).filter(e => e && e.trim() !== '').join('\n');
      } else {
        this.proxyFinderStatus.style.color = '#cc1d1dff';
        this.proxyFinderStatus.innerText = 'Ошибка поиска';

        log(`Ошибка поиска прокси`, 'log-error');
      }
    } catch (error) {
      this.proxyFinderStatus.style.color = '#cc1d1dff';
      this.proxyFinderStatus.innerText = 'Ошибка поиска';

      log(`Ошибка поиска прокси: ${error}`, 'log-error');
    } finally {
      this.updateCount();
      setTimeout(() => {
        this.proxyFinderStatus.style.color = '#848080';
        this.proxyFinderStatus.innerText = 'Поиск неактивен';
      }, 2000);
    }
  }
}

class ConfigManager {
  async init() {
    await this.create();
  }

  async create() {
    if (!localStorage.getItem('salarixionion:config')) {
      localStorage.setItem('salarixionion:config', JSON.stringify({}, null, 2));
    }
  }

  async load() {
    try {
      let config = null;

      for (let attempts = 0; attempts < 8; attempts++) {
        const data = localStorage.getItem('salarixionion:config');

        if (!data) {
          continue;
        } else {
          config = JSON.parse(data);
          break;
        } 
      }

      return config;
    } catch {
      return null;
    }
  }

  async save(config) {
    for (let attempts = 0; attempts < 4; attempts++) {
      localStorage.setItem('salarixionion:config', JSON.stringify(config, null, 2))
      break;
    }
  }
}

const listenerManager = new ListenerManager();
const functionManager = new FunctionManager();
const graphicManager = new GraphicManager();
const monitoringManager = new MonitoringManager();
const proxyManager = new ProxyManager();
const configManager = new ConfigManager();

setInterval(async () => {
  if (!statistics.isInitialized) return;

  const elements = document.querySelectorAll('[keep="true"]');

  const config = {};

  for (const element of elements) {
    if (element.type === 'checkbox') {
      config[element.name] = {
        id: element.id,
        value: element.checked
      };
    } else {
      config[element.name] = {
        id: element.id,
        value: element.type === 'number' ? parseInt(element.value) : element.value
      };
    }
  }

  if (JSON.stringify(config) === JSON.stringify(statistics.latestConfig)) return;

  await configManager.save(config);

  statistics.latestConfig = config;
}, 1400);

async function loadConfig() {
  log('Загрузка конфига...', 'log-system');

  const config = await configManager.load();

  if (!config) {
    log(`Ошибка (load-config): Файл конфигурации отсутствует или повреждён`, 'log-error');
    return;
  }

  for (const [_, element] of Object.entries(config)) {
    if (element.value) {
      const html = document.getElementById(element.id);

      if (html) {
        if (String(element.id).startsWith('use')) {
          html.checked = element.value;
        } else {
          if (typeof element.value === 'number') {
            html.valueAsNumber = element.value ? element.value : 0;
          } else {
            html.value = element.value;
          }
        }
      } 
    }
  }

  log('Конфиг успешно загружен', 'log-system');
}

async function initInformationCard() {
  const clientHeaderContainer = document.getElementById('client-header');
  const clientVersionContainer = document.getElementById('client-version');
  const clientTypeContainer = document.getElementById('client-type');
  const clientReleaseDateContainer = document.getElementById('client-release-date');

  const info = await client.getInfo();

  if (info.type === 'Beta') {
    clientHeaderContainer.classList.add('beta');
  } else if (info.type === 'Expert') {
    clientHeaderContainer.classList.add('expert');
  }

  const header = `${info.type} Release`;

  clientHeaderContainer.innerText = header;
  clientVersionContainer.innerText = info.version;
  clientTypeContainer.innerText = info.type;
  clientReleaseDateContainer.innerText = info.releaseDate;
}

async function initSocialButtons() {
  document.getElementById('telegram').addEventListener('click', async () => await client.openUrl('https://t.me/salarixionion')); 
  document.getElementById('github').addEventListener('click', async () => await client.openUrl('https://github.com/nullclyze/SalarixiOnion'));
  document.getElementById('youtube').addEventListener('click', async () => await client.openUrl('https://www.youtube.com/@salarixionion'));
}

function updateDisplayOfElements(condition, view, show = [], hide = []) {
  hide.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = condition ? 'none' : view;
  });
  
  show.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = condition ? view : 'none';
  });
}

async function initCheckboxes() {
  try {
    const update = () => {
      updateDisplayOfElements(document.getElementById('use-auto-register').checked, 'flex', ['auto-register-input-container']);
      updateDisplayOfElements(document.getElementById('use-auto-login').checked, 'flex', ['auto-login-input-container']);
      updateDisplayOfElements(document.getElementById('use-auto-rejoin').checked, 'flex', ['auto-rejoin-input-container']);
    }

    document.getElementById('use-auto-register').addEventListener('change', function () { updateDisplayOfElements(this.checked, 'flex', ['auto-register-input-container']); });
    document.getElementById('use-auto-login').addEventListener('change', function () { updateDisplayOfElements(this.checked, 'flex', ['auto-login-input-container']); });
    document.getElementById('use-auto-rejoin').addEventListener('change', function () { updateDisplayOfElements(this.checked, 'flex', ['auto-rejoin-input-container']); });
  
    document.getElementById('use-action-impulsiveness').addEventListener('change', function () { updateDisplayOfElements(this.checked, 'flex', ['action-jumping-and-shifting-input-container']); });

    document.getElementById('show-system-log').addEventListener('change', function () {
      const systemLogs = document.querySelectorAll('.log-line-system');
      
      if (this.checked) {
        statistics.showSystemLogs = true;
        systemLogs.forEach(element => element.style.display = 'flex');
      } else {
        statistics.showSystemLogs = false;
        systemLogs.forEach(element => element.style.display = 'none');
      }
    });

    update();
  } catch (error) {
    log(`Ошибка операции initCheckboxes: ${error}`, 'log-error');
  }
}

async function initSelects() {
  try {
    const chatTypeSelect = document.getElementById('chat-type');
    const actionSelect = document.getElementById('select-action');
    const imitationSelect = document.getElementById('select-imitation');
    const spoofingSettings = document.getElementById('select-spoofing-settings');
    const flightSettings = document.getElementById('select-flight-settings');

    chatTypeSelect.addEventListener('change', () => {
      const chatSpammingChbxContainer = document.getElementById('chat-spamming-chbx-container');
      const chatSpammingInputContainer = document.getElementById('chat-spamming-input-container');
            
      const chatDefaultBtnsContainer = document.getElementById('chat-default-btns-container');
      const chatSpammingBtnsContainer = document.getElementById('chat-spamming-btns-container');

      if (chatTypeSelect.value === 'spamming') {
        chatSpammingChbxContainer.style.display = 'flex';
        chatSpammingInputContainer.style.display = 'flex';
        chatSpammingBtnsContainer.style.display = 'flex';

        chatDefaultBtnsContainer.style.display = 'none';
      } else {
        chatDefaultBtnsContainer.style.display = 'flex';

        chatSpammingChbxContainer.style.display = 'none';
        chatSpammingInputContainer.style.display = 'none';
        chatSpammingBtnsContainer.style.display = 'none';
      }
    });

    actionSelect.addEventListener('change', () => {
      const actionJumpingAndShiftingInputContainer = document.getElementById('action-jumping-and-shifting-input-container');
      const actionJumpingAndShiftingChbxContainer = document.getElementById('action-jumping-and-shifting-chbx-container');
      const actionWavingChbxContainer = document.getElementById('action-waving-chbx-container');
      const actionSpinningChbxContainer = document.getElementById('action-spinning-chbx-container');

      if (actionSelect.value === 'jumping' || actionSelect.value === 'shifting') {
        actionJumpingAndShiftingInputContainer.style.display = 'flex';
        actionJumpingAndShiftingChbxContainer.style.display = 'flex';
        actionWavingChbxContainer.style.display = 'none';
        actionSpinningChbxContainer.style.display = 'none';
      } else if (actionSelect.value === 'waving') {
        actionJumpingAndShiftingInputContainer.style.display = 'none';
        actionJumpingAndShiftingChbxContainer.style.display = 'none';
        actionWavingChbxContainer.style.display = 'flex';
        actionSpinningChbxContainer.style.display = 'none';
      } else if (actionSelect.value === 'spinning') {
        actionJumpingAndShiftingInputContainer.style.display = 'none';
        actionJumpingAndShiftingChbxContainer.style.display = 'none';
        actionWavingChbxContainer.style.display = 'none';
        actionSpinningChbxContainer.style.display = 'flex';
      }
    });

    imitationSelect.addEventListener('change', () => {
      const hybridImitationChbxContainer = document.getElementById('imitation-hybrid-chbx-container');
      const walkingImitationChbxContainer = document.getElementById('imitation-walking-chbx-container');
      const lookingImitationChbxContainer = document.getElementById('imitation-looking-chbx-container');

      if (imitationSelect.value === 'hybrid') {
        hybridImitationChbxContainer.style.display = 'flex';
        walkingImitationChbxContainer.style.display = 'none';
        lookingImitationChbxContainer.style.display = 'none';
      } else if (imitationSelect.value === 'walking') {
        hybridImitationChbxContainer.style.display = 'none';
        walkingImitationChbxContainer.style.display = 'flex';
        lookingImitationChbxContainer.style.display = 'none';
      } else if (imitationSelect.value === 'looking') {
        hybridImitationChbxContainer.style.display = 'none';
        walkingImitationChbxContainer.style.display = 'none';
        lookingImitationChbxContainer.style.display = 'flex';
      }
    });

    spoofingSettings.addEventListener('change', () => {
      const spoofingModeContainer = document.getElementById('spoofing-mode-container');
      const spoofingManualSettingsContainer = document.getElementById('spoofing-manual-settings-container');

      if (spoofingSettings.value === 'adaptive') {
        spoofingModeContainer.style.display = 'none';
        spoofingManualSettingsContainer.style.display = 'none';
      } else {
        spoofingModeContainer.style.display = 'grid';
        spoofingManualSettingsContainer.style.display = 'flex';
      }
    });

    flightSettings.addEventListener('change', () => {
      const flightManualSettingsContainer = document.getElementById('flight-manual-settings-container');

      if (flightSettings.value === 'adaptive') {
        flightManualSettingsContainer.style.display = 'none';
      } else {
        flightManualSettingsContainer.style.display = 'flex';
      }
    });
  } catch (error) {
    log(`Ошибка операции initSelects: ${error}`, 'log-error');
  }
}

async function checkUpdate() {
  try {
    const closeNoticeBtn = document.getElementById('close-notice-btn');

    closeNoticeBtn.addEventListener('click', () => {
      const notice = document.getElementById('notice');
      if (!notice) return;
      notice.style.display = 'none';
    });

    const notice = document.getElementById('notice');
    const newVersion = document.getElementById('new-client-version');
    const newType = document.getElementById('new-client-type');
    const newTag = document.getElementById('new-client-tag');
    const newReleaseDate = document.getElementById('new-client-release-date');
    const openClientRelease = document.getElementById('open-client-release');

    const response = await fetch('https://raw.githubusercontent.com/nullclyze/SalarixiOnion/refs/heads/main/salarixi.version.json', { method: 'GET' });

    if (!response.ok) return;

    const data = await response.json();
    const info = await client.getInfo();

    if (data && data.version !== info.version) {
      tag = `v${data.version}-${String(data.type).toLowerCase()}`;

      newVersion.innerText = data.version;
      newType.innerText = data.type;
      newTag.innerText = tag;
      newReleaseDate.innerText = data.releaseDate;
      
      openClientRelease.addEventListener('click', async () => await client.openUrl(`https://github.com/nullclyze/SalarixiOnion/releases/tag/${tag}`));
      
      setTimeout(() => {
        notice.style.display = 'flex';
      }, 3500);
    }
  } catch (error) {
    log(`Ошибка проверки обновлений: ${error}`, 'log-error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  log('Клиент запущен', 'log-info');

  try {
    localhost = `http://localhost:${await client.port()}/salarixi`;

    const data = await client.getInfo();

    document.getElementById('title-version').innerText = `v${data.version}`;

    document.getElementById('window-minimize').addEventListener('click', () => client.window('minimize'));
    document.getElementById('window-close').addEventListener('click', () => client.window('close'));

    document.querySelectorAll('[global="true"]').forEach(c => globalContainers.push({ id: c.id, el: c }));
    document.querySelectorAll('[sector="true"]').forEach(c => controlContainers.push({ id: c.id, el: c }));

    await clear();

    await configManager.init();

    await loadConfig();

    await initInformationCard();
    await initSocialButtons();

    await functionManager.init();

    await proxyManager.init();

    await graphicManager.init();
    await graphicManager.enableGraphicActiveBots();
    await graphicManager.enableGraphicAverageLoad();

    await monitoringManager.init();
    await monitoringManager.enableProfileDataMonitoring();
    await monitoringManager.enableChatHistoryMonitoring();
    
    await initCheckboxes();
    await initSelects();

    statistics.isInitialized = true;

    const loadingContainer = document.getElementById('loading-container');

    if (loadingContainer) {
      setTimeout(() => {
        loadingContainer.classList.add('hide');
        setTimeout(() => {
          loadingContainer.style.display = 'none';
        }, 590);
      }, 1000);
    }

    await checkUpdate();
  } catch (error) {
    log(`Ошибка инициализации: ${error}`, 'log-error');
  }
});