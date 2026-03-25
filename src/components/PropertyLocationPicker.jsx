import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Navigation, MapPin, Loader2, AlertCircle, X } from 'lucide-react';
import './PropertyLocationPicker.css';

// ─── Config ───────────────────────────────────────────────────────────────
//  .env.local must contain:
//    VITE_GOOGLE_MAPS_API_KEY=AIza...    (Maps JS API + Places API + Geocoding API)
//    VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID (or a real Map ID from Cloud Console)
//
//  Required Google Cloud APIs:
//    • Maps JavaScript API
//    • Places API (New)
//    • Geocoding API
const API_KEY        = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_ID         = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID  || 'DEMO_MAP_ID';
const DEFAULT_CENTER = { lat: 17.3850, lng: 78.4867 }; // Hyderabad, India
const DEFAULT_ZOOM   = 12;
const PINNED_ZOOM    = 16;
const DEBOUNCE_MS    = 280;

// ─── Singleton bootstrap ──────────────────────────────────────────────────
//  Loads the Maps JS API bootstrap script once per page lifetime.
//  All library imports (maps, marker, places) are done via importLibrary()
//  after the bootstrap, which is the Google-recommended modern pattern.
let _boot = null;

function bootstrapGoogleMaps() {
    if (window.google?.maps?.importLibrary) return Promise.resolve();
    if (_boot) return _boot;

    _boot = new Promise((resolve, reject) => {
        if (!API_KEY) { reject(new Error('NO_API_KEY')); return; }

        const cb = '__plpBoot__';
        window[cb] = () => { resolve(); delete window[cb]; };

        const s  = document.createElement('script');
        s.src    = `https://maps.googleapis.com/maps/api/js`
                 + `?key=${API_KEY}&v=weekly&callback=${cb}&loading=async`;
        s.async  = true;
        s.defer  = true;
        s.onerror = () => { _boot = null; reject(new Error('LOAD_FAILED')); };
        document.head.appendChild(s);
    });

    return _boot;
}

// ─── Highlight matched text from AutocompleteSuggestion ──────────────────
//  FormattableText has .text (string) + .matches ([{startOffset, endOffset}])
function HighlightedText({ formattableText }) {
    const full    = formattableText?.text ?? '';
    const matches = formattableText?.matches ?? [];
    if (!matches.length) return <span>{full}</span>;

    const parts = [];
    let cursor = 0;
    for (const { startOffset, endOffset } of matches) {
        if (cursor < startOffset) parts.push(full.slice(cursor, startOffset));
        parts.push(<strong key={startOffset}>{full.slice(startOffset, endOffset)}</strong>);
        cursor = endOffset;
    }
    if (cursor < full.length) parts.push(full.slice(cursor));
    return <>{parts}</>;
}

// ─── Component ────────────────────────────────────────────────────────────
/*
 * PropertyLocationPicker
 *
 * Props:
 *   locationText  {string}    parent's current address
 *   lat           {string}    parent's current latitude
 *   lng           {string}    parent's current longitude
 *   onChange      {function}  called with { locationText, lat, lng }
 *
 * Google Maps APIs used:
 *   • google.maps.Map                         (map canvas)
 *   • google.maps.marker.AdvancedMarkerElement (draggable pin)
 *   • google.maps.marker.PinElement            (native Google Maps red pin)
 *   • google.maps.places.AutocompleteSuggestion (search suggestions)
 *   • google.maps.places.AutocompleteSessionToken (billing optimization)
 *   • google.maps.Geocoder                    (reverse geocoding)
 */
