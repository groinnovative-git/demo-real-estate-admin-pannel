import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Upload, X, CheckCircle, Building, MapPin, Navigation,
    Search, Info, Home, Map, Store, Castle, Youtube, AlertCircle
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import './AddProperty.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITY_OPTIONS = [
    'Swimming Pool', 'Gym', 'Security', 'Parking', 'Club House',
    'Power Backup', 'Lift', 'Garden', 'Kids Play Area', 'CCTV',
    'Intercom', 'Fire Safety',
];

const FACING_OPTIONS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

// ─── Per-type configuration ───────────────────────────────────────────────────

const TYPE_CONFIG = {
    apartment: {
        label: 'Apartment',
        icon: Building,
        subtitle: 'Create a premium residential apartment listing for the portfolio.',
        specTitle: 'Apartment Specifications',
        successMsg: 'Apartment Listed Successfully!',
        successSub: 'The apartment has been securely added to your premium portfolio.',
        publishLabel: 'Publish Apartment Listing',
        defaultImg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
        theme: {
            heroBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #fef9c3 100%)',
            border: '#a7f3d0',
            iconBg: 'linear-gradient(150deg, #052e16 0%, #0d6933 42%, #22c55e 100%)',
            iconGlow: 'rgba(13, 105, 51, 0.55)',
            accentColor: '#0d6933',
            accentBg: 'rgba(13, 105, 51, 0.09)',
            accentBorder: 'rgba(13, 105, 51, 0.22)',
            watermark: '#0d6933',
        },
        fields: {
            carpetArea: true,
            bhk: true,
            floor: true,
            totalFloors: true,
            furnishing: true,
            facing: true,
            ageYears: true,
            maintenance: true,
            amenities: true,
        },
    },
    villa: {
        label: 'Villa',
        icon: Castle,
        subtitle: 'Create a luxury villa listing for the premium portfolio.',
        specTitle: 'Villa Specifications',
        successMsg: 'Villa Listed Successfully!',
        successSub: 'The villa has been securely added to your premium portfolio.',
        publishLabel: 'Publish Villa Listing',
        defaultImg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
        theme: {
            heroBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 85%, #fff7ed 100%)',
            border: '#fcd34d',
            iconBg: 'linear-gradient(150deg, #431407 0%, #b45309 42%, #fbbf24 100%)',
            iconGlow: 'rgba(180, 83, 9, 0.55)',
            accentColor: '#92400e',
            accentBg: 'rgba(180, 83, 9, 0.08)',
            accentBorder: 'rgba(180, 83, 9, 0.22)',
            watermark: '#b45309',
        },
        fields: {
            plotArea: true,
            builtUpArea: true,
            bhk: true,
            bathrooms: true,
            furnishing: true,
            facing: true,
            ageYears: true,
            parking: true,
            amenities: true,
        },
    },
    plot: {
        label: 'Plot',
        icon: Map,
        subtitle: 'Create a plot / land listing for the portfolio.',
        specTitle: 'Plot Specifications',
        successMsg: 'Plot Listed Successfully!',
        successSub: 'The plot has been added to your portfolio.',
        publishLabel: 'Publish Plot Listing',
        defaultImg: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
        theme: {
            heroBg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #a7f3d0 80%, #ecfdf5 100%)',
            border: '#5eead4',
            iconBg: 'linear-gradient(150deg, #042f2e 0%, #0f766e 42%, #2dd4bf 100%)',
            iconGlow: 'rgba(15, 118, 110, 0.55)',
            accentColor: '#0f766e',
            accentBg: 'rgba(15, 118, 110, 0.08)',
            accentBorder: 'rgba(15, 118, 110, 0.22)',
            watermark: '#0f766e',
        },
        fields: {
            plotArea: true,
            facing: true,
            plotDimensions: true,
            approvalDetails: true,
            amenities: false,
        },
    },
    house: {
        label: 'Individual House',
        icon: Home,
        subtitle: 'Create an individual house / bungalow listing for the portfolio.',
        specTitle: 'House Specifications',
        successMsg: 'House Listed Successfully!',
        successSub: 'The house has been securely added to your premium portfolio.',
        publishLabel: 'Publish House Listing',
        defaultImg: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
        theme: {
            heroBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 80%, #f0f9ff 100%)',
            border: '#93c5fd',
            iconBg: 'linear-gradient(150deg, #0f172a 0%, #1d4ed8 42%, #93c5fd 100%)',
            iconGlow: 'rgba(29, 78, 216, 0.55)',
            accentColor: '#1d4ed8',
            accentBg: 'rgba(29, 78, 216, 0.08)',
            accentBorder: 'rgba(29, 78, 216, 0.20)',
            watermark: '#1d4ed8',
        },
        fields: {
            plotArea: true,
            builtUpArea: true,
            bhk: true,
            bathrooms: true,
            totalFloors: true,
            furnishing: true,
            facing: true,
            ageYears: true,
            parking: true,
            amenities: true,
        },
    },
    commercial: {
        label: 'Commercial Space',
        icon: Store,
        subtitle: 'Create a commercial property listing for the portfolio.',
        specTitle: 'Commercial Specifications',
        successMsg: 'Commercial Space Listed Successfully!',
        successSub: 'The commercial property has been added to your portfolio.',
        publishLabel: 'Publish Commercial Listing',
        defaultImg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
        theme: {
            heroBg: 'linear-gradient(135deg, #f6fef9 0%, #d1fae5 45%, #fef3c7 85%, #fffbeb 100%)',
            border: '#6ee7b7',
            iconBg: 'linear-gradient(150deg, #022c22 0%, #065f46 42%, #34d399 100%)',
            iconGlow: 'rgba(6, 95, 70, 0.55)',
            accentColor: '#065f46',
            accentBg: 'rgba(6, 95, 70, 0.08)',
            accentBorder: 'rgba(6, 95, 70, 0.22)',
            watermark: '#065f46',
        },
        fields: {
            builtUpArea: true,
            commercialType: true,
            floor: true,
            totalFloors: true,
            furnishing: true,
            parking: true,
            washrooms: true,
            ageYears: true,
            amenities: false,
        },
    },
};

