<div align="center">
  <img src="https://avatars.githubusercontent.com/u/247460033?s=200&v=4" alt="Rigel Server" width="100" height="100"/>

  # Rigel Web Client

  A web interface for the Rigel platform, built with Preact and Vite.

  [![Rigel](https://img.shields.io/badge/Rigel-Join_Public_Instance-brightgreen?style=for-the-badge&logo=rocket&logoColor=white)](https://rigel.chat/invite/rigel?instance=https%3A%2F%2Frigel.chat)
  [![License](https://img.shields.io/badge/License-AGPLv3-blue.svg?style=for-the-badge)](LICENSE)
  [![Preact](https://img.shields.io/badge/Preact-673AB8?style=for-the-badge&logo=preact&logoColor=white)](https://preactjs.com)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
</div>

## Introduction

This repository contains the web interface for the Rigel platform, which connects to the [rigel-server](https://github.com/rigelchat/rigel-server-rs) API.
It uses **Preact** to maintain a small bundle size and **Vite** for the build pipeline.

## Prerequisites

* [Node.js](https://nodejs.org) (v16 or higher)
* npm or pnpm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rigelchat/rigel-web-preact.git
cd rigel-web-preact
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configuration

Copy the example environment file and configure the target host and port:

```bash
cp .env.example .env
```

*Edit `.env` to set your `PORT` and `VITE_HOST`.*

### 4. Run Development Server

```bash
npm run dev
```
The client will be available at `http://localhost:5173`.

## Building for Production

To create the production build:

```bash
npm run build
```

A basic Fastify server is included to serve the production build:

```bash
node server.cjs
```

> [!TIP]
> The server uses settings from `.env.production.local`. Ensure a `PORT` is defined.

Alternatively, you can serve the contents of the static `dist/` directory using Nginx, Apache, or any static hosting service.

---

<div align="center">
  <sub>Part of the <a href="https://github.com/rigelchat">Rigel Project</a>.</sub>
</div>