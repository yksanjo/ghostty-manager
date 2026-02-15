# Ghostty Manager (gtm)

CLI terminal manager for Ghostty workflow automation.

## Installation

```bash
cd ghostty-manager
npm install
npm link
```

## Usage

```bash
# Check Ghostty status
gtm status

# Start Ghostty
gtm start
gtm start -d ~/projects/myapp -t "My App"

# Stop Ghostty
gtm stop

# Session management
gtm session list           # List all tmux sessions
gtm session create myapp   # Create new session
gtm session attach myapp   # Attach to session
gtm session kill myapp     # Kill session
gtm session kill -a       # Kill all sessions

# Config management
gtm config list            # List all config
gtm config get theme       # Get specific config
gtm config set theme nord  # Set config value

# Project management
gtm project list           # List projects in ~/dev
gtm project open myapp     # Open project in Ghostty
```

## Features

- **Ghostty Process Management**: Start, stop, and check status of Ghostty terminal
- **Tmux Session Management**: Create, list, attach, and kill tmux sessions
- **Configuration Management**: Get, set, list, and reset Ghostty configurations
- **Project Management**: Quick access to projects in ~/dev directory

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `gtm start` | | Start Ghostty terminal |
| `gtm stop` | | Stop Ghostty terminal |
| `gtm status` | | Check Ghostty status |
| `gtm session list` | `gtm s ls` | List tmux sessions |
| `gtm session create` | `gtm s create` | Create new session |
| `gtm session attach` | `gtm s a` | Attach to session |
| `gtm session kill` | `gtm s k` | Kill session |
| `gtm config list` | `gtm c ls` | List config |
| `gtm config get` | `gtm c get` | Get config value |
| `gtm config set` | `gtm c set` | Set config value |
| `gtm project list` | `gtm p ls` | List projects |
| `gtm project open` | `gtm p open` | Open project |

## Requirements

- [Ghostty](https://ghostty.org) terminal emulator
- [tmux](https://github.com/tmux/tmux) terminal multiplexer
- Node.js 18+
