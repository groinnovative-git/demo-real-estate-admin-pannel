import React from 'react';
import { X, MapPin, Bed, Maximize2, Building, Calendar, CheckCircle } from 'lucide-react';

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
    const embedUrl = p.youtubeUrl ? p.youtubeUrl.replace('watch?v=', 'embed/') : null;
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
                    {/* Image */}
                    <img
                        src={p.images?.[0]}
                        alt={p.title}
                        style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 8, marginBottom: 20 }}
                        onError={(e) => { e.target.src = `https://placehold.co/780x240/f1f5f9/f5b642?text=${p.type}`; }}
                    />

                    {/* Location + Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <MapPin size={14} />{p.location}
                            </div>
                            {p.listedDate && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                                    <Calendar size={13} />Listed: {new Date(p.listedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="prop-details-grid">
                        <Detail label="Type" value={TYPE_LABELS[p.type]} />
                        <Detail label="BHK / Bedrooms" value={p.bhk ? `${p.bhk} BHK` : undefined} />
                        <Detail label="Area" value={p.area ? `${p.area} sqft` : undefined} />
                        <Detail label="Plot Area" value={p.plotArea ? `${p.plotArea} sqft` : undefined} />
                        <Detail label="Floor" value={p.floor ? `${p.floor} of ${p.totalFloors}` : undefined} />
                        <Detail label="Furnishing" value={p.furnishing} />
                        <Detail label="Facing" value={p.facing} />
                        <Detail label="Age" value={p.ageYears !== undefined ? `${p.ageYears} year${p.ageYears !== 1 ? 's' : ''}` : undefined} />
                        <Detail label="Maintenance" value={p.maintenance ? `₹${p.maintenance}/month` : undefined} />
                        <Detail label="Parking" value={p.parking ? `${p.parking} slots` : undefined} />
                        <Detail label="Dimensions" value={p.dimensions} />
                        <Detail label="Zone" value={p.zone} />
                        <Detail label="Road Width" value={p.roadWidth} />
                        <Detail label="Space Type" value={p.spaceType} />
                        <Detail label="Cabins" value={p.cabins} />
                        <Detail label="Washrooms" value={p.washrooms} />
                        <Detail label="Power Load" value={p.powerLoad} />
                        <Detail label="Garden" value={p.garden !== undefined ? (p.garden ? 'Yes' : 'No') : undefined} />
                        <Detail label="Swimming Pool" value={p.pool !== undefined ? (p.pool ? 'Yes' : 'No') : undefined} />
                        <Detail label="Corner Plot" value={p.cornerPlot !== undefined ? (p.cornerPlot ? 'Yes' : 'No') : undefined} />
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

                    {embedUrl && (
                        <div style={{ marginTop: 24 }}>
                            <div className="section-label">Property Video</div>
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius)' }}>
                                <iframe
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                    src={embedUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen>
                                </iframe>
                            </div>
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
        </div >
    );
}
