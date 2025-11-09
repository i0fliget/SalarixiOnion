import Logger from './logger';
import Functions from './functions';
import Configurator from './tools/configurator';
import Cleaner from './tools/cleaner';
import date from './tools/date';
import LineGraphicManager from './graph';

const mainPageContainer = document.getElementById('main-container') as HTMLElement;
const settingsPageContainer = document.getElementById('settings-container') as HTMLElement;
const proxyPageContainer = document.getElementById('proxy-container') as HTMLElement;
const controlSectorsPageContainer = document.getElementById('control-sectors-container') as HTMLElement;
const controlChatPageContainer = document.getElementById('control-chat-container') as HTMLElement;
const controlActionsPageContainer = document.getElementById('control-action-container') as HTMLElement;
const controlMovementPageContainer = document.getElementById('control-movement-container') as HTMLElement;
const controlImitationPageContainer = document.getElementById('control-imitation-container') as HTMLElement;
const controlAttackPageContainer = document.getElementById('control-attack-container') as HTMLElement;
const controlFlightPageContainer = document.getElementById('control-flight-container') as HTMLElement;
const controlGhostPageContainer = document.getElementById('control-ghost-container') as HTMLElement;
const controlReporterPageContainer = document.getElementById('control-reporter-container') as HTMLElement;
const scriptPageContainer = document.getElementById('script-container') as HTMLElement;
const graphicPageContainer = document.getElementById('graphic-container') as HTMLElement;
const monitoringPageContainer = document.getElementById('monitoring-container') as HTMLElement;
const analysisPageContainer = document.getElementById('analysis-container') as HTMLElement;
const logPageContainer = document.getElementById('log-container') as HTMLElement;
const aboutPageContainer = document.getElementById('about-container') as HTMLElement;

const logger = new Logger();
const functions = new Functions();
const configurator = new Configurator();
const cleaner = new Cleaner();
const lineGraphic = new LineGraphicManager();

const client = {
  version: '1.0.0',
  type: 'Beta',
  releaseData: '09.11.2025'
};

