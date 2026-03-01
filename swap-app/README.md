
<h1 align="center">⬡ SolSwap</h1>

<p align="center">
  <strong>A sleek, cyberpunk-themed Solana token swap interface & Telegram Bot powered by Jupiter.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Mainnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" />
  <img src="https://img.shields.io/badge/Jupiter-V6_&_Ultra-00D18C?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Telegram_Bot-grammY-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" />
</p>

---

## ✨ Features

### 🌐 Web Application (`swap-app/`)
- 🔄 **Token Swap** — Swap any SPL token on Solana with best-rate aggregation
- 👛 **Wallet Integration** — Connect via Phantom, Solflare, Backpack, and others
- 🎯 **Slippage Control** — Configurable slippage tolerance with preset options
- 🔍 **Token Search** — Search and select from the full Jupiter token list
- 🎭 **Cyberpunk UI** — Dark-themed interface with circuit nodes, data streams, scan beams
- 🎬 **Animations** — Staggered entrance animations and smooth CSS transitions

### 🤖 Telegram Bot (`tg-bot/`)
- ⚡ **Instant Execution** — Lightning-fast swaps via Jupiter Ultra API
- 🔑 **Auto Wallet** — Automatically generates a non-custodial wallet on `/start`
- 📊 **Portfolio Tracking** — View live SOL and token holdings directly in chat
- ⚙️ **Configurable** — Set default buy amounts and slippage percentages
- 📱 **Mobile First** — Trade tokens directly from your Telegram chat, no browser needed

---

## 🛠️ Tech Stack

### Web App
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 / Vite 5 |
| **Swap Engine** | Jupiter V6 API |
| **Blockchain** | `@solana/web3.js` |
| **Wallet** | `@solana/wallet-adapter` |
| **Animations** | anime.js |

### Telegram Bot
| Layer | Technology |
|-------|-----------|
| **Bot Framework**| [grammY](https://grammy.dev/) |
| **Swap Engine** | Jupiter Ultra API |
| **Blockchain** | `@solana/web3.js` |
| **Environment** | Node.js / `dotenv` |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)

### 1. Web Application (`swap-app`)

```bash
cd swap-app
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Telegram Bot (`tg-bot`)

You will need a Telegram Bot Token from [@BotFather](https://t.me/botfather).

```bash
cd tg-bot
npm install
```

Copy the example environment file and add your tokens:
```bash
cp .env.example .env
```
Edit `.env` and set `BOT_TOKEN` and your optional `JUPITER_API_KEY`.

Start the bot:
```bash
npm start
```
*For development with auto-reload, use `npm run dev`.*

---

## 📁 Project Structure

```
.
├── swap-app/                  # React + Vite Web Application
│   ├── src/
│   │   ├── App.jsx            # Main app layout, animations, wallet providers
│   │   ├── App.css            # Full design system — cyberpunk theme
│   │   ├── components/        # Swap interface and Token selection modals
│   │   └── utils/
│   │       └── jupiter.js     # Jupiter V6 API integration
│   ├── index.html             # Web app entry point
│   └── vite.config.js         # Vite + React + Node polyfills config
│
└── tg-bot/                    # Server-side Telegram Bot
    ├── src/
    │   ├── index.js           # Bot commands and callback handlers
    │   ├── services/
    │   │   ├── jupiter.js     # Jupiter Ultra API integration
    │   │   ├── wallet.js      # Keypair generation and SOL balance tracking
    │   │   └── settings.js    # User preference management
    │   └── utils/             # Formatting tools for strings and crypto amounts
    ├── .env.example           # Environment template
    └── package.json           # Bot dependencies
```

---

## 🤖 Bot Commands

Once your bot is running, message it on Telegram to use these commands:
- `/start` — Initializes your non-custodial wallet
- `/buy <token_address>` — Prompts to buy a token with SOL using your default settings
- `/sell <token_address>` — Prompts to sell a percentage of your token holdings for SOL
- `/balance` — Displays your current SOL balance and token portfolio
- `/wallet` — View your wallet address and export your private key securely
- `/settings` — Configure your default slippage and preset buy amounts
- `/help` — Display bot instructions

---

## 📄 License

MIT © Anshul Singh
