import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, MapPin, Bed, Maximize2, Calendar, CheckCircle } from 'lucide-react';
import VideoPreviewCard from './VideoPreviewCard';
import VideoModal from './VideoModal';
import { extractYouTubeVideoId } from './PropertyVideoSection';
import './PropertyModalPremium.css';

const TYPE_LABELS = {
    apartment: 'Apartment', villa: 'Villa', plot: 'Plot',
    house: 'Individual House', commercial: 'Commercial Space',
    farmland: 'Farm Land', pg: 'PG'
};

function getLatestAuditMeta(property) {
    const createdAt = property.createdAt ? new Date(property.createdAt) : null;
    const updatedAt = property.updatedAt ? new Date(property.updatedAt) : null;

    const hasValidCreated = createdAt && !Number.isNaN(createdAt.getTime());
    const hasValidUpdated = updatedAt && !Number.isNaN(updatedAt.getTime());

    if (hasValidUpdated) {
        return {
            label: 'Updated',
            actor: property.updatedBy || property.createdBy || 'Unknown',
            date: updatedAt,
        };
    }

    if (hasValidCreated) {
        return {
            label: 'Created',
            actor: property.createdBy || 'Unknown',
            date: createdAt,
        };
    }

    return null;
}

function Detail({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--card-border)' }}>
            <div className="pm-field-label">{label}</div>
            <div className="pm-field-value">{value}</div>
        </div>
    );
}