// Функция для инициализации глобальных элементов (глобальные контейнеры, кнопки, поля...)
async function initializeGlobalContainers() {
  const clientHeaderContainer = document.getElementById('client-header') as HTMLElement;
  const clientVersionContainer = document.getElementById('client-version') as HTMLElement;
  const clientTypeContainer = document.getElementById('client-type') as HTMLElement;
  const clientDescriptionContainer = document.getElementById('client-description') as HTMLElement;
  const clientReleaseDataContainer = document.getElementById('client-release-data') as HTMLElement;

  let description = '';

  if (client.type === 'Beta') {
    clientHeaderContainer.classList.add('beta');
    description = 'В данной версии возможны различные баги и ошибки';
  } else if (client.type === 'Expert') {
    clientHeaderContainer.classList.add('expert');
    description = 'Стабильная, оптимизированная и проверенная версия';
  }

  const header = `${client.type}-Release`;

  clientHeaderContainer.innerText = header;
  clientVersionContainer.innerText = client.version;
  clientTypeContainer.innerText = client.type;
  clientDescriptionContainer.innerText = `(${description})`;
  clientReleaseDataContainer.innerText = client.releaseData;

  const copyGithubLinkBtn = document.getElementById('btn-github') as HTMLButtonElement;
  const copyTelegramLinkBtn = document.getElementById('btn-telegram') as HTMLButtonElement;

  copyGithubLinkBtn.addEventListener('click', () => {
    logger.log('g', 'log-system');
    navigator.clipboard.writeText('https://github.com/i0fliget');

  }); 

  copyTelegramLinkBtn.addEventListener('click', () => {
    logger.log('t', 'log-system');
    navigator.clipboard.writeText('https://t.me/salarixionion');
  });

	const panelBtns = document.querySelectorAll('.panel-btn') as NodeListOf<HTMLElement>;

	const mainPageBtn = document.getElementById('main') as HTMLButtonElement;
	const settingsPageBtn = document.getElementById('settings') as HTMLButtonElement;
  const proxyPageBtn = document.getElementById('proxy') as HTMLButtonElement;
  const controlPageBtn = document.getElementById('control') as HTMLButtonElement;
  const controlChatPageBtn = document.getElementById('control-chat') as HTMLButtonElement;
  const controlActionsPageBtn = document.getElementById('control-actions') as HTMLButtonElement;
  const controlMovementPageBtn = document.getElementById('control-movement') as HTMLButtonElement;
  const controlImitationPageBtn = document.getElementById('control-imitation') as HTMLButtonElement;
  const controlAttackPageBtn = document.getElementById('control-attack') as HTMLButtonElement;
  const controlFlightPageBtn = document.getElementById('control-flight') as HTMLButtonElement;
  const controlGhostPageBtn = document.getElementById('control-ghost') as HTMLButtonElement;
  const controlCrasherPageBtn = document.getElementById('control-crasher') as HTMLButtonElement;
  const controlReporterPageBtn = document.getElementById('control-reporter') as HTMLButtonElement;
  const scriptPageBtn = document.getElementById('script') as HTMLButtonElement;
  const graphicPageBtn = document.getElementById('graphic') as HTMLButtonElement;
  const monitoringPageBtn = document.getElementById('monitoring') as HTMLButtonElement;
  const analysisPageBtn = document.getElementById('analysis') as HTMLButtonElement;
	const logPageBtn = document.getElementById('log') as HTMLButtonElement;
	const	aboutPageBtn = document.getElementById('about') as HTMLButtonElement;

  const openToolsButtonListBtn = document.getElementById('open-tools-button-list') as HTMLButtonElement;
  const openCheatButtonListBtn = document.getElementById('open-cheat-button-list') as HTMLButtonElement;
  const openHackButtonListBtn = document.getElementById('open-hack-button-list') as HTMLButtonElement;

	panelBtns.forEach((button: HTMLElement) => {
		if (button.id === 'main') {
			button.classList.add('selected');
		}

  	button.addEventListener('click', () => {
    	panelBtns.forEach((btn: HTMLElement) => {
      	btn.classList.remove('selected');
    	});

    	button.classList.add('selected');

      let scriptBetaTag = document.getElementById('script-beta-tag') as HTMLElement;
      let analysisBetaTag = document.getElementById('analysis-beta-tag') as HTMLElement;

      if (button.id === 'analysis') {
        scriptBetaTag.style.display = 'none';
        analysisBetaTag.style.display = 'flex';
      } else if (button.id === 'script') {
        scriptBetaTag.style.display = 'flex';
        analysisBetaTag.style.display = 'none';
      } else {
        scriptBetaTag.style.display = 'none';
        analysisBetaTag.style.display = 'none';
      }
  	});
	});

	mainPageBtn.addEventListener('click', () => showContainer(mainPageContainer));
	settingsPageBtn.addEventListener('click', () => showContainer(settingsPageContainer));
  proxyPageBtn.addEventListener('click', () => showContainer(proxyPageContainer));
  controlPageBtn.addEventListener('click', () => showContainer(controlSectorsPageContainer));
  controlChatPageBtn.addEventListener('click', () => showContainer(controlChatPageContainer));
  controlActionsPageBtn.addEventListener('click', () => showContainer(controlActionsPageContainer));
  controlMovementPageBtn.addEventListener('click', () => showContainer(controlMovementPageContainer));
  controlImitationPageBtn.addEventListener('click', () => showContainer(controlImitationPageContainer));
  controlFlightPageBtn.addEventListener('click', () => showContainer(controlFlightPageContainer));
  controlGhostPageBtn.addEventListener('click', () => showContainer(controlGhostPageContainer));
  controlAttackPageBtn.addEventListener('click', () => showContainer(controlAttackPageContainer));
  controlReporterPageBtn.addEventListener('click', () => showContainer(controlReporterPageContainer));
  scriptPageBtn.addEventListener('click', () => showContainer(scriptPageContainer));
  graphicPageBtn.addEventListener('click', () => showContainer(graphicPageContainer));
  monitoringPageBtn.addEventListener('click', () => showContainer(monitoringPageContainer));
  analysisPageBtn.addEventListener('click', () => showContainer(analysisPageContainer));
	logPageBtn.addEventListener('click', () => showContainer(logPageContainer));
	aboutPageBtn.addEventListener('click', () => showContainer(aboutPageContainer));

  const globalContainers: HTMLElement[] = [
		mainPageContainer,
		settingsPageContainer,
    proxyPageContainer,
    controlSectorsPageContainer,
    controlChatPageContainer,
    controlActionsPageContainer,
    controlMovementPageContainer,
    controlImitationPageContainer,
    controlFlightPageContainer,
    controlGhostPageContainer,
    controlAttackPageContainer,
    controlReporterPageContainer,
    scriptPageContainer,
    graphicPageContainer,
    monitoringPageContainer,
    analysisPageContainer,
		logPageContainer,
    aboutPageContainer
  ];

  const showContainer = (container: HTMLElement) => {
    globalContainers.forEach((element) => {
      if (element.id !== container.id) {
        element.style.display = 'none';
      }
    });

    container.style.display = 'block';

    if (container.id === 'control-sectors-container') {
      setTimeout(() => { 
        changeDisplayButtonList('tools', 'client');
        setTimeout(() => { 
          changeDisplayButtonList('cheat', 'client');
          setTimeout(() => changeDisplayButtonList('hack', 'client'), 200);
        }, 130);
      }, 100);
    }
  }

  openToolsButtonListBtn.addEventListener('click', () => changeDisplayButtonList('tools', 'user'));
  openCheatButtonListBtn.addEventListener('click', () => changeDisplayButtonList('cheat', 'user'));
  openHackButtonListBtn.addEventListener('click', () => changeDisplayButtonList('hack', 'user'));

  const changeDisplayButtonList = (type: string, who: 'client' | 'user') => {
    let buttonListContainer = document.getElementById(`control-${type}-button-list`) as HTMLElement;

    if (who === 'client' && buttonListContainer.style.display === 'block') return;

    if (buttonListContainer.style.display === 'block') {
      buttonListContainer.classList.remove('show');
      buttonListContainer.classList.add('hide');

      setTimeout(() => {
        buttonListContainer.classList.remove('hide');
        buttonListContainer.style.display = 'none';
      }, 200);
    } else {
      buttonListContainer.classList.remove('hide');
      buttonListContainer.classList.add('show');
          
      buttonListContainer.style.display = 'block';

      const buttons = buttonListContainer.querySelectorAll('.list-btn') as NodeListOf<HTMLButtonElement>;

      buttons.forEach((button: HTMLButtonElement, index: number) => {
        setTimeout(() => {
          button.classList.add('temporary-theme');

          setTimeout(() => {
            button.classList.remove('temporary-theme');
          }, 130); 
        }, index * 70); 
      });
    }
  }

  controlCrasherPageBtn.addEventListener('click', async () => {
    try {
      await fetch('http://localhost:37621/salarixi/terminal/tools/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'crasher'
        })
      });
    } catch (error) {
      logger.log(`Ошибка (start-crasher): ${error}`, 'log-error');
    }
  })
}