// ─── Required fields per property type ───────────────────────────────────────
// Each entry = { key: form field name, label: human-readable name shown in toast }

const REQUIRED_FIELDS = {
    apartment: [
        { key: 'title',       label: 'Property Title' },
        { key: 'price',       label: 'Asking Price' },
        { key: 'locationText', label: 'Location / Address' },
        { key: 'carpetArea',  label: 'Carpet / Built-up Area' },
    ],
    villa: [
        { key: 'title',       label: 'Property Title' },
        { key: 'price',       label: 'Asking Price' },
        { key: 'locationText', label: 'Location / Address' },
        { key: 'plotArea',    label: 'Plot Area' },
    ],
    plot: [
        { key: 'title',       label: 'Property Title' },
        { key: 'price',       label: 'Asking Price' },
        { key: 'locationText', label: 'Location / Address' },
        { key: 'plotArea',    label: 'Plot Area' },
    ],
    house: [
        { key: 'title',       label: 'Property Title' },
        { key: 'price',       label: 'Asking Price' },
        { key: 'locationText', label: 'Location / Address' },
        { key: 'plotArea',    label: 'Plot Area' },
    ],
    commercial: [
        { key: 'title',       label: 'Property Title' },
        { key: 'price',       label: 'Asking Price' },
        { key: 'locationText', label: 'Location / Address' },
        { key: 'builtUpArea', label: 'Built-up Area' },
    ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract YouTube video ID from watch, share, or embed URLs */
function getYoutubeId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function FieldGroup({ label, children }) {
    return (
        <div className="form-group">
            <label className="premium-label">{label}</label>
            {children}
        </div>
    );
}

/** Floating toast — auto-dismisses after 3.5 s */
function Toast({ message, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [message, onClose]);

    return (
        <div className="ap-toast">
            <AlertCircle size={18} className="ap-toast-icon" />
            <span className="ap-toast-msg">{message}</span>
            <button type="button" className="ap-toast-close" onClick={onClose}>
                <X size={14} />
            </button>
        </div>
    );
}

/** Floating sparkle particles — CSS-only, no JS randomness */
const PARTICLES = [
    { x: '6%',  y: '28%', s: 16, delay: '0s',    dur: '2.2s' },
    { x: '13%', y: '65%', s: 11, delay: '0.4s',  dur: '1.9s' },
    { x: '20%', y: '40%', s: 20, delay: '0.9s',  dur: '2.5s' },
    { x: '30%', y: '74%', s: 12, delay: '0.2s',  dur: '2.0s' },
    { x: '39%', y: '20%', s: 17, delay: '1.3s',  dur: '1.8s' },
    { x: '47%', y: '58%', s: 13, delay: '0.6s',  dur: '2.3s' },
    { x: '56%', y: '32%', s: 20, delay: '0.1s',  dur: '2.1s' },
    { x: '63%', y: '70%', s: 11, delay: '1.0s',  dur: '2.4s' },
    { x: '71%', y: '24%', s: 18, delay: '0.5s',  dur: '2.0s' },
    { x: '78%', y: '52%', s: 12, delay: '1.5s',  dur: '1.9s' },
    { x: '85%', y: '76%', s: 16, delay: '0.8s',  dur: '2.3s' },
    { x: '91%', y: '36%', s: 14, delay: '0.3s',  dur: '1.7s' },
];

function ParticleField() {
    return (
        <div className="ap-hero-particles" aria-hidden="true">
            {PARTICLES.map((p, i) => (
                <span
                    key={i}
                    className="ap-hero-particle"
                    style={{
                        left: p.x,
                        top: p.y,
                        width: p.s,
                        height: p.s,
                        animationDelay: p.delay,
                        animationDuration: p.dur,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddProperty() {
    const navigate = useNavigate();
    const { type = 'apartment' } = useParams();
    const { addProperty } = useProperties();
    const { user } = useAuth();
    const fileRef = useRef();

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.apartment;
    const { fields } = config;
    const TypeIcon = config.icon;

    const [form, setForm] = useState({
        title: '',
        price: '',
        locationText: '',
        // Area fields
        carpetArea: '',
        plotArea: '',
        builtUpArea: '',
        // Bedroom / bathroom
        bhk: '2',
        bathrooms: '2',
        // Building
        floor: '',
        totalFloors: '',
        // Property details
        furnishing: 'Semi-Furnished',
        facing: 'East',
        ageYears: '',
        maintenance: '',
        parking: 'Covered',
        washrooms: '',
        commercialType: 'Office Space',
        plotDimensions: '',
        approvalDetails: '',
        // Extras
        amenities: [],
        images: [],
        youtube: '',
        description: '',
        // Map
        lat: '17.3850',
        lng: '78.4867',
    });

    const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '' });

    const showToast = (message) => setToast({ visible: true, message });
    const closeToast = () => setToast({ visible: false, message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const toggleAmenity = (a) => {
        setForm(f => ({
            ...f,
            amenities: f.amenities.includes(a)
                ? f.amenities.filter(x => x !== a)
                : [...f.amenities, a],
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

    const simulateMapClick = () => {
        const randomLat = (17 + Math.random() * 0.5).toFixed(4);
        const randomLng = (78 + Math.random() * 0.5).toFixed(4);
        setForm(f => ({
            ...f,
            lat: randomLat,
            lng: randomLng,
            locationText: f.locationText || 'Hyderabad, Telangana',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Custom validation — show toast for first missing required field
        const requiredFields = REQUIRED_FIELDS[type] || REQUIRED_FIELDS.apartment;
        for (const { key, label } of requiredFields) {
            if (!form[key] || String(form[key]).trim() === '') {
                showToast(`${label} is required`);
                return;
            }
        }

        const primaryArea = fields.carpetArea
            ? form.carpetArea
            : fields.builtUpArea
            ? form.builtUpArea
            : form.plotArea;
        addProperty({
            ...form,
            type,
            price: Number(form.price),
            area: Number(primaryArea) || 0,
            images: form.images.length > 0 ? form.images : [config.defaultImg],
            agent: user?.role || 'admin',
        });
        setSubmitted(true);
    };

    // ─── Success screen ──────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="add-success fade-in">
                <div className="add-success-card">
                    <div className="success-icon-ring">
                        <CheckCircle size={48} color="#0d6933" />
                    </div>
                    <h2 className="success-title">{config.successMsg}</h2>
                    <p className="success-sub">{config.successSub}</p>
                    <div className="success-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setSubmitted(false);
                                setForm(f => ({ ...f, title: '', price: '', images: [], description: '' }));
                            }}
                        >
                            Add Another {config.label}
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ background: '#0d6933', borderColor: '#0d6933' }}
                            onClick={() => navigate('/properties')}
                        >
                            View Properties
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Form ────────────────────────────────────────────────────────────────

    return (
        <div className="add-property fade-in" style={{ paddingBottom: 60 }}>

            {/* Validation Toast */}
            {toast.visible && <Toast message={toast.message} onClose={closeToast} />}

            {/* ── Premium Hero Header ─────────────────────────────────── */}
            <div
                className="ap-hero-header"
                style={{
                    background: config.theme.heroBg,
                    borderColor: config.theme.border,
                    boxShadow: `0 1px 0 0 rgba(255,255,255,0.9) inset, 0 6px 32px -6px ${config.theme.iconGlow}`,
                }}
            >
                {/* Floating sparkle particles */}
                <ParticleField />

                {/* Decorative watermark icon */}
                <div
                    className="ap-hero-watermark"
                    aria-hidden="true"
                    style={{ color: config.theme.watermark }}
                >
                    <TypeIcon size={160} />
                </div>

                <div className="ap-hero-content">
                    {/* Icon tile */}
                    <div
                        className="ap-hero-icon-wrap"
                        style={{
                            background: config.theme.iconBg,
                            boxShadow: [
                                `0 18px 44px -6px ${config.theme.iconGlow}`,
                                `0 6px 16px -2px ${config.theme.iconGlow}`,
                                `0 0 0 1.5px rgba(255,255,255,0.22) inset`,
                                `0 2px 0 rgba(255,255,255,0.55) inset`,
                                `0 -1px 0 rgba(0,0,0,0.18) inset`,
                            ].join(', '),
                        }}
                    >
                        <TypeIcon size={34} className="ap-hero-icon" />
                    </div>

                    {/* Text block */}
                    <div className="ap-hero-text">
                        <span
                            className="ap-hero-badge"
                            style={{
                                background: config.theme.accentBg,
                                color: config.theme.accentColor,
                                border: `1px solid ${config.theme.accentBorder}`,
                            }}
                        >
                            {config.label}
                        </span>
                        <h1 className="ap-hero-title">Add New {config.label}</h1>
                        <p className="ap-hero-subtitle">{config.subtitle}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="premium-form-container" noValidate>

                {/* ── Section 1: Basic Details ─────────────────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <Info size={18} color="#0d6933" />
                        <h3 className="premium-section-title">Basic Details</h3>
                    </div>
                    <div className="grid grid-2">
                        <FieldGroup label="Property Title *">
                            <input
                                className="premium-input"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder={`e.g. Premium ${config.label} in Banjara Hills`}
                            />
                        </FieldGroup>
                        <FieldGroup label="Asking Price (₹) *">
                            <input
                                className="premium-input"
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="e.g. 15000000"
                                min={1}
                            />
                        </FieldGroup>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <FieldGroup label="Location / Address *">
                                <input
                                    className="premium-input"
                                    name="locationText"
                                    value={form.locationText}
                                    onChange={handleChange}
                                    placeholder="e.g. Banjara Hills, Road No. 12, Hyderabad"
                                />
                            </FieldGroup>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Property Specifications ──────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <TypeIcon size={18} color="#0d6933" />
                        <h3 className="premium-section-title">{config.specTitle}</h3>
                    </div>
                    <div className="grid grid-3">

                        {fields.carpetArea && (
                            <FieldGroup label="Carpet / Built-up Area (sq.ft) *">
                                <input className="premium-input" type="number" name="carpetArea" value={form.carpetArea} onChange={handleChange} placeholder="e.g. 1850" min={1} />
                            </FieldGroup>
                        )}

                        {fields.plotArea && (
                            <FieldGroup label={type === 'plot' ? 'Plot Area (sq.yd) *' : 'Plot Area (sq.yd)'}>
                                <input className="premium-input" type="number" name="plotArea" value={form.plotArea} onChange={handleChange} placeholder="e.g. 200" min={1} />
                            </FieldGroup>
                        )}

                        {fields.builtUpArea && (
                            <FieldGroup label="Built-up Area (sq.ft)">
                                <input className="premium-input" type="number" name="builtUpArea" value={form.builtUpArea} onChange={handleChange} placeholder="e.g. 2400" min={1} />
                            </FieldGroup>
                        )}

                        {fields.bhk && (
                            <FieldGroup label="Bedrooms (BHK)">
                                <select className="premium-input" name="bhk" value={form.bhk} onChange={handleChange}>
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                </select>
                            </FieldGroup>
                        )}

                        {fields.bathrooms && (
                            <FieldGroup label="Bathrooms">
                                <select className="premium-input" name="bathrooms" value={form.bathrooms} onChange={handleChange}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </FieldGroup>
                        )}

                        {fields.floor && (
                            <FieldGroup label="Floor Number">
                                <input className="premium-input" type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="e.g. 5" min={0} />
                            </FieldGroup>
                        )}

                        {fields.totalFloors && (
                            <FieldGroup label="Total Floors in Building">
                                <input className="premium-input" type="number" name="totalFloors" value={form.totalFloors} onChange={handleChange} placeholder="e.g. 12" min={1} />
                            </FieldGroup>
                        )}

                        {fields.furnishing && (
                            <FieldGroup label="Furnishing Status">
                                <select className="premium-input" name="furnishing" value={form.furnishing} onChange={handleChange}>
                                    <option>Unfurnished</option>
                                    <option>Semi-Furnished</option>
                                    <option>Fully Furnished</option>
                                </select>
                            </FieldGroup>
                        )}

                        {fields.facing && (
                            <FieldGroup label="Facing Direction">
                                <select className="premium-input" name="facing" value={form.facing} onChange={handleChange}>
                                    {FACING_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </FieldGroup>
                        )}

                        {fields.ageYears && (
                            <FieldGroup label="Age of Property (Years)">
                                <input className="premium-input" type="number" name="ageYears" value={form.ageYears} onChange={handleChange} placeholder="0 = Brand New" min={0} />
                            </FieldGroup>
                        )}

                        {fields.maintenance && (
                            <FieldGroup label="Monthly Maintenance (₹)">
                                <input className="premium-input" type="number" name="maintenance" value={form.maintenance} onChange={handleChange} placeholder="e.g. 6000" min={0} />
                            </FieldGroup>
                        )}

                        {fields.parking && (
                            <FieldGroup label="Parking">
                                <select className="premium-input" name="parking" value={form.parking} onChange={handleChange}>
                                    <option>None</option>
                                    <option>Open</option>
                                    <option>Covered</option>
                                    <option>Multi-Level</option>
                                </select>
                            </FieldGroup>
                        )}

                        {fields.washrooms && (
                            <FieldGroup label="Washrooms">
                                <select className="premium-input" name="washrooms" value={form.washrooms} onChange={handleChange}>
                                    <option value="">Select</option>
                                    {[1, 2, 3, 4, '5+'].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </FieldGroup>
                        )}

                        {fields.commercialType && (
                            <FieldGroup label="Commercial Type">
                                <select className="premium-input" name="commercialType" value={form.commercialType} onChange={handleChange}>
                                    {['Office Space', 'Retail Shop', 'Showroom', 'Warehouse', 'Industrial Unit', 'Co-working Space'].map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </FieldGroup>
                        )}

                        {fields.plotDimensions && (
                            <FieldGroup label="Plot Dimensions">
                                <input className="premium-input" name="plotDimensions" value={form.plotDimensions} onChange={handleChange} placeholder="e.g. 30×60 ft" />
                            </FieldGroup>
                        )}

                        {fields.approvalDetails && (
                            <FieldGroup label="Approval / Registration">
                                <input className="premium-input" name="approvalDetails" value={form.approvalDetails} onChange={handleChange} placeholder="e.g. HMDA Approved, Clear Title" />
                            </FieldGroup>
                        )}

                    </div>
                </div>

                {/* ── Section 3: Amenities (type-dependent) ───────────────── */}
                {fields.amenities && (
                    <div className="card premium-form-section">
                        <div className="premium-section-header">
                            <CheckCircle size={18} color="#0d6933" />
                            <h3 className="premium-section-title">Premium Amenities</h3>
                        </div>
                        <div className="premium-checkbox-grid">
                            {AMENITY_OPTIONS.map(a => (
                                <label
                                    key={a}
                                    className={`premium-checkbox-pill ${form.amenities.includes(a) ? 'active' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.amenities.includes(a)}
                                        onChange={() => toggleAmenity(a)}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="pill-indicator"></div>
                                    {a}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Section 4: Property Images ───────────────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <Upload size={18} color="#0d6933" />
                        <h3 className="premium-section-title">Property Images</h3>
                    </div>
                    <div className="premium-upload-area" onClick={() => fileRef.current.click()}>
                        <div className="upload-icon-circle">
                            <Upload size={24} color="#f5b642" />
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: 16 }}>
                            Click or Drag Images Here
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 6, fontWeight: 500 }}>
                            JPG, PNG or WebP — multiple files allowed
                        </div>
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
                        <div className="premium-image-gallery">
                            {form.images.map((img, i) => (
                                <div key={i} className="gallery-thumbnail">
                                    <img src={img} alt={`Upload ${i + 1}`} />
                                    <button
                                        type="button"
                                        className="btn-remove-image"
                                        onClick={() => removeImage(i)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Section 5: YouTube Walkthrough ───────────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <Youtube size={18} color="#EF4444" />
                        <h3 className="premium-section-title">YouTube Walkthrough <span className="yt-optional-badge">Optional</span></h3>
                    </div>
                    <FieldGroup label="YouTube Video URL">
                        <input
                            className="premium-input"
                            name="youtube"
                            value={form.youtube}
                            onChange={handleChange}
                            placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        />
                    </FieldGroup>
                    {getYoutubeId(form.youtube) && (
                        <div className="yt-embed-wrapper">
                            <iframe
                                src={`https://www.youtube.com/embed/${getYoutubeId(form.youtube)}`}
                                title="Property Walkthrough"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="yt-embed-frame"
                            />
                        </div>
                    )}
                </div>

                {/* ── Section 7: Description ───────────────────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <Info size={18} color="#0d6933" />
                        <h3 className="premium-section-title">Description</h3>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <textarea
                            className="premium-input"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder={`Describe this ${config.label.toLowerCase()} — highlight key features, nearby landmarks, connectivity, and unique selling points...`}
                            rows={6}
                        />
                    </div>
                </div>

                {/* ── Section 6: Google Map Location Picker ────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header" style={{ marginBottom: 6 }}>
                        <MapPin size={18} color="#0d6933" />
                        <h3 className="premium-section-title">Property Location</h3>
                    </div>
                    <p className="map-hint-text">
                        Search for an address or click the map to pin the exact property location.
                        Coordinates are stored for backend / map integration.
                    </p>

                    {/* Search bar */}
                    <div className="map-search-bar">
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            className="map-search-input"
                            placeholder="Search address, neighborhood, or landmark..."
                            name="locationText"
                            value={form.locationText}
                            onChange={handleChange}
                        />
                        <button type="button" className="btn-locate-me" onClick={simulateMapClick}>
                            <Navigation size={16} />
                            Locate Me
                        </button>
                    </div>

                    {/*
                     * MAP CONTAINER
                     * To integrate Google Maps API:
                     *   1. Install: npm install @react-google-maps/api
                     *   2. Wrap app with <LoadScript googleMapsApiKey="YOUR_KEY">
                     *   3. Replace this div with <GoogleMap> + <Marker> components
                     *   4. Use onClick event to capture lat/lng and update form state
                     */}
                    <div className="map-view-container" onClick={simulateMapClick}>
                        <div className="map-background mock-google-map">
                            <div className="map-overlay-instructions">
                                Click anywhere on the map to pin the exact property location
                            </div>
                            {form.lat && (
                                <div className="map-marker-pin" style={{ top: '50%', left: '50%' }}>
                                    <div className="marker-bounce">
                                        <MapPin size={32} color="#EF4444" fill="#EF4444" style={{ stroke: '#ffffff', strokeWidth: 1.5 }} />
                                    </div>
                                    <div className="marker-shadow"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coordinates preview */}
                    <div className="map-coordinates-grid">
                        <div className="coord-box">
                            <span className="coord-label">Selected Address</span>
                            <span className="coord-value">{form.locationText || 'No address selected'}</span>
                        </div>
                        <div className="coord-box">
                            <span className="coord-label">Latitude</span>
                            <span className="coord-value">{form.lat || '—'}</span>
                        </div>
                        <div className="coord-box">
                            <span className="coord-label">Longitude</span>
                            <span className="coord-value">{form.lng || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* ── Actions ──────────────────────────────────────────────── */}
                <div className="premium-form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/properties')}
                        style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 700 }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            padding: '14px 36px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            background: '#0d6933',
                            borderColor: '#0d6933',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <CheckCircle size={20} />
                        {config.publishLabel}
                    </button>
                </div>

            </form>
        </div>
    );
}
