<div align="center">
  <img src="https://avatars.githubusercontent.com/u/247460033?s=200&v=4" alt="Rigel Server" width="100" height="100"/>

  # Rigel Web Client

  **The lightweight, blazing fast frontend for Rigel.**

  Built with **Vite** and **Preact** for maximum performance and minimal footprint.

  [![Rigel](https://img.shields.io/badge/Rigel-Join_Public_Instance-0?style=for-the-badge&logo=rocket&logoColor=white)]()
  [![License](https://img.shields.io/badge/License-AGPLv3-blue.svg?style=for-the-badge)](LICENSE)
  [![Preact](https://img.shields.io/badge/Preact-673AB8?style=for-the-badge&logo=preact&logoColor=white)](https://preactjs.com/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
</div>

## ⚡ Introduction

This repository contains the web interface for the Rigel platform. It connects to the `rigel-server` API. We chose **Preact** to ensure the client remains lightweight (3kb alternative to React) and **Vite** for instant development start times.

## 🛠️ Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher)
* npm or pnpm

## 🚀 Getting Started

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

Copy the example environment file and configure your database and keys:

```bash
cp .env.example .env
```

*Edit `.env` to set your `PORT` and `VITE_HOST`.*

### 4. Run Development Server

```bash
npm run dev
```
The client will be available at `http://localhost:5173`.

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

A built-in Fastify server is provided to serve your production build with optimized headers and routing:

```bash
node server.cjs
```

> [!TIP]
> The server will use settings from `.env.production.local`. Make sure to set a `PORT`.

The project can also be served by other services like Nginx, Apache, or Vercel by pointing them to the `dist/` directory.

---

<div align="center">
  <sub>Part of the <a href="https://github.com/rigelchat">Rigel Project</a>.</sub>
</div>