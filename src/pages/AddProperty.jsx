import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, CheckCircle, Building, TreePine, Landmark, Home, Store } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import './AddProperty.css';

const PROPERTY_CONFIG = {
    apartment: {
        label: 'Apartment',
        icon: Building,
        color: '#f5b642',
        description: 'Residential unit in a multi-storey building',
        fields: ['title', 'bhk', 'floor', 'totalFloors', 'area', 'furnishing', 'facing', 'ageYears', 'maintenance', 'price', 'location', 'amenities', 'youtube', 'description'],
    },
    villa: {
        label: 'Villa',
        icon: TreePine,
        color: '#0d6933',
        description: 'Standalone premium residential villa',
        fields: ['title', 'bhk', 'plotArea', 'area', 'garden', 'pool', 'floors', 'parking', 'price', 'location', 'youtube', 'description'],
    },
    plot: {
        label: 'Plot',
        icon: Landmark,
        color: '#3B82F6',
        description: 'Residential or commercial land parcel',
        fields: ['title', 'area', 'dimensions', 'zone', 'cornerPlot', 'roadWidth', 'price', 'location', 'youtube', 'description'],
    },
    house: {
        label: 'Individual House',
        icon: Home,
        color: '#F59E0B',
        description: 'Independent house with full ownership',
        fields: ['title', 'bhk', 'floors', 'area', 'plotArea', 'parking', 'ageYears', 'price', 'location', 'youtube', 'description'],
    },
    commercial: {
        label: 'Commercial Space',
        icon: Store,
        color: '#A855F7',
        description: 'Office, retail, or warehouse space',
        fields: ['title', 'spaceType', 'area', 'floor', 'totalFloors', 'cabins', 'washrooms', 'powerLoad', 'price', 'location', 'youtube', 'description'],
    },
};

const AMENITY_OPTIONS = ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Club House', 'Power Backup', 'Lift', 'Garden', 'Kids Play Area', 'CCTV', 'Intercom', 'Fire Safety'];

function FieldGroup({ label, children }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {children}
        </div>
    );
}

