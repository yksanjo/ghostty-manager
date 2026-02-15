const { spawn, execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');

/**
 * List all tmux sessions
 */
async function listSessions() {
  try {
    const output = execSync('tmux ls 2>/dev/null', { encoding: 'utf8' });
    
    if (!output.trim()) {
      console.log(chalk.yellow('No tmux sessions found'));
      return;
    }
    
    console.log(chalk.bold('\nActive sessions:\n'));
    
    const lines = output.trim().split('\n');
    lines.forEach(line => {
      const [name, info] = line.split(':');
      const sessionName = name.trim();
      const sessionInfo = info.trim();
      
      // Extract window count and status
      const windowsMatch = sessionInfo.match(/(\d+) windows/);
      const attachedMatch = sessionInfo.match(/(attached)/);
      
      const windows = windowsMatch ? windowsMatch[1] : '?';
      const status = attachedMatch ? chalk.green('(attached)') : chalk.gray('(detached)');
      
      console.log(`  ${chalk.blue('●')} ${chalk.bold(sessionName)} ${chalk.gray(`(${windows} windows)`)} ${status}`);
    });
    
    console.log('');
    
  } catch (error) {
    console.log(chalk.yellow('No tmux sessions found'));
  }
}

/**
 * Create new tmux session
 */
async function createSession(name, options) {
  const spinner = ora(`Creating session: ${name}...`).start();
  
  try {
    const dir = options.directory || process.cwd();
    const windowName = options.window || 'main';
    
    // Check if session already exists
    try {
      execSync(`tmux has-session -t ${name} 2>/dev/null`, { stdio: 'ignore' });
      spinner.info(`Session "${name}" already exists`);
      return;
    } catch (e) {
      // Session doesn't exist, continue to create
    }
    
    // Create session
    execSync(`tmux new-session -d -s "${name}" -n "${windowName}" -c "${dir}"`, {
      stdio: 'ignore'
    });
    
    spinner.succeed(`Session "${name}" created`);
    console.log(chalk.gray(`  Directory: ${dir}`));
    console.log(chalk.gray(`  Window: ${windowName}`));
    console.log(chalk.blue(`\nRun: ghostty session attach ${name}`));
    
  } catch (error) {
    spinner.fail(`Failed to create session: ${error.message}`);
  }
}

/**
 * Attach to tmux session
 */
async function attachSession(name) {
  if (!name) {
    console.log(chalk.red('Error: Session name required'));
    console.log(chalk.gray('Usage: ghostty session attach <name>'));
    return;
  }
  
  try {
    // Check if session exists
    execSync(`tmux has-session -t "${name}" 2>/dev/null`, { stdio: 'ignore' });
    
    // Attach to session through Ghostty
    const ghostty = spawn('ghostty', ['-e', 'tmux', 'attach', '-t', name], {
      detached: true,
      stdio: 'ignore'
    });
    
    ghostty.unref();
    console.log(chalk.green(`Attached to session: ${name}`));
    
  } catch (error) {
    console.log(chalk.red(`Session "${name}" not found`));
    console.log(chalk.gray('Run: ghostty session list to see available sessions'));
  }
}

/**
 * Kill tmux session
 */
async function killSession(name, options) {
  const spinner = ora('Killing session...').start();
  
  try {
    if (options.all) {
      // Kill all sessions
      execSync('tmux kill-session -a', { stdio: 'ignore' });
      spinner.succeed('All sessions killed');
      return;
    }
    
    if (!name) {
      spinner.fail('Session name required');
      return;
    }
    
    execSync(`tmux kill-session -t "${name}"`, { stdio: 'ignore' });
    spinner.succeed(`Session "${name}" killed`);
    
  } catch (error) {
    spinner.fail(`Failed to kill session: ${error.message}`);
  }
}

module.exports = {
  listSessions,
  createSession,
  attachSession,
  killSession
};