// Функция для инициализации значений элементов (загрузка конфига)
async function initializeElementValues() {
  try {
    logger.log('Чтение конфига...', 'log-system');

    const operation = await configurator.load();

    if (!operation.success) {
      logger.log(operation.message, 'log-error'); return;
    }

    if (operation.invalidKey) {
      logger.log(operation.message, 'log-error'); return;
    }

    if (!operation.config) {
      logger.log('Не удалось получить значения из конфига', 'log-error'); return;
    }

    logger.log(operation.message, 'log-system');

    const initInputsInMainContainer = () => {
      const current = operation.config?.input.mainContainer;

      if (!current) {
        logger.log('Ошибка операции initInputsInMainContainer: Config damaged', 'log-error'); return;
      }

      let address = document.getElementById(current.address.id) as HTMLInputElement;
      let version = document.getElementById(current.version.id) as HTMLInputElement;
      let quantity = document.getElementById(current.quantity.id) as HTMLInputElement;
      let delay = document.getElementById(current.delay.id) as HTMLInputElement;

      address.value = current.address.value;
      version.value = current.version.value;
      quantity.valueAsNumber = current.quantity.value;
      delay.valueAsNumber = current.delay.value;
    }

    const initInputsInSettingsContainer = () => {
      const current = operation.config?.input.settingsContainer;

      if (!current) {
        logger.log('Ошибка операции initInputsInSettingsContainer: Config damaged', 'log-error'); return;
      }

      let nickname = document.getElementById(current.nickname.id) as HTMLInputElement;
      let password = document.getElementById(current.password.id) as HTMLInputElement;
      let timeout = document.getElementById(current.timeout.id) as HTMLInputElement;
      let distance = document.getElementById(current.distance.id) as HTMLInputElement;
      let registerCommand = document.getElementById(current.registerCommand.id) as HTMLInputElement;
      let registerTemplate = document.getElementById(current.registerTemplate.id) as HTMLInputElement;
      let loginCommand = document.getElementById(current.loginCommand.id) as HTMLInputElement;
      let loginTemplate = document.getElementById(current.loginTemplate.id) as HTMLInputElement;
      let rejoinQuantity = document.getElementById(current.rejoinQuantity.id) as HTMLInputElement;
      let rejoinDelay = document.getElementById(current.rejoinDelay.id) as HTMLInputElement;

      nickname.value = current.nickname.value;
      password.value = current.password.value;
      timeout.valueAsNumber = current.timeout.value;
      distance.value = current.distance.value;
      registerCommand.value = current.registerCommand.value;
      registerTemplate.value = current.registerTemplate.value;
      loginCommand.value = current.loginCommand.value;
      loginTemplate.value = current.loginTemplate.value;
      rejoinQuantity.valueAsNumber = current.rejoinQuantity.value;
      rejoinDelay.valueAsNumber = current.rejoinDelay.value;
    }

    const initInputsInProxyContainer = () => {
      const current = operation.config?.input.proxyContainer;

      if (!current) {
        logger.log('Ошибка операции initInputsInProxyContainer: Config damaged', 'log-error'); return;
      }

      let proxyList = document.getElementById(current.proxyList.id) as HTMLTextAreaElement;

      proxyList.value = current.proxyList.value;
    }

    const initInputsInControlContainer = () => {
      const current = operation.config?.input.controlContainer;

      if (!current) {
        logger.log('Ошибка операции initInputsInControlContainer: Config damaged', 'log-error'); return;
      }

      let message = document.getElementById(current.message.id) as HTMLInputElement;
      let spammingMinDelay = document.getElementById(current.spammingMinDelay.id) as HTMLInputElement;
      let spammingMaxDelay = document.getElementById(current.spammingMaxDelay.id) as HTMLInputElement;

      message.value = current.message.value;
      spammingMinDelay.valueAsNumber = current.spammingMinDelay.value;
      spammingMaxDelay.valueAsNumber = current.spammingMaxDelay.value;
    }

    const initInputsInScriptContainer = () => {
      const current = operation.config?.input.scriptContainer;

      if (!current) {
        logger.log('Ошибка операции initInputsInScriptContainer: Config damaged', 'log-error'); return;
      }

      let script = document.getElementById(current.script.id) as HTMLInputElement;

      script.value = current.script.value;
    }

    const initCheckboxesInSettingsContainer = () => {
      const current = operation.config?.checkbox.settingsContainer;

      if (!current) {
        logger.log('Ошибка операции initCheckboxesInSettingsContainer: Config damaged', 'log-error'); return;
      }

      let useKeepAlive = document.getElementById(current.useKeepAlive.id) as HTMLInputElement;
      let usePhysics = document.getElementById(current.usePhysics.id) as HTMLInputElement;
      let useProxy = document.getElementById(current.useProxy.id) as HTMLInputElement;
      let useProxyChecker = document.getElementById(current.useProxyChecker.id) as HTMLInputElement;
      let useAutoRegister = document.getElementById(current.useAutoRegister.id) as HTMLInputElement;
      let useAutoLogin = document.getElementById(current.useAutoLogin.id) as HTMLInputElement;
      let useAutoRejoin = document.getElementById(current.useAutoRejoin.id) as HTMLInputElement;
      let useLogDeath = document.getElementById(current.useLogDeath.id) as HTMLInputElement;
      let useSaveChat = document.getElementById(current.useSaveChat.id) as HTMLInputElement;
      let useSavePlayers = document.getElementById(current.useSavePlayers.id) as HTMLInputElement;
      let useAiAgent = document.getElementById(current.useAiAgent.id) as HTMLInputElement;
      let useDataAnalysis = document.getElementById(current.useDataAnalysis.id) as HTMLInputElement;
      let useOptimization = document.getElementById(current.useOptimization.id) as HTMLInputElement;
      let useErrorCorrector = document.getElementById(current.useErrorCorrector.id) as HTMLInputElement;

      useKeepAlive.checked = current.useKeepAlive.value;
      usePhysics.checked = current.usePhysics.value;
      useProxy.checked = current.useProxy.value;
      useProxyChecker.checked = current.useProxyChecker.value;
      useAutoRegister.checked = current.useAutoRegister.value;
      useAutoLogin.checked = current.useAutoLogin.value;
      useAutoRejoin.checked = current.useAutoRejoin.value;
      useLogDeath.checked = current.useLogDeath.value;
      useSaveChat.checked = current.useSaveChat.value;
      useSavePlayers.checked = current.useSavePlayers.value;
      useAiAgent.checked = current.useAiAgent.value;
      useDataAnalysis.checked = current.useDataAnalysis.value;
      useOptimization.checked = current.useOptimization.value;
      useErrorCorrector.checked = current.useErrorCorrector.value;
    }

    initInputsInMainContainer();
    initInputsInSettingsContainer();
    initInputsInProxyContainer();
    initInputsInControlContainer();
    initInputsInScriptContainer();
    initCheckboxesInSettingsContainer();

    logger.log('Значения элементов успешно инициализированы', 'log-system');
  } catch (error) {
    logger.log(`Ошибка операции initializeElementValues: ${error}`, 'log-error');
  }
}

