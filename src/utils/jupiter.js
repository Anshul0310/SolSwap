// Jupiter Metis Swap API helper functions
const API_BASE = 'https://api.jup.ag';

// Popular tokens on Solana mainnet
export const POPULAR_TOKENS = [
    {
        symbol: 'SOL',
        name: 'Solana',
        mint: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    },
    {
        symbol: 'BONK',
        name: 'Bonk',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        decimals: 5,
        logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    },
    {
        symbol: 'JUP',
        name: 'Jupiter',
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        decimals: 6,
        logoURI: 'https://static.jup.ag/jup/icon.png',
    },
    {
        symbol: 'WIF',
        name: 'dogwifhat',
        mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        decimals: 6,
        logoURI: 'https://bafkreibk3covs5ltyqxa272uodhber7t52mrozcddiuos4w2mzpnlo64fa.ipfs.nftstorage.link',
    },
    {
        symbol: 'RAY',
        name: 'Raydium',
        mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    },
    {
        symbol: 'ORCA',
        name: 'Orca',
        mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
    },
];

/**
 * Get a swap quote from Jupiter
 */
export async function getQuote(inputMint, outputMint, amount, slippageBps = 50) {
    const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
    });

    const response = await fetch(`${API_BASE}/swap/v1/quote?${params}`);
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Quote failed: ${err}`);
    }
    return response.json();
}

/**
 * Build a swap transaction from a quote
 */
export async function getSwapTransaction(quoteResponse, userPublicKey) {
    const response = await fetch(`${API_BASE}/swap/v1/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quoteResponse,
            userPublicKey: userPublicKey.toString(),
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            dynamicSlippage: true,
            prioritizationFeeLamports: {
                priorityLevelWithMaxLamports: {
                    maxLamports: 1000000,
                    priorityLevel: 'veryHigh',
                },
            },
        }),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Swap transaction failed: ${err}`);
    }
    return response.json();
}

/**
 * Search tokens via Jupiter
 */
export async function searchTokens(query) {
    if (!query || query.length < 2) return POPULAR_TOKENS;

    try {
        const response = await fetch(`${API_BASE}/ultra/v1/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) return POPULAR_TOKENS;
        const data = await response.json();

        if (data && Array.isArray(data)) {
            return data.map(t => ({
                symbol: t.symbol || '???',
                name: t.name || 'Unknown',
                mint: t.address || t.mint,
                decimals: t.decimals ?? 9,
                logoURI: t.logoURI || t.logo_uri || '',
            }));
        }
        return POPULAR_TOKENS;
    } catch {
        return POPULAR_TOKENS;
    }
}

/**
 * Format a token amount with decimal places
 */
export function formatTokenAmount(amount, decimals) {
    if (!amount) return '0';
    const num = Number(amount) / Math.pow(10, decimals);
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    if (num < 0.0001) return num.toExponential(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/**
 * Calculate price impact as a percentage string
 */
export function formatPriceImpact(priceImpactPct) {
    if (!priceImpactPct) return '0%';
    const pct = parseFloat(priceImpactPct);
    if (pct < 0.01) return '<0.01%';
    return pct.toFixed(2) + '%';
}

/**
 * Convert user input amount to raw integer
 */
export function toRawAmount(amount, decimals) {
    return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}
