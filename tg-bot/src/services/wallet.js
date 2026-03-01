// Wallet management — generate, store, load keypairs per Telegram user
import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WALLETS_DIR = path.join(__dirname, '..', 'wallets');

// Ensure wallets directory exists
if (!fs.existsSync(WALLETS_DIR)) {
    fs.mkdirSync(WALLETS_DIR, { recursive: true });
}

/**
 * Get or create a wallet for a Telegram user
 */
export function getOrCreateWallet(userId) {
    const walletPath = path.join(WALLETS_DIR, `${userId}.json`);

    if (fs.existsSync(walletPath)) {
        const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        const keypair = Keypair.fromSecretKey(bs58.decode(data.secretKey));
        return { keypair, isNew: false };
    }

    // Generate new wallet
    const keypair = Keypair.generate();
    const walletData = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: bs58.encode(keypair.secretKey),
        createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));
    return { keypair, isNew: true };
}

/**
 * Get wallet keypair for user (returns null if no wallet)
 */
export function getWallet(userId) {
    const walletPath = path.join(WALLETS_DIR, `${userId}.json`);
    if (!fs.existsSync(walletPath)) return null;

    const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    return Keypair.fromSecretKey(bs58.decode(data.secretKey));
}

/**
 * Get private key string for export
 */
export function getPrivateKey(userId) {
    const walletPath = path.join(WALLETS_DIR, `${userId}.json`);
    if (!fs.existsSync(walletPath)) return null;

    const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    return data.secretKey;
}

/**
 * Get SOL balance for a public key
 */
export async function getSolBalance(connection, publicKey) {
    try {
        const balance = await connection.getBalance(publicKey);
        return balance / LAMPORTS_PER_SOL;
    } catch {
        return 0;
    }
}