// Функция для инициализации графика активных ботов
async function initializeLineGraphicActiveBots() {
  try {
    await lineGraphic.createGraphicActiveBots();

    const eventSource = new EventSource('http://localhost:37621/salarixi/session/graphic/line/active-bots');

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        const activeBotsQuantity = data.activeBotsQuantity;

        await lineGraphic.addGraphicDataActiveBots(activeBotsQuantity);
      } catch (error) {
        logger.log(`Ошибка парсинга SSE-сообщения (line-graphic-active-bots): ${error}`, 'log-error');
      }
    }

    eventSource.onerror = async () => {
      logger.log('Ошибка (line-graphic-active-bots): SSE-connection was dropped', 'log-error');
      eventSource.close();
    }

    (window as any).currentLineGraphicActiveBotsEventSource = eventSource;
  } catch (error) {
    logger.log(`Ошибка инициализации line-графика активных ботов: ${error}`, 'log-error');
  }
}

// Функция для инициализации графика активных ботов
async function initializeLineGraphicAverageLoad() {
  try {
    await lineGraphic.createGraphicAverageLoad();

    const eventSource = new EventSource('http://localhost:37621/salarixi/session/graphic/line/average-load');

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        const averageLoad = data.averageLoad ? data.averageLoad : 0;

        await lineGraphic.addGraphicDataAverageLoad(averageLoad);
      } catch (error) {
        logger.log(`Ошибка парсинга SSE-сообщения (line-graphic-average-load): ${error}`, 'log-error');
      }
    }

    eventSource.onerror = async () => {
      logger.log('Ошибка (line-graphic-average-load): SSE-connection was dropped', 'log-error');
      eventSource.close();
    }

    (window as any).currentLineGraphicAverageLoadEventSource = eventSource;
  } catch (error) {
    logger.log(`Ошибка инициализации line-графика средней нагрузки ботов: ${error}`, 'log-error');
  }
}

