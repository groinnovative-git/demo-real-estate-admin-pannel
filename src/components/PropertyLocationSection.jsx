import { useState, useEffect, useRef } from 'react';
import {
    Search, Navigation, MapPin, ExternalLink,
    X, Loader2, Globe, AlertCircle,
} from 'lucide-react';
import './property-location-section.css';

// ── Config ────────────────────────────────────────────────────────────────────
//  If VITE_GOOGLE_MAPS_API_KEY is set → Maps Embed API v1 (higher quality pin).
//  Falls back to keyless legacy embed so the component always works out of the box.
const EMBED_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// ── Pure helpers (no React, easily testable) ──────────────────────────────────

/**
 * Build an embeddable iframe src.
 * Coordinates take priority over plain text (more accurate pin on the map).
 */
function buildEmbedUrl(lat, lng, address) {
    if (lat && lng) {
        if (EMBED_KEY) {
            return (
                `https://www.google.com/maps/embed/v1/place` +
                `?key=${EMBED_KEY}&q=${encodeURIComponent(lat + ',' + lng)}&zoom=15`
            );
        }
        // Keyless legacy embed — works in every browser without billing
        return (
            `https://maps.google.com/maps` +
            `?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&hl=en&z=15&output=embed`
        );
    }
    if (address?.trim()) {
        if (EMBED_KEY) {
            return (
                `https://www.google.com/maps/embed/v1/place` +
                `?key=${EMBED_KEY}&q=${encodeURIComponent(address.trim())}`
            );
        }
        return (
            `https://maps.google.com/maps` +
            `?q=${encodeURIComponent(address.trim())}&hl=en&z=15&output=embed`
        );
    }
    return '';
}

