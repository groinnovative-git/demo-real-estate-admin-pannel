import { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Loader, Upload } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { buildPropertyFormData, getErrorMessage } from '../utils/propertyPayloadMapper';
import { getAmenitiesForType } from '../data/amenitiesByPropertyType';
import { compressImages } from '../utils/imageCompressor';
import PropertyVideoSection from './PropertyVideoSection';
import PropertyLocationEmbed from './PropertyLocationEmbed';
import './PropertyModalPremium.css';


export default function EditPropertyModal({ property, onClose, onSaved }) {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalStyle; };
    }, []);

    const { updateProperty } = useProperties();

    // Dynamic amenity list based on property type
    const currentAmenities = useMemo(() => getAmenitiesForType(property.type), [property.type]);

    // Pre-populate form from the normalised property shape
    const [form, setForm] = useState({
        title:          property.title          || '',
        price:          property.price          ?? '',
        location:       property.location       || '',
        area:           property.area           || '',
        carpetArea:     property.area           || '',   // reuse area as carpetArea for mapper
        builtUpArea:    property.area           || '',
        plotArea:       property.plotArea       || '',
        bhk:            property.bhk            || 2,
        bathrooms:      property.bathrooms      || 2,
        floor:          property.floor          || '',
        totalFloors:    property.totalFloors    || '',
        furnishing:     property.furnishing     || 'Semi-Furnished',
        facing:         property.facing         || 'East',
        ageYears:       property.ageYears       || '',
        maintenance:    property.maintenance    || '',
        washrooms:      property.washrooms      || '',
        commercialType: property.commercialType || 'Office Space',
        plotDimensions: property.plotDimensions || '',
        totalLandArea:  property.totalLandArea  || '',
        pricePerAcre:   property.pricePerAcre   || '',
        floorDetails:   property.floorDetails   || '',
        landType:               property.landType               || '',
        govApprovedCertificate: property.govApprovedCertificate || '',
        status:         property.status         || 'active',
        loanSupport:    property.loanSupport    || false,
        amenities:      Array.isArray(property.amenities) ? [...property.amenities] : [],
        description:    property.description    || '',
        shortVideoUrl:  property.shortVideoUrl  || '',
        fullVideoUrl:   property.fullVideoUrl   || '',
        mapEmbedSrc:    property.mapEmbedSrc    || '',
        images:         Array.isArray(property.images) ? [...property.images] : [],
    });

    const [imageFiles, setImageFiles] = useState([]);
    const fileRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const urls  = files.map(f => URL.createObjectURL(f));
        setForm(f => ({ ...f, images: [...f.images, ...urls] }));
        setImageFiles(prev => [...prev, ...files]);
    };

    const removeImage = (idx) => {
        const imgUrl = form.images[idx];
        const isNewBlob = typeof imgUrl === 'string' && imgUrl.startsWith('blob:');
        setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
        if (isNewBlob) {
            // Count blob URLs before this index to find the correct imageFiles index
            const blobIdx = form.images.slice(0, idx).filter(u => String(u).startsWith('blob:')).length;
            setImageFiles(prev => prev.filter((_, i) => i !== blobIdx));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const toggleAmenity = (a) => {
        setForm(f => {
            const current = f.amenities || [];
            return {
                ...f,
                amenities: current.includes(a)
                    ? current.filter(x => x !== a)
                    : [...current, a],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim())    { setError('Property title is required.'); return; }
        if (!form.price)           { setError('Price is required.'); return; }
        if (!form.location.trim()) { setError('Location is required.'); return; }

        setError('');
        setLoading(true);
        try {
            const compressedFiles = imageFiles.length > 0 ? await compressImages(imageFiles) : [];
            const payload = buildPropertyFormData(form, property.type, compressedFiles, property.id);
            await updateProperty(payload);
            onSaved?.();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="pm-overlay" onClick={onClose}>
            <div className="pm-modal" onClick={e => e.stopPropagation()}>
                <div className="pm-header">
                    <div className="pm-header-left">
                        <div className="pm-header-title">Edit Property</div>
                        <span className="pm-header-id">
                            Update details and media
                        </span>
                    </div>
                    <div className="pm-header-right">
                        <button className="pm-close" onClick={onClose} disabled={loading}>
                            <X size={17} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="pm-form">
                    <div className="pm-body">

                        {error && (
                            <div style={{
                                background: '#fef2f2', color: '#b91c1c',
                                border: '1px solid #fecaca', borderRadius: 8,
                                padding: '10px 14px', marginBottom: 16, fontSize: '0.875rem',
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price (₹) *</label>
                                <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} required />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Location *</label>
                                <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Banjara Hills, Hyderabad" required />
                            </div>
                            
                            {(property.type === 'apartment' || property.type === 'villa' || property.type === 'house' || property.type === 'commercial') && (
                                <div className="form-group">
                                    <label className="form-label">{property.type === 'apartment' ? 'Carpet / Built-up Area (sqft)' : 'Built-up Area (sqft)'}</label>
                                    <input className="form-control" type="number" name="area" value={form.area} onChange={handleChange} />
                                </div>
                            )}

                            {(property.type === 'villa' || property.type === 'plot' || property.type === 'house') && (
                                <div className="form-group">
                                    <label className="form-label">Plot Area (sq.yd)</label>
                                    <input className="form-control" type="number" name="plotArea" value={form.plotArea} onChange={handleChange} />
                                </div>
                            )}

                            {(property.type === 'apartment' || property.type === 'villa' || property.type === 'house') && (
                                <div className="form-group">
                                    <label className="form-label">Bedrooms (BHK)</label>
                                    <select className="form-control" name="bhk" value={form.bhk} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                    </select>
                                </div>
                            )}

                            {(property.type === 'villa' || property.type === 'house') && (
                                <div className="form-group">
                                    <label className="form-label">Bathrooms</label>
                                    <select className="form-control" name="bathrooms" value={form.bathrooms} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            )}

                            {(property.type === 'commercial') && (
                                <div className="form-group">
                                    <label className="form-label">Washrooms</label>
                                    <select className="form-control" name="washrooms" value={form.washrooms} onChange={handleChange}>
                                        <option value="">Select</option>
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            )}

                            {(property.type === 'apartment' || property.type === 'commercial') && (
                                <div className="form-group">
                                    <label className="form-label">Floor No.</label>
                                    <input className="form-control" type="number" name="floor" value={form.floor} onChange={handleChange} />
                                </div>
                            )}

                            {(property.type === 'apartment' || property.type === 'house' || property.type === 'commercial') && (
                                <div className="form-group">
                                    <label className="form-label">Total Floors</label>
                                    <input className="form-control" type="number" name="totalFloors" value={form.totalFloors} onChange={handleChange} />
                                </div>
                            )}

                            {(property.type === 'apartment' || property.type === 'villa' || property.type === 'house' || property.type === 'commercial') && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Furnishing</label>
                                        <select className="form-control" name="furnishing" value={form.furnishing} onChange={handleChange}>
                                            <option value="Unfurnished">Unfurnished</option>
                                            <option value="Semi-Furnished">Semi-Furnished</option>
                                            <option value="Fully Furnished">Fully Furnished</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Age of Property (Years)</label>
                                        <input className="form-control" type="number" name="ageYears" value={form.ageYears} onChange={handleChange} />
                                    </div>
                                </>
                            )}

                            {(property.type !== 'farmland') && (
                                <div className="form-group">
                                    <label className="form-label">Facing Direction</label>
                                    <select className="form-control" name="facing" value={form.facing} onChange={handleChange}>
                                        {['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'].map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                            )}

                            {property.type === 'apartment' && (
                                <div className="form-group">
                                    <label className="form-label">Monthly Maintenance (₹)</label>
                                    <input className="form-control" type="number" name="maintenance" value={form.maintenance} onChange={handleChange} />
                                </div>
                            )}

                            {property.type === 'commercial' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Property Sub-Type</label>
                                        <select className="form-control" name="commercialType" value={form.commercialType} onChange={handleChange}>
                                            {['Shop', 'Office Space', 'Showroom', 'Complex'].map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Floor Details</label>
                                        <input className="form-control" name="floorDetails" value={form.floorDetails} onChange={handleChange} />
                                    </div>
                                </>
                            )}

                            {property.type === 'plot' && (
                                <div className="form-group">
                                    <label className="form-label">Plot Dimensions</label>
                                    <input className="form-control" name="plotDimensions" value={form.plotDimensions} onChange={handleChange} placeholder="e.g. 30x60 ft" />
                                </div>
                            )}

                            {property.type === 'farmland' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Total Land Area</label>
                                        <input className="form-control" name="totalLandArea" value={form.totalLandArea} onChange={handleChange} placeholder="e.g. 5 Acres" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price per Acre (₹)</label>
                                        <input className="form-control" type="number" name="pricePerAcre" value={form.pricePerAcre} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Land Type</label>
                                        <select className="form-control" name="landType" value={form.landType} onChange={handleChange}>
                                            <option value="">Select Land Type</option>
                                            <option>Dry Land</option>
                                            <option>Wet Land</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {(property.type !== 'house') && (
                                <div className="form-group">
                                    <label className="form-label">Approval</label>
                                    <select className="form-control" name="govApprovedCertificate" value={form.govApprovedCertificate} onChange={handleChange}>
                                        <option value="">Select Approval</option>
                                        <option>DTCP Approved</option>
                                        <option>RERA Approved</option>
                                        <option>DTCP &amp; RERA Approved</option>
                                        <option>Not Available</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                                    <option value="active">Active</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Loan Support</label>
                                <div className="loan-toggle-field">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={!!form.loanSupport}
                                        className={`loan-toggle-switch${form.loanSupport ? ' loan-toggle-switch--on' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, loanSupport: !f.loanSupport }))}
                                    >
                                        <span className="loan-toggle-thumb" />
                                    </button>
                                    <span className="loan-toggle-label">
                                        {form.loanSupport ? 'Available' : 'Not Available'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {currentAmenities.length > 0 && (
                            <div className="form-group" style={{ marginTop: 14 }}>
                                <label className="form-label">Amenities</label>
                                <div className="checkbox-group">
                                    {currentAmenities.map(a => (
                                        <label key={a} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={(form.amenities || []).includes(a)}
                                                onChange={() => toggleAmenity(a)}
                                            />
                                            {a}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="form-group" style={{ marginTop: 14 }}>
                            <label className="form-label">Description</label>
                            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
                        </div>

                        {/* ── Images ── */}
                        <div className="form-group" style={{ marginTop: 14 }}>
                            <label className="form-label">Property Images</label>
                            <div
                                className="premium-upload-area"
                                style={{ padding: '16px', cursor: 'pointer', marginBottom: 10 }}
                                onClick={() => fileRef.current.click()}
                            >
                                <Upload size={18} color="#f5b642" style={{ marginBottom: 4 }} />
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Click to add images</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>JPG, PNG or WebP</div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />
                            </div>
                            {form.images.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {form.images.map((img, i) => (
                                        <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                                            <img
                                                src={img}
                                                alt={`img-${i}`}
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--card-border)' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                style={{
                                                    position: 'absolute', top: -6, right: -6,
                                                    background: '#ef4444', color: '#fff',
                                                    border: 'none', borderRadius: '50%',
                                                    width: 18, height: 18, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    padding: 0, lineHeight: 1,
                                                }}
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <PropertyVideoSection
                                shortVideoUrl={form.shortVideoUrl}
                                fullVideoUrl={form.fullVideoUrl}
                                onShortVideoChange={(val) => setForm(f => ({ ...f, shortVideoUrl: val }))}
                                onFullVideoChange={(val) => setForm(f => ({ ...f, fullVideoUrl: val }))}
                            />
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <PropertyLocationEmbed
                                embedSrc={form.mapEmbedSrc}
                                onEmbedChange={(src) => setForm(f => ({ ...f, mapEmbedSrc: src }))}
                            />
                        </div>
                    </div>

                    <div className="pm-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <><Loader size={14} className="spin" /> Saving...</>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
