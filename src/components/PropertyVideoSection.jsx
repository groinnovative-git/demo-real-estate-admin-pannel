import { useState } from 'react';
import { Youtube, X, AlertCircle } from 'lucide-react';
import VideoPreviewCard from './VideoPreviewCard';
import VideoModal from './VideoModal';
import './property-video-section.css';

// ─── YouTube utilities ────────────────────────────────────────────────────────

export function extractYouTubeVideoId(url) {
    if (!url) return null;
    const patterns = [
        /[?&]v=([A-Za-z0-9_-]{11})/,
        /youtu\.be\/([A-Za-z0-9_-]{11})/,
        /\/embed\/([A-Za-z0-9_-]{11})/,
        /\/shorts\/([A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

function validateYouTubeUrl(url) {
    if (!url) return { valid: true };
    const id = extractYouTubeVideoId(url);
    if (!id) return { valid: false, reason: 'Please enter a valid YouTube URL.' };
    return { valid: true };
}

// ─── component ────────────────────────────────────────────────────────────────

export default function PropertyVideoSection({
    shortVideoUrl = '',
    fullVideoUrl = '',
    onShortVideoChange,
    onFullVideoChange,
}) {
    const [modalVideoId, setModalVideoId] = useState(null);
    const [modalLabel, setModalLabel]     = useState('');
    const [shortError, setShortError]     = useState('');
    const [fullError, setFullError]       = useState('');

    const shortId = extractYouTubeVideoId(shortVideoUrl);
    const fullId  = extractYouTubeVideoId(fullVideoUrl);

    function handleShortChange(e) {
        const val = e.target.value;
        onShortVideoChange?.(val);
        setShortError(val ? (validateYouTubeUrl(val).reason || '') : '');
    }

    function handleFullChange(e) {
        const val = e.target.value;
        onFullVideoChange?.(val);
        setFullError(val ? (validateYouTubeUrl(val).reason || '') : '');
    }

    function openModal(videoId, label) {
        setModalVideoId(videoId);
        setModalLabel(label);
    }

    function closeModal() {
        setModalVideoId(null);
        setModalLabel('');
    }

    return (
        <div className="pvs-root">
            {/* ── Header ── */}
            <div className="pvs-header">
                <div className="pvs-icon-tile">
                    <Youtube size={20} />
                </div>
                <div className="pvs-header-text">
                    <h3 className="pvs-title">Property Videos</h3>
                    <p className="pvs-subtitle">
                        Add a short teaser and a full walkthrough YouTube video for this property
                    </p>
                </div>
            </div>

            {/* ── URL Inputs ── */}
            <div className="pvs-inputs-grid">
                {/* Short Video */}
                <div className="pvs-input-group">
                    <label className="pvs-label" htmlFor="pvs-short">
                        <span className="pvs-label-dot pvs-label-dot--short" />
                        1 Min Video URL
                        <span className="pvs-optional-chip">Short</span>
                    </label>
                    <div className="pvs-input-row">
                        <input
                            id="pvs-short"
                            className={`pvs-input${shortError ? ' pvs-input--error' : ''}`}
                            type="url"
                            value={shortVideoUrl}
                            onChange={handleShortChange}
                            placeholder="https://youtu.be/… or youtube.com/shorts/…"
                            autoComplete="off"
                        />
                        {shortVideoUrl && (
                            <button
                                type="button"
                                className="pvs-clear-btn"
                                onClick={() => { onShortVideoChange?.(''); setShortError(''); }}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {shortError && (
                        <div className="pvs-error-msg">
                            <AlertCircle size={12} /><span>{shortError}</span>
                        </div>
                    )}
                </div>

                {/* Full Video */}
                <div className="pvs-input-group">
                    <label className="pvs-label" htmlFor="pvs-full">
                        <span className="pvs-label-dot pvs-label-dot--full" />
                        Full Video URL
                        <span className="pvs-optional-chip">Full Walk</span>
                    </label>
                    <div className="pvs-input-row">
                        <input
                            id="pvs-full"
                            className={`pvs-input${fullError ? ' pvs-input--error' : ''}`}
                            type="url"
                            value={fullVideoUrl}
                            onChange={handleFullChange}
                            placeholder="https://www.youtube.com/watch?v=…"
                            autoComplete="off"
                        />
                        {fullVideoUrl && (
                            <button
                                type="button"
                                className="pvs-clear-btn"
                                onClick={() => { onFullVideoChange?.(''); setFullError(''); }}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {fullError && (
                        <div className="pvs-error-msg">
                            <AlertCircle size={12} /><span>{fullError}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Preview cards (only shown when a valid ID exists) ── */}
            {(shortId || fullId) && (
                <div className="pvs-previews">
                    {shortId && (
                        <VideoPreviewCard
                            label="Short Video Preview"
                            videoId={shortId}
                            onPlay={() => openModal(shortId, '1 Min Video — Short Walkthrough')}
                        />
                    )}
                    {fullId && (
                        <VideoPreviewCard
                            label="Full Video Preview"
                            videoId={fullId}
                            onPlay={() => openModal(fullId, 'Full Property Walkthrough')}
                        />
                    )}
                </div>
            )}

            {/* ── Video Modal ── */}
            <VideoModal
                isOpen={!!modalVideoId}
                videoId={modalVideoId}
                videoLabel={modalLabel}
                onClose={closeModal}
            />
        </div>
    );
}