// Функция для инициализации мониторинга чата
async function initializeChatMonitoring() {
  try {
    let NICKNAMES_LIST: string[] = [];
    let LATEST_MESSAGES: any[] = [];

    const monitoringStatusText = document.getElementById('monitoring-chat-status-text') as HTMLElement;

    setInterval(() => {
      if (!functions.flags.IS_ACTIVE) {
        NICKNAMES_LIST.length = 0;
        LATEST_MESSAGES.length = 0;
      }
    }, 3000);

    const eventSource = new EventSource('http://localhost:37621/salarixi/session/monitoring/chat');

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        const nickname = data.nickname;
        const type = data.type;
        const text = data.text;

        const monitoringContent = document.getElementById(`monitoring-chat-content-${nickname}`) as HTMLElement;

        if (!monitoringContent) return;

        let validMessage = true;

        LATEST_MESSAGES.forEach(element => element.nickname === nickname && element.text === text ? validMessage = false : validMessage = validMessage);

        if (validMessage) {
          LATEST_MESSAGES.push({ nickname: nickname, text: text });

          if (LATEST_MESSAGES.length > 40) LATEST_MESSAGES.shift();

          const container = document.createElement('div');

          container.className = 'monitoring-line';

          container.innerHTML = `
            <div class="monitoring-line-time">${date()}</div>
            <div class="monitoring-line-content" style="-moz-user-select: text; -ms-user-select: text; user-select: text;"><span class="monitoring-type">(${type})</span> ${String(text).replace('%hb', '<span style="color: #a85fdfff; font-weight: 600;">').replace('%sc', '</span>')}</div>
          `;

          monitoringContent.appendChild(container);

          let validNickname = true;

          NICKNAMES_LIST.forEach(element => nickname === element ? validNickname = false : validNickname = validNickname);

          monitoringContent.scrollTo({
            top: monitoringContent.scrollHeight,
            behavior: 'smooth'
          });
        }
      } catch (error) {
        logger.log(`Ошибка парсинга SSE-сообщения (chat-monitoring): ${error}`, 'log-error');
      }
    }

    eventSource.onerror = async () => {
      logger.log('Ошибка (chat-monitoring): SSE-connection was dropped', 'log-error');
      eventSource.close();

      LATEST_MESSAGES.length = 0;

      for (const nickname of NICKNAMES_LIST) {
        const monitoringContent = document.getElementById(`monitoring-chat-content-${nickname}`) as HTMLElement;

        monitoringContent.innerHTML = '';
        monitoringContent.style.display = 'none';
      }

      NICKNAMES_LIST.length = 0;

      monitoringStatusText.innerText = 'Ошибка соединения с сервером\nПодробнее: SSE-connection was dropped';
      monitoringStatusText.style.color = '#e32020ff';
      monitoringStatusText.style.display = 'block';
    }

    (window as any).currentChatMonitoringEventSource = eventSource;
  } catch (error) {
    logger.log(`Ошибка инициализации мониторинга чата: ${error}`, 'log-error');
  }
}

