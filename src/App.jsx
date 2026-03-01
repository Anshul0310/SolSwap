import { useEffect, useRef } from 'react';
import * as anime from 'animejs';
import { SwapCard } from './components/SwapCard';

// Wallet adapter imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
    const headerRef = useRef(null);
    const heroRef = useRef(null);

    const statsRef = useRef(null);
    const tagsRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        // anime.js staggered entrance
        const tl = anime.timeline({
            easing: 'easeOutExpo',
            duration: 900,
        });

        tl.add({
            targets: headerRef.current,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 600,
        })
            .add({
                targets: heroRef.current?.children,
                opacity: [0, 1],
                translateX: [-40, 0],
                delay: anime.stagger(120),
            }, '-=400')

            .add({
                targets: statsRef.current?.children,
                opacity: [0, 1],
                translateY: [16, 0],
                delay: anime.stagger(100),
            }, '-=400')
            .add({
                targets: tagsRef.current?.children,
                opacity: [0, 1],
                scale: [0.9, 1],
                delay: anime.stagger(60),
            }, '-=400')
            .add({
                targets: cardRef.current,
                opacity: [0, 1],
                translateX: [50, 0],
                scale: [0.97, 1],
                duration: 1000,
            }, '-=800');
    }, []);

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
                        <header className="app-header" ref={headerRef} style={{ opacity: 0 }}>
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
                                    <div className="hero-section" ref={heroRef}>
                                        <div className="hero-badge" style={{ opacity: 0 }}>
                                            <span className="badge-dot"></span>
                                            SOLANA PROTOCOL
                                        </div>
                                        <h1 className="hero-title" style={{ opacity: 0 }}>
                                            SWAP IN<br />THE SHADOWS
                                        </h1>
                                        <p className="hero-subtitle" style={{ opacity: 0 }}>
                                            Phantom liquidity on Solana. Best rates aggregated across every DEX.
                                        </p>
                                    </div>


                                    {/* Stats */}
                                    <div className="stats-row" ref={statsRef}>
                                        <div className="stat-item" style={{ opacity: 0 }}>
                                            <span className="stat-value">{'<'}0.5s</span>
                                            <span className="stat-label">FINALITY</span>
                                        </div>
                                        <div className="stat-divider" style={{ opacity: 0 }}></div>
                                        <div className="stat-item" style={{ opacity: 0 }}>
                                            <span className="stat-value">20+</span>
                                            <span className="stat-label">DEX ROUTES</span>
                                        </div>
                                    </div>

                                    {/* Tech tags */}
                                    <div className="tech-tags" ref={tagsRef}>
                                        <span className="tech-tag" style={{ opacity: 0 }}>JUPITER V6</span>
                                        <span className="tech-tag" style={{ opacity: 0 }}>SPL TOKENS</span>
                                        <span className="tech-tag" style={{ opacity: 0 }}>NON-CUSTODIAL</span>
                                        <span className="tech-tag" style={{ opacity: 0 }}>OPEN SOURCE</span>
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
                                <div className="right-content" ref={cardRef} style={{ opacity: 0 }}>
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
