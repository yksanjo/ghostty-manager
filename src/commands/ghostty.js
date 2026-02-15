const { spawn } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const { execSync } = require('child_process');

/**
 * Start Ghostty terminal
 */
async function startGhostty(options) {
  const spinner = ora('Starting Ghostty...').start();
  
  try {
    const args = [];
    
    if (options.config) {
      args.push('--config-file', options.config);
    }
    if (options.directory) {
      args.push('--working-directory', options.directory);
    }
    if (options.title) {
      args.push('--title', options.title);
    }
    
    // Check if Ghostty is already running
    const isRunning = isGhosttyRunning();
    
    if (isRunning && !options.config && !options.directory && !options.title) {
      spinner.info('Ghostty is already running');
      return;
    }
    
    const ghostty = spawn('ghostty', args, {
      detached: true,
      stdio: 'ignore'
    });
    
    ghostty.unref();
    
    spinner.succeed('Ghostty started successfully');
    
  } catch (error) {
    spinner.fail(`Failed to start Ghostty: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Stop Ghostty terminal
 */
async function stopGhostty() {
  const spinner = ora('Stopping Ghostty...').start();
  
  try {
    // Kill Ghostty process
    execSync('pkill -f ghostty', { stdio: 'ignore' });
    spinner.succeed('Ghostty stopped');
  } catch (error) {
    spinner.info('Ghostty is not running');
  }
}

/**
 * Check Ghostty status
 */
async function statusGhostty() {
  const isRunning = isGhosttyRunning();
  
  if (isRunning) {
    console.log(chalk.green('●') + ' Ghostty is running');
    
    // Get additional info
    try {
      const pid = execSync('pgrep -f ghostty').toString().trim();
      console.log(chalk.gray(`  PID: ${pid}`));
    } catch (e) {
      // ignore
    }
  } else {
    console.log(chalk.red('○') + ' Ghostty is not running');
  }
}

/**
 * Check if Ghostty is running
 */
function isGhosttyRunning() {
  try {
    execSync('pgrep -f ghostty', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  startGhostty,
  stopGhostty,
  statusGhostty
};
