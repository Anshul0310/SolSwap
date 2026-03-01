// Formatting helpers for Telegram messages
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Format SOL amount from lamports
 */
export function lamportsToSol(lamports) {
    return (Number(lamports) / LAMPORTS_PER_SOL).toFixed(4);
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount, decimals) {
    if (!amount) return '0';
    const num = Number(amount) / Math.pow(10, decimals);
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    if (num < 0.0001 && num > 0) return num.toExponential(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/**
 * Truncate a Solana address for display
 */
export function shortAddress(address) {
    if (!address) return '???';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Convert SOL string to lamports
 */
export function solToLamports(sol) {
    return Math.floor(parseFloat(sol) * LAMPORTS_PER_SOL);
}

/**
 * Convert user amount to raw token amount
 */
export function toRawAmount(amount, decimals) {
    return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}

/**
 * Escape Telegram MarkdownV2 special characters
 */
export function escapeMarkdown(text) {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}