/** External "open in Google Maps" link — coordinate-first for an accurate pin. */
function buildOpenMapsUrl(lat, lng, address) {
    if (lat && lng) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lng)}`;
    }
    if (address?.trim()) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
    }
    return 'https://www.google.com/maps';
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * PropertyLocationSection
 *
 * Props (used as INITIAL values + parent notification target only):
 *   address          {string}    Initial address text from the parent form
 *   latitude         {string}    Initial latitude from the parent form
 *   longitude        {string}    Initial longitude from the parent form
 *   onLocationChange {function}  Called with { address, latitude, longitude }
 *                                whenever the user searches or locates.
 *
 * Architecture:
 *   All display state (selectedAddress, lat, lng, mapEmbedUrl) is owned
 *   INTERNALLY.  The iframe updates the moment geocoding completes — it does
 *   NOT wait for the parent to round-trip the new props back.  The parent is
 *   notified via onLocationChange so it can persist the values for submission.
 *
 *   A sentRef prevents the parent's prop update from reflexively re-syncing
 *   internal state (which would cause a stale-closure / update loop).
 *
 * Geocoding:
 *   Search  → OpenStreetMap Nominatim forward-geocode  → fills all 3 fields
 *   Locate  → Browser GPS → Nominatim reverse-geocode → fills all 3 fields
 *   No state is ever read from inside the iframe (iframe = visual only).
 */
export default function PropertyLocationSection({
    address   = '',
    latitude  = '',
    longitude = '',
    onLocationChange,
}) {
    // ── Internal state ── the ONLY source of truth for display ───────────────
    const [searchText,      setSearchText]      = useState(address);
    const [selectedAddress, setSelectedAddress] = useState(address);
    const [lat,             setLat]             = useState(latitude);
    const [lng,             setLng]             = useState(longitude);
    const [mapEmbedUrl,     setMapEmbedUrl]     = useState(
        () => buildEmbedUrl(latitude, longitude, address)
    );
    const [iframeKey,       setIframeKey]       = useState(0);

    // ── Loading / error state ─────────────────────────────────────────────────
    const [isSearching,   setIsSearching]   = useState(false);
    const [isLocating,    setIsLocating]    = useState(false);
    const [locationError, setLocationError] = useState('');

    const inputRef = useRef(null);

    /**
     * sentRef tracks the last { address, latitude, longitude } we pushed to the
     * parent.  The sync effect below ignores prop changes that match sentRef so
     * we don't re-import our own updates from the parent round-trip.
     */
    const sentRef = useRef({ address, latitude, longitude });

    // ── Sync props → internal state (only for EXTERNAL changes) ──────────────
    //  Fires when the parent resets / clears the form, or pre-fills values from
    //  an existing record.  Ignored when the change originated from us.
    useEffect(() => {
        const s = sentRef.current;
        if (
            address   !== s.address   ||
            latitude  !== s.latitude  ||
            longitude !== s.longitude
        ) {
            console.log('[PLS] External prop change detected → syncing internal state', {
                address, latitude, longitude,
            });
            setSelectedAddress(address);
            setSearchText(address);
            setLat(latitude);
            setLng(longitude);
            setMapEmbedUrl(buildEmbedUrl(latitude, longitude, address));
            setIframeKey(k => k + 1);
            sentRef.current = { address, latitude, longitude };
        }
    }, [address, latitude, longitude]);

    // ── Derived values ────────────────────────────────────────────────────────
    const isBusy      = isSearching || isLocating;
    const hasLocation = !!(selectedAddress.trim() || (lat && lng));
    const mapsUrl     = buildOpenMapsUrl(lat, lng, selectedAddress);

    // ── notifyParent ─────────────────────────────────────────────────────────
    //  Updates sentRef BEFORE calling the callback so the sync effect above
    //  knows to ignore the prop change that will come back from the parent.
    function notifyParent(newAddress, newLat, newLng) {
        sentRef.current = { address: newAddress, latitude: newLat, longitude: newLng };
        onLocationChange?.({ address: newAddress, latitude: newLat, longitude: newLng });
    }

    // ── Commit a resolved location to internal state + parent ─────────────────
    //  Single place to apply the 5 state updates so nothing is ever out of sync.
    function commitLocation(newAddress, newLat, newLng) {
        const newEmbedUrl = buildEmbedUrl(newLat, newLng, newAddress);
        console.log('[PLS] commitLocation →', { newAddress, newLat, newLng, newEmbedUrl });

        setSelectedAddress(newAddress);
        setSearchText(newAddress);
        setLat(newLat);
        setLng(newLng);
        setMapEmbedUrl(newEmbedUrl);
        setIframeKey(k => k + 1);  // force iframe to reload with fresh src
        notifyParent(newAddress, newLat, newLng);
    }

    // ── handleSearch ──────────────────────────────────────────────────────────
    //  Forward-geocodes the typed query via OSM Nominatim (free, no key needed).
    async function handleSearch() {
        const query = searchText.trim();
        console.log('[PLS] handleSearch called → query:', JSON.stringify(query));

        if (!query) {
            console.warn('[PLS] handleSearch: empty query, aborting');
            return;
        }
        if (isBusy) {
            console.warn('[PLS] handleSearch: busy, aborting');
            return;
        }

        setLocationError('');
        setIsSearching(true);

        const apiUrl =
            `https://nominatim.openstreetmap.org/search` +
            `?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en`;

        console.log('[PLS] Fetching:', apiUrl);

        try {
            const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });

            console.log('[PLS] Nominatim status:', res.status, res.statusText);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} — ${res.statusText}`);
            }

            const data = await res.json();
            console.log('[PLS] Nominatim raw response:', data);

            if (!Array.isArray(data) || data.length === 0) {
                console.warn('[PLS] No results for:', query);
                setLocationError(
                    `No location found for "${query}". ` +
                    `Try a different address, city name, or landmark.`
                );
                return;
            }

            // Nominatim returns `lon` (not `lng`) — map explicitly
            const { lat: rawLat, lon: rawLon, display_name } = data[0];
            console.log('[PLS] Raw result:', { rawLat, rawLon, display_name });

            const newLat = parseFloat(rawLat).toFixed(6);
            const newLng = parseFloat(rawLon).toFixed(6);
            console.log('[PLS] Parsed coords:', { lat: newLat, lng: newLng });

            commitLocation(display_name, newLat, newLng);

        } catch (err) {
            console.error('[PLS] Search error:', err);
            setLocationError(
                `Search failed: ${err.message}. ` +
                `Check your internet connection and try again.`
            );
        } finally {
            setIsSearching(false);
        }
    }

    // ── handleLocateMe ────────────────────────────────────────────────────────
    //  Browser GPS → Nominatim reverse-geocode → fills all fields.
    function handleLocateMe() {
        console.log('[PLS] handleLocateMe called');

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        if (isBusy) return;

        setIsLocating(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const newLat = coords.latitude.toFixed(6);
                const newLng = coords.longitude.toFixed(6);
                console.log('[PLS] GPS coords:', { lat: newLat, lng: newLng });

                // Reverse-geocode to get a human-readable address
                let resolvedAddress = `${newLat}, ${newLng}`;  // safe fallback
                try {
                    const reverseUrl =
                        `https://nominatim.openstreetmap.org/reverse` +
                        `?format=json&lat=${newLat}&lon=${newLng}&accept-language=en`;
                    console.log('[PLS] Reverse geocoding:', reverseUrl);

                    const res  = await fetch(reverseUrl, { headers: { Accept: 'application/json' } });
                    const data = await res.json();
                    console.log('[PLS] Reverse geocode response:', data);

                    if (data?.display_name) resolvedAddress = data.display_name;
                } catch (err) {
                    console.warn('[PLS] Reverse geocode failed (using coords as address):', err);
                }

                setIsLocating(false);
                commitLocation(resolvedAddress, newLat, newLng);
            },
            (geoErr) => {
                console.error('[PLS] Geolocation error:', geoErr.code, geoErr.message);
                const msg = geoErr.code === 1
                    ? 'Location access denied. Allow browser permissions and try again.'
                    : 'Could not determine your location. Please search manually.';
                setLocationError(msg);
                setIsLocating(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }

    // ── handleClear ───────────────────────────────────────────────────────────
    function handleClear() {
        console.log('[PLS] handleClear called');
        setSearchText('');
        setSelectedAddress('');
        setLat('');
        setLng('');
        setMapEmbedUrl('');
        setLocationError('');
        notifyParent('', '', '');
        inputRef.current?.focus();
    }

    // ── handleKeyDown ─────────────────────────────────────────────────────────
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log('[PLS] Enter key → handleSearch');
            handleSearch();
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="pls-root">

            {/* ── A) Header ──────────────────────────────────────────────── */}
            <div className="pls-header">
                <div className="pls-header-left">
                    <div className="pls-header-icon-wrap" aria-hidden="true">
                        <MapPin size={18} strokeWidth={2.2} />
                    </div>
                    <div className="pls-header-text">
                        <h3 className="pls-header-title">Property Location</h3>
                        <p className="pls-header-sub">
                            Search an address or use device GPS — coordinates resolve automatically.
                        </p>
                    </div>
                </div>
                <span className={`pls-status-badge${hasLocation ? ' pls-status-badge--set' : ''}`}>
                    <Globe size={11} strokeWidth={2.5} aria-hidden="true" />
                    {hasLocation ? 'Location Set' : 'Map Preview'}
                </span>
            </div>

            {/* ── B) Search + Action Row ─────────────────────────────────── */}
            <div className="pls-search-row">

                {/* Search field */}
                <div className="pls-search-field">
                    {isSearching
                        ? <Loader2
                              className="pls-search-prefix-icon pls-spin"
                              size={16}
                              aria-label="Searching…"
                          />
                        : <Search
                              className="pls-search-prefix-icon"
                              size={17}
                              strokeWidth={2.5}
                              aria-hidden="true"
                          />
                    }
                    <input
                        ref={inputRef}
                        type="text"
                        className="pls-search-input"
                        placeholder="Search address, neighborhood, landmark…"
                        value={searchText}
                        onChange={e => {
                            setSearchText(e.target.value);
                            // Clear error as soon as the user starts typing again
                            if (locationError) setLocationError('');
                        }}
                        onKeyDown={handleKeyDown}
                        aria-label="Search property address"
                        disabled={isBusy}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    {searchText && !isBusy && (
                        <button
                            type="button"
                            className="pls-clear-btn"
                            onClick={handleClear}
                            aria-label="Clear address"
                        >
                            <X size={13} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                {/* Action buttons */}
                <div className="pls-action-group">

                    {/* Search / geocode */}
                    <button
                        type="button"
                        className={`pls-btn pls-btn--primary${isSearching ? ' pls-btn--loading' : ''}`}
                        onClick={handleSearch}
                        disabled={!searchText.trim() || isBusy}
                        title="Geocode this address to get coordinates"
                    >
                        {isSearching
                            ? <Loader2 size={15} className="pls-spin" aria-hidden="true" />
                            : <Search  size={15} strokeWidth={2.5} aria-hidden="true" />
                        }
                        <span>{isSearching ? 'Searching…' : 'Search'}</span>
                    </button>

                    {/* Locate Me */}
                    <button
                        type="button"
                        className={`pls-btn pls-btn--outline${isLocating ? ' pls-btn--busy' : ''}`}
                        onClick={handleLocateMe}
                        disabled={isBusy}
                        aria-label="Use my current location"
                        title="Auto-fill using device GPS"
                    >
                        {isLocating
                            ? <Loader2   size={15} className="pls-spin" aria-hidden="true" />
                            : <Navigation size={15} strokeWidth={2.2} aria-hidden="true" />
                        }
                        <span>{isLocating ? 'Locating…' : 'Locate Me'}</span>
                    </button>

                    {/* Open in Maps — only visible when a location is pinned */}
                    {hasLocation && (
                        <button
                            type="button"
                            className="pls-btn pls-btn--ghost"
                            onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
                            title="Open this location in Google Maps"
                        >
                            <ExternalLink size={15} strokeWidth={2.2} aria-hidden="true" />
                            <span>Open Map</span>
                        </button>
                    )}

                </div>
            </div>

            {/* Error / info bar */}
            {locationError && (
                <div className="pls-error-bar" role="alert">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{locationError}</span>
                    <button
                        type="button"
                        className="pls-error-dismiss"
                        onClick={() => setLocationError('')}
                        aria-label="Dismiss error"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* ── C) Map iframe ──────────────────────────────────────────── */}
            <div className="pls-map-outer">
                {mapEmbedUrl ? (
                    /*
                     * key={iframeKey} — forces a full unmount/remount whenever the
                     * location changes so the browser always loads the fresh src.
                     * Without this, some browsers cache the old URL.
                     */
                    <iframe
                        key={iframeKey}
                        src={mapEmbedUrl}
                        className="pls-map-iframe"
                        title="Property Location Map"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        style={{ border: 0 }}
                    />
                ) : (
                    <div className="pls-map-empty" aria-label="No location selected">
                        <div className="pls-map-empty-icon-wrap" aria-hidden="true">
                            <MapPin size={28} strokeWidth={1.4} />
                        </div>
                        <p className="pls-map-empty-title">No Location Pinned Yet</p>
                        <p className="pls-map-empty-sub">
                            Search or select a location above to preview the map here
                        </p>
                    </div>
                )}

                {/* Translucent overlay while a geocode / locate is in flight */}
                {isBusy && (
                    <div className="pls-map-overlay" aria-hidden="true">
                        <div className="pls-map-overlay-badge">
                            <Loader2 size={16} className="pls-spin" />
                            <span>
                                {isSearching ? 'Finding location…' : 'Getting your position…'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── D) Location Info Cards ─────────────────────────────────── */}
            {/*
             * IMPORTANT: these cards are bound to INTERNAL state (lat, lng,
             * selectedAddress), NOT to props.  They update the instant geocoding
             * completes — no prop round-trip required.
             */}
            <div className={`pls-info-grid${!hasLocation ? ' pls-info-grid--empty' : ''}`}>

                {/* Card 1: Selected Address */}
                <div className="pls-info-card pls-info-card--address">
                    <div className="pls-info-icon pls-info-icon--green" aria-hidden="true">
                        <MapPin size={14} strokeWidth={2.2} />
                    </div>
                    <div className="pls-info-body">
                        <span className="pls-info-label">Selected Address</span>
                        <span className="pls-info-value pls-info-value--address">
                            {isBusy
                                ? 'Resolving location…'
                                : (selectedAddress || 'No address selected')
                            }
                        </span>
                    </div>
                </div>

                {/* Card 2: Latitude */}
                <div className="pls-info-card">
                    <div className="pls-info-icon pls-info-icon--blue" aria-hidden="true">
                        <span className="pls-coord-chip">LAT</span>
                    </div>
                    <div className="pls-info-body">
                        <span className="pls-info-label">Latitude</span>
                        <span className={
                            `pls-info-value pls-info-value--mono` +
                            (!lat && !isBusy ? ' pls-info-value--empty' : '')
                        }>
                            {isBusy ? '…' : (lat || '—')}
                        </span>
                    </div>
                </div>

                {/* Card 3: Longitude */}
                <div className="pls-info-card">
                    <div className="pls-info-icon pls-info-icon--blue" aria-hidden="true">
                        <span className="pls-coord-chip">LNG</span>
                    </div>
                    <div className="pls-info-body">
                        <span className="pls-info-label">Longitude</span>
                        <span className={
                            `pls-info-value pls-info-value--mono` +
                            (!lng && !isBusy ? ' pls-info-value--empty' : '')
                        }>
                            {isBusy ? '…' : (lng || '—')}
                        </span>
                    </div>
                </div>

            </div>

        </div>
    );
}
