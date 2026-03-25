import { useEffect } from 'react';
import { X } from 'lucide-react';
import './property-video-section.css';

export default function VideoModal({ isOpen, videoId, videoLabel, onClose }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen || !videoId) return null;

    return (
        <div className="pvs-modal-overlay" onClick={onClose}>
            <div className="pvs-modal" onClick={e => e.stopPropagation()}>
                <div className="pvs-modal-header">
                    <span className="pvs-modal-label">{videoLabel}</span>
                    <button type="button" className="pvs-modal-close" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="pvs-modal-video-wrap">
                    {/* key forces iframe remount (stops old video) each time videoId changes */}
                    <iframe
                        key={videoId}
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                        title={videoLabel}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="pvs-modal-iframe"
                    />
                </div>
            </div>
        </div>
    );
}
