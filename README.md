# BMM DEV V2 - WhatsApp Multi-Instance Bot Framework

## Overview

**BMM (Bot Management Module) Version 2** is a powerful, modular WhatsApp bot framework built with Node.js, Baileys, and Supabase. It supports multiple WhatsApp sessions per user, advanced group automation, real-time management via a web dashboard, and a rich set of commands for moderation, fun, and group control.

---

## Features

- **Multi-Instance Support:** Run multiple WhatsApp bots per user, each with isolated sessions.
- **Command System:**  
  - Modular command handlers in [/src/handler/command/](cci:7://file:///e:/Bot%20development/BOT%20V2/BMM%20DEV%20V2/src/handler/command:0:0-0:0)
  - Dynamic menu and help system, WhatsApp-friendly with reply numbers and emoji.
  - Commands grouped: Core, Moderation, Group Controls, Fun & Media.
  - Subcommands for group management (e.g., `.group stats`, `.group revoke`).
- **Emoji Reactions:**  
  - Centralized emoji mapping for all commands.
  - Bot reacts with the correct emoji for known commands, and random fun emoji for unknown/undefined commands.
- **Group Management:**  
  - Add/kick/promote/demote members, set group description/picture, get/revoke group link.
  - Detailed group stats (30-day activity, top members, owner info).
  - Robust admin/owner permission checks.
- **Moderation Tools:**  
  - Anti-link, anti-delete, warn system, privacy controls, disappearing messages.
- **Fun & Media:**  
  - Sticker creation, sticker-to-image/GIF, screenshots, random emoji reactions.
- **Real-Time Web Dashboard:**  
  - Live QR code display, bot status, group stats, and command usage.
  - Socket.IO for real-time updates between backend and frontend.
- **Session Management:**  
  - SQLite for local storage, Supabase for cloud backup.
  - Automatic session restoration and graceful shutdown.
- **Deployment Ready:**  
  - Docker support, Fly.io deployment configuration, environment variable management.

---

## Project Structure



---

## Usage

- **WhatsApp:**  
  - Use `.menu` or `.help` to see all available commands and their descriptions.
  - Reply with a menu number or command name to execute a command.
  - Use `.group <subcommand>` for group management (e.g., `.group stats`, `.group revoke`).

- **Web Dashboard:**  
  - Access live bot status, QR/pairing, session management, and group stats in real time.

---

## Tech Stack

- **Backend:** Node.js, Express, Baileys, Supabase, SQLite, Socket.IO
- **Frontend:** Modern web interface for bot management, real-time updates
- **Deployment:** Docker, Fly.io

---

## Development

- Modular codebase for easy extension and maintenance.
- All utility functions in `/utils/`, database in `/database/`, feature handlers in `/handler/features/`.
- See [dev.md](cci:7://file:///e:/Bot%20development/BOT%20V2/BMM%20DEV%20V2/dev.md:0:0-0:0) for detailed developer notes and architecture.

---

## License

MIT License

---

_Last updated: 2025-07-30_