export default function AddProperty() {
    const { type } = useParams();
    const navigate = useNavigate();
    const { addProperty } = useProperties();
    const { user } = useAuth();
    const fileRef = useRef();

    const config = PROPERTY_CONFIG[type];

    const [form, setForm] = useState({
        type,
        title: '',
        price: '',
        location: '',
        area: '',
        description: '',
        bhk: '2',
        floor: '',
        totalFloors: '',
        furnishing: 'Semi-Furnished',
        facing: 'East',
        ageYears: '',
        maintenance: '',
        plotArea: '',
        garden: false,
        pool: false,
        floors: '',
        parking: '',
        dimensions: '',
        zone: 'Residential',
        cornerPlot: false,
        roadWidth: '',
        spaceType: 'Office',
        cabins: '',
        washrooms: '',
        powerLoad: '',
        amenities: [],
        images: [],
        youtube: '',
    });
    const [submitted, setSubmitted] = useState(false);

    if (!config) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <h2>Invalid property type</h2>
                <button className="btn btn-primary" onClick={() => navigate('/properties')} style={{ marginTop: 16 }}>
                    Go to Properties
                </button>
            </div>
        );
    }

    const Icon = config.icon;
    const fields = config.fields;

    const handleChange = (e) => {
        const { name, value, type: t, checked } = e.target;
        setForm(f => ({ ...f, [name]: t === 'checkbox' ? checked : value }));
    };

    const toggleAmenity = (a) => {
        setForm(f => ({
            ...f,
            amenities: f.amenities.includes(a)
                ? f.amenities.filter(x => x !== a)
                : [...f.amenities, a]
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map(f => URL.createObjectURL(f));
        setForm(f => ({ ...f, images: [...f.images, ...urls] }));
    };

    const removeImage = (idx) => {
        setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const defaultImg = {
            apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
            villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
            plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
            house: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
            commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
        };
        addProperty({
            ...form,
            price: Number(form.price),
            area: Number(form.area),
            images: form.images.length > 0 ? form.images : [defaultImg[type]],
            agent: user?.role || 'admin',
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="add-success fade-in">
                <div className="add-success-card">
                    <CheckCircle size={56} color="var(--success)" />
                    <h2>Property Added Successfully!</h2>
                    <p>Your {config.label} listing has been added to the portfolio.</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>Add Another</button>
                        <button className="btn btn-primary" onClick={() => navigate('/properties')}>View Properties</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="add-property fade-in">
            {/* Header */}
            <div className="add-property-header" style={{ borderColor: config.color + '40' }}>
                <div className="add-property-type-icon" style={{ background: config.color + '20', color: config.color }}>
                    <Icon size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Add {config.label}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 3 }}>{config.description}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="add-property-body">
                    {/* Section: Basic Info */}
                    <div className="card add-section">
                        <h3 className="add-section-title">Basic Information</h3>
                        <div className="grid grid-2">
                            {fields.includes('title') && (
                                <FieldGroup label="Property Title *">
                                    <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder={`e.g. Luxury ${config.label} in Banjara Hills`} required />
                                </FieldGroup>
                            )}
                            {fields.includes('location') && (
                                <FieldGroup label="Location / Address *">
                                    <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="Area, City" required />
                                </FieldGroup>
                            )}
                            {fields.includes('price') && (
                                <FieldGroup label="Price (₹) *">
                                    <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 8500000" required min={1} />
                                </FieldGroup>
                            )}
                            {fields.includes('area') && (
                                <FieldGroup label="Carpet / Built-up Area (sqft) *">
                                    <input className="form-control" type="number" name="area" value={form.area} onChange={handleChange} placeholder="e.g. 1850" required min={1} />
                                </FieldGroup>
                            )}
                            {fields.includes('youtube') && (
                                <FieldGroup label="YouTube Video URL">
                                    <input className="form-control" name="youtube" value={form.youtube} onChange={handleChange} placeholder="e.g. https://www.youtube.com/watch?v=..." />
                                </FieldGroup>
                            )}
                        </div>
                    </div>
                    {/* Section: Property Specific */}
                    <div className="card add-section">
                        <h3 className="add-section-title">Property Details</h3>
                        <div className="grid grid-3">
                            {fields.includes('bhk') && (
                                <FieldGroup label="BHK / Bedrooms">
                                    <select className="form-control" name="bhk" value={form.bhk} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                    </select>
                                </FieldGroup>
                            )}
                            {fields.includes('floor') && (
                                <FieldGroup label="Floor Number">
                                    <input className="form-control" type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="e.g. 5" />
                                </FieldGroup>
                            )}
                            {fields.includes('totalFloors') && (
                                <FieldGroup label="Total Floors">
                                    <input className="form-control" type="number" name="totalFloors" value={form.totalFloors} onChange={handleChange} placeholder="e.g. 12" />
                                </FieldGroup>
                            )}
                            {fields.includes('furnishing') && (
                                <FieldGroup label="Furnishing">
                                    <select className="form-control" name="furnishing" value={form.furnishing} onChange={handleChange}>
                                        <option>Unfurnished</option>
                                        <option>Semi-Furnished</option>
                                        <option>Fully Furnished</option>
                                    </select>
                                </FieldGroup>
                            )}
                            {fields.includes('facing') && (
                                <FieldGroup label="Facing Direction">
                                    <select className="form-control" name="facing" value={form.facing} onChange={handleChange}>
                                        {['East', 'West', 'North', 'South', 'NE', 'NW', 'SE', 'SW'].map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </FieldGroup>
                            )}
                            {fields.includes('ageYears') && (
                                <FieldGroup label="Age of Property (years)">
                                    <input className="form-control" type="number" name="ageYears" value={form.ageYears} onChange={handleChange} placeholder="0 = new" min={0} />
                                </FieldGroup>
                            )}
                            {fields.includes('maintenance') && (
                                <FieldGroup label="Monthly Maintenance (₹)">
                                    <input className="form-control" type="number" name="maintenance" value={form.maintenance} onChange={handleChange} placeholder="e.g. 4500" />
                                </FieldGroup>
                            )}
                            {fields.includes('plotArea') && (
                                <FieldGroup label="Plot Area (sqft)">
                                    <input className="form-control" type="number" name="plotArea" value={form.plotArea} onChange={handleChange} placeholder="e.g. 6000" />
                                </FieldGroup>
                            )}
                            {fields.includes('floors') && (
                                <FieldGroup label="Number of Floors">
                                    <input className="form-control" type="number" name="floors" value={form.floors} onChange={handleChange} placeholder="e.g. 3" />
                                </FieldGroup>
                            )}
                            {fields.includes('parking') && (
                                <FieldGroup label="Parking Slots">
                                    <input className="form-control" type="number" name="parking" value={form.parking} onChange={handleChange} placeholder="e.g. 2" />
                                </FieldGroup>
                            )}
                            {fields.includes('dimensions') && (
                                <FieldGroup label="Plot Dimensions">
                                    <input className="form-control" name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="e.g. 15m x 20m" />
                                </FieldGroup>
                            )}
                            {fields.includes('zone') && (
                                <FieldGroup label="Zone Type">
                                    <select className="form-control" name="zone" value={form.zone} onChange={handleChange}>
                                        <option>Residential</option>
                                        <option>Commercial</option>
                                        <option>Industrial</option>
                                        <option>Mixed Use</option>
                                    </select>
                                </FieldGroup>
                            )}
                            {fields.includes('roadWidth') && (
                                <FieldGroup label="Road Width">
                                    <input className="form-control" name="roadWidth" value={form.roadWidth} onChange={handleChange} placeholder="e.g. 30ft" />
                                </FieldGroup>
                            )}
                            {fields.includes('spaceType') && (
                                <FieldGroup label="Space Type">
                                    <select className="form-control" name="spaceType" value={form.spaceType} onChange={handleChange}>
                                        <option>Office</option>
                                        <option>Retail</option>
                                        <option>Warehouse</option>
                                        <option>Showroom</option>
                                        <option>Restaurant</option>
                                    </select>
                                </FieldGroup>
                            )}
                            {fields.includes('cabins') && (
                                <FieldGroup label="Number of Cabins">
                                    <input className="form-control" type="number" name="cabins" value={form.cabins} onChange={handleChange} placeholder="e.g. 10" />
                                </FieldGroup>
                            )}
                            {fields.includes('washrooms') && (
                                <FieldGroup label="Washrooms">
                                    <input className="form-control" type="number" name="washrooms" value={form.washrooms} onChange={handleChange} placeholder="e.g. 4" />
                                </FieldGroup>
                            )}
                            {fields.includes('powerLoad') && (
                                <FieldGroup label="Power Load">
                                    <input className="form-control" name="powerLoad" value={form.powerLoad} onChange={handleChange} placeholder="e.g. 100KW" />
                                </FieldGroup>
                            )}
                        </div>

                        {/* Boolean fields */}
                        {(fields.includes('garden') || fields.includes('pool') || fields.includes('cornerPlot')) && (
                            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                                {fields.includes('garden') && (
                                    <label className="checkbox-item">
                                        <input type="checkbox" name="garden" checked={form.garden} onChange={handleChange} />
                                        Garden / Lawn
                                    </label>
                                )}
                                {fields.includes('pool') && (
                                    <label className="checkbox-item">
                                        <input type="checkbox" name="pool" checked={form.pool} onChange={handleChange} />
                                        Swimming Pool
                                    </label>
                                )}
                                {fields.includes('cornerPlot') && (
                                    <label className="checkbox-item">
                                        <input type="checkbox" name="cornerPlot" checked={form.cornerPlot} onChange={handleChange} />
                                        Corner Plot
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Amenities (Apartment only) */}
                    {fields.includes('amenities') && (
                        <div className="card add-section">
                            <h3 className="add-section-title">Amenities</h3>
                            <div className="checkbox-group">
                                {AMENITY_OPTIONS.map(a => (
                                    <label key={a} className={`checkbox-item ${form.amenities.includes(a) ? 'selected' : ''}`}>
                                        <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                                        {a}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Images */}
                    <div className="card add-section">
                        <h3 className="add-section-title">Property Images</h3>
                        <div className="image-upload-area" onClick={() => fileRef.current.click()}>
                            <Upload size={28} style={{ marginBottom: 8, color: 'var(--gold)' }} />
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Click to upload images</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP supported</div>
                            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageChange} />
                        </div>
                        {form.images.length > 0 && (
                            <div className="image-previews" style={{ marginTop: 12 }}>
                                {form.images.map((img, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <img src={img} alt="" className="image-preview" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            style={{
                                                position: 'absolute', top: -6, right: -6,
                                                width: 20, height: 20, border: 'none',
                                                borderRadius: '50%', background: 'var(--danger)',
                                                color: '#fff', cursor: 'pointer', fontSize: 12,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="card add-section">
                        <h3 className="add-section-title">Description</h3>
                        <div className="form-group">
                            <textarea
                                className="form-control"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder={`Describe the ${config.label.toLowerCase()} in detail — location highlights, special features, connectivity, nearby landmarks...`}
                                rows={5}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="add-property-submit">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/properties')}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ minWidth: 160 }}>
                        <CheckCircle size={16} />
                        Publish {config.label}
                    </button>
                </div>
            </form>
        </div>
    );
}
