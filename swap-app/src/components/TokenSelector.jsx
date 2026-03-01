import { useState, useRef, useEffect } from 'react';
import { searchTokens, POPULAR_TOKENS } from '../utils/jupiter';

export function TokenSelector({ isOpen, onClose, onSelectToken, currentToken }) {
    const [query, setQuery] = useState('');
    const [tokens, setTokens] = useState(POPULAR_TOKENS);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (!isOpen) {
            setQuery('');
            setTokens(POPULAR_TOKENS);
        }
    }, [isOpen]);

    const handleSearch = (value) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchTokens(value);
                setTokens(results);
            } catch {
                setTokens(POPULAR_TOKENS);
            }
            setLoading(false);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="token-modal" onClick={(e) => e.stopPropagation()}>
                <div className="token-modal-header">
                    <h3>Select a Token</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="token-search-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="token-search-input"
                        placeholder="Search by name or paste address..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className="popular-tokens">
                    {POPULAR_TOKENS.slice(0, 6).map((token) => (
                        <button
                            key={token.mint}
                            className={`popular-chip ${currentToken?.mint === token.mint ? 'active' : ''}`}
                            onClick={() => { onSelectToken(token); onClose(); }}
                        >
                            {token.logoURI && <img src={token.logoURI} alt="" className="chip-icon" />}
                            {token.symbol}
                        </button>
                    ))}
                </div>

                <div className="token-divider"></div>

                <div className="token-list">
                    {loading ? (
                        <div className="token-loading">
                            <div className="spinner"></div>
                            <span>Searching tokens...</span>
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="token-empty">No tokens found</div>
                    ) : (
                        tokens.map((token) => (
                            <button
                                key={token.mint}
                                className={`token-item ${currentToken?.mint === token.mint ? 'selected' : ''}`}
                                onClick={() => { onSelectToken(token); onClose(); }}
                            >
                                <div className="token-item-icon">
                                    {token.logoURI ? (
                                        <img
                                            src={token.logoURI}
                                            alt={token.symbol}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    <div className="token-placeholder" style={token.logoURI ? { display: 'none' } : {}}>
                                        {token.symbol?.charAt(0) || '?'}
                                    </div>
                                </div>
                                <div className="token-item-info">
                                    <span className="token-item-symbol">{token.symbol}</span>
                                    <span className="token-item-name">{token.name}</span>
                                </div>
                                <span className="token-item-address">
                                    {token.mint?.slice(0, 4)}...{token.mint?.slice(-4)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
