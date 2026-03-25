import { Play } from 'lucide-react';
import './property-video-section.css';

export default function VideoPreviewCard({ label, videoId, onPlay }) {
    const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

    return (
        <div className="pvs-preview-card" onClick={onPlay} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(); } }}
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
