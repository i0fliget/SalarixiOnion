import Logger from './logger';
import Configurator from './tools/configurator';
import Cleaner from './tools/cleaner';

const logger = new Logger();
const configurator = new Configurator();
const cleaner = new Cleaner();

// Структура обыкновенных SSE-сообщений
interface ServerMessageStructure {
  type: string;
  data: {
    success: boolean;
    message: string;
  }
}

class Functions {
  public flags = {
    IS_ACTIVE: false
  }

  public async initializeButtonFunctions(): Promise<void> {
    try {
      const initButtonsGlobal = async () => {
        try {
          const saveConfigBtn = document.getElementById('save-config') as HTMLButtonElement;

          saveConfigBtn.addEventListener('click', async () => {
            try {
              const address = (document.getElementById('address') as HTMLInputElement).value;
              const version = (document.getElementById('version') as HTMLInputElement).value;
              const quantity = parseInt((document.getElementById('quantity') as HTMLInputElement).value);
              const delay = parseInt((document.getElementById('delay') as HTMLInputElement).value);

              const nickname = (document.getElementById('nickname') as HTMLInputElement).value;
              const password = (document.getElementById('password') as HTMLInputElement).value;
              const timeout = parseInt((document.getElementById('timeout') as HTMLInputElement).value);
              const distance = (document.getElementById('distance') as HTMLInputElement).value;
              const registerCommand = (document.getElementById('register-command') as HTMLInputElement).value;
              const registerTemplate = (document.getElementById('register-template') as HTMLInputElement).value;
              const loginCommand = (document.getElementById('login-command') as HTMLInputElement).value;
              const loginTemplate = (document.getElementById('login-template') as HTMLInputElement).value;
              const rejoinQuantity = parseInt((document.getElementById('rejoin-quantity') as HTMLInputElement).value);
              const rejoinDelay = parseInt((document.getElementById('rejoin-delay') as HTMLInputElement).value);

              const proxyList = (document.getElementById('proxy-list') as HTMLTextAreaElement).value;

              const message = (document.getElementById('chat-message') as HTMLInputElement).value;
              const spammingMinDelay = parseInt((document.getElementById('chat-spamming-min-delay') as HTMLInputElement).value);
              const spammingMaxDelay = parseInt((document.getElementById('chat-spamming-max-delay') as HTMLInputElement).value);

              const script = (document.getElementById('script-input') as HTMLTextAreaElement).value;

              const useKeepAlive = (document.getElementById('use-keep-alive') as HTMLInputElement).checked;
              const usePhysics = (document.getElementById('use-physics') as HTMLInputElement).checked;
              const useProxy = (document.getElementById('use-proxy') as HTMLInputElement).checked;
              const useProxyChecker = (document.getElementById('use-proxy-checker') as HTMLInputElement).checked;
              const useAutoRegister = (document.getElementById('use-auto-register') as HTMLInputElement).checked;
              const useAutoRejoin = (document.getElementById('use-auto-rejoin') as HTMLInputElement).checked;
              const useAutoLogin = (document.getElementById('use-auto-login') as HTMLInputElement).checked;
              const useLogDeath = (document.getElementById('use-log-death') as HTMLInputElement).checked;
              const useSaveChat = (document.getElementById('use-save-chat') as HTMLInputElement).checked;
              const useSavePlayers = (document.getElementById('use-save-players') as HTMLInputElement).checked;
              const useAiAgent = (document.getElementById('use-ai-agent') as HTMLInputElement).checked;
              const useDataAnalysis = (document.getElementById('use-data-analysis') as HTMLInputElement).checked;
              const useOptimization = (document.getElementById('use-optimization') as HTMLInputElement).checked;
              const useErrorCorrector = (document.getElementById('use-error-corrector') as HTMLInputElement).checked;

              const operation = await configurator.write({
                'input': {
                  'mainContainer': {
                    'address': { 'id': 'address', 'value': address },
                    'version': { 'id': 'version', 'value': version },
                    'quantity': { 'id': 'quantity', 'value': quantity },
                    'delay': {'id': 'delay', 'value': delay }
                  },
                  'settingsContainer': {
                    'nickname': { 'id': 'nickname', 'value': nickname },
                    'password': { 'id': 'password', 'value': password },
                    'timeout': { 'id': 'timeout', 'value': timeout },
                    'distance': { 'id': 'distance', 'value': distance },
                    'registerCommand': { 'id': 'register-command', 'value': registerCommand },
                    'registerTemplate': { 'id': 'register-template', 'value': registerTemplate },
                    'loginCommand': { 'id': 'login-command', 'value': loginCommand },
                    'loginTemplate': { 'id': 'login-template', 'value': loginTemplate },
                    'rejoinQuantity': { 'id': 'rejoin-quantity', 'value': rejoinQuantity },
                    'rejoinDelay': { 'id': 'rejoin-delay', 'value': rejoinDelay }
                  },
                  'proxyContainer': {
                    'proxyList': { 'id': 'proxy-list', 'value': proxyList }
                  },
                  'controlContainer': {
                    'message': { 'id': 'chat-message', 'value': message },
                    'spammingMinDelay': { 'id': 'chat-spamming-min-delay', 'value': spammingMinDelay },
                    'spammingMaxDelay': { 'id': 'chat-spamming-max-delay', 'value': spammingMaxDelay }
                  },
                  'scriptContainer': {
                    'script': { 'id': 'script-input', 'value': script }
                  }
                },
                'checkbox': {
                  'settingsContainer': {
                    'useKeepAlive': { 'id': 'use-keep-alive', 'value': useKeepAlive },
                    'usePhysics': { 'id': 'use-physics', 'value': usePhysics },
                    'useProxy': { 'id': 'use-proxy', 'value': useProxy },
                    'useProxyChecker': { 'id': 'use-proxy-checker', 'value': useProxyChecker },
                    'useAutoRegister': { 'id': 'use-auto-register', 'value': useAutoRegister },
                    'useAutoRejoin': { 'id': 'use-auto-rejoin', 'value': useAutoRejoin },
                    'useAutoLogin': { 'id': 'use-auto-login', 'value': useAutoLogin },
                    'useLogDeath': { 'id': 'use-log-death', 'value': useLogDeath },
                    'useSaveChat': { 'id': 'use-save-chat', 'value': useSaveChat },
                    'useSavePlayers': { 'id': 'use-save-players', 'value': useSavePlayers },
                    'useAiAgent': { 'id': 'use-ai-agent', 'value': useAiAgent },
                    'useDataAnalysis': { 'id': 'use-data-analysis', 'value': useDataAnalysis },
                    'useOptimization': { 'id': 'use-optimization', 'value': useOptimization },
                    'useErrorCorrector': { 'id': 'use-error-corrector', 'value': useErrorCorrector }
                  }
                } 
              });

              if (operation.success) {
                logger.log(operation.message, 'log-system');
              } else {
                logger.log(operation.message, 'log-error');
              }
            } catch (error) {
              logger.log(`Ошибка сохранения конфига: ${error}`, 'log-error');
            }
          })
        } catch (error) {
          logger.log(`Ошибка операции initButtonsGlobal: ${error}`, 'log-error');
        }
      }

      const initButtonsInMainContainer = async () => {
        const startBotsProcessBtn = document.getElementById('start') as HTMLButtonElement;
        const stopBotsProcessBtn = document.getElementById('stop') as HTMLButtonElement;
        const setRandomValuesBtn =  document.getElementById('random') as HTMLButtonElement;
        const cleanInputValuesBtn = document.getElementById('clean') as HTMLButtonElement;

        startBotsProcessBtn.addEventListener('click', async () => {
          try {
            const address = (document.getElementById('address') as HTMLInputElement).value;
            const version = (document.getElementById('version') as HTMLInputElement).value;
            const quantity = parseInt((document.getElementById('quantity') as HTMLInputElement).value);
            const delay = parseInt((document.getElementById('delay') as HTMLInputElement).value);

            const nickname = (document.getElementById('nickname') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const timeout = parseInt((document.getElementById('timeout') as HTMLInputElement).value);
            const distance = String((document.getElementById('distance') as HTMLInputElement).value).toLowerCase();
            const registerCommand = (document.getElementById('register-command') as HTMLInputElement).value;
            const registerTemplate = (document.getElementById('register-template') as HTMLInputElement).value;
            const loginCommand = (document.getElementById('login-command') as HTMLInputElement).value;
            const loginTemplate = (document.getElementById('login-template') as HTMLInputElement).value;
            const rejoinQuantity = parseInt((document.getElementById('rejoin-quantity') as HTMLInputElement).value);
            const rejoinDelay = parseInt((document.getElementById('rejoin-delay') as HTMLInputElement).value);

            const proxyList = String((document.getElementById('proxy-list') as HTMLTextAreaElement).value).toLowerCase();

            const useKeepAlive = (document.getElementById('use-keep-alive') as HTMLInputElement).checked;
            const usePhysics = (document.getElementById('use-physics') as HTMLInputElement).checked;
            const useProxy = (document.getElementById('use-proxy') as HTMLInputElement).checked;
            const useProxyChecker = (document.getElementById('use-proxy-checker') as HTMLInputElement).checked;
            const useAutoRegister = (document.getElementById('use-auto-register') as HTMLInputElement).checked;
            const useAutoRejoin = (document.getElementById('use-auto-rejoin') as HTMLInputElement).checked;
            const useAutoLogin = (document.getElementById('use-auto-login') as HTMLInputElement).checked;
            const useSaveChat = (document.getElementById('use-save-chat') as HTMLInputElement).checked;
            const useSavePlayers = (document.getElementById('use-save-players') as HTMLInputElement).checked;
            const useAiAgent = (document.getElementById('use-ai-agent') as HTMLInputElement).checked;
            const useDataAnalysis = (document.getElementById('use-data-analysis') as HTMLInputElement).checked;
            const useOptimization = (document.getElementById('use-optimization') as HTMLInputElement).checked;
            const useErrorCorrector = (document.getElementById('use-error-corrector') as HTMLInputElement).checked;

            const monitoringStatusText = document.getElementById('monitoring-status-text') as HTMLElement;
            const monitoringBotsCardsContainer = document.getElementById('bots-cards-container') as HTMLElement;

            logger.log(`Запуск ботов на сервер...`, 'log-info');

            if (this.flags.IS_ACTIVE) {
              logger.log('Запуск невозможен, есть активные боты', 'log-warning'); return;
            }
        
            const response = await fetch('http://localhost:37621/salarixi/process/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address: address,
                version: version || 'auto',
                quantity: quantity,
                delay: delay || 1000,
                nickname: nickname,
                password: password,
                timeout: timeout || 10000,
                distance: distance,
                registerCommand: registerCommand,
                registerTemplate: registerTemplate,
                rejoinQuantity: rejoinQuantity,
                rejoinDelay: rejoinDelay || 3000,
                loginCommand: loginCommand,
                loginTemplate: loginTemplate,
                proxyList: proxyList,
                useKeepAlive: useKeepAlive,
                usePhysics: usePhysics,
                useProxy: useProxy,
                useProxyChecker: useProxyChecker,
                useAutoRegister: useAutoRegister,
                useAutoRejoin: useAutoRejoin,
                useAutoLogin: useAutoLogin,
                useSaveChat: useSaveChat,
                useSavePlayers: useSavePlayers,
                useAiAgent: useAiAgent,
                useDataAnalysis: useDataAnalysis,
                useOptimization: useOptimization,
                useErrorCorrector: useErrorCorrector
              })
            });

            if (!response.ok) {
              logger.log('Ошибка сервера, перезапустите клиент', 'log-error'); return;
            }

            this.flags.IS_ACTIVE = true;

            monitoringStatusText.style.display = 'none';
            monitoringBotsCardsContainer.innerHTML = '';
            monitoringBotsCardsContainer.style.display = 'grid';

            const eventSource = new EventSource(`http://localhost:37621/salarixi/session/process`);

            eventSource.onmessage = async (event) => {
              try {
                const data = JSON.parse(event.data);
                logger.log(data.data.message, `log-${data.type}`);
              } catch (error) {
                logger.log(`Ошибка (start-bots-process): ${error}`, 'log-error');
              }
            }

            eventSource.onerror = async () => {
              logger.log('Ошибка (start-bots-process): SSE-connection was dropped', 'log-error');
              eventSource.close();
            }

            (window as any).currentProcessEventSource = eventSource;
          } catch (error) {
            logger.log(`Ошибка (start-bots-process): ${error}`, 'log-error');
          }
        })

        stopBotsProcessBtn.addEventListener('click', async () => {
          try {
            const monitoringStatusText = document.getElementById('monitoring-status-text') as HTMLElement;
            const monitoringBotsCardsContainer = document.getElementById('bots-cards-container') as HTMLElement;
            
            logger.log('Остановка ботов...', 'log-info');

            const response = await fetch('http://localhost:37621/salarixi/process/stop', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
              logger.log('Ошибка сервера, перезапустите клиент', 'log-error'); return;
            }

            this.flags.IS_ACTIVE = false;

            monitoringStatusText.innerText = 'Объекты ботов отсутствуют';
            monitoringStatusText.style.color = '#646464f7';
            monitoringBotsCardsContainer.innerHTML = '';
            monitoringBotsCardsContainer.style.display = 'none';
            monitoringStatusText.style.display = 'block';

            const data: ServerMessageStructure = await response.json();

            logger.log(data.data.message, `log-${data.type}`);

            await cleaner.purify()
              .then(({ success, message }) => {
                if (success) {
                  logger.log(message, 'log-system');
                } else {
                  logger.log(message, 'log-error');
                }
              });
          } catch (error) {
            logger.log(`Ошибка (stop-bots-process): ${error}`, 'log-error');
          }
        })

        setRandomValuesBtn.addEventListener('click', async () => {
          try {
            const setRandomValue = (element: string) => {
              let current = document.getElementById(element) as HTMLInputElement; 

              const addresses = [
                'org.mc-complex.com',
                'join.insanitycraft.net',
                'play.MysticMC.co',
                'play.mellowcraft.org',
                'hub.opblocks.com',
                'org.earthmc.net',
                'hub.manacube.com',
                'ms.rainyday.gg',
                'ms.blossomcraft.org',
                'mc.masedworld.net',
                'mc.mineblaze.net',
                'mc.dexland.org',
                'mc.hypemc.pro',
                'mc.hypemc.ru'
              ];

              const versions = [
                '1.8.9',
                '1.12.2',
                '1.12',
                '1.14',
                '1.16.4',
                '1.16.5',
                '1.19',
                '1.20.1',
                '1.20.3',
                '1.21',
                '1.21.1',
                '1.21.3',
                '1.21.6',
                '1.21.5'
              ];

              switch (element) {
                case 'address':
                  const randomAddress = addresses[Math.floor(Math.random() * addresses.length)] + ':25565';
                  current.value = randomAddress; break;
                case 'version':
                  const randomVersion = versions[Math.floor(Math.random() * versions.length)];
                  current.value = randomVersion; break;
                case 'quantity':
                  const randomQuantity = String(Math.floor(Math.random() * (30 - 5 + 1) + 5));
                  current.value = randomQuantity; break;
                case 'delay':
                  const randomDelay = String(Math.floor(Math.random() * (7000 - 1000 + 1) + 1000));
                  current.value = randomDelay; break;
              }
            }

            setRandomValue('address');
            setRandomValue('version');
            setRandomValue('quantity');
            setRandomValue('delay');

            logger.log('Установлены случайные значения элементов', 'log-system');
          } catch (error) {
            logger.log('Не удалось установить случайные значения элементов', 'log-error');
          }
        })

        cleanInputValuesBtn.addEventListener('click', async () => {
          try {
            let address = document.getElementById('address') as HTMLInputElement;
            let version = document.getElementById('version') as HTMLInputElement;
            let quantity = document.getElementById('quantity') as HTMLInputElement;
            let delay = document.getElementById('delay') as HTMLInputElement;

            address.value = '';
            version.value = '';
            quantity.value = '';
            delay.value = '';

            logger.log('Значения элементов очищены', 'log-system');
          } catch (error) {
            logger.log('Не удалось очистить значения элементов', 'log-error');
          }
        })
      }

