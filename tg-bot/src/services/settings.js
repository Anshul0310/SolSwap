// User settings storage (in-memory + file persistence)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = path.join(__dirname, '..', 'wallets', 'settings.json');

// Default user settings
const DEFAULT_SETTINGS = {
    slippageBps: 100,        // 1%
    buyAmountSol: '0.1',     // Default buy amount in SOL
    sellPercentage: 100,     // Default sell % (100 = sell all)
    mevProtection: true,
};

let allSettings = {};

// Load settings from disk
if (fs.existsSync(SETTINGS_FILE)) {
    try {
        allSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    } catch { allSettings = {}; }
}

function save() {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(allSettings, null, 2));
}

export function getUserSettings(userId) {
    return { ...DEFAULT_SETTINGS, ...(allSettings[userId] || {}) };
}

export function updateUserSettings(userId, updates) {
    allSettings[userId] = { ...getUserSettings(userId), ...updates };
    save();
    return allSettings[userId];
}
