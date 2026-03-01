// SolSwap Telegram Bot — Main Entry Point
import { Bot, InlineKeyboard, session } from 'grammy';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import dotenv from 'dotenv';

import { getOrCreateWallet, getWallet, getPrivateKey, getSolBalance } from './services/wallet.js';
import { getOrder, executeOrder, searchToken, getHoldings, getQuote, TOKENS } from './services/jupiter.js';
import { formatTokenAmount, shortAddress, solToLamports, toRawAmount, lamportsToSol, escapeMarkdown } from './utils/format.js';
import { getUserSettings, updateUserSettings } from './services/settings.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const JUPITER_API_KEY = process.env.JUPITER_API_KEY || '';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is required. Set it in .env');
    process.exit(1);
}

const bot = new Bot(BOT_TOKEN);
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// ==========================================
// Session for tracking user state
// ==========================================
bot.use(session({
    initial: () => ({
        pendingBuy: null,   // { tokenMint, tokenSymbol, tokenDecimals }
        pendingSell: null,  // { tokenMint, tokenSymbol, tokenDecimals, balance }
    }),
}));

// ==========================================
// /start — Welcome + Wallet Setup
// ==========================================
bot.command('start', async (ctx) => {
    const userId = ctx.from.id.toString();
    const { keypair, isNew } = getOrCreateWallet(userId);
    const address = keypair.publicKey.toBase58();
    const balance = await getSolBalance(connection, keypair.publicKey);

    const welcome = `
🚀 *Welcome to SolSwap Bot!*
Your on\\-chain Solana trading bot powered by Jupiter\\.

${isNew ? '🆕 *New wallet created for you\\!*' : '👛 *Your wallet:*'}

\`${address}\`

💰 *Balance:* ${escapeMarkdown(balance.toFixed(4))} SOL

${isNew ? `\n⚠️ *Deposit SOL to start trading\\!*\nSend SOL to the address above\\.` : ''}

*Commands:*
/buy \\<token\\_address\\> — Buy a token with SOL
/sell \\<token\\_address\\> — Sell a token for SOL
/balance — View your portfolio
/wallet — Wallet info \\& export
/settings — Configure slippage \\& defaults
/help — Show this message
  `.trim();

    await ctx.reply(welcome, { parse_mode: 'MarkdownV2' });
});

// ==========================================
// /help
// ==========================================
bot.command('help', async (ctx) => {
    await ctx.reply(`
🚀 *SolSwap Bot Commands*

/start — Start the bot \\& create wallet
/buy \\<token\\_address\\> — Buy a token with SOL
/sell \\<token\\_address\\> — Sell a token for SOL
/balance — View SOL \\+ token holdings
/wallet — Show wallet address \\& export key
/settings — Slippage, default amounts
/help — Show this message

💡 *Tip:* You can also paste any Solana token address directly to get a buy prompt\\!
  `.trim(), { parse_mode: 'MarkdownV2' });
});

// ==========================================
// /wallet — Show wallet info
// ==========================================
bot.command('wallet', async (ctx) => {
    const userId = ctx.from.id.toString();
    const keypair = getWallet(userId);

    if (!keypair) {
        return ctx.reply('No wallet found. Use /start to create one.');
    }

    const address = keypair.publicKey.toBase58();
    const balance = await getSolBalance(connection, keypair.publicKey);

    const keyboard = new InlineKeyboard()
        .text('🔑 Export Private Key', 'export_key')
        .row()
        .text('📋 Copy Address', 'copy_address')
        .row()
        .text('🔄 Refresh Balance', 'refresh_balance');

    await ctx.reply(`
👛 *Your Wallet*

*Address:*
\`${address}\`

💰 *Balance:* ${escapeMarkdown(balance.toFixed(4))} SOL

📥 *Deposit:* Send SOL to the address above
🔗 [View on Solscan](https://solscan.io/account/${address})
  `.trim(), {
        parse_mode: 'MarkdownV2',
        reply_markup: keyboard,
        link_preview_options: { is_disabled: true },
    });
});

