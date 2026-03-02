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

                                    {/* Tech tags */}
                                    <div className="tech-tags">
                                        <span className="tech-tag">JUPITER V6</span>
                                        <span className="tech-tag">SPL TOKENS</span>
                                        <span className="tech-tag">NON-CUSTODIAL</span>
                                        <span className="tech-tag">OPEN SOURCE</span>
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
