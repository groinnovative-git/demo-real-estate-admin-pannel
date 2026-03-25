import { useState } from 'react';
import { X, MapPin, Bed, Maximize2, Calendar, CheckCircle } from 'lucide-react';
import VideoPreviewCard from './VideoPreviewCard';
import VideoModal from './VideoModal';
import { extractYouTubeVideoId } from './PropertyVideoSection';

const TYPE_LABELS = {
    apartment: 'Apartment', villa: 'Villa', plot: 'Plot',
    house: 'Individual House', commercial: 'Commercial Space',
};

function Detail({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="prop-detail-item">
            <span className="prop-detail-label">{label}</span>
            <span className="prop-detail-value">{value}</span>
        </div>
    );
}

export default function PropertyDetailModal({ property: p, onClose }) {
    const [modalVideoId, setModalVideoId] = useState(null);
    const [modalLabel, setModalLabel]     = useState('');

    // Support new fields AND backward-compat with legacy `youtube` field
    const shortId = extractYouTubeVideoId(p.shortVideoUrl || '');
    const fullId  = extractYouTubeVideoId(p.fullVideoUrl || p.youtube || '');

    const hasVideos = shortId || fullId;

    function openModal(videoId, label) { setModalVideoId(videoId); setModalLabel(label); }
    function closeModal()              { setModalVideoId(null);    setModalLabel('');    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 780 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{ fontSize: '1.1rem' }}>{p.title}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span className="badge badge-gold">{TYPE_LABELS[p.type]}</span>
                            <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                {p.status === 'active' ? 'Active' : 'Sold'}
                            </span>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {/* Image Gallery */}
                    {p.images && p.images.length > 0 ? (
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
                            {p.images.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`${p.title} ${i + 1}`}
                                    style={{ height: 220, minWidth: 320, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                                    onError={(e) => { e.target.src = `https://placehold.co/320x220/f1f5f9/f5b642?text=${p.type}`; }}
                                />
                            ))}
                        </div>
                    ) : (
                        <img
                            src={`https://placehold.co/780x240/f1f5f9/f5b642?text=${p.type}`}
                            alt={p.title}
                            style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 8, marginBottom: 20 }}
                        />
                    )}

                    {/* Location + Listed date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            {p.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <MapPin size={14} />{p.location}
                                </div>
                            )}
                            {p.listedDate && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                                    <Calendar size={13} />Listed: {new Date(p.listedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="prop-details-grid">
                        <Detail label="Type"           value={TYPE_LABELS[p.type]} />
                        <Detail label="BHK / Bedrooms" value={p.bhk ? `${p.bhk} BHK` : undefined} />
                        <Detail label="Area"           value={p.area ? `${p.area} sqft` : undefined} />
                        <Detail label="Plot Area"      value={p.plotArea ? `${p.plotArea} sqft` : undefined} />
                        <Detail label="Floor"          value={p.floor ? `${p.floor} of ${p.totalFloors}` : undefined} />
                        <Detail label="Furnishing"     value={p.furnishing} />
                        <Detail label="Facing"         value={p.facing} />
                        <Detail label="Age"            value={p.ageYears !== undefined ? `${p.ageYears} year${p.ageYears !== 1 ? 's' : ''}` : undefined} />
                        <Detail label="Maintenance"    value={p.maintenance ? `₹${p.maintenance}/month` : undefined} />
                        <Detail label="Dimensions"     value={p.dimensions} />
                        <Detail label="Zone"           value={p.zone} />
                        <Detail label="Road Width"     value={p.roadWidth} />
                        <Detail label="Space Type"     value={p.spaceType} />
                        <Detail label="Cabins"         value={p.cabins} />
                        <Detail label="Washrooms"      value={p.washrooms} />
                        <Detail label="Power Load"     value={p.powerLoad} />
                        <Detail label="Garden"         value={p.garden !== undefined ? (p.garden ? 'Yes' : 'No') : undefined} />
                        <Detail label="Swimming Pool"  value={p.pool !== undefined ? (p.pool ? 'Yes' : 'No') : undefined} />
                        <Detail label="Corner Plot"    value={p.cornerPlot !== undefined ? (p.cornerPlot ? 'Yes' : 'No') : undefined} />
                        <Detail label="Loan Support"   value={p.loanSupport !== undefined ? (p.loanSupport ? 'Available' : 'Not Available') : undefined} />
                    </div>

                    {/* Amenities */}
                    {p.amenities && p.amenities.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amenities</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {p.amenities.map(a => (
                                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef3c7', color: 'var(--gold-dark)', padding: '4px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 500 }}>
                                        <CheckCircle size={12} /> {a}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Video Previews */}
                    {hasVideos && (
                        <div style={{ marginTop: 24 }}>
                            <div className="section-label" style={{ marginBottom: 10 }}>Property Videos</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                                {shortId && (
                                    <VideoPreviewCard
                                        label="Short Video"
                                        videoId={shortId}
                                        onPlay={() => openModal(shortId, '1 Min Video — Short Walkthrough')}
                                    />
                                )}
                                {fullId && (
                                    <VideoPreviewCard
                                        label="Full Walkthrough"
                                        videoId={fullId}
                                        onPlay={() => openModal(fullId, 'Full Property Walkthrough')}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Google Maps Embed */}
                    {p.mapEmbedSrc && (
                        <div style={{ marginTop: 24 }}>
                            <div className="section-label" style={{ marginBottom: 10 }}>Property Location</div>
                            <iframe
                                src={p.mapEmbedSrc}
                                title="Property Location Map"
                                width="100%"
                                height="280"
                                style={{ border: 0, borderRadius: 8, display: 'block' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    )}

                    {/* Description */}
                    {p.description && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Modal — fixed overlay, above the detail modal */}
            <VideoModal
                isOpen={!!modalVideoId}
                videoId={modalVideoId}
                videoLabel={modalLabel}
                onClose={closeModal}
            />

            <style>{`
        .prop-details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .prop-detail-item {
          background: #f8f9fa;
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .prop-detail-label {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 3px;
        }
        .prop-detail-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        @media (max-width: 600px) {
          .prop-details-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
        </div>
    );
}
