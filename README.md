<div align="center">
  <img src="https://avatars.githubusercontent.com/u/247460033?s=200&v=4" alt="Rigel Server" width="100" height="100"/>

  # Rigel Web Client

  **The lightweight, blazing fast frontend for Rigel.**

  Built with **Vite** and **Preact** for maximum performance and minimal footprint.

  [![Rigel Chat](https://img.shields.io/badge/Rigel_Chat-Join_Public_Instance-3da9fc?style=for-the-badge&logo=rocket&logoColor=white)](https://app.rigel.chat/invite/rigel?instance=https%3A%2F%2Fserver.rigel.chat)
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

Create a `.env` file in the root directory:

```env
VITE_API_ENDPOINT=http://localhost:3000
VITE_CDN_ENDPOINT=http://localhost:3000
VITE_GATEWAY_ENDPOINT=ws://localhost:3000
```

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
The output will be in the `dist/` folder, ready to be served by Nginx, Apache, or Vercel.

---

<div align="center">
  <sub>Part of the <a href="https://github.com/rigelchat">Rigel Project</a>.</sub>
</div>