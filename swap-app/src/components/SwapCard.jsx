import { useState, useEffect, useRef, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { TokenSelector } from './TokenSelector';
import {
    POPULAR_TOKENS,
    getQuote,
    getSwapTransaction,
    formatTokenAmount,
    formatPriceImpact,
    toRawAmount,
} from '../utils/jupiter';

const DEFAULT_INPUT = POPULAR_TOKENS[0];  // SOL
const DEFAULT_OUTPUT = POPULAR_TOKENS[1]; // USDC

export function SwapCard() {
    const { connection } = useConnection();
    const { publicKey, signTransaction, connected } = useWallet();

    // Token state
    const [inputToken, setInputToken] = useState(DEFAULT_INPUT);
    const [outputToken, setOutputToken] = useState(DEFAULT_OUTPUT);
    const [inputAmount, setInputAmount] = useState('');
    const [outputAmount, setOutputAmount] = useState('');

    // Quote state
    const [quote, setQuote] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState('');

    // Swap state
    const [swapping, setSwapping] = useState(false);
    const [swapResult, setSwapResult] = useState(null);

    // Token selector modal
    const [selectorOpen, setSelectorOpen] = useState(null); // 'input' | 'output' | null

    // Slippage
    const [slippage, setSlippage] = useState(50); // basis points (0.5%)
    const [showSettings, setShowSettings] = useState(false);

    const debounceRef = useRef(null);

    // Fetch quote when input changes
    const fetchQuote = useCallback(async (amount) => {
        if (!amount || parseFloat(amount) <= 0 || !inputToken || !outputToken) {
            setQuote(null);
            setOutputAmount('');
            return;
        }

        setQuoteLoading(true);
        setQuoteError('');

        try {
            const rawAmount = toRawAmount(amount, inputToken.decimals);
            if (rawAmount <= 0) throw new Error('Amount too small');

            const quoteResponse = await getQuote(
                inputToken.mint,
                outputToken.mint,
                rawAmount,
                slippage
            );

            setQuote(quoteResponse);
            setOutputAmount(
                formatTokenAmount(quoteResponse.outAmount, outputToken.decimals)
            );
        } catch (err) {
            setQuoteError(err.message || 'Failed to get quote');
            setQuote(null);
            setOutputAmount('');
        }
        setQuoteLoading(false);
    }, [inputToken, outputToken, slippage]);

    // Debounced input handler
    const handleInputChange = (value) => {
        setInputAmount(value);
        setSwapResult(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchQuote(value);
        }, 500);
    };

    // Flip tokens
    const handleFlip = () => {
        setInputToken(outputToken);
        setOutputToken(inputToken);
        setInputAmount(outputAmount !== '0' ? '' : '');
        setOutputAmount('');
        setQuote(null);
        setSwapResult(null);
    };

    // Execute swap
    const handleSwap = async () => {
        if (!connected || !publicKey || !quote || !signTransaction) return;

        setSwapping(true);
        setSwapResult(null);

        try {
            // Build swap transaction
            const swapResponse = await getSwapTransaction(quote, publicKey);
            const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

            // Sign with wallet adapter
            const signedTx = await signTransaction(transaction);

            // Send transaction
            const rawTransaction = signedTx.serialize();
            const txid = await connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
                maxRetries: 2,
            });

            // Confirm
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                signature: txid,
            });

            setSwapResult({
                success: true,
                txid,
                message: `Swapped ${inputAmount} ${inputToken.symbol} → ${outputAmount} ${outputToken.symbol}`,
            });

            // Reset
            setInputAmount('');
            setOutputAmount('');
            setQuote(null);
        } catch (err) {
            setSwapResult({
                success: false,
                message: err.message || 'Swap failed',
            });
        }
        setSwapping(false);
    };

    // Select token handler
    const handleSelectToken = (token) => {
        if (selectorOpen === 'input') {
            if (token.mint === outputToken?.mint) {
                handleFlip();
            } else {
                setInputToken(token);
                setQuote(null);
                setOutputAmount('');
            }
        } else {
            if (token.mint === inputToken?.mint) {
                handleFlip();
            } else {
                setOutputToken(token);
                setQuote(null);
                setOutputAmount('');
            }
        }
    };

    // Rate display
    const rate = quote && inputAmount && outputAmount
        ? `1 ${inputToken.symbol} ≈ ${(Number(quote.outAmount) / Math.pow(10, outputToken.decimals) / parseFloat(inputAmount)).toFixed(6)} ${outputToken.symbol}`
        : null;

    return (
        <>
            <div className="swap-card">
                <div className="swap-header">
                    <h2>Swap</h2>
                    <button
                        className="settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Settings"
                    >
                        ⚙️
                    </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="settings-panel">
                        <div className="settings-label">Slippage Tolerance</div>
                        <div className="slippage-options">
                            {[10, 50, 100, 300].map((bps) => (
                                <button
                                    key={bps}
                                    className={`slippage-btn ${slippage === bps ? 'active' : ''}`}
                                    onClick={() => setSlippage(bps)}
                                >
                                    {(bps / 100).toFixed(1)}%
                                </button>
                            ))}
                            <div className="slippage-custom">
                                <input
                                    type="number"
                                    placeholder="Custom"
                                    value={![10, 50, 100, 300].includes(slippage) ? slippage / 100 : ''}
                                    onChange={(e) => setSlippage(Math.round(parseFloat(e.target.value || '0') * 100))}
                                    step="0.1"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input (You Pay) */}
                <div className="swap-panel">
                    <div className="panel-label">You pay</div>
                    <div className="panel-row">
                        <input
                            type="number"
                            className="amount-input"
                            placeholder="0.00"
                            value={inputAmount}
                            onChange={(e) => handleInputChange(e.target.value)}
                            min="0"
                            step="any"
                            id="input-amount"
                        />
                        <button
                            className="token-select-btn"
                            onClick={() => setSelectorOpen('input')}
                            id="input-token-select"
                        >
                            {inputToken?.logoURI && (
                                <img src={inputToken.logoURI} alt="" className="token-btn-icon" />
                            )}
                            <span>{inputToken?.symbol || 'Select'}</span>
                            <span className="chevron">▾</span>
                        </button>
                    </div>
                </div>

                {/* Flip Button */}
                <div className="flip-wrapper">
                    <button className="flip-btn" onClick={handleFlip} id="flip-tokens" title="Swap direction">
                        <span className="flip-icon">⇅</span>
                    </button>
                </div>

                {/* Output (You Receive) */}
                <div className="swap-panel output-panel">
                    <div className="panel-label">You receive</div>
                    <div className="panel-row">
                        <div className={`amount-output ${quoteLoading ? 'loading' : ''}`}>
                            {quoteLoading ? (
                                <div className="quote-loading">
                                    <div className="dot-pulse"></div>
                                </div>
                            ) : (
                                outputAmount || '0.00'
                            )}
                        </div>
                        <button
                            className="token-select-btn"
                            onClick={() => setSelectorOpen('output')}
                            id="output-token-select"
                        >
                            {outputToken?.logoURI && (
                                <img src={outputToken.logoURI} alt="" className="token-btn-icon" />
                            )}
                            <span>{outputToken?.symbol || 'Select'}</span>
                            <span className="chevron">▾</span>
                        </button>
                    </div>
                </div>

                {/* Quote Details */}
                {quote && !quoteLoading && (
                    <div className="quote-details">
                        {rate && <div className="quote-rate">{rate}</div>}
                        <div className="quote-row">
                            <span>Price Impact</span>
                            <span className={`impact ${parseFloat(quote.priceImpactPct || 0) > 1 ? 'high' : ''}`}>
                                {formatPriceImpact(quote.priceImpactPct)}
                            </span>
                        </div>
                        <div className="quote-row">
                            <span>Min. Received</span>
                            <span>
                                {formatTokenAmount(quote.otherAmountThreshold, outputToken.decimals)} {outputToken.symbol}
                            </span>
                        </div>
                        <div className="quote-row">
                            <span>Slippage</span>
                            <span>{(slippage / 100).toFixed(1)}%</span>
                        </div>
                    </div>
                )}

                {/* Error */}
                {quoteError && (
                    <div className="swap-error">{quoteError}</div>
                )}

                {/* Swap Button */}
                <button
                    className={`swap-btn ${!connected ? 'connect' : swapping ? 'swapping' : ''}`}
                    onClick={connected ? handleSwap : undefined}
                    disabled={connected && (!quote || swapping || quoteLoading)}
                    id="swap-execute-btn"
                >
                    {!connected
                        ? '🔗 Connect Wallet to Swap'
                        : swapping
                            ? '⏳ Swapping...'
                            : !inputAmount
                                ? 'Enter an amount'
                                : quoteLoading
                                    ? 'Getting quote...'
                                    : quoteError
                                        ? 'Invalid swap'
                                        : `Swap ${inputToken.symbol} → ${outputToken.symbol}`}
                </button>

                {/* Result Toast */}
                {swapResult && (
                    <div className={`swap-result ${swapResult.success ? 'success' : 'error'}`}>
                        <span>{swapResult.success ? '✅' : '❌'} {swapResult.message}</span>
                        {swapResult.txid && (
                            <a
                                href={`https://solscan.io/tx/${swapResult.txid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tx-link"
                            >
                                View on Solscan ↗
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Token Selector Modal */}
            <TokenSelector
                isOpen={selectorOpen !== null}
                onClose={() => setSelectorOpen(null)}
                onSelectToken={handleSelectToken}
                currentToken={selectorOpen === 'input' ? inputToken : outputToken}
            />
        </>
    );
}