// ==========================================
// /balance — Portfolio overview
// ==========================================
bot.command('balance', async (ctx) => {
    const userId = ctx.from.id.toString();
    const keypair = getWallet(userId);

    if (!keypair) {
        return ctx.reply('No wallet found. Use /start to create one.');
    }

    const address = keypair.publicKey.toBase58();
    const balance = await getSolBalance(connection, keypair.publicKey);

    let holdingsText = '';
    if (JUPITER_API_KEY) {
        try {
            const holdings = await getHoldings(address, JUPITER_API_KEY);
            if (holdings && holdings.length > 0) {
                holdingsText = '\n📦 *Token Holdings:*\n';
                for (const h of holdings.slice(0, 10)) {
                    const symbol = escapeMarkdown(h.symbol || '???');
                    const amt = formatTokenAmount(h.amount || h.uiAmount || 0, h.decimals || 0);
                    holdingsText += `• ${symbol}: ${escapeMarkdown(amt)}\n`;
                }
            }
        } catch { /* skip holdings if API fails */ }
    }

    await ctx.reply(`
💼 *Your Portfolio*

💰 *SOL:* ${escapeMarkdown(balance.toFixed(4))} SOL
${holdingsText}
🔗 [View on Solscan](https://solscan.io/account/${address})
  `.trim(), {
        parse_mode: 'MarkdownV2',
        link_preview_options: { is_disabled: true },
    });
});

// ==========================================
// /settings — Configure bot
// ==========================================
bot.command('settings', async (ctx) => {
    const userId = ctx.from.id.toString();
    const settings = getUserSettings(userId);

    const keyboard = new InlineKeyboard()
        .text(`Slippage: ${(settings.slippageBps / 100).toFixed(1)}%`, 'set_slippage')
        .row()
        .text(`Buy Amount: ${settings.buyAmountSol} SOL`, 'set_buy_amount')
        .row()
        .text(`Sell %: ${settings.sellPercentage}%`, 'set_sell_pct')
        .row()
        .text('0.5%', 'slip_50').text('1%', 'slip_100').text('2%', 'slip_200').text('5%', 'slip_500')
        .row()
        .text('Buy 0.05 SOL', 'buy_005').text('Buy 0.1 SOL', 'buy_01').text('Buy 0.5 SOL', 'buy_05').text('Buy 1 SOL', 'buy_1');

    await ctx.reply(`
⚙️ *Settings*

*Slippage:* ${escapeMarkdown((settings.slippageBps / 100).toFixed(1))}%
*Default Buy:* ${escapeMarkdown(settings.buyAmountSol)} SOL
*Default Sell:* ${settings.sellPercentage}%

Tap a button below to change:
  `.trim(), {
        parse_mode: 'MarkdownV2',
        reply_markup: keyboard,
    });
});