export default function PropertyDetailModal({ property: p, onClose }) {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalStyle; };
    }, []);

    const [modalVideoId, setModalVideoId] = useState(null);
    const [modalLabel, setModalLabel]     = useState('');
    const latestAudit = getLatestAuditMeta(p);

    // Support new fields AND backward-compat with legacy `youtube` field
    const shortId = extractYouTubeVideoId(p.shortVideoUrl || '');
    const fullId  = extractYouTubeVideoId(p.fullVideoUrl || p.youtube || '');

    const hasVideos = shortId || fullId;

    function openModal(videoId, label) { setModalVideoId(videoId); setModalLabel(label); }
    function closeModal()              { setModalVideoId(null);    setModalLabel('');    }

    return ReactDOM.createPortal(
        <div className="pm-overlay" onClick={onClose}>
            <div className="pm-modal" onClick={e => e.stopPropagation()}>
                
                {/* ── Header ──────────────────────────────────────────── */}
                <div className="pm-header">
                    <div className="pm-header-left">
                        <div className="pm-header-title" style={{ fontSize: '1.1rem' }}>{p.title}</div>
                    </div>
                    <div className="pm-header-right">
                        {latestAudit && (
                            <div className="pm-audit-badge">
                                <div className="pm-audit-label">
                                    {latestAudit.label} by {latestAudit.actor}
                                </div>
                                <div className="pm-audit-date">
                                    {latestAudit.date.toLocaleString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        )}
                        <span className={`pm-header-badge ${p.status === 'active' ? 'active-badge' : 'sold-badge'}`}>
                            <span className="pm-dot" />
                            {p.status === 'active' ? 'Active' : 'Sold'}
                        </span>
                        <button className="pm-close" onClick={onClose}>
                            <X size={17} />
                        </button>
                    </div>
                </div>

                {/* ── Top Status Area ─────────────────────────────────── */}
                <div className="pm-status-bar">
                    <span className="pm-status-bar-label">Summary</span>
                    <div className="pm-status-pills">
                        <span className="pm-status-pill" style={{ '--pill-color': '#d49830', '--pill-bg': '#fef3c7', pointerEvents: 'none', background: '#fef3c7', borderWidth: 2, fontWeight: 700 }}>
                            {TYPE_LABELS[p.type] || p.type}
                        </span>
                    </div>
                </div>

                <div className="pm-body">
                    {/* Image Gallery */}
                    {p.images && p.images.length > 0 ? (
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, flexShrink: 0 }}>
                            {p.images.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`${p.title} ${i + 1}`}
                                    style={{ height: 220, minWidth: 320, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--card-border)' }}
                                    onError={(e) => { e.target.src = `https://placehold.co/320x220/f1f5f9/f5b642?text=${p.type}`; }}
                                />
                            ))}
                        </div>
                    ) : (
                        <img
                            src={`https://placehold.co/780x240/f1f5f9/f5b642?text=${p.type}`}
                            alt={p.title}
                            style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                        />
                    )}

                    {/* Location + Listed date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10 }}>
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

                    <div className="pm-section-title">Property Details</div>

                    {/* Details Grid */}
                    <div className="pm-details-grid">
                        <Detail label="Type"           value={TYPE_LABELS[p.type] || p.type} />
                        <Detail label="Price"          value={p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : undefined} />
                        {(p.type === 'apartment' || p.type === 'commercial' || p.type === 'villa' || p.type === 'house') && (
                            <Detail label="Area"           value={p.area ? `${p.area} sqft` : undefined} />
                        )}
                        {(p.type === 'plot' || p.type === 'villa' || p.type === 'house') && (
                            <Detail label="Plot Area"      value={p.plotArea ? `${p.plotArea} sq.yd` : undefined} />
                        )}
                        {(p.type === 'apartment' || p.type === 'villa' || p.type === 'house') && (
                            <Detail label="BHK / Bedrooms" value={p.bhk ? `${p.bhk} BHK` : undefined} />
                        )}
                        {(p.type === 'villa' || p.type === 'house') && (
                            <Detail label="Bathrooms"      value={p.bathrooms} />
                        )}
                        {(p.type === 'commercial') && (
                            <Detail label="Washrooms"      value={p.washrooms} />
                        )}
                        {(p.type === 'apartment' || p.type === 'commercial') && (
                            <Detail label="Floor"          value={p.floor ? `${p.floor}${p.totalFloors ? ` of ${p.totalFloors}` : ''}` : undefined} />
                        )}
                        {(p.type === 'house') && (
                            <Detail label="Total Floors"   value={p.totalFloors} />
                        )}
                        {(p.type === 'apartment' || p.type === 'villa' || p.type === 'house' || p.type === 'commercial') && (
                            <>
                                <Detail label="Furnishing"     value={p.furnishing} />
                                <Detail label="Age"            value={p.ageYears !== undefined ? `${p.ageYears} year${p.ageYears !== 1 ? 's' : ''}` : undefined} />
                            </>
                        )}
                        {(p.type !== 'farmland') && (
                            <Detail label="Facing"         value={p.facing} />
                        )}
                        {(p.type === 'apartment') && (
                            <Detail label="Maintenance"    value={p.maintenance ? `₹${p.maintenance}/month` : undefined} />
                        )}
                        {(p.type === 'commercial') && (
                            <>
                                <Detail label="Sub-Type"       value={p.commercialType} />
                                <Detail label="Floor Details"  value={p.floorDetails} />
                            </>
                        )}
                        {(p.type === 'plot') && (
                            <Detail label="Dimensions"     value={p.plotDimensions} />
                        )}
                        {(p.type === 'farmland') && (
                            <>
                                <Detail label="Total Land Area" value={p.totalLandArea} />
                                <Detail label="Price Per Acre"  value={p.pricePerAcre ? `₹${p.pricePerAcre}` : undefined} />
                                <Detail label="Land Type"       value={p.landType} />
                            </>
                        )}
                        {(p.type === 'pg') && (
                            <>
                                <Detail label="Deposit Amount" value={p.depositAmount ? `${Number(p.depositAmount).toLocaleString('en-IN')}` : undefined} />
                                <Detail label="Available From" value={p.availableFrom ? new Date(p.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined} />
                                <Detail label="Sharing Type" value={p.sharingType} />
                                <Detail label="PG Type" value={p.genderAllowed} />
                                <Detail label="Food Included" value={p.foodIncluded !== '' && p.foodIncluded !== undefined ? (p.foodIncluded ? 'Yes' : 'No') : undefined} />
                                <Detail label="AC / Non-AC" value={p.ac !== '' && p.ac !== undefined ? (p.ac ? 'AC' : 'Non-AC') : undefined} />
                                <Detail label="Attached Bathroom" value={p.attachedBathroom !== '' && p.attachedBathroom !== undefined ? (p.attachedBathroom ? 'Yes' : 'No') : undefined} />
                                <Detail label="Furnished" value={p.furnished !== '' && p.furnished !== undefined ? (p.furnished ? 'Yes' : 'No') : undefined} />
                            </>
                        )}
                        {(p.type !== 'house' && p.type !== 'pg') && (
                            <Detail label="Approval" value={p.govApprovedCertificate || undefined} />
                        )}
                        <Detail label="Loan Support"   value={p.loanSupport !== undefined ? (p.loanSupport ? 'Available' : 'Not Available') : undefined} />
                        {p.loanSupport && <Detail label="Loan Percentage" value={p.loanPercentage ? `${p.loanPercentage}%` : undefined} />}
                    </div>

                    {/* Amenities */}
                    {p.amenities && p.amenities.length > 0 && (
                        <>
                            <div className="pm-section-title" style={{ marginTop: 10 }}>Amenities</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {p.amenities.map(a => (
                                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef3c7', color: 'var(--gold-dark)', padding: '5px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 500, border: '1px solid #fde68a' }}>
                                        <CheckCircle size={13} /> {a}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Video Previews */}
                    {hasVideos && (
                        <div style={{ marginTop: 10 }}>
                            <div className="pm-section-title">Property Videos</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                                {shortId && (
                                    <VideoPreviewCard
                                        label="Short Video"
                                        videoId={shortId}
                                    />
                                )}
                                {fullId && (
                                    <VideoPreviewCard
                                        label="Full Walkthrough"
                                        videoId={fullId}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Google Maps Embed */}
                    {p.mapEmbedSrc && (
                        <div style={{ marginTop: 10 }}>
                            <div className="pm-section-title">Property Location</div>
                            <iframe
                                src={p.mapEmbedSrc}
                                title="Property Location Map"
                                width="100%"
                                height="280"
                                style={{ border: '1px solid var(--card-border)', borderRadius: 12, display: 'block' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    )}

                    {/* Description */}
                    {p.description && (
                        <div style={{ marginTop: 10 }}>
                            <div className="pm-section-title">Description</div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, background: '#f8fafc', padding: '16px', borderRadius: 8, border: '1px solid var(--card-border)' }}>
                                {p.description}
                            </p>
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
        </div>,
        document.body
    );
}
