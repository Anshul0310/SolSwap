# SolSwap 🌑

Welcome to **SolSwap**, a comprehensive token swap ecosystem built on Solana. Designed to provide a fast, deep, and seamless swapping experience, SolSwap leverages Jupiter's powerful decentralized exchange infrastructure across two main platforms: a sleek web interface and a lightning-fast Telegram bot.

## 🌟 Ecosystem Overview

### 1. SolSwap Web App
A modern, dark-themed React application enabling users to execute swaps directly from their browser with ease.
- **Tech Stack**: React 18, Vite, `@solana/wallet-adapter-react`, `@solana/web3.js`
- **Features**:
  - Direct wallet integration (Phantom, Solflare, etc.) using the standard Solana Wallet Adapter.
  - Powered by the **Jupiter API** for optimal routing and "phantom liquidity".
  - Premium "techie" aesthetic with entrance animations and interactive sticky UI elements.
- **Run Locally**:
  ```bash
  cd swap-app
  npm install
  npm run dev
  ```

### 2. SolSwap Telegram Bot (`/tg-bot`)
A dedicated, BonkBot-style Telegram bot that allows users to swap tokens quickly without leaving their chats.
- **Tech Stack**: Node.js, `grammy`, `@solana/web3.js`, `bs58`
- **Features**:
  - Built with the **Jupiter Ultra API** for high-speed, minimal-latency swaps.
  - Built-in wallet management for on-the-go trading and instant execution.
- **Run Locally**:
  ```bash
  cd tg-bot
  npm install
  npm start
  ```

## 🚀 Getting Started

To get started with either component:
1. Clone this repository.
2. For the bot, create a `.env` file based on the `.env.example` templates.
3. Install dependencies and run the respective `dev` or `start` scripts.

---
*Powered by Jupiter.*