// ==========================================
// /buy <token_address> — Buy with SOL
// ==========================================
bot.command('buy', async (ctx) => {
    const userId = ctx.from.id.toString();
    const keypair = getWallet(userId);

    if (!keypair) {
        return ctx.reply('No wallet found. Use /start first.');
    }

    const tokenAddress = ctx.match?.trim();
    if (!tokenAddress) {
        return ctx.reply('Usage: /buy <token_address>\nExample: /buy DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
    }

    await ctx.reply('🔍 Looking up token...');

    try {
        // Try to get a quick quote to validate the token
        const settings = getUserSettings(userId);
        const rawAmount = solToLamports(settings.buyAmountSol);
        const quote = await getQuote(TOKENS.SOL.mint, tokenAddress, rawAmount, settings.slippageBps);

        if (!quote) {
            return ctx.reply('❌ Could not find this token or no liquidity available.');
        }

        // Try to identify the token
        let tokenSymbol = 'Unknown';
        let tokenDecimals = 9;
        if (JUPITER_API_KEY) {
            const results = await searchToken(tokenAddress, JUPITER_API_KEY);
            if (results.length > 0) {
                tokenSymbol = results[0].symbol || 'Unknown';
                tokenDecimals = results[0].decimals ?? 9;
            }
        }

        const outAmount = formatTokenAmount(quote.outAmount, tokenDecimals);
        const impact = quote.priceImpactPct ? parseFloat(quote.priceImpactPct).toFixed(2) : '0';
        const balance = await getSolBalance(connection, keypair.publicKey);

        // Store pending buy
        ctx.session.pendingBuy = {
            tokenMint: tokenAddress,
            tokenSymbol,
            tokenDecimals,
        };

        const keyboard = new InlineKeyboard()
            .text(`✅ Buy ${settings.buyAmountSol} SOL`, `confirm_buy_${settings.buyAmountSol}`)
            .row()
            .text('0.05 SOL', 'confirm_buy_0.05')
            .text('0.1 SOL', 'confirm_buy_0.1')
            .text('0.5 SOL', 'confirm_buy_0.5')
            .text('1 SOL', 'confirm_buy_1')
            .row()
            .text('❌ Cancel', 'cancel_swap');

        await ctx.reply(`
🛒 *Buy ${escapeMarkdown(tokenSymbol)}*

*Token:* ${escapeMarkdown(tokenSymbol)} \\(\`${shortAddress(tokenAddress)}\`\\)
*You pay:* ${escapeMarkdown(settings.buyAmountSol)} SOL
*You receive:* ~${escapeMarkdown(outAmount)} ${escapeMarkdown(tokenSymbol)}
*Price Impact:* ${escapeMarkdown(impact)}%
*Your SOL Balance:* ${escapeMarkdown(balance.toFixed(4))} SOL

Select amount to buy:
    `.trim(), {
            parse_mode: 'MarkdownV2',
            reply_markup: keyboard,
        });
    } catch (err) {
        await ctx.reply(`❌ Error: ${err.message}`);
    }
});

// ==========================================
// /sell <token_address> — Sell token for SOL
// ==========================================
bot.command('sell', async (ctx) => {
    const userId = ctx.from.id.toString();
    const keypair = getWallet(userId);

    if (!keypair) {
        return ctx.reply('No wallet found. Use /start first.');
    }

    const tokenAddress = ctx.match?.trim();
    if (!tokenAddress) {
        return ctx.reply('Usage: /sell <token_address>\nExample: /sell DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
    }

    await ctx.reply('🔍 Checking your token balance...');

    try {
        let tokenSymbol = 'Unknown';
        let tokenDecimals = 9;
        if (JUPITER_API_KEY) {
            const results = await searchToken(tokenAddress, JUPITER_API_KEY);
            if (results.length > 0) {
                tokenSymbol = results[0].symbol || 'Unknown';
                tokenDecimals = results[0].decimals ?? 9;
            }
        }

        ctx.session.pendingSell = {
            tokenMint: tokenAddress,
            tokenSymbol,
            tokenDecimals,
        };

        const keyboard = new InlineKeyboard()
            .text('25%', 'confirm_sell_25')
            .text('50%', 'confirm_sell_50')
            .text('75%', 'confirm_sell_75')
            .text('100%', 'confirm_sell_100')
            .row()
            .text('❌ Cancel', 'cancel_swap');

        await ctx.reply(`
💰 *Sell ${escapeMarkdown(tokenSymbol)}*

*Token:* ${escapeMarkdown(tokenSymbol)} \\(\`${shortAddress(tokenAddress)}\`\\)

Choose how much to sell:
    `.trim(), {
            parse_mode: 'MarkdownV2',
            reply_markup: keyboard,
        });
    } catch (err) {
        await ctx.reply(`❌ Error: ${err.message}`);
    }
});

// ==========================================
// Callback Query Handlers
// ==========================================

// Confirm Buy
bot.callbackQuery(/^confirm_buy_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id.toString();
    const amountSol = ctx.match[1];

    const keypair = getWallet(userId);
    const pending = ctx.session?.pendingBuy;

    if (!keypair || !pending) {
        return ctx.reply('Session expired. Use /buy again.');
    }

    if (!JUPITER_API_KEY) {
        return ctx.reply('❌ Jupiter API key not configured. Set JUPITER_API_KEY in .env');
    }

    await ctx.editMessageText('⏳ Executing swap...');

    try {
        const rawAmount = solToLamports(amountSol);
        const address = keypair.publicKey.toBase58();

        // Get order from Jupiter Ultra
        const orderResponse = await getOrder(
            TOKENS.SOL.mint,
            pending.tokenMint,
            rawAmount,
            address,
            JUPITER_API_KEY
        );

        if (!orderResponse.transaction) {
            throw new Error('No transaction returned from Jupiter');
        }

        // Deserialize, sign, serialize
        const txBuf = Buffer.from(orderResponse.transaction, 'base64');
        const transaction = VersionedTransaction.deserialize(txBuf);
        transaction.sign([keypair]);
        const signedTx = Buffer.from(transaction.serialize()).toString('base64');

        // Execute
        const result = await executeOrder(signedTx, orderResponse.requestId, JUPITER_API_KEY);

        if (result.status === 'Success') {
            await ctx.editMessageText(`
✅ *Swap Successful\\!*

Bought ${escapeMarkdown(pending.tokenSymbol)} with ${escapeMarkdown(amountSol)} SOL

🔗 [View on Solscan](https://solscan\\.io/tx/${result.signature})
      `.trim(), {
                parse_mode: 'MarkdownV2',
                link_preview_options: { is_disabled: true },
            });
        } else {
            await ctx.editMessageText(`❌ Swap failed: ${result.error || 'Unknown error'}\n\nTx: ${result.signature || 'N/A'}`);
        }
    } catch (err) {
        await ctx.editMessageText(`❌ Swap failed: ${err.message}`);
    }

    ctx.session.pendingBuy = null;
});

// Confirm Sell
bot.callbackQuery(/^confirm_sell_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id.toString();
    const sellPct = parseInt(ctx.match[1]);

    const keypair = getWallet(userId);
    const pending = ctx.session?.pendingSell;

    if (!keypair || !pending) {
        return ctx.reply('Session expired. Use /sell again.');
    }

    if (!JUPITER_API_KEY) {
        return ctx.reply('❌ Jupiter API key not configured. Set JUPITER_API_KEY in .env');
    }

    await ctx.editMessageText(`⏳ Selling ${sellPct}% of ${pending.tokenSymbol}...`);

    try {
        const address = keypair.publicKey.toBase58();

        // Get token balance by checking holdings
        const holdings = await getHoldings(address, JUPITER_API_KEY);
        const tokenHolding = holdings?.find?.(h =>
            (h.address || h.mint) === pending.tokenMint
        );

        if (!tokenHolding) {
            return ctx.editMessageText('❌ No balance found for this token.');
        }

        const totalBalance = tokenHolding.amount || tokenHolding.uiAmount * Math.pow(10, pending.tokenDecimals);
        const sellAmount = Math.floor(totalBalance * sellPct / 100);

        if (sellAmount <= 0) {
            return ctx.editMessageText('❌ Insufficient token balance.');
        }

        // Get order
        const orderResponse = await getOrder(
            pending.tokenMint,
            TOKENS.SOL.mint,
            sellAmount,
            address,
            JUPITER_API_KEY
        );

        if (!orderResponse.transaction) {
            throw new Error('No transaction returned from Jupiter');
        }

        // Sign and execute
        const txBuf = Buffer.from(orderResponse.transaction, 'base64');
        const transaction = VersionedTransaction.deserialize(txBuf);
        transaction.sign([keypair]);
        const signedTx = Buffer.from(transaction.serialize()).toString('base64');

        const result = await executeOrder(signedTx, orderResponse.requestId, JUPITER_API_KEY);

        if (result.status === 'Success') {
            await ctx.editMessageText(`
✅ *Sold ${sellPct}% of ${escapeMarkdown(pending.tokenSymbol)}\\!*

🔗 [View on Solscan](https://solscan\\.io/tx/${result.signature})
      `.trim(), {
                parse_mode: 'MarkdownV2',
                link_preview_options: { is_disabled: true },
            });
        } else {
            await ctx.editMessageText(`❌ Sell failed: ${result.error || 'Unknown error'}`);
        }
    } catch (err) {
        await ctx.editMessageText(`❌ Sell failed: ${err.message}`);
    }

    ctx.session.pendingSell = null;
});

// Cancel swap
bot.callbackQuery('cancel_swap', async (ctx) => {
    await ctx.answerCallbackQuery('Cancelled');
    ctx.session.pendingBuy = null;
    ctx.session.pendingSell = null;
    await ctx.editMessageText('❌ Swap cancelled.');
});

// Export private key
bot.callbackQuery('export_key', async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id.toString();
    const pk = getPrivateKey(userId);

    if (!pk) return ctx.reply('No wallet found.');

    // Send as private message that auto-deletes
    const msg = await ctx.reply(`
⚠️ *PRIVATE KEY \\- KEEP SAFE\\!*

\`${pk}\`

🚨 *Never share this with anyone\\!*
This message will NOT be auto\\-deleted\\. Delete it manually after copying\\.
  `.trim(), { parse_mode: 'MarkdownV2' });
});

// Refresh balance
bot.callbackQuery('refresh_balance', async (ctx) => {
    await ctx.answerCallbackQuery('Refreshing...');
    const userId = ctx.from.id.toString();
    const keypair = getWallet(userId);
    if (!keypair) return;

    const balance = await getSolBalance(connection, keypair.publicKey);
    const address = keypair.publicKey.toBase58();

    const keyboard = new InlineKeyboard()
        .text('🔑 Export Private Key', 'export_key')
        .row()
        .text('🔄 Refresh Balance', 'refresh_balance');

    await ctx.editMessageText(`
👛 *Your Wallet*

*Address:*
\`${address}\`

💰 *Balance:* ${escapeMarkdown(balance.toFixed(4))} SOL

📥 *Deposit:* Send SOL to the address above
🔗 [View on Solscan](https://solscan.io/account/${address})
  `.trim(), {
        parse_mode: 'MarkdownV2',
        reply_markup: keyboard,
        link_preview_options: { is_disabled: true },
    });
});

// Settings callbacks
bot.callbackQuery(/^slip_(\d+)$/, async (ctx) => {
    const bps = parseInt(ctx.match[1]);
    const userId = ctx.from.id.toString();
    updateUserSettings(userId, { slippageBps: bps });
    await ctx.answerCallbackQuery(`Slippage set to ${(bps / 100).toFixed(1)}%`);
    await ctx.reply(`✅ Slippage updated to ${(bps / 100).toFixed(1)}%`);
});

bot.callbackQuery(/^buy_(.+)$/, async (ctx) => {
    const amount = ctx.match[1].replace('_', '.');
    const amountMap = { '005': '0.05', '01': '0.1', '05': '0.5', '1': '1' };
    const solAmount = amountMap[ctx.match[1]] || amount;
    const userId = ctx.from.id.toString();
    updateUserSettings(userId, { buyAmountSol: solAmount });
    await ctx.answerCallbackQuery(`Default buy set to ${solAmount} SOL`);
    await ctx.reply(`✅ Default buy amount updated to ${solAmount} SOL`);
});

// ==========================================
// Direct token address handler
// When user pastes a contract address, treat as /buy
// ==========================================
bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();

    // Check if it looks like a Solana address (base58, 32-44 chars)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text) && !text.startsWith('/')) {
        const userId = ctx.from.id.toString();
        const keypair = getWallet(userId);

        if (!keypair) {
            return ctx.reply('No wallet found. Use /start first.');
        }

        // Treat as buy command
        ctx.match = text;
        // Simulate buy flow
        await ctx.reply('🔍 Looking up token...');

        try {
            const settings = getUserSettings(userId);
            const rawAmount = solToLamports(settings.buyAmountSol);
            const quote = await getQuote(TOKENS.SOL.mint, text, rawAmount, settings.slippageBps);

            let tokenSymbol = shortAddress(text);
            let tokenDecimals = 9;

            if (JUPITER_API_KEY) {
                const results = await searchToken(text, JUPITER_API_KEY);
                if (results.length > 0) {
                    tokenSymbol = results[0].symbol || shortAddress(text);
                    tokenDecimals = results[0].decimals ?? 9;
                }
            }

            if (!quote) {
                return ctx.reply('❌ Token not found or no liquidity.');
            }

            ctx.session.pendingBuy = {
                tokenMint: text,
                tokenSymbol,
                tokenDecimals,
            };

            const outAmount = formatTokenAmount(quote.outAmount, tokenDecimals);
            const impact = quote.priceImpactPct ? parseFloat(quote.priceImpactPct).toFixed(2) : '0';
            const balance = await getSolBalance(connection, keypair.publicKey);

            const keyboard = new InlineKeyboard()
                .text(`✅ Buy ${settings.buyAmountSol} SOL`, `confirm_buy_${settings.buyAmountSol}`)
                .row()
                .text('0.05 SOL', 'confirm_buy_0.05')
                .text('0.1 SOL', 'confirm_buy_0.1')
                .text('0.5 SOL', 'confirm_buy_0.5')
                .text('1 SOL', 'confirm_buy_1')
                .row()
                .text('❌ Cancel', 'cancel_swap');

            await ctx.reply(`
🛒 *Buy ${escapeMarkdown(tokenSymbol)}*

*Token:* \`${shortAddress(text)}\`
*You pay:* ${escapeMarkdown(settings.buyAmountSol)} SOL
*You receive:* ~${escapeMarkdown(outAmount)} ${escapeMarkdown(tokenSymbol)}
*Price Impact:* ${escapeMarkdown(impact)}%
*Your SOL Balance:* ${escapeMarkdown(balance.toFixed(4))} SOL

Select amount to buy:
      `.trim(), {
                parse_mode: 'MarkdownV2',
                reply_markup: keyboard,
            });
        } catch (err) {
            await ctx.reply(`❌ Error: ${err.message}`);
        }
    }
});

// ==========================================
// Error handling
// ==========================================
bot.catch((err) => {
    console.error('Bot error:', err);
});

// ==========================================
// Start
// ==========================================
console.log('🤖 SolSwap Bot starting...');
bot.start({
    onStart: () => {
        console.log('✅ SolSwap Bot is live!');
        console.log('📡 Using RPC:', SOLANA_RPC_URL);
        console.log('🪐 Jupiter API Key:', JUPITER_API_KEY ? '✅ configured' : '❌ NOT SET');
    },
});
