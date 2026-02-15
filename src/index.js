#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { startGhostty, stopGhostty, statusGhostty } = require('./commands/ghostty');
const { listSessions, createSession, attachSession, killSession } = require('./commands/session');
const { getConfig, setConfig, listConfig, resetConfig } = require('./commands/config');
const { version } = require('../package.json');

const program = new Command();

program
  .name('ghostty')
  .description('CLI terminal manager for Ghostty workflow automation')
  .version(version);

// Ghostty process management commands
program
  .command('start')
  .description('Start Ghostty terminal')
  .option('-c, --config <file>', 'Use specific config file')
  .option('-d, --directory <dir>', 'Working directory')
  .option('-t, --title <title>', 'Window title')
  .action(startGhostty);

program
  .command('stop')
  .description('Stop Ghostty terminal')
  .action(stopGhostty);

program
  .command('status')
  .description('Check Ghostty status')
  .action(statusGhostty);

// Session management commands
program
  .command('session')
  .description('Manage tmux sessions')
  .alias('s');

const sessionCmd = program.commands.find(c => c.name() === 'session');

sessionCmd
  .command('list')
  .description('List all tmux sessions')
  .alias('ls')
  .action(listSessions);

sessionCmd
  .command('create <name>')
  .description('Create new tmux session')
  .option('-d, --directory <dir>', 'Working directory')
  .option('-w, --window <name>', 'Initial window name', 'main')
  .action(createSession);

sessionCmd
  .command('attach <name>')
  .description('Attach to tmux session')
  .alias('a')
  .action(attachSession);

sessionCmd
  .command('kill <name>')
  .description('Kill tmux session')
  .alias('k')
  .option('-a, --all', 'Kill all sessions')
  .action(killSession);

// Config management commands
program
  .command('config')
  .description('Manage Ghostty configuration')
  .alias('c');

const configCmd = program.commands.find(c => c.name() === 'config');

configCmd
  .command('get <key>')
  .description('Get config value')
  .action(getConfig);

configCmd
  .command('set <key> <value>')
  .description('Set config value')
  .action(setConfig);

configCmd
  .command('list')
  .description('List all config values')
  .alias('ls')
  .action(listConfig);

configCmd
  .command('reset')
  .description('Reset config to defaults')
  .option('-f, --force', 'Skip confirmation')
  .action(resetConfig);

// Project commands
program
  .command('project')
  .description('Manage projects')
  .alias('p');

const projectCmd = program.commands.find(c => c.name() === 'project');

projectCmd
  .command('open <name>')
  .description('Open project in Ghostty')
  .option('-d, --directory <dir>', 'Project directory', process.cwd())
  .action(async (name, options) => {
    const { spawn } = require('child_process');
    const dir = options.directory || `${process.env.HOME}/dev/${name}`;
    
    console.log(chalk.blue(`Opening project: ${name} in ${dir}`));
    
    const ghostty = spawn('ghostty', ['--working-directory', dir, '--title', `Project: ${name}`, '-e', 'tmux', 'new', '-s', name], {
      detached: true,
      stdio: 'ignore'
    });
    
    ghostty.unref();
    console.log(chalk.green(`Project ${name} opened!`));
  });

projectCmd
  .command('list')
  .description('List available projects')
  .action(async () => {
    const fs = require('fs');
    const projectsDir = `${process.env.HOME}/dev`;
    
    if (!fs.existsSync(projectsDir)) {
      console.log(chalk.yellow('No projects directory found'));
      return;
    }
    
    const projects = fs.readdirSync(projectsDir).filter(p => {
      return fs.statSync(`${projectsDir}/${p}`).isDirectory();
    });
    
    if (projects.length === 0) {
      console.log(chalk.yellow('No projects found'));
      return;
    }
    
    console.log(chalk.bold('\nAvailable projects:\n'));
    projects.forEach(p => console.log(`  ${chalk.blue('●')} ${p}`));
    console.log('');
  });

program.parse(process.argv);