      const initButtonsInControlContainer = async () => {
        try {
          const sendMessageBtn = document.getElementById('chat-send-message') as HTMLButtonElement;
          const startSpammingBtn = document.getElementById('chat-start-spamming') as HTMLButtonElement;
          const stopSpammingBtn = document.getElementById('chat-stop-spamming') as HTMLButtonElement;
          const startAnyActionBtn = document.getElementById('start-any-action') as HTMLButtonElement;
          const stopAnyActionBtn = document.getElementById('stop-any-action') as HTMLButtonElement;
          const startAnyMovement = document.getElementById('start-any-movement') as HTMLButtonElement;
          const stopAnyMovement = document.getElementById('stop-any-movement') as HTMLButtonElement;
          const startAnyImitationBtn = document.getElementById('start-any-imitation') as HTMLButtonElement;
          const stopAnyImitationBtn = document.getElementById('stop-any-imitation') as HTMLButtonElement;
          const startAnyAttackBtn = document.getElementById('start-any-attack') as HTMLButtonElement;
          const stopAnyAttackBtn = document.getElementById('stop-any-attack') as HTMLButtonElement;
          const startFlightBtn = document.getElementById('start-flight') as HTMLButtonElement;
          const stopFlightBtn = document.getElementById('stop-flight') as HTMLButtonElement;
          const startGhostBtn = document.getElementById('start-ghost') as HTMLButtonElement;
          const stopGhostBtn = document.getElementById('stop-ghost') as HTMLButtonElement;

          sendMessageBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const from = (document.getElementById('chat-from') as HTMLInputElement).value;
              const message = (document.getElementById('chat-message') as HTMLInputElement).value;

              const useMagicText = (document.getElementById('use-chat-magic-text') as HTMLInputElement).checked;
              const useTextMutation = (document.getElementById('use-chat-text-mutation') as HTMLInputElement).checked;
              const useSync = (document.getElementById('use-chat-sync') as HTMLInputElement).checked;

              if (message === '') {
                logger.log('Поле "Сообщение" пустое, действие невозможно', 'log-warning'); return;
              }

              const response = await fetch('http://localhost:37621/salarixi/control/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'default',
                  data: {
                    from: from,
                    message: message,
                    useMagicText: useMagicText,
                    useTextMutation: useTextMutation,
                    useSync: useSync
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка отправки сообщения: ${error}`, 'log-error');
            }
          });

          startSpammingBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const from = (document.getElementById('chat-from') as HTMLInputElement).value;
              const message = (document.getElementById('chat-message') as HTMLInputElement).value;
              const minDelay = Number((document.getElementById('chat-spamming-min-delay') as HTMLInputElement).value) | 2000;
              const maxDelay = Number((document.getElementById('chat-spamming-max-delay') as HTMLInputElement).value) | 4000;

              const useMagicText = (document.getElementById('use-chat-magic-text') as HTMLInputElement).checked;
              const useTextMutation = (document.getElementById('use-chat-text-mutation') as HTMLInputElement).checked;
              const useSync = (document.getElementById('use-chat-sync') as HTMLInputElement).checked;
              const useAntiRepetition = (document.getElementById('use-chat-spamming-anti-repetition') as HTMLInputElement).checked;

              if (message === '') {
                logger.log('Поле "Сообщение" пустое, действие невозможно', 'log-warning'); return;
              }

              const response = await fetch('http://localhost:37621/salarixi/control/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'spamming',
                  data: {
                    state: 'start',
                    from: from,
                    message: message,
                    minDelay: minDelay,
                    maxDelay: maxDelay,
                    useMagicText: useMagicText,
                    useTextMutation: useTextMutation,
                    useSync: useSync,
                    useAntiRepetition: useAntiRepetition
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка старта «Спамминг»: ${error}`, 'log-error');
            }
          });

          stopSpammingBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const response = await fetch('http://localhost:37621/salarixi/control/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'spamming',
                  data: {
                    state: 'stop'
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «Спамминг»: ${error}`, 'log-error');
            }
          });

          startAnyActionBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            const action = (document.getElementById('select-action') as HTMLSelectElement).value;

            let actionName = '';

            if (action === 'jumping') {
              actionName = 'Джампинг';
            } else if (action === 'shifting') {
              actionName = 'Шифтинг';
            } else if (action === 'waving') {
              actionName = 'Махание рукой';
            } else if (action === 'looking') {
              actionName = 'Осмотр';
            } else if (action === 'spinning') {
              actionName = 'Спиннинг';
            }

            try {
              const useSync = (document.getElementById('use-action-sync') as HTMLInputElement).checked;
              const useAntiDetect = (document.getElementById('use-action-anti-detect') as HTMLInputElement).checked;
              const useImpulsiveness = (document.getElementById('use-action-impulsiveness') as HTMLInputElement).checked;

              const minDelay = parseInt((document.getElementById('action-min-delay') as HTMLInputElement).value);
              const maxDelay = parseInt((document.getElementById('action-max-delay') as HTMLInputElement).value);

              const response = await fetch('http://localhost:37621/salarixi/control/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'start',
                  action: action,
                  data: {
                    useSync: useSync,
                    useAntiDetect: useAntiDetect,
                    useImpulsiveness: useImpulsiveness,
                    minDelay: minDelay,
                    maxDelay: maxDelay
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка старта «${actionName}»: ${error}`, 'log-error');
            }
          });

          stopAnyActionBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            const action = (document.getElementById('select-action') as HTMLSelectElement).value;

            let actionName = '';

            if (action === 'jumping') {
              actionName = 'Джампинг';
            } else if (action === 'shifting') {
              actionName = 'Шифтинг';
            } else if (action === 'waving') {
              actionName = 'Махание рукой';
            } else if (action === 'looking') {
              actionName = 'Осмотр';
            } else if (action === 'spinning') {
              actionName = 'Спиннинг';
            }

            try {
              const response = await fetch('http://localhost:37621/salarixi/control/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'stop',
                  action: action,
                  data: undefined
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «${actionName}»: ${error}`, 'log-error');
            }
          });

          startAnyMovement.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            const direction = (document.getElementById('select-direction') as HTMLSelectElement).value;

            let directionName = '';

            if (direction === 'forward') {
              directionName = 'Движение вперёд';
            } else if (direction === 'back') {
              directionName = 'Движение назад';
            } else if (direction === 'left') {
              directionName = 'Движение влево';
            } else if (direction === 'right') {
              directionName = 'Движение вправо';
            }

            try {
              const useSync = (document.getElementById('use-movement-sync') as HTMLSelectElement).value;
              const useAntiDetect = (document.getElementById('use-movement-anti-detect') as HTMLSelectElement).value;
              const useImpulsiveness = (document.getElementById('use-movement-impulsiveness') as HTMLSelectElement).value;

              const response = await fetch('http://localhost:37621/salarixi/control/movement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'start',
                  direction: direction,
                  data: {
                    useSync: useSync,
                    useAntiDetect: useAntiDetect,
                    useImpulsiveness: useImpulsiveness
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «${directionName}»: ${error}`, 'log-error');
            }
          });

          stopAnyMovement.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            const direction = (document.getElementById('select-direction') as HTMLSelectElement).value;

            let directionName = '';

            if (direction === 'forward') {
              directionName = 'Движение вперёд';
            } else if (direction === 'back') {
              directionName = 'Движение назад';
            } else if (direction === 'left') {
              directionName = 'Движение влево';
            } else if (direction === 'right') {
              directionName = 'Движение вправо';
            }

            try {
              const response = await fetch('http://localhost:37621/salarixi/control/movement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'stop',
                  direction: direction
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «${directionName}»: ${error}`, 'log-error');
            }
          });

          startAnyImitationBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            const imitation = (document.getElementById('select-imitation') as HTMLSelectElement).value;

            let imitationName = '';

            if (imitation === 'walking') {
              imitationName = 'Имитация хотьбы';
            } else if (imitation === 'chating') {
              imitationName = 'Имитация чата';
            } else if (imitation === 'looking') {
              imitationName = 'Имитация осмотра';
            } else if (imitation === 'hybrid') {
              imitationName = 'Гибридная имитация';
            }

            try {
              const useSmoothness = (document.getElementById('use-imitation-smoothness') as HTMLInputElement).checked;
              const useLongDelays = (document.getElementById('use-imitation-long-delays') as HTMLInputElement).checked;
              const useLooking = (document.getElementById('use-imitation-looking') as HTMLInputElement).checked;
              const useWaving = (document.getElementById('use-imitation-waving') as HTMLInputElement).checked;
              const useMultitasking = (document.getElementById('use-imitation-multitasking') as HTMLInputElement).checked;
              const useSmartRoutes = (document.getElementById('use-imitation-smart-routes') as HTMLInputElement).checked;
              const useSprint = (document.getElementById('use-imitation-sprint') as HTMLInputElement).checked;

              let structure = {};

              if (imitation === 'hybrid') {
                structure = {
                  useSmoothness: useSmoothness,
                  useLongDelays: useLongDelays,
                  useLooking: useLooking,
                  useWaving: useWaving,
                  useMultitasking: useMultitasking
                }
              } else if (imitation === 'walking') {
                structure = {
                  useSmoothness: useSmoothness,
                  useLongDelays: useLongDelays,
                  useSmartRoutes: useSmartRoutes,
                  useSprint: useSprint,
                  useMultitasking: useMultitasking
                }
              }

              const response = await fetch('http://localhost:37621/salarixi/control/imitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'start',
                  type: imitation,
                  data: structure
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка старта «${imitationName}»: ${error}`, 'log-error');
            }
          });

          stopAnyImitationBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            const imitation = (document.getElementById('select-imitation') as HTMLSelectElement).value;

            let imitationName = '';

            if (imitation === 'walking') {
              imitationName = 'Имитация хотьбы';
            } else if (imitation === 'chating') {
              imitationName = 'Имитация чата';
            } else if (imitation === 'looking') {
              imitationName = 'Имитация осмотра';
            } else if (imitation === 'hybrid') {
              imitationName = 'Гибридная имитация';
            }

            try {
              const response = await fetch('http://localhost:37621/salarixi/control/imitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'stop',
                  type: imitation,
                  data: undefined
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «${imitationName}»: ${error}`, 'log-error');
            }
          });

          startAnyAttackBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const useLongDelays = (document.getElementById('use-attack-long-delays') as HTMLInputElement).checked;
              const useSmoothness = (document.getElementById('use-attack-smoothness') as HTMLInputElement).checked;
              const useAntiDetect = (document.getElementById('use-attack-anti-detect') as HTMLInputElement).checked;
              const useImprovedStrikes = (document.getElementById('use-attack-improved-strikes') as HTMLInputElement).checked;

              const response = await fetch('http://localhost:37621/salarixi/control/attack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'start',
                  data: {
                    useLongDelays: useLongDelays,
                    useSmoothness: useSmoothness,
                    useAntiDetect: useAntiDetect,
                    useImprovedStrikes: useImprovedStrikes
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка старта «Атака»: ${error}`, 'log-error');
            }
          });

          stopAnyAttackBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const response = await fetch('http://localhost:37621/salarixi/control/attack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'stop',
                  data: undefined
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «Атака»: ${error}`, 'log-error');
            }
          });

          startFlightBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const type = (document.getElementById('select-flight-type') as HTMLSelectElement).value;

              const response = await fetch('http://localhost:37621/salarixi/control/flight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'start',
                  data: {
                    type: type
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка старта «Полёт»: ${error}`, 'log-error');
            }
          });

          stopFlightBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const response = await fetch('http://localhost:37621/salarixi/control/flight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'stop',
                  data: undefined
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «Полёт»: ${error}`, 'log-error');
            }
          });

          startGhostBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const mode = (document.getElementById('select-ghost-mode') as HTMLSelectElement).value;

              const response = await fetch('http://localhost:37621/salarixi/control/ghost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'start',
                  data: {
                    mode: mode
                  }
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка старта «Призрак»: ${error}`, 'log-error');
            }
          });

          stopGhostBtn.addEventListener('click', async () => {
            if (!this.flags.IS_ACTIVE) {
              logger.log('Активных ботов не существует, действие невозможно', 'log-warning'); return;
            }

            try {
              const response = await fetch('http://localhost:37621/salarixi/control/ghost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: 'stop',
                  data: undefined
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка остановки «Призрак»: ${error}`, 'log-error');
            }
          });
        } catch (error) {
          logger.log(`Ошибка операции initButtonsInControlContainer: ${error}`, 'log-error');
        }
      }

      const initButtonsInScriptContainer = async () => {
        try {
          const executeScriptBtn = document.getElementById('execute-script') as HTMLButtonElement;

          executeScriptBtn.addEventListener('click', async () => {
            try {
              const script = (document.getElementById('script-input') as HTMLTextAreaElement).value;

              const response = await fetch('http://localhost:37621/salarixi/script/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  script: script
                })
              });

              const data: ServerMessageStructure = await response.json();

              logger.log(data.data.message, `log-${data.type}`);
            } catch (error) {
              logger.log(`Ошибка выполнения скрипта: ${error}`, 'log-error');
            }
          });
        } catch (error) {
          logger.log(`Ошибка операции initButtonsInScriptContainer: ${error}`, 'log-error');
        }
      }

      // Запуск функций, которые инициализируют функции кнопок в определённом контейнере
      await initButtonsGlobal();
      await initButtonsInMainContainer();
      await initButtonsInControlContainer();
      await initButtonsInScriptContainer();
    } catch (error) {
      logger.log(`Ошибка операции initializeButtonFunctions: ${error}`, 'log-error');
    }
  }

  public async initializeCheckboxFunctions(): Promise<void> {
    try {
      const initCheckboxesInSettingsContainer = async () => {
        try {
          const proxyChbx = document.getElementById('use-proxy') as HTMLInputElement;
          const proxyCheckerChbx = document.getElementById('use-proxy-checker-container') as HTMLInputElement;

          const autoRegisterChbx = document.getElementById('use-auto-register') as HTMLInputElement;
          const autoRejoinChbx = document.getElementById('use-auto-rejoin') as HTMLInputElement;
          const autoLoginChbx = document.getElementById('use-auto-login') as HTMLInputElement;

          const autoRegisterInputContainer = document.getElementById('auto-register-input-container') as HTMLElement;
          const autoRejoinInputContainer = document.getElementById('auto-rejoin-input-container') as HTMLElement;
          const autoLoginInputContainer = document.getElementById('auto-login-input-container') as HTMLElement;

          const checkProxyChbx = () => {
            if (proxyChbx.checked) {
              proxyCheckerChbx.style.display = 'flex';
            } else {
              proxyCheckerChbx.style.display = 'none';
            }
          }

          const checkRegisterChbx = () => {
            if (autoRegisterChbx.checked) {
              autoRegisterInputContainer.style.display = 'block';
            } else {
              autoRegisterInputContainer.style.display = 'none';
            }
          }

          const checkRejoinChbx = () => {
            if (autoRejoinChbx.checked) {
              autoRejoinInputContainer.style.display = 'block';
            } else {
              autoRejoinInputContainer.style.display = 'none';
            }
          }

          const checkLoginChbx = () => {
            if (autoLoginChbx.checked) {
              autoLoginInputContainer.style.display = 'block';
            } else {
              autoLoginInputContainer.style.display = 'none';
            }
          }

          checkProxyChbx();
          checkRegisterChbx();
          checkRejoinChbx();
          checkLoginChbx();

          proxyChbx.addEventListener('change', () => checkProxyChbx());
          autoRegisterChbx.addEventListener('change', () => checkRegisterChbx());
          autoRejoinChbx.addEventListener('change', () => checkRejoinChbx());
          autoLoginChbx.addEventListener('change', () => checkLoginChbx());
        } catch (error) {
          logger.log(`Ошибка операции initCheckboxesInSettingsContainer: ${error}`, 'log-error');
        }
      }

      const initCheckboxesInControlContainer = async () => {
        try {
          const chatSpammingChbx = document.getElementById('use-chat-spamming') as HTMLInputElement;
          const actionImpulsivenessChbx = document.getElementById('use-action-impulsiveness') as HTMLInputElement;

          chatSpammingChbx.addEventListener('change', async () => {
            const chatSpammingChbxContainer = document.getElementById('chat-spamming-chbx-container') as HTMLElement;
            const chatSpammingInputContainer = document.getElementById('chat-spamming-input-container') as HTMLElement;
            
            const chatDefaultBtnsContainer = document.getElementById('chat-default-btns-container') as HTMLElement;
            const chatSpammingBtnsContainer = document.getElementById('chat-spamming-btns-container') as HTMLElement;

            if (chatSpammingChbx.checked) {
              chatSpammingChbxContainer.style.display = 'block';
              chatSpammingInputContainer.style.display = 'block';
              chatSpammingBtnsContainer.style.display = 'flex';

              chatDefaultBtnsContainer.style.display = 'none';
            } else {
              chatDefaultBtnsContainer.style.display = 'flex';

              chatSpammingChbxContainer.style.display = 'none';
              chatSpammingInputContainer.style.display = 'none';
              chatSpammingBtnsContainer.style.display = 'none';
            }
          });

          actionImpulsivenessChbx.addEventListener('change', async () => {
            const actionDelayInputContainer = document.getElementById('action-delay-container') as HTMLInputElement;
            const actionRandomizerChbxContainer = document.getElementById('use-action-randomizer-container') as HTMLInputElement;

            if (actionImpulsivenessChbx.checked) {
              actionDelayInputContainer.style.display = 'flex';
              actionRandomizerChbxContainer.style.display = 'flex';
            } else {
              actionDelayInputContainer.style.display = 'none';
              actionRandomizerChbxContainer.style.display = 'none';
            }
          })
        } catch (error) {
          logger.log(`Ошибка операции initCheckboxesInControlContainer: ${error}`, 'log-error');
        }
      }

      const initCheckboxesInLogContainer = async () => {
        try {
          const showSystemLogChbx = document.getElementById('show-system-log') as HTMLInputElement;

          showSystemLogChbx.addEventListener('change', async () => {
            const systemLogs = document.querySelectorAll('.log-line-system') as NodeListOf<HTMLElement>;

            if (showSystemLogChbx.checked) {
              systemLogs.forEach((element) => {
                element.style.display = 'flex';
              })
            } else {
              systemLogs.forEach((element) => {
                element.style.display = 'none';
              })
            }
          });
        } catch (error) {
          logger.log(`Ошибка операции initCheckboxesInLogContainer: ${error}`, 'log-error');
        }
      }

      // Запуск функций, которые инициализируют функции чекбоксов в определённом контейнере
      await initCheckboxesInSettingsContainer();
      await initCheckboxesInControlContainer();
      await initCheckboxesInLogContainer();
    } catch (error) {
      logger.log(`Ошибка операции initializeCheckboxFunctions: ${error}`, 'log-error');
    }
  }

  public async initializeSelectFunctions(): Promise<void> {
    try {
      const initSelectControlContainer = async () => {
        try {
          const actionSelect = document.getElementById('select-action') as HTMLSelectElement;
          const imitationSelect = document.getElementById('select-imitation') as HTMLSelectElement;

          actionSelect.addEventListener('change', async () => {
            const actionJumpingAndShiftingInputContainer = document.getElementById('action-jumping-and-shifting-input-container') as HTMLElement;
            const actionJumpingAndShiftingChbxContainer = document.getElementById('action-jumping-and-shifting-chbx-container') as HTMLElement;
            const actionWavingChbxContainer = document.getElementById('action-waving-chbx-container') as HTMLElement;

            if (actionSelect.value === 'jumping' || actionSelect.value === 'shifting') {
              actionJumpingAndShiftingInputContainer.style.display = 'block';
              actionJumpingAndShiftingChbxContainer.style.display = 'block';
              actionWavingChbxContainer.style.display = 'none';
            } else if (actionSelect.value === 'waving') {
              actionJumpingAndShiftingInputContainer.style.display = 'none';
              actionJumpingAndShiftingChbxContainer.style.display = 'none';
              actionWavingChbxContainer.style.display = 'block';
            } else if (actionSelect.value === 'looking') {
              actionJumpingAndShiftingInputContainer.style.display = 'none';
              actionJumpingAndShiftingChbxContainer.style.display = 'none';
              actionWavingChbxContainer.style.display = 'none';
            } else if (actionSelect.value === 'spinning') {
              actionJumpingAndShiftingInputContainer.style.display = 'none';
              actionJumpingAndShiftingChbxContainer.style.display = 'none';
              actionWavingChbxContainer.style.display = 'none';
            }
          });

          imitationSelect.addEventListener('change', async () => {
            const hybridImitationChbxContainer = document.getElementById('imitation-hybrid-chbx-container') as HTMLElement;
            const walkingImitationChbxContainer = document.getElementById('imitation-walking-chbx-container') as HTMLElement;
            const lookingImitationChbxContainer = document.getElementById('imitation-looking-chbx-container') as HTMLElement;

            if (imitationSelect.value === 'hybrid') {
              hybridImitationChbxContainer.style.display = 'block';
              walkingImitationChbxContainer.style.display = 'none';
              lookingImitationChbxContainer.style.display = 'none';
            } else if (imitationSelect.value === 'walking') {
              hybridImitationChbxContainer.style.display = 'none';
              walkingImitationChbxContainer.style.display = 'block';
              lookingImitationChbxContainer.style.display = 'none';
            } else if (imitationSelect.value === 'looking') {
              hybridImitationChbxContainer.style.display = 'none';
              walkingImitationChbxContainer.style.display = 'none';
              lookingImitationChbxContainer.style.display = 'block';
            }
          });
        } catch (error) {
          logger.log(`Ошибка операции initSelectControlContainer: ${error}`, 'log-error');
        }
      }

      // Запуск функций, которые инициализируют функции селектов в определённом контейнере
      await initSelectControlContainer();
    } catch (error) {
      logger.log(`Ошибка операции initializeSelectFunctions: ${error}`, 'log-error');
    }
  }
}

export default Functions;