function addEventListenerToOpenChatBtn(nickname: string) {
  const openChatBtn = document.getElementById(`open-chat-${nickname}`) as HTMLButtonElement;

  openChatBtn.addEventListener('click', () => {
    try {
      const chatContainer = document.getElementById(`chat-${nickname}`) as HTMLElement;

      chatContainer.style.display = 'flex';
    } catch (error) {
      logger.log(`Ошибка открытия чата: ${error}`, 'log-error');
    }
  });
}

function addEventListenerToCloseChatBtn(nickname: string) {
  const closeChatBtn = document.getElementById(`close-chat-${nickname}`) as HTMLButtonElement;

  closeChatBtn.addEventListener('click', () => {
    try {
      const chatContainer = document.getElementById(`chat-${nickname}`) as HTMLElement;

      chatContainer.style.display = 'none';
    } catch (error) {
      logger.log(`Ошибка закрытия чата: ${error}`, 'log-error');
    }
  });
}

// Функция для инициализации мониторинга чата
async function initializeBotsMonitoring() {
  try {
    let NICKNAMES_LIST: string[] = [];

    const monitoringStatusText = document.getElementById('monitoring-status-text') as HTMLElement;
    const monitoringContent = document.getElementById('bots-cards-container') as HTMLElement;
    const steveIconPngPath = document.getElementById('steve-img') as HTMLImageElement;

    setInterval(() => {
      if (!functions.flags.IS_ACTIVE) NICKNAMES_LIST.length = 0;
    }, 3000);

    const eventSource = new EventSource('http://localhost:37621/salarixi/session/monitoring/bots');

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        const { 
          nickname, status, statusColor, 
          version, password, proxyType, 
          proxy, reputation, reputationColor, 
          load, loadColor, ping, pingColor
        } = data;

        if (NICKNAMES_LIST.includes(nickname)) {
          let botStatus = document.getElementById(`bot-status-${nickname}`) as HTMLElement;
          let botVersion = document.getElementById(`bot-version-${nickname}`) as HTMLElement;
          let botPassword = document.getElementById(`bot-password-${nickname}`) as HTMLElement;
          let botReputation = document.getElementById(`bot-reputation-${nickname}`) as HTMLElement;
          let botProxyType = document.getElementById(`bot-proxy-type-${nickname}`) as HTMLElement;
          let botProxy = document.getElementById(`bot-proxy-${nickname}`) as HTMLElement;
          let botLoad = document.getElementById(`bot-load-${nickname}`) as HTMLElement;
          let botPing = document.getElementById(`bot-ping-${nickname}`) as HTMLElement;

          botStatus.innerHTML = `<span style="color: ${statusColor};">${status}</span>`;
          botVersion.innerHTML = `  ${version}`;
          botPassword.innerHTML = `  ${password}`;
          botReputation.innerHTML = `<span style="color: ${reputationColor};">  ${reputation}/100</span>`;
          botProxyType.innerHTML = `  ${proxyType}`;
          botProxy.innerHTML = `  ${proxy}`;
          botLoad.innerHTML = `<span style="color: ${loadColor};">  ${load}</span>`;
          botPing.innerHTML = `<span style="color: ${pingColor};">  ${ping}</span>`;
        } else {
          const card = document.createElement('div');
          card.className = 'bot-card';

          card.innerHTML = `
            <div class="bot-card-head">
              <img src="${steveIconPngPath.src}" class="image" draggable="false">
              <div class="text">
                <div class="bot-basic-info">
                  <div class="bot-nickname" style="user-select: text; -moz-user-select: text;">${nickname}</div>
                  <div class="bot-status"><span id="bot-status-${nickname}" style="color: ${statusColor};">${status}</span></div>
                </div>
              </div>
            </div>

            <div class="bot-advanced-info">
              <p>Версия:<span id="bot-version-${nickname}">  ${version}</span></p>
              <p>Пароль:<span id="bot-password-${nickname}">  ${password}</span></p>
              <p>Репутация:<span id="bot-reputation-${nickname}"><span style="color: ${reputationColor};">  ${reputation}/100</span></span></p>
              <p>Тип прокси:<span id="bot-proxy-type-${nickname}">  ${proxyType}</span></p>
              <p>Прокси:<span id="bot-proxy-${nickname}">  ${proxy}</span></p>
              <p>Нагрузка:<span id="bot-load-${nickname}"><span style="color: ${loadColor};">  ${load}</span></span></p>
              <p>Пинг:<span id="bot-ping-${nickname}"><span style="color: ${pingColor};">  ${ping}</span></span></p>
            </div>

            <button id="open-chat-${nickname}">Открыть чат</button>

            <div class="chat-container" id="chat-${nickname}">
              <div class="chat-header">
                <button class="close-button" id="close-chat-${nickname}">Закрыть</button>
              </div>
              <div class="chat-content">
                <div class="monitoring-content" id="monitoring-chat-content-${nickname}"></div>
              </div>
            </div>
          `;

          monitoringContent.appendChild(card);

          NICKNAMES_LIST.push(nickname);

          setTimeout(() => {
            addEventListenerToOpenChatBtn(nickname);
            addEventListenerToCloseChatBtn(nickname);
          }, 500);
        }
      } catch (error) {
        logger.log(`Ошибка парсинга SSE-сообщения (bots-monitoring): ${error}`, 'log-error');
      }
    }

    eventSource.onerror = async () => {
      logger.log('Ошибка (bots-monitoring): SSE-connection was dropped', 'log-error');
      eventSource.close();

      monitoringContent.innerHTML = '';
      monitoringStatusText.innerText = 'Ошибка соединения с сервером\nПодробнее: SSE-connection was dropped';
      monitoringStatusText.style.color = '#e32020ff';
      monitoringStatusText.style.display = 'block';
    }

    (window as any).currentBotsMonitoringEventSource = eventSource;
  } catch (error) {
    logger.log(`Ошибка инициализации мониторинга ботов: ${error}`, 'log-error');
  }
}

// Инициализация интерфейса
document.addEventListener('DOMContentLoaded', async () => {
  logger.log('Клиент запущен', 'log-system');

  await initializeGlobalContainers();
  await initializeElementValues();

  await cleaner.purify()
    .then(({ success, message }) => {
      if (success) {
        logger.log(message, 'log-system');
      } else {
        logger.log(message, 'log-error');
      }
    });

  await initializeLineGraphicActiveBots();
  await initializeLineGraphicAverageLoad();

  await initializeChatMonitoring();
  await initializeBotsMonitoring();

  await functions.initializeButtonFunctions();
  await functions.initializeCheckboxFunctions();
  await functions.initializeSelectFunctions();
});