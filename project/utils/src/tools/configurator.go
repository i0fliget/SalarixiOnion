package tools

import (
	"encoding/json"
	"os"
)

type Information struct {
	Id    string `json:"id"`
	Value any    `json:"value"`
}

type InputMainContainer struct {
	Address  Information `json:"address"`
	Version  Information `json:"version"`
	Quantity Information `json:"quantity"`
	Delay    Information `json:"delay"`
}

type InputSettingsContainer struct {
	Nickname         Information `json:"nickname"`
	Password         Information `json:"password"`
	Timeout          Information `json:"timeout"`
	Distance         Information `json:"distance"`
	RegisterCommand  Information `json:"registerCommand"`
	RegisterTemplate Information `json:"registerTemplate"`
	LoginCommand     Information `json:"loginCommand"`
	LoginTemplate    Information `json:"loginTemplate"`
	RejoinQuantity   Information `json:"rejoinQuantity"`
	RejoinDelay      Information `json:"rejoinDelay"`
}

type InputProxyContainer struct {
	ProxyList Information `json:"proxyList"`
}

type InputControlContainer struct {
	Message          Information `json:"message"`
	SpammingMinDelay Information `json:"spammingMinDelay"`
	SpammingMaxDelay Information `json:"spammingMaxDelay"`
}

type InputScriptContainer struct {
	Script Information `json:"script"`
}

type CheckboxSettingsContainer struct {
	UseKeepAlive      Information `json:"useKeepAlive"`
	UsePhysics        Information `json:"usePhysics"`
	UseProxy          Information `json:"useProxy"`
	UseProxyChecker   Information `json:"useProxyChecker"`
	UseAutoRegister   Information `json:"useAutoRegister"`
	UseAutoLogin      Information `json:"useAutoLogin"`
	UseAutoRejoin     Information `json:"useAutoRejoin"`
	UseLogDeath       Information `json:"useLogDeath"`
	UseSaveChat       Information `json:"useSaveChat"`
	UseSavePlayers    Information `json:"useSavePlayers"`
	UseAiAgent        Information `json:"useAiAgent"`
	UseDataAnalysis   Information `json:"useDataAnalysis"`
	UseOptimization   Information `json:"useOptimization"`
	UseErrorCorrector Information `json:"useErrorCorrector"`
}

type Input struct {
	MainContainer     InputMainContainer     `json:"mainContainer"`
	SettingsContainer InputSettingsContainer `json:"settingsContainer"`
	ProxyContainer    InputProxyContainer    `json:"proxyContainer"`
	ControlContainer  InputControlContainer  `json:"controlContainer"`
	ScriptContainer   InputScriptContainer   `json:"scriptContainer"`
}

type Checkbox struct {
	SettingsContainer CheckboxSettingsContainer `json:"settingsContainer"`
}

type ConfigStructure struct {
	Input    Input    `json:"input"`
	Checkbox Checkbox `json:"checkbox"`
}

func checkConfigExist() (bool, string) {
	status := false
	path := "NOT_FOUND"

	configPaths := []string{
		"./config/salarixi.config.json",
		"./salarixi.config.json",
		"./cfg/salarixi.config.json",
		"./salarixi.cfg.json",
		"./config/salarixi.cfg.json",
		"../config/salarixi.config.json",
		"../cfg/salarixi.config.json",
		"../config/salarixi.cfg.json",
	}

	for _, configPath := range configPaths {
		_, err := os.Stat(configPath)

		isNotExist := os.IsNotExist(err)

		if !isNotExist {
			status = true
			path = configPath
			break
		}
	}

	return status, path
}

func WriteConfig(config ConfigStructure) (bool, string) {
	data, err := json.MarshalIndent(config, "", "  ")

	if err != nil {
		return false, "Не удалось провести сериализацию JSON-данных"
	}

	status, path := checkConfigExist()

	if !status {
		return false, "Не удалось найти путь к конфигу"
	}

	err = os.WriteFile(path, data, 0644)

	if err != nil {
		return false, "Не удалось записать данные в конфиг"
	}

	return true, "Конфиг успешно изменён"
}

func ReadConfig() (bool, string, map[string]any) {
	status, path := checkConfigExist()

	if !status {
		return false, "Не удалось найти путь к конфигу", nil
	}

	data, err := os.ReadFile(path)

	if err != nil {
		return false, "Не удалось прочитать конфиг", nil
	}

	var config map[string]any

	err = json.Unmarshal(data, &config)

	if err != nil {
		return false, "Не удалось распарсить данные из конфига", nil
	}

	return true, "Конфиг успешно прочитан", config
}
