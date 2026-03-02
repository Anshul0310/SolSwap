import { SwapCard } from './components/SwapCard';

// Wallet adapter imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
    return (
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    <div className="app-container">
                        {/* Techie Background */}
                        <div className="bg-gradient"></div>
                        <div className="grid-bg"></div>
                        <div className="noise-overlay"></div>

                        {/* Circuit nodes */}
                        <div className="circuit-node node-1"></div>
                        <div className="circuit-node node-2"></div>
                        <div className="circuit-node node-3"></div>
                        <div className="circuit-node node-4"></div>
                        <div className="circuit-node node-5"></div>

                        {/* Data streams */}
                        <div className="data-stream stream-1">01001010</div>
                        <div className="data-stream stream-2">11010011</div>
                        <div className="data-stream stream-3">0xA7F3</div>
                        <div className="data-stream stream-4">10110100</div>
                        <div className="data-stream stream-5">0xDEF1</div>
                        <div className="data-stream stream-6">01110101</div>
                        <div className="data-stream stream-7">0xFF00</div>
                        <div className="data-stream stream-8">10010110</div>

                        {/* Scan beam */}
                        <div className="scan-beam"></div>

                        {/* Header */}
                        <header className="app-header">
                            <div className="logo">
                                <span className="logo-icon">⬡</span>
                                <span className="logo-text">SOLSWAP</span>
                            </div>
                            <nav className="nav-links">
                                <a href="https://solscan.io" target="_blank" rel="noopener noreferrer">EXPLORER</a>
                                <a href="https://station.jup.ag/docs" target="_blank" rel="noopener noreferrer">DOCS</a>
                            </nav>
                            <div className="wallet-buttons">
                                <WalletMultiButton />
                            </div>
                        </header>

                        {/* Split Layout — scrollable left, sticky right */}
                        <main className="split-layout">
                            {/* LEFT — scrollable content */}
                            <section className="left-panel">
                                <div className="left-content">
                                    {/* Hero */}
                                    <div className="hero-section">
                                        <div className="hero-badge">
                                            <span className="badge-dot"></span>
                                            SOLANA PROTOCOL
                                        </div>
                                        <h1 className="hero-title">
                                            SWAP IN<br />THE SHADOWS
                                        </h1>
                                        <p className="hero-subtitle">
                                            Phantom liquidity on Solana. Best rates aggregated across every DEX.
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="stats-row">
                                        <div className="stat-item">
                                            <span className="stat-value">{'<'}0.5s</span>
                                            <span className="stat-label">FINALITY</span>
                                        </div>
                                        <div className="stat-divider"></div>
                                        <div className="stat-item">
                                            <span className="stat-value">20+</span>
                                            <span className="stat-label">DEX ROUTES</span>
                                        </div>
                                    </div>

                                    {/* Telegram Bot Section */}
                                    <div className="tg-section">
                                        <div className="tg-header">
                                            <div className="tg-icon">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <div className="tg-header-text">
                                                <h2 className="tg-title">
                                                    SWAP ON TELEGRAM
                                                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: '8px', verticalAlign: 'middle', letterSpacing: '1px' }}>
                                                        (COMING SOON)
                                                    </span>
                                                </h2>
                                                <p className="tg-subtitle">Trade tokens directly from your Telegram chat — no browser needed.</p>
                                            </div>
                                        </div>

                                        <div className="tg-features">
                                            <div className="tg-feature">
                                                <span className="tg-feature-icon">👛</span>
                                                <div className="tg-feature-text">
                                                    <span className="tg-feature-title">AUTO WALLET</span>
                                                    <span className="tg-feature-desc">Generated on /start, export anytime</span>
                                                </div>
                                            </div>
                                            <div className="tg-feature">
                                                <span className="tg-feature-icon">⚡</span>
                                                <div className="tg-feature-text">
                                                    <span className="tg-feature-title">INSTANT SWAPS</span>
                                                    <span className="tg-feature-desc">Buy & sell via Jupiter Ultra API</span>
                                                </div>
                                            </div>
                                            <div className="tg-feature">
                                                <span className="tg-feature-icon">📊</span>
                                                <div className="tg-feature-text">
                                                    <span className="tg-feature-title">PORTFOLIO</span>
                                                    <span className="tg-feature-desc">Track SOL + token holdings live</span>
                                                </div>
                                            </div>
                                            <div className="tg-feature">
                                                <span className="tg-feature-icon">⚙️</span>
                                                <div className="tg-feature-text">
                                                    <span className="tg-feature-title">CONFIGURABLE</span>
                                                    <span className="tg-feature-desc">Custom slippage & buy defaults</span>
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href="https://t.me/YourBotUsername"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tg-cta"
                                        >
                                            <span className="tg-cta-text">OPEN IN TELEGRAM</span>
                                            <span className="tg-cta-arrow">→</span>
                                        </a>
                                    </div>
                                </div>
                            </section>

                            {/* Divider */}
                            <div className="split-divider">
                                <div className="divider-line"></div>
                                <div className="divider-pulse"></div>
                            </div>

                            {/* RIGHT — sticky swap card */}
                            <section className="right-panel">
                                <div className="right-content">
                                    <SwapCard />
                                    <div className="powered-by">
                                        POWERED BY <a href="https://jup.ag" target="_blank" rel="noopener noreferrer">JUPITER</a>
                                    </div>
                                </div>
                            </section>
                        </main>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
