import { useState } from 'react';
import { Play } from 'lucide-react';
import './property-video-section.css';

export default function VideoPreviewCard({ label, videoId, onPlay }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

    const handlePlay = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsPlaying(true);
        if (onPlay) onPlay(); // Still trigger parent if needed, though we handle it inline now
    };

    if (isPlaying) {
        return (
            <div className="pvs-preview-card" style={{ padding: 0, overflow: 'hidden' }}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={label}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', minHeight: '180px', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className="pvs-preview-card" onClick={handlePlay} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePlay(e); }}
        >
            <div className="pvs-thumb-wrap">
                <img
                    src={thumbnail}
                    alt={label}
                    className="pvs-thumb"
                    onError={e => { e.target.src = 'https://placehold.co/320x180/1a1a2e/f5b642?text=Video+Preview'; }}
                />
                <div className="pvs-play-overlay">
                    <div className="pvs-play-btn">
                        <Play size={20} fill="#fff" color="#fff" />
                    </div>
                </div>
            </div>
            <div className="pvs-preview-info">
                <span className="pvs-preview-label">{label}</span>
                <span className="pvs-preview-action">Click to play</span>
            </div>
        </div>
    );
}