export default function PropertyLocationPicker({
    locationText = '',
    lat          = '',
    lng          = '',
    onChange,
}) {
    // ── State ────────────────────────────────────────────────────────────
    const [apiReady,        setApiReady]        = useState(false);
    const [apiError,        setApiError]        = useState('');
    const [position,        setPosition]        = useState(() =>
        lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
    );
    const [hasInput,        setHasInput]        = useState(!!locationText);
    const [suggestions,     setSuggestions]     = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGeocoding,     setIsGeocoding]     = useState(false);
    const [isLocating,      setIsLocating]      = useState(false);
    const [geoError,        setGeoError]        = useState('');

    // ── Refs ─────────────────────────────────────────────────────────────
    const mapDivRef     = useRef(null);  // Google Maps mount node
    const inputRef      = useRef(null);  // search <input> DOM node
    const searchRowRef  = useRef(null);  // outer search field (for outside-click)
    const mapRef        = useRef(null);  // google.maps.Map instance
    const markerRef     = useRef(null);  // AdvancedMarkerElement instance
    const geocoderRef   = useRef(null);  // Geocoder instance
    const acLibRef      = useRef(null);  // cached { AutocompleteSuggestion, AutocompleteSessionToken }
    const sessionTokRef = useRef(null);  // current AutocompleteSessionToken
    const debounceRef   = useRef(null);

    // Stable ref to latest onChange — prevents stale closures in map listeners
    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    // Capture initial props for one-time map setup
    const initLatRef  = useRef(lat);
    const initLngRef  = useRef(lng);
    const initAddrRef = useRef(locationText);

    // ── Close suggestions on outside click ───────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (!searchRowRef.current?.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Reverse Geocoder ──────────────────────────────────────────────────
    //  Stable identity — all deps are refs.
    const reverseGeocode = useCallback((newLat, newLng) => {
        if (!geocoderRef.current) return;

        setIsGeocoding(true);

        geocoderRef.current.geocode(
            { location: { lat: newLat, lng: newLng } },
            (results, status) => {
                setIsGeocoding(false);
                const addr = (status === 'OK' && results?.[0])
                    ? results[0].formatted_address
                    : `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;

                if (inputRef.current) inputRef.current.value = addr;
                setHasInput(true);
                onChangeRef.current?.({
                    locationText: addr,
                    lat: newLat.toFixed(6),
                    lng: newLng.toFixed(6),
                });
            }
        );
    }, []);

    // ── Map initializer (runs once) ───────────────────────────────────────
    useEffect(() => {
        if (!API_KEY) { setApiError('NO_API_KEY'); return; }

        let destroyed = false;

        (async () => {
            try {
                await bootstrapGoogleMaps();
                if (destroyed || !mapDivRef.current) return;

                // Import all required libraries in parallel
                const [mapsLib, markerLib, placesLib] = await Promise.all([
                    google.maps.importLibrary('maps'),
                    google.maps.importLibrary('marker'),
                    google.maps.importLibrary('places'),
                ]);
                if (destroyed || !mapDivRef.current) return;

                const { Map, Geocoder }                               = mapsLib;
                const { AdvancedMarkerElement, PinElement }           = markerLib;
                const { AutocompleteSuggestion, AutocompleteSessionToken } = placesLib;

                // Cache places lib for use in fetchSuggestions
                acLibRef.current = { AutocompleteSuggestion, AutocompleteSessionToken };

                const initPos = initLatRef.current && initLngRef.current
                    ? { lat: parseFloat(initLatRef.current), lng: parseFloat(initLngRef.current) }
                    : null;

                // ── 1. Map ────────────────────────────────────────────────
                //  mapId is required for AdvancedMarkerElement.
                //  'DEMO_MAP_ID' works for all developers during development.
                //  In production, create a real Map ID in Google Cloud Console.
                const map = new Map(mapDivRef.current, {
                    center:             initPos || DEFAULT_CENTER,
                    zoom:               initPos ? PINNED_ZOOM : DEFAULT_ZOOM,
                    mapId:              MAP_ID,
                    mapTypeControl:     false,
                    streetViewControl:  false,
                    fullscreenControl:  false,
                    rotateControl:      false,
                    scaleControl:       false,
                    zoomControl:        true,
                    zoomControlOptions: { position: mapsLib.ControlPosition.RIGHT_BOTTOM },
                    // 'cooperative' = two-finger pan on touch (prevents scroll hijack)
                    gestureHandling:    'cooperative',
                    clickableIcons:     false,
                });
                mapRef.current = map;

                // ── 2. Geocoder ────────────────────────────────────────────
                geocoderRef.current = new Geocoder();

                // ── 3. AdvancedMarkerElement (replaces deprecated Marker) ──
                //  PinElement with no args renders the native Google red teardrop pin.
                const pin = new PinElement();

                const marker = new AdvancedMarkerElement({
                    map:          initPos ? map : null, // null = hidden until first click
                    position:     initPos || DEFAULT_CENTER,
                    content:      pin.element,
                    gmpDraggable: true,
                    title:        'Drag to adjust the exact location',
                });
                markerRef.current = marker;

                // ── 4. Map click → place marker + reverse-geocode ─────────
                map.addListener('click', (e) => {
                    const clickLat = e.latLng.lat();
                    const clickLng = e.latLng.lng();

                    marker.position = { lat: clickLat, lng: clickLng };
                    marker.map      = map;

                    setPosition({ lat: clickLat, lng: clickLng });
                    reverseGeocode(clickLat, clickLng);
                });

                // ── 5. Marker drag end → reverse-geocode ──────────────────
                //  AdvancedMarkerElement fires 'gmp-dragend' (not 'dragend').
                //  After drag, marker.position is a LatLng object.
                marker.addListener('gmp-dragend', () => {
                    const pos    = marker.position;
                    // pos can be LatLng (method) or LatLngLiteral (plain value)
                    const newLat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
                    const newLng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
                    setPosition({ lat: newLat, lng: newLng });
                    reverseGeocode(newLat, newLng);
                });

                // ── 6. Pre-fill input with initial address ─────────────────
                if (initAddrRef.current && inputRef.current) {
                    inputRef.current.value = initAddrRef.current;
                }

                setApiReady(true);

            } catch (err) {
                if (!destroyed) setApiError(err.message || 'LOAD_FAILED');
            }
        })();

        return () => {
            destroyed = true;
            clearTimeout(debounceRef.current);
            if (window.google?.maps) {
                if (markerRef.current)
                    window.google.maps.event.clearInstanceListeners(markerRef.current);
                if (mapRef.current)
                    window.google.maps.event.clearInstanceListeners(mapRef.current);
            }
            if (markerRef.current) markerRef.current.map = null;
            markerRef.current   = null;
            mapRef.current      = null;
            geocoderRef.current = null;
            acLibRef.current    = null;
            sessionTokRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Autocomplete suggestions (new Places API — no deprecated widget) ──
    //  Uses AutocompleteSuggestion.fetchAutocompleteSuggestions() which is
    //  the replacement for the deprecated google.maps.places.Autocomplete.
    const fetchSuggestions = useCallback(async (input) => {
        const lib = acLibRef.current;
        if (!lib || !input.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const { AutocompleteSuggestion, AutocompleteSessionToken } = lib;

        // Reuse session token across requests in the same search session.
        // Reset it (= null) after a place is selected to start a new session.
        if (!sessionTokRef.current) {
            sessionTokRef.current = new AutocompleteSessionToken();
        }

        try {
            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input,
                sessionToken: sessionTokRef.current,
            });
            setSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
        } catch {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setHasInput(!!val);
        if (!val.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
    };

    // ── Select a suggestion from the dropdown ─────────────────────────────
    const handleSuggestionSelect = async (suggestion) => {
        setSuggestions([]);
        setShowSuggestions(false);

        try {
            const place = suggestion.placePrediction.toPlace();
            await place.fetchFields({ fields: ['formattedAddress', 'location'] });

            const addr   = place.formattedAddress;
            const newLat = place.location.lat();
            const newLng = place.location.lng();

            if (inputRef.current) inputRef.current.value = addr;
            setHasInput(true);

            // Invalidate session token — a new session starts on next keystroke
            sessionTokRef.current = null;

            const latLng = { lat: newLat, lng: newLng };
            if (markerRef.current) {
                markerRef.current.position = latLng;
                markerRef.current.map      = mapRef.current;
            }
            mapRef.current?.panTo(latLng);
            mapRef.current?.setZoom(PINNED_ZOOM);

            setPosition({ lat: newLat, lng: newLng });
            onChangeRef.current?.({
                locationText: addr,
                lat: newLat.toFixed(6),
                lng: newLng.toFixed(6),
            });
        } catch {
            // Place fetch failed — silently close the dropdown
        }
    };

    // ── Clear ─────────────────────────────────────────────────────────────
    const handleClear = () => {
        if (inputRef.current) inputRef.current.value = '';
        setHasInput(false);
        setSuggestions([]);
        setShowSuggestions(false);
        setPosition(null);
        clearTimeout(debounceRef.current);
        sessionTokRef.current = null;
        if (markerRef.current) markerRef.current.map = null;
        onChange?.({ locationText: '', lat: '', lng: '' });
    };

    // ── Locate Me ─────────────────────────────────────────────────────────
    const handleLocateMe = useCallback(() => {
        if (!apiReady) return;
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        setGeoError('');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLat = pos.coords.latitude;
                const newLng = pos.coords.longitude;
                const latLng = { lat: newLat, lng: newLng };

                if (markerRef.current) {
                    markerRef.current.position = latLng;
                    markerRef.current.map      = mapRef.current;
                }
                mapRef.current?.panTo(latLng);
                mapRef.current?.setZoom(PINNED_ZOOM);

                setPosition({ lat: newLat, lng: newLng });
                reverseGeocode(newLat, newLng);
                setIsLocating(false);
            },
            () => {
                setGeoError(
                    'Location access denied. Allow browser permissions or search manually.'
                );
                setIsLocating(false);
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    }, [apiReady, reverseGeocode]);

    // ── Derived display values ─────────────────────────────────────────────
    const hasPinned  = !!position;
    const displayLat = position ? position.lat.toFixed(6) : (lat || '');
    const displayLng = position ? position.lng.toFixed(6) : (lng || '');
    const displayAddr = locationText;

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="plp-root">

            {/* ── API key warning ───────────────────────────────────────── */}
            {apiError === 'NO_API_KEY' && (
                <div className="plp-warn-bar">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>
                        Google Maps API key not found. Create{' '}
                        <code>.env.local</code> and add{' '}
                        <code>VITE_GOOGLE_MAPS_API_KEY=AIza…</code>,
                        then restart the dev server.
                    </span>
                </div>
            )}

            {/* ── API load error ────────────────────────────────────────── */}
            {apiError === 'LOAD_FAILED' && (
                <div className="plp-error-bar" role="alert">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>
                        Google Maps failed to load. Check your API key, billing
                        status, and that Maps JS API + Places API (New) +
                        Geocoding API are enabled in Google Cloud Console.
                    </span>
                </div>
            )}

            {/* ── Search Row ────────────────────────────────────────────── */}
            {/*
             * .plp-search-field is position:relative so the custom suggestions
             * dropdown (.plp-suggestions) can be absolutely positioned below it.
             * ref={searchRowRef} wraps the field for outside-click detection.
             */}
            <div className="plp-search-row">
                <div className="plp-search-field" ref={searchRowRef}>

                    {/* Search icon / geocoding spinner */}
                    {isGeocoding
                        ? <Loader2
                              className="plp-search-icon plp-search-icon--spin"
                              size={17}
                              aria-label="Resolving address…"
                          />
                        : <Search
                              className="plp-search-icon"
                              size={17}
                              strokeWidth={2.5}
                              aria-hidden="true"
                          />
                    }

                    {/*
                     * Uncontrolled <input> — the Google Autocomplete APIs write
                     * directly to the DOM value; we only track hasInput for the
                     * clear-button visibility via onChange.
                     */}
                    <input
                        ref={inputRef}
                        type="text"
                        className="plp-search-input"
                        placeholder="Search address, neighborhood, or landmark…"
                        defaultValue={locationText}
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="Search property address"
                        aria-autocomplete="list"
                        aria-expanded={showSuggestions}
                        onChange={handleInputChange}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                    />

                    {/* Clear ✕ */}
                    {hasInput && (
                        <button
                            type="button"
                            className="plp-clear-btn"
                            onClick={handleClear}
                            aria-label="Clear address"
                        >
                            <X size={13} strokeWidth={2.5} />
                        </button>
                    )}

                    {/* ── Custom suggestions dropdown ─────────────────────
                     * Replaces the old .pac-container (deprecated Autocomplete).
                     * onMouseDown + preventDefault prevents input blur before
                     * the click event fires on the suggestion button.
                     */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="plp-suggestions" role="listbox">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    role="option"
                                    className="plp-suggestion-item"
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // keep input focused
                                        handleSuggestionSelect(s);
                                    }}
                                >
                                    <span className="plp-suggestion-pin" aria-hidden="true">
                                        <MapPin size={14} strokeWidth={1.8} />
                                    </span>
                                    <span className="plp-suggestion-text">
                                        <span className="plp-suggestion-main">
                                            <HighlightedText
                                                formattableText={s.placePrediction.mainText}
                                            />
                                        </span>
                                        {s.placePrediction.secondaryText && (
                                            <span className="plp-suggestion-secondary">
                                                {s.placePrediction.secondaryText.toString()}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                {/* Locate Me — same height as field via align-items:stretch */}
                <button
                    type="button"
                    className={`plp-locate-btn${isLocating ? ' plp-locate-btn--busy' : ''}`}
                    onClick={handleLocateMe}
                    disabled={isLocating || !apiReady}
                    title={!apiReady ? 'Map is loading…' : 'Use my current device location'}
                    aria-label="Use my current location"
                >
                    {isLocating
                        ? <Loader2 size={15} className="plp-spin" aria-hidden="true" />
                        : <Navigation size={15} strokeWidth={2.2} aria-hidden="true" />
                    }
                    <span>{isLocating ? 'Locating…' : 'Locate Me'}</span>
                </button>

            </div>

            {/* ── Geolocation error ─────────────────────────────────────── */}
            {geoError && (
                <div className="plp-error-bar" role="alert">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{geoError}</span>
                    <button
                        type="button"
                        className="plp-error-dismiss"
                        onClick={() => setGeoError('')}
                        aria-label="Dismiss"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* ── Map Container ─────────────────────────────────────────── */}
            <div className="plp-map-outer">

                {/* Instruction chip — after API loads, before first pin */}
                {apiReady && !hasPinned && (
                    <div className="plp-instruction-chip" aria-hidden="true">
                        <MapPin size={11} aria-hidden="true" />
                        <span>Click anywhere on the map to pin the exact property location</span>
                    </div>
                )}

                {/* Loading skeleton with shimmer */}
                {!apiReady && (
                    <div className="plp-map-skeleton" aria-hidden="true">
                        <div className="plp-skeleton-shimmer" />
                        {!apiError && (
                            <div className="plp-map-loading-badge">
                                <Loader2 size={16} className="plp-spin" />
                                <span>Loading map…</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Google Maps canvas — always in DOM so ref stays valid */}
                <div ref={mapDivRef} className="plp-map-canvas" />

            </div>

            {/* ── Coordinates Panel ─────────────────────────────────────── */}
            <div
                className={`plp-coords-card${!hasPinned ? ' plp-coords-card--empty' : ''}`}
                aria-label="Selected location details"
            >

                <div className="plp-coord-cell plp-coord-cell--address">
                    <span className="plp-coord-label">
                        <MapPin size={10} strokeWidth={2.5} aria-hidden="true" />
                        Selected Address
                    </span>
                    <span className="plp-coord-val plp-coord-val--address">
                        {isGeocoding
                            ? 'Resolving address…'
                            : (displayAddr || (hasPinned ? '—' : 'No address selected'))
                        }
                    </span>
                </div>

                <div className="plp-coord-sep" aria-hidden="true" />

                <div className="plp-coord-cell">
                    <span className="plp-coord-label">Latitude</span>
                    <span className={`plp-coord-val plp-coord-val--mono${!displayLat ? ' plp-coord-val--empty' : ''}`}>
                        {displayLat || '—'}
                    </span>
                </div>

                <div className="plp-coord-sep" aria-hidden="true" />

                <div className="plp-coord-cell">
                    <span className="plp-coord-label">Longitude</span>
                    <span className={`plp-coord-val plp-coord-val--mono${!displayLng ? ' plp-coord-val--empty' : ''}`}>
                        {displayLng || '—'}
                    </span>
                </div>

            </div>

        </div>
    );
}
