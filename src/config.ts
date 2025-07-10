import fs from 'fs'
import os from 'os'
import path from 'path'

type Config = {
  dbUrl: string
  currentUserName: string
}

type ConfigJSON = {
  db_url: string
  current_user_name: string
}

const DEFAULT_CONFIG: Config = {
  dbUrl: 'postgres://example',
  currentUserName: 'guest',
}

function getConfigFilePath() {
  return path.join(os.homedir(), '.gatorconfig.json')
}

export function readConfig(): Config {
  const filePath = getConfigFilePath()

  if (!fs.existsSync(filePath)) {
    writeConfig(DEFAULT_CONFIG)
    return DEFAULT_CONFIG
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(fileContent)
    return validateConfig(parsed)
  } catch (err) {
    console.error('❌ Error reading config:', err)
    console.log('Restoring default config.')
    writeConfig(DEFAULT_CONFIG)
    return DEFAULT_CONFIG
  }
}

export function setUser(userName: string): void {
  const config = readConfig()
  config.currentUserName = userName
  writeConfig(config)
}

function validateConfig(raw: any): Config {
  if (
    typeof raw !== 'object' ||
    typeof raw.db_url !== 'string' ||
    typeof raw.current_user_name !== 'string'
  ) {
    throw new Error('❌ Invalid configuration format.')
  }

  return {
    dbUrl: raw.db_url,
    currentUserName: raw.current_user_name,
  }
}

function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath()
  const cfgJSON: ConfigJSON = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  }
  const json = JSON.stringify(cfgJSON, null, 2)
  fs.writeFileSync(filePath, json, { encoding: 'utf-8' })
}
