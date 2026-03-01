// Jupiter Ultra API wrapper for TG bot
const API_BASE = 'https://api.jup.ag';

/**
 * Get an order (quote + unsigned transaction) from Jupiter Ultra API
 */
export async function getOrder(inputMint, outputMint, amount, takerPublicKey, apiKey) {
    const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        taker: takerPublicKey,
    });

    const response = await fetch(`${API_BASE}/ultra/v1/order?${params}`, {
        headers: { 'x-api-key': apiKey },
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Order failed: ${err}`);
    }

    return response.json();
}

/**
 * Execute a signed order via Jupiter Ultra API
 */
export async function executeOrder(signedTransaction, requestId, apiKey) {
    const response = await fetch(`${API_BASE}/ultra/v1/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({ signedTransaction, requestId }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Execute failed: ${err}`);
    }

    return response.json();
}

/**
 * Search for a token by name or address
 */
export async function searchToken(query, apiKey) {
    const response = await fetch(`${API_BASE}/ultra/v1/search?query=${encodeURIComponent(query)}`, {
        headers: { 'x-api-key': apiKey },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

/**
 * Get token holdings for a wallet
 */
export async function getHoldings(walletAddress, apiKey) {
    const response = await fetch(`${API_BASE}/ultra/v1/holdings?wallet=${walletAddress}`, {
        headers: { 'x-api-key': apiKey },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data || [];
}

/**
 * Get swap quote using Metis API (for quote display without executing)
 */
export async function getQuote(inputMint, outputMint, amount, slippageBps = 100) {
    const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
    });

    const response = await fetch(`${API_BASE}/swap/v1/quote?${params}`);
    if (!response.ok) return null;
    return response.json();
}

// Well-known token addresses
export const TOKENS = {
    SOL: {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
    },
    USDC: {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
    },
    USDT: {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
    },
    BONK: {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        symbol: 'BONK',
        name: 'Bonk',
        decimals: 5,
    },
    JUP: {
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        symbol: 'JUP',
        name: 'Jupiter',
        decimals: 6,
    },
};
