import { useState } from 'react';
import { MapPin, Eye, X, AlertCircle } from 'lucide-react';
import './property-location-embed.css';

// ─── helpers ──────────────────────────────────────────────────────────────────

const ALLOWED_HOSTS = new Set(['www.google.com', 'maps.google.com', 'google.com']);

function extractIframeSrc(raw) {
    const input = raw.trim();
    if (!input) return null;

    if (/<iframe/i.test(input)) {
        try {
            const doc = new DOMParser().parseFromString(input, 'text/html');
            const el = doc.querySelector('iframe');
            if (el) return el.getAttribute('src') ?? null;
        } catch (_) { /* fall through */ }
        const m = input.match(/src=["']([^"']+)["']/i);
        return m ? m[1] : null;
    }

    if (/^https?:\/\//i.test(input)) return input;
    return null;
}

function validateGoogleMapsUrl(url) {
    if (!url) return { valid: false, reason: 'No URL found in the pasted content.' };
    let parsed;
    try { parsed = new URL(url); } catch {
        return { valid: false, reason: 'Could not parse the URL.' };
    }
    if (parsed.protocol !== 'https:')
        return { valid: false, reason: 'Only HTTPS embed URLs are accepted.' };
    if (!ALLOWED_HOSTS.has(parsed.hostname))
        return { valid: false, reason: 'URL must be from google.com.' };
    const path = parsed.pathname;
    if (path.startsWith('/maps/embed')) return { valid: true };
    if (path.startsWith('/maps')) {
        if (parsed.searchParams.get('output') === 'embed') return { valid: true };
        return { valid: false, reason: 'Use Share → Embed a map in Google Maps to get a valid embed URL.' };
    }
    return { valid: false, reason: 'URL does not match Google Maps embed format.' };
}

// ─── component ────────────────────────────────────────────────────────────────

export default function PropertyLocationEmbed({ embedSrc = '', onEmbedChange }) {
    const [embedInput, setEmbedInput] = useState(embedSrc || '');
    const [activeSrc, setActiveSrc] = useState(embedSrc || '');
    const [error, setError] = useState('');
    const [previewReady, setPreviewReady] = useState(!!embedSrc);

    function handlePreview() {
        setError('');
        const src = extractIframeSrc(embedInput);
        const validation = validateGoogleMapsUrl(src);
        if (!validation.valid) { setError(validation.reason); return; }
        setActiveSrc(src);
        setPreviewReady(true);
        onEmbedChange?.(src);
    }

    function handleClear() {
        setEmbedInput('');
        setActiveSrc('');
        setError('');
        setPreviewReady(false);
        onEmbedChange?.('');
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handlePreview();
        }
    }

    const hasInput = embedInput.trim().length > 0;

    return (
        <div className="ple-root">
            {/* ── Header ── */}
            <div className="ple-header">
                <div className="ple-icon-tile">
                    <MapPin size={20} />
                </div>
                <div className="ple-header-text">
                    <h3 className="ple-title">Property Location</h3>
                    <p className="ple-subtitle">
                        Open Google Maps → Share → <strong>Embed a map</strong> → paste the code or URL below
                    </p>
                </div>
            </div>

            {/* ── Input zone ── */}
            <div className="ple-input-zone">
                <label className="ple-label" htmlFor="ple-textarea">
                    Google Maps Embed Code or URL
                </label>

                <textarea
                    id="ple-textarea"
                    className={`ple-textarea${error ? ' ple-textarea--error' : ''}`}
                    value={embedInput}
                    onChange={e => { setEmbedInput(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    rows={4}
                    placeholder={`Paste <iframe> embed code or Google Maps embed URL here…`}
                    spellCheck={false}
                    autoComplete="off"
                />

                {error && (
                    <div className="ple-error-bar">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* ── Actions ── */}
            <div className="ple-actions">
                <button
                    type="button"
                    className="ple-btn ple-btn--primary"
                    onClick={handlePreview}
                    disabled={!hasInput}
                >
                    <Eye size={16} />
                    Preview Map
                </button>

                <button
                    type="button"
                    className="ple-btn ple-btn--outline"
                    onClick={handleClear}
                    disabled={!hasInput && !previewReady}
                >
                    <X size={16} />
                    Clear
                </button>
            </div>

            {/* ── Map preview ── */}
            <div className="ple-map-container">
                {previewReady && activeSrc ? (
                    <iframe
                        key={activeSrc}
                        src={activeSrc}
                        className="ple-map-iframe"
                        title="Property Location Map"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <div className="ple-empty-state">
                        <div className="ple-empty-icon">
                            <MapPin size={28} />
                        </div>
                        <p className="ple-empty-title">No map preview yet</p>
                        <p className="ple-empty-sub">
                            Paste your Google Maps embed code above and click <strong>Preview Map</strong>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
