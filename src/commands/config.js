const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const CONFIG_DIR = path.join(process.env.HOME, '.config', 'ghostty-manager');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const defaults = {
  theme: 'nord',
  'shell-integration': 'detect',
  'shell-integration-features': 'cursor,sudo,ssh-env,ssh-terminfo',
  'window-padding-x': '10',
  'window-padding-y': '10',
  'quit-after-last-window-closed': 'true',
  'quit-after-last-window-closed-delay': '5m'
};

// Simple config store
let configStore = { ...defaults };

// Load config from file
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      configStore = { ...defaults, ...JSON.parse(data) };
    }
  } catch (e) {
    configStore = { ...defaults };
  }
}

// Save config to file
function saveConfig() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(configStore, null, 2));
}

// Get config value
function getConfigValue(key) {
  loadConfig();
  return configStore[key];
}

// Set config value
function setConfigValue(key, value) {
  loadConfig();
  configStore[key] = value;
  saveConfig();
}

// Get all config
function getAllConfig() {
  loadConfig();
  return configStore;
}

// Clear config
function clearConfig() {
  configStore = { ...defaults };
  saveConfig();
}

const GHOSTTY_CONFIG_PATH = path.join(process.env.HOME, '.config', 'ghostty', 'config');

/**
 * Get config value
 */
async function getConfig(key) {
  try {
    const value = getConfigValue(key);
    
    if (value === undefined) {
      console.log(chalk.yellow(`Config key "${key}" not found`));
      return;
    }
    
    console.log(chalk.blue(`${key} = ${value}`));
    
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

/**
 * Set config value
 */
async function setConfig(key, value) {
  try {
    setConfigValue(key, value);
    console.log(chalk.green(`Set ${key} = ${value}`));
    
    // Optionally sync to Ghostty config
    syncToGhosttyConfig(key, value);
    
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

/**
 * List all config values
 */
async function listConfig() {
  const store = getAllConfig();
  
  console.log(chalk.bold('\nGhostty Manager Configuration:\n'));
  
  Object.keys(store).forEach(key => {
    const value = store[key];
    console.log(`  ${chalk.blue(key)}: ${chalk.gray(value)}`);
  });
  
  console.log(chalk.gray('\n(Not synced with Ghostty config file)'));
  console.log('');
}

/**
 * Reset config to defaults
 */
async function resetConfig(options) {
  if (!options.force) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(chalk.yellow('Reset all config to defaults? (y/N): '), (answer) => {
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log(chalk.gray('Cancelled'));
        return;
      }
      
      clearConfig();
      console.log(chalk.green('Config reset to defaults'));
    });
    
    return;
  }
  
  clearConfig();
  console.log(chalk.green('Config reset to defaults'));
}

/**
 * Sync config to Ghostty config file
 */
function syncToGhosttyConfig(key, value) {
  try {
    // Ensure directory exists
    const configDir = path.dirname(GHOSTTY_CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Read existing config
    let configContent = '';
    if (fs.existsSync(GHOSTTY_CONFIG_PATH)) {
      configContent = fs.readFileSync(GHOSTTY_CONFIG_PATH, 'utf8');
    }
    
    // Check if key exists
    const regex = new RegExp(`^${key}\\s*=.*$`, 'm');
    
    if (regex.test(configContent)) {
      // Update existing key
      configContent = configContent.replace(regex, `${key} = ${value}`);
    } else {
      // Add new key
      configContent += `\n${key} = ${value}`;
    }
    
    fs.writeFileSync(GHOSTTY_CONFIG_PATH, configContent);
    console.log(chalk.gray(`  Synced to ${GHOSTTY_CONFIG_PATH}`));
    
  } catch (error) {
    console.log(chalk.gray(`  Could not sync to Ghostty config: ${error.message}`));
  }
}

module.exports = {
  getConfig,
  setConfig,
  listConfig,
  resetConfig
};
