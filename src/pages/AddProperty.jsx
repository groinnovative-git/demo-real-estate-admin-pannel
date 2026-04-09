import { useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Upload, X, CheckCircle, Building,
    Info, Home, Map, Store, Castle, Leaf, MapPin, Bed
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { buildPropertyFormData, getErrorMessage } from '../utils/propertyPayloadMapper';
import { getAmenitiesForType } from '../data/amenitiesByPropertyType';
import { compressImages } from '../utils/imageCompressor';
import PropertyLocationEmbed from '../components/PropertyLocationEmbed';
import PropertyVideoSection from '../components/PropertyVideoSection';
import Toast from '../components/Toast';
import './AddProperty.css';

// ─── Constants ────────────────────────────────────────────────────────────────

// Amenities are now loaded dynamically per property type
// from src/data/amenitiesByPropertyType.js

const FACING_OPTIONS = [
    'East', 'West', 'North', 'South',
    'North-East', 'North-West', 'South-East', 'South-West',
];

const IMAGE_SLOT_COUNT = 5;

function getImageSlotLabel(index) {
    return index === 0 ? 'Thumbnail' : `Card ${index + 1}`;
}

// ─── Per-type configuration ───────────────────────────────────────────────────

const TYPE_CONFIG = {
    apartment: {
        label: 'Apartment', icon: Building,
        subtitle: 'Create a premium residential apartment listing for the portfolio.',
        specTitle: 'Apartment Specifications',
        successMsg: 'Apartment Listed Successfully!',
        successSub: 'The apartment has been securely added to your premium portfolio.',
        publishLabel: 'Publish Apartment Listing',
        theme: {
            heroBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #fef9c3 100%)',
            border: '#a7f3d0', iconBg: 'linear-gradient(150deg, #052e16 0%, #0d6933 42%, #22c55e 100%)',
            iconGlow: 'rgba(13, 105, 51, 0.55)', accentColor: '#0d6933',
            accentBg: 'rgba(13, 105, 51, 0.09)', accentBorder: 'rgba(13, 105, 51, 0.22)', watermark: '#0d6933',
        },
        fields: {
            carpetArea: true, bhk: true, floor: true, totalFloors: true,
            furnishing: true, facing: true, ageYears: true, maintenance: true, amenities: true,
            apartmentSubType: true, approval: true,
        },
    },
    villa: {
        label: 'Villa', icon: Castle,
        subtitle: 'Create a luxury villa listing for the premium portfolio.',
        specTitle: 'Villa Specifications',
        successMsg: 'Villa Listed Successfully!',
        successSub: 'The villa has been securely added to your premium portfolio.',
        publishLabel: 'Publish Villa Listing',
        theme: {
            heroBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 85%, #fff7ed 100%)',
            border: '#fcd34d', iconBg: 'linear-gradient(150deg, #431407 0%, #b45309 42%, #fbbf24 100%)',
            iconGlow: 'rgba(180, 83, 9, 0.55)', accentColor: '#92400e',
            accentBg: 'rgba(180, 83, 9, 0.08)', accentBorder: 'rgba(180, 83, 9, 0.22)', watermark: '#b45309',
        },
        fields: {
            plotArea: true, builtUpArea: true, bhk: true, bathrooms: true,
            furnishing: true, facing: true, ageYears: true, amenities: true,
            approval: true,
        },
    },
    plot: {
        label: 'Plot', icon: Map,
        subtitle: 'Create a plot / land listing for the portfolio.',
        specTitle: 'Plot Specifications',
        successMsg: 'Plot Listed Successfully!',
        successSub: 'The plot has been added to your portfolio.',
        publishLabel: 'Publish Plot Listing',
        theme: {
            heroBg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #a7f3d0 80%, #ecfdf5 100%)',
            border: '#5eead4', iconBg: 'linear-gradient(150deg, #042f2e 0%, #0f766e 42%, #2dd4bf 100%)',
            iconGlow: 'rgba(15, 118, 110, 0.55)', accentColor: '#0f766e',
            accentBg: 'rgba(15, 118, 110, 0.08)', accentBorder: 'rgba(15, 118, 110, 0.22)', watermark: '#0f766e',
        },
        fields: { plotArea: true, facing: true, plotDimensions: true, approvalDetails: true, amenities: true, plotSubType: true },
    },
    house: {
        label: 'Individual House', icon: Home,
        subtitle: 'Create an individual house / bungalow listing for the portfolio.',
        specTitle: 'House Specifications',
        successMsg: 'House Listed Successfully!',
        successSub: 'The house has been securely added to your premium portfolio.',
        publishLabel: 'Publish House Listing',
        theme: {
            heroBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 80%, #f0f9ff 100%)',
            border: '#93c5fd', iconBg: 'linear-gradient(150deg, #0f172a 0%, #1d4ed8 42%, #93c5fd 100%)',
            iconGlow: 'rgba(29, 78, 216, 0.55)', accentColor: '#1d4ed8',
            accentBg: 'rgba(29, 78, 216, 0.08)', accentBorder: 'rgba(29, 78, 216, 0.20)', watermark: '#1d4ed8',
        },
        fields: {
            plotArea: true, builtUpArea: true, bhk: true, bathrooms: true,
            totalFloors: true, furnishing: true, facing: true, ageYears: true, amenities: true,
        },
    },
    commercial: {
        label: 'Commercial Space', icon: Store,
        subtitle: 'Create a commercial property listing for the portfolio.',
        specTitle: 'Commercial Specifications',
        successMsg: 'Commercial Space Listed Successfully!',
        successSub: 'The commercial property has been added to your portfolio.',
        publishLabel: 'Publish Commercial Listing',
        theme: {
            heroBg: 'linear-gradient(135deg, #f6fef9 0%, #d1fae5 45%, #fef3c7 85%, #fffbeb 100%)',
            border: '#6ee7b7', iconBg: 'linear-gradient(150deg, #022c22 0%, #065f46 42%, #34d399 100%)',
            iconGlow: 'rgba(6, 95, 70, 0.55)', accentColor: '#065f46',
            accentBg: 'rgba(6, 95, 70, 0.08)', accentBorder: 'rgba(6, 95, 70, 0.22)', watermark: '#065f46',
        },
        fields: {
            builtUpArea: true, commercialType: true, floor: true, totalFloors: true,
            furnishing: true, washrooms: true, ageYears: true, amenities: true,
            facing: true, approval: true, roadAccess: true, floorDetails: true,
        },
    },
    pg: {
        label: 'PG', icon: Bed,
        subtitle: 'Create a premium PG listing with rent, sharing, and stay amenities.',
        specTitle: 'PG Details',
        successMsg: 'PG Listed Successfully!',
        successSub: 'The PG listing has been added to your portfolio.',
        publishLabel: 'Publish PG Listing',
        theme: {
            heroBg: 'linear-gradient(135deg, #f8fafc 0%, #ecfeff 45%, #fef3c7 100%)',
            border: '#bae6fd', iconBg: 'linear-gradient(150deg, #164e63 0%, #0f766e 42%, #14b8a6 100%)',
            iconGlow: 'rgba(15, 118, 110, 0.42)', accentColor: '#0f766e',
            accentBg: 'rgba(15, 118, 110, 0.08)', accentBorder: 'rgba(15, 118, 110, 0.2)', watermark: '#0f766e',
        },
        fields: {
            amenities: true,
        },
    },
    farmland: {
        label: 'Farm Land', icon: Leaf,
        subtitle: 'Create an agricultural farm land listing for the portfolio.',
        specTitle: 'Farm Land Specifications',
        successMsg: 'Farm Land Listed Successfully!',
        successSub: 'The farm land has been securely added to your portfolio.',
        publishLabel: 'Publish Farm Land Listing',
        theme: {
            heroBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)',
            border: '#6ee7b7', iconBg: 'linear-gradient(150deg, #064e3b 0%, #059669 42%, #34d399 100%)',
            iconGlow: 'rgba(5, 150, 105, 0.55)', accentColor: '#065f46',
            accentBg: 'rgba(5, 150, 105, 0.09)', accentBorder: 'rgba(5, 150, 105, 0.22)', watermark: '#059669',
        },
        fields: {
            totalLandArea: true, pricePerAcre: true, landType: true,
            approval: true, amenities: true,
        },
    },
};

const REQUIRED_FIELDS = {
    apartment: [
        { key: 'title', label: 'Property Title' },
        { key: 'price', label: 'Asking Price' },
        { key: 'location', label: 'Location' },
        { key: 'carpetArea', label: 'Carpet / Built-up Area' },
    ],
    villa: [
        { key: 'title', label: 'Property Title' },
        { key: 'price', label: 'Asking Price' },
        { key: 'location', label: 'Location' },
        { key: 'plotArea', label: 'Plot Area' },
    ],
    plot: [
        { key: 'title', label: 'Property Title' },
        { key: 'price', label: 'Asking Price' },
        { key: 'location', label: 'Location' },
        { key: 'plotArea', label: 'Plot Area' },
    ],
    house: [
        { key: 'title', label: 'Property Title' },
        { key: 'price', label: 'Asking Price' },
        { key: 'location', label: 'Location' },
        { key: 'plotArea', label: 'Plot Area' },
    ],
    commercial: [
        { key: 'title', label: 'Property Title' },
        { key: 'price', label: 'Asking Price' },
        { key: 'location', label: 'Location' },
        { key: 'builtUpArea', label: 'Built-up Area' },
    ],
    farmland: [
        { key: 'title', label: 'Property Title' },
        { key: 'location', label: 'Location' },
        { key: 'totalLandArea', label: 'Total Land Area' },
        { key: 'price', label: 'Total Price' },
    ],
    pg: [
        { key: 'title', label: 'Property Title' },
        { key: 'location', label: 'Location' },
        { key: 'monthlyRent', label: 'Monthly Rent' },
        { key: 'depositAmount', label: 'Deposit Amount' },
        { key: 'availableFrom', label: 'Available From' },
        { key: 'sharingType', label: 'Sharing Type' },
        { key: 'genderAllowed', label: 'PG Type' },
        { key: 'attachedBathroom', label: 'Attached Bathroom' },
        { key: 'furnished', label: 'Furnished' },
        { key: 'description', label: 'Description' },
    ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldGroup({ label, children, error }) {
    return (
        <div className="form-group">
            <label className="premium-label">{label}</label>
            {children}
            {error && <div className="premium-field-error">{error}</div>}
        </div>
    );
}

function NearbyLocationsSection({ form, handleChange }) {
    return (
        <div className="card premium-form-section">
            <div className="premium-section-header">
                <MapPin size={18} color="#0d6933" />
                <h3 className="premium-section-title">Nearby Locations</h3>
            </div>
            <div className="grid grid-2">
                {[
                    { label: 'Hospital', keyDist: 'nearbyHospitalDist', keyUnit: 'nearbyHospitalUnit' },
                    { label: 'College', keyDist: 'nearbyCollegeDist', keyUnit: 'nearbyCollegeUnit' },
                    { label: 'School', keyDist: 'nearbySchoolDist', keyUnit: 'nearbySchoolUnit' },
                    { label: 'Station', keyDist: 'nearbyStationDist', keyUnit: 'nearbyStationUnit' },
                    { label: 'Bus Stand', keyDist: 'nearbyBusStandDist', keyUnit: 'nearbyBusStandUnit' }
                ].map(loc => (
                    <FieldGroup key={loc.label} label={loc.label}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                className="premium-input"
                                type="number"
                                name={loc.keyDist}
                                value={form[loc.keyDist]}
                                onChange={handleChange}
                                placeholder="Distance"
                                min={0}
                                step="any"
                                style={{ flex: 1 }}
                            />
                            <select
                                className="premium-input"
                                name={loc.keyUnit}
                                value={form[loc.keyUnit]}
                                onChange={handleChange}
                                style={{ width: '80px', flexShrink: 0 }}
                            >
                                <option value="m">m</option>
                                <option value="km">km</option>
                            </select>
                        </div>
                    </FieldGroup>
                ))}
            </div>
        </div>
    );
}

function createInitialForm() {
    return {
        title: '', price: '', location: '',
        carpetArea: '', plotArea: '', builtUpArea: '',
        bhk: '', bathrooms: '',
        floor: '', totalFloors: '',
        furnishing: '', facing: '',
        ageYears: '', maintenance: '', washrooms: '',
        commercialType: '',
        plotDimensions: '', approvalDetails: '',
        amenities: [], images: [], description: '',
        shortVideoUrl: '', fullVideoUrl: '',
        mapEmbedSrc: '',
        loanSupport: false,
        loanPercentage: '',
        status: 'rent',
        apartmentSubType: '',
        plotSubType: '',
        govApprovedCertificate: '',
        totalLandArea: '',
        pricePerAcre: '',
        landType: '',
        floorDetails: '',
        borewell: false,
        ebConnection: false,
        roadAccess: false,
        nearbyHospitalDist: '', nearbyHospitalUnit: 'km',
        nearbyCollegeDist: '', nearbyCollegeUnit: 'km',
        nearbySchoolDist: '', nearbySchoolUnit: 'km',
        nearbyStationDist: '', nearbyStationUnit: 'km',
        nearbyBusStandDist: '', nearbyBusStandUnit: 'km',
        monthlyRent: '',
        depositAmount: '',
        availableFrom: '',
        sharingType: '',
        genderAllowed: '',
        foodIncluded: '',
        ac: '',
        attachedBathroom: '',
        furnished: '',
    };
}

function isBlank(value) {
    return value === null || value === undefined || String(value).trim() === '';
}

function isPositiveNumber(value) {
    return !isBlank(value) && Number(value) > 0;
}

function isValidDate(value) {
    return !isBlank(value) && !Number.isNaN(Date.parse(value));
}

const PARTICLES = [
    { x: '6%', y: '28%', s: 16, delay: '0s', dur: '2.2s' },
    { x: '13%', y: '65%', s: 11, delay: '0.4s', dur: '1.9s' },
    { x: '20%', y: '40%', s: 20, delay: '0.9s', dur: '2.5s' },
    { x: '30%', y: '74%', s: 12, delay: '0.2s', dur: '2.0s' },
    { x: '39%', y: '20%', s: 17, delay: '1.3s', dur: '1.8s' },
    { x: '47%', y: '58%', s: 13, delay: '0.6s', dur: '2.3s' },
    { x: '56%', y: '32%', s: 20, delay: '0.1s', dur: '2.1s' },
    { x: '63%', y: '70%', s: 11, delay: '1.0s', dur: '2.4s' },
    { x: '71%', y: '24%', s: 18, delay: '0.5s', dur: '2.0s' },
    { x: '78%', y: '52%', s: 12, delay: '1.5s', dur: '1.9s' },
    { x: '85%', y: '76%', s: 16, delay: '0.8s', dur: '2.3s' },
    { x: '91%', y: '36%', s: 14, delay: '0.3s', dur: '1.7s' },
];

function ParticleField() {
    return (
        <div className="ap-hero-particles" aria-hidden="true">
            {PARTICLES.map((p, i) => (
                <span
                    key={i}
                    className="ap-hero-particle"
                    style={{
                        left: p.x, top: p.y,
                        width: p.s, height: p.s,
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
    const fileRef = useRef();

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.apartment;
    const { fields } = config;
    const isPg = type === 'pg';

    // Dynamic amenity list based on current property type
    const currentAmenities = useMemo(() => getAmenitiesForType(type), [type]);
    const TypeIcon = config.icon;

    const [form, setForm] = useState({
        title: '', price: '', location: '',
        carpetArea: '', plotArea: '', builtUpArea: '',
        bhk: '', bathrooms: '',
        floor: '', totalFloors: '',
        furnishing: '', facing: '',
        ageYears: '', maintenance: '', washrooms: '',
        commercialType: '',
        plotDimensions: '', approvalDetails: '',
        amenities: [], images: [], description: '',
        shortVideoUrl: '', fullVideoUrl: '',
        mapEmbedSrc: '',
        loanSupport: false,
        loanPercentage: '',
        status: 'rent',
        // ── New PDF fields ──
        apartmentSubType: '',
        plotSubType: '',
        govApprovedCertificate: '',
        totalLandArea: '',
        pricePerAcre: '',
        landType: '',
        floorDetails: '',
        borewell: false,
        ebConnection: false,
        roadAccess: false,
        // ── Nearby Locations ──
        nearbyHospitalDist: '', nearbyHospitalUnit: 'km',
        nearbyCollegeDist: '', nearbyCollegeUnit: 'km',
        nearbySchoolDist: '', nearbySchoolUnit: 'km',
        nearbyStationDist: '', nearbyStationUnit: 'km',
        nearbyBusStandDist: '', nearbyBusStandUnit: 'km',
        monthlyRent: '',
        depositAmount: '',
        availableFrom: '',
        sharingType: '',
        genderAllowed: '',
        foodIncluded: '',
        ac: '',
        attachedBathroom: '',
        furnished: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [errors, setErrors] = useState({});

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    const showToast = (message, type = 'error') => setToast({ visible: true, message, type });
    const closeToast = () => setToast({ visible: false, message: '', type: 'error' });
    const getFieldClass = (name) => `premium-input${errors[name] ? ' premium-input--error' : ''}`;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrors(prev => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handlePgBooleanChange = (name, amenityLabel = '') => (e) => {
        const value = e.target.value;
        setForm(f => {
            const currentAmenitiesList = Array.isArray(f.amenities) ? [...f.amenities] : [];
            let nextAmenities = currentAmenitiesList;

            if (amenityLabel) {
                const hasAmenity = currentAmenitiesList.includes(amenityLabel);
                if (value === 'true' && !hasAmenity) nextAmenities = [...currentAmenitiesList, amenityLabel];
                if (value === 'false' && hasAmenity) nextAmenities = currentAmenitiesList.filter(item => item !== amenityLabel);
            }

            return { ...f, [name]: value, amenities: nextAmenities };
        });
        setErrors(prev => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const toggleAmenity = (a) => {
        setForm(f => {
            const current = Array.isArray(f.amenities) ? f.amenities : [];
            const nextAmenities = current.includes(a)
                ? current.filter(x => x !== a)
                : [...current, a];
            const nextForm = { ...f, amenities: nextAmenities };

            if (isPg && a === 'Food Included') nextForm.foodIncluded = nextAmenities.includes(a) ? 'true' : 'false';
            if (isPg && a === 'AC') nextForm.ac = nextAmenities.includes(a) ? 'true' : 'false';

            return nextForm;
        });
    };

    const validateForm = () => {
        const nextErrors = {};
        const requiredFields = REQUIRED_FIELDS[type] || REQUIRED_FIELDS.apartment;

        requiredFields.forEach(({ key, label }) => {
            if (isBlank(form[key])) nextErrors[key] = `${label} is required.`;
        });

        if (isPg) {
            if (!isPositiveNumber(form.monthlyRent)) nextErrors.monthlyRent = 'Monthly rent must be a valid number.';
            if (!isPositiveNumber(form.depositAmount)) nextErrors.depositAmount = 'Deposit amount must be a valid number.';
            if (!isValidDate(form.availableFrom)) nextErrors.availableFrom = 'Available from must be a valid date.';
        }

        setErrors(nextErrors);
        return nextErrors;
    };

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        
        setForm(f => {
            const newImages = [...(f.images || [])];
            while (newImages.length < IMAGE_SLOT_COUNT) newImages.push('');
            newImages[index] = url;
            return { ...f, images: newImages };
        });

        setImageFiles(prev => {
            const newFiles = [...(prev || [])];
            while (newFiles.length < IMAGE_SLOT_COUNT) newFiles.push(null);
            newFiles[index] = file;
            return newFiles;
        });
    };

    const removeImage = (index) => {
        setForm(f => {
            const newImages = [...(f.images || [])];
            while (newImages.length < IMAGE_SLOT_COUNT) newImages.push('');
            newImages[index] = '';
            return { ...f, images: newImages };
        });
        setImageFiles(prev => {
            const newFiles = [...(prev || [])];
            while (newFiles.length < IMAGE_SLOT_COUNT) newFiles.push(null);
            newFiles[index] = null;
            return newFiles;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) showToast(firstError, 'warning');
            return;
        }

        setLoading(true);
        try {
            // Compress images client-side before uploading (resize + WebP conversion)
            const compressedFiles = imageFiles.length > 0
                ? await compressImages(imageFiles)
                : [];
            const payload = buildPropertyFormData(form, type, compressedFiles);
            await addProperty(payload);
            setErrors({});
            setSubmitted(true);
        } catch (err) {
            showToast(getErrorMessage(err), 'error');
        } finally {
            setLoading(false);
        }
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
                                setImageFiles([]);
                                setErrors({});
                                setForm(createInitialForm());
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

            {toast.visible && (
                <Toast message={toast.message} type={toast.type} onClose={closeToast} />
            )}

            {/* ── Hero Header ─────────────────────────────────────────── */}
            <div
                className="ap-hero-header"
                style={{
                    background: config.theme.heroBg,
                    borderColor: config.theme.border,
                    boxShadow: `0 1px 0 0 rgba(255,255,255,0.9) inset, 0 6px 32px -6px ${config.theme.iconGlow}`,
                }}
            >
                <ParticleField />
                <div className="ap-hero-watermark" aria-hidden="true" style={{ color: config.theme.watermark }}>
                    <TypeIcon size={160} />
                </div>
                <div className="ap-hero-content">
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
                {isPg && (
                    <>
                        <div className="card premium-form-section">
                            <div className="premium-section-header">
                                <Info size={18} color="#0d6933" />
                                <h3 className="premium-section-title">Basic Details</h3>
                            </div>
                            <div className="grid grid-2">
                                <FieldGroup label="Property Type">
                                    <div className="property-type-display">
                                        <TypeIcon size={15} />
                                        <span>{config.label}</span>
                                    </div>
                                </FieldGroup>
                                <FieldGroup label="Available From *" error={errors.availableFrom}>
                                    <input className={getFieldClass('availableFrom')} type="date" name="availableFrom" value={form.availableFrom} onChange={handleChange} />
                                </FieldGroup>
                                <FieldGroup label="Property Title *" error={errors.title}>
                                    <input className={getFieldClass('title')} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Premium PG in RS Puram" />
                                </FieldGroup>
                                <FieldGroup label="Location *" error={errors.location}>
                                    <input className={getFieldClass('location')} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Coimbatore" />
                                </FieldGroup>
                            </div>
                        </div>

                        <div className="card premium-form-section">
                            <div className="premium-section-header">
                                <CheckCircle size={18} color="#0d6933" />
                                <h3 className="premium-section-title">Pricing</h3>
                            </div>
                            <div className="grid grid-2">
                                <FieldGroup label="Monthly Rent (₹) *" error={errors.monthlyRent}>
                                    <input className={getFieldClass('monthlyRent')} type="number" name="monthlyRent" value={form.monthlyRent} onChange={handleChange} placeholder="e.g. 6000" min={1} />
                                </FieldGroup>
                                <FieldGroup label="Deposit Amount (₹) *" error={errors.depositAmount}>
                                    <input className={getFieldClass('depositAmount')} type="number" name="depositAmount" value={form.depositAmount} onChange={handleChange} placeholder="e.g. 10000" min={0} />
                                </FieldGroup>
                            </div>
                        </div>

                        <div className="card premium-form-section">
                            <div className="premium-section-header">
                                <TypeIcon size={18} color="#0d6933" />
                                <h3 className="premium-section-title">PG Details</h3>
                            </div>
                            <div className="grid grid-3">
                                <FieldGroup label="Sharing Type *" error={errors.sharingType}>
                                    <select className={getFieldClass('sharingType')} name="sharingType" value={form.sharingType} onChange={handleChange}>
                                        <option value="">Select sharing</option>
                                        <option value="1 Sharing">1 Sharing</option>
                                        <option value="2 Sharing">2 Sharing</option>
                                        <option value="3 Sharing">3 Sharing</option>
                                        <option value="4 Sharing">4 Sharing</option>
                                        <option value="5 Sharing">5 Sharing</option>
                                        <option value="6 Sharing">6 Sharing</option>
                                    </select>
                                </FieldGroup>
                                <FieldGroup label="PG Type *" error={errors.genderAllowed}>
                                    <select className={getFieldClass('genderAllowed')} name="genderAllowed" value={form.genderAllowed} onChange={handleChange}>
                                        <option value="">Select PG type</option>
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Colive">Colive</option>
                                    </select>
                                </FieldGroup>
                                <FieldGroup label="Attached Bathroom *" error={errors.attachedBathroom}>
                                    <select className={getFieldClass('attachedBathroom')} name="attachedBathroom" value={form.attachedBathroom} onChange={handlePgBooleanChange('attachedBathroom')}>
                                        <option value="">Select option</option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </FieldGroup>
                                <FieldGroup label="Furnished *" error={errors.furnished}>
                                    <select className={getFieldClass('furnished')} name="furnished" value={form.furnished} onChange={handlePgBooleanChange('furnished')}>
                                        <option value="">Select option</option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </FieldGroup>
                            </div>
                        </div>

                        {currentAmenities.length > 0 && (
                            <div className="card premium-form-section">
                                <div className="premium-section-header">
                                    <CheckCircle size={18} color="#0d6933" />
                                    <h3 className="premium-section-title">Amenities</h3>
                                </div>
                                <div className="premium-checkbox-grid">
                                    {currentAmenities.map(a => (
                                        <label key={a} className={`premium-checkbox-pill ${form.amenities.includes(a) ? 'active' : ''}`}>
                                            <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ display: 'none' }} />
                                            <div className="pill-indicator" />
                                            {a}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <NearbyLocationsSection form={form} handleChange={handleChange} />

                    </>
                )}
                {!isPg && (
                    <>

                {/* ── Section 1: Basic Details ─────────────────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <Info size={18} color="#0d6933" />
                        <h3 className="premium-section-title">Basic Details</h3>
                    </div>
                    <div className="grid grid-2">
                        <FieldGroup label="Property Type">
                            <div className="property-type-display">
                                <TypeIcon size={15} />
                                <span>{config.label}</span>
                            </div>
                        </FieldGroup>

                        <FieldGroup label="Loan Support & Listing Type">
                            <div className="form-toggle-row">
                                <div className="form-toggle-cluster">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={form.loanSupport}
                                        className={`loan-toggle-switch${form.loanSupport ? ' loan-toggle-switch--on' : ''}`}
                                        onClick={() => setForm(f => ({ 
                                            ...f, 
                                            loanSupport: !f.loanSupport,
                                            loanPercentage: !f.loanSupport ? f.loanPercentage : ''
                                        }))}
                                    >
                                        <span className="loan-toggle-thumb" />
                                    </button>
                                    <span className="loan-toggle-label">
                                        {form.loanSupport ? 'Available' : 'Not Available'}
                                    </span>
                                </div>
                                {form.loanSupport && (
                                    <input
                                        className="premium-input"
                                        type="number"
                                        name="loanPercentage"
                                        value={form.loanPercentage}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value, 10);
                                            if (isNaN(val)) val = '';
                                            else if (val < 1) val = 1;
                                            else if (val > 100) val = 100;
                                            setForm(f => ({ ...f, loanPercentage: val }));
                                        }}
                                        placeholder="%"
                                        min={1}
                                        max={100}
                                        style={{ width: '80px', padding: '6px 12px', minHeight: '38px', fontSize: '14px', marginBottom: 0, flexShrink: 0 }}
                                    />
                                )}
                                <div className="listing-toggle" aria-label="Listing type">
                                    <button
                                        type="button"
                                        className={`listing-toggle-btn${form.status !== 'sold' ? ' listing-toggle-btn--active listing-toggle-btn--rent' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, status: 'rent' }))}
                                    >
                                        Rent
                                    </button>
                                    <button
                                        type="button"
                                        className={`listing-toggle-btn${form.status === 'sold' ? ' listing-toggle-btn--active listing-toggle-btn--sold' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, status: 'sold' }))}
                                    >
                                        Sale
                                    </button>
                                </div>
                            </div>
                        </FieldGroup>

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
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="premium-label">Location *</label>
                            <input
                                className="premium-input"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="e.g. Banjara Hills, Hyderabad"
                            />
                        </div>
                    </div>

                </div>

                {/* ── Section 2: Specifications ────────────────────────────── */}
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
                                <select className="premium-input" name="bhk" value={form.bhk} onChange={handleChange} placeholder="Select BHK">
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
                        {fields.washrooms && (
                            <FieldGroup label="Washrooms">
                                <select className="premium-input" name="washrooms" value={form.washrooms} onChange={handleChange}>
                                    <option value="">Select</option>
                                    {[1, 2, 3, 4, '5+'].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </FieldGroup>
                        )}
                        {fields.commercialType && (
                            <FieldGroup label="Property Sub-Type">
                                <select className="premium-input" name="commercialType" value={form.commercialType} onChange={handleChange}>
                                    {['Shop', 'Office Space', 'Showroom', 'Complex'].map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </FieldGroup>
                        )}
                        {fields.plotDimensions && (
                            <FieldGroup label="Plot Dimensions">
                                <input className="premium-input" name="plotDimensions" value={form.plotDimensions} onChange={handleChange} placeholder="e.g. 30x60 ft" />
                            </FieldGroup>
                        )}
                        {fields.approvalDetails && (
                            <FieldGroup label="Approval / Registration">
                                <input className="premium-input" name="approvalDetails" value={form.approvalDetails} onChange={handleChange} placeholder="e.g. HMDA Approved, Clear Title" />
                            </FieldGroup>
                        )}

                        {/* ── New PDF fields ── */}
                        {fields.apartmentSubType && (
                            <FieldGroup label="Apartment Sub-Type">
                                <select className="premium-input" name="apartmentSubType" value={form.apartmentSubType} onChange={handleChange}>
                                    <option>Apartment</option>
                                    <option>Flat</option>
                                </select>
                            </FieldGroup>
                        )}
                        {fields.plotSubType && (
                            <FieldGroup label="Plot Type">
                                <select className="premium-input" name="plotSubType" value={form.plotSubType} onChange={handleChange}>
                                    <option>Residential</option>
                                    <option>Commercial</option>
                                </select>
                            </FieldGroup>
                        )}
                        {fields.totalLandArea && (
                            <FieldGroup label="Total Land Area">
                                <input className="premium-input" name="totalLandArea" value={form.totalLandArea} onChange={handleChange} placeholder="e.g. 5 Acres / 2 Hectares" />
                            </FieldGroup>
                        )}
                        {fields.pricePerAcre && (
                            <FieldGroup label="Price per Acre (₹)">
                                <input className="premium-input" type="number" name="pricePerAcre" value={form.pricePerAcre} onChange={handleChange} placeholder="e.g. 500000" min={1} />
                            </FieldGroup>
                        )}
                        {fields.landType && (
                            <FieldGroup label="Land Type">
                                <select className="premium-input" name="landType" value={form.landType} onChange={handleChange}>
                                    <option>Dry Land</option>
                                    <option>Wet Land</option>
                                </select>
                            </FieldGroup>
                        )}
                        {fields.floorDetails && (
                            <FieldGroup label="Floor Details">
                                <input className="premium-input" name="floorDetails" value={form.floorDetails} onChange={handleChange} placeholder="e.g. Ground + 2 Floors" />
                            </FieldGroup>
                        )}
                        {fields.approval && (
                            <FieldGroup label="Approval">
                                <select className="premium-input" name="govApprovedCertificate" value={form.govApprovedCertificate} onChange={handleChange}>
                                    <option value="">Select Approval</option>
                                    <option>DTCP Approved</option>
                                    <option>RERA Approved</option>
                                    <option>DTCP &amp; RERA Approved</option>
                                    <option>Not Available</option>
                                </select>
                            </FieldGroup>
                        )}

                    </div>
                </div>

                {/* ── Section 3: Amenities ─────────────────────────────────── */}
                {fields.amenities && currentAmenities.length > 0 && (
                    <div className="card premium-form-section">
                        <div className="premium-section-header">
                            <CheckCircle size={18} color="#0d6933" />
                            <h3 className="premium-section-title">Amenities</h3>
                        </div>
                        <div className="premium-checkbox-grid">
                            {currentAmenities.map(a => (
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
                                    <div className="pill-indicator" />
                                    {a}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <NearbyLocationsSection form={form} handleChange={handleChange} />

                {/* ── Section 4: Images ────────────────────────────────────── */}
                </>
                )}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <Upload size={18} color="#0d6933" />
                        <h3 className="premium-section-title">Property Images (5 Slots)</h3>
                    </div>
                    <div className="premium-image-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        {Array.from({ length: IMAGE_SLOT_COUNT }).map((_, i) => {
                            const imgUrl = form.images && form.images[i];
                            return (
                                <div 
                                    key={i} 
                                    className="image-upload-card" 
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        backgroundColor: '#f8fafc',
                                        transition: 'all 0.2s',
                                    }}
                                    onClick={() => !imgUrl && document.getElementById(`upload-slot-${i}`).click()}
                                >
                                    {imgUrl ? (
                                        <>
                                            <img 
                                                src={imgUrl} 
                                                alt={`Slot ${i + 1}`} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(0,0,0,0.6)',
                                                color: '#fff',
                                                fontSize: '0.75rem',
                                                textAlign: 'center',
                                                padding: '4px 0'
                                            }}>
                                                {getImageSlotLabel(i)}
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: 'rgba(255, 0, 0, 0.8)',
                                                    border: 'none',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                                                {getImageSlotLabel(i)}
                                            </span>
                                        </>
                                    )}
                                    <input
                                        id={`upload-slot-${i}`}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageChange(e, i)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Section 5: Videos ────────────────────────────────────── */}
                <div className="card premium-form-section">
                    <PropertyVideoSection
                        shortVideoUrl={form.shortVideoUrl}
                        fullVideoUrl={form.fullVideoUrl}
                        onShortVideoChange={(val) => setForm(f => ({ ...f, shortVideoUrl: val }))}
                        onFullVideoChange={(val) => setForm(f => ({ ...f, fullVideoUrl: val }))}
                    />
                </div>

                {/* ── Section 6: Description ───────────────────────────────── */}
                <div className="card premium-form-section">
                    <div className="premium-section-header">
                        <Info size={18} color="#0d6933" />
                        <h3 className="premium-section-title">Description</h3>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <textarea
                            className={getFieldClass('description')}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder={`Describe this ${config.label.toLowerCase()} — highlight key features, nearby landmarks, and unique selling points...`}
                            rows={6}
                        />
                        {errors.description && <div className="premium-field-error">{errors.description}</div>}
                    </div>
                </div>

                {/* ── Section 7: Map Embed ─────────────────────────────────── */}
                <div className="card premium-form-section">
                    <PropertyLocationEmbed
                        embedSrc={form.mapEmbedSrc}
                        onEmbedChange={(src) => setForm(f => ({ ...f, mapEmbedSrc: src }))}
                    />
                </div>

                {/* ── Actions ──────────────────────────────────────────────── */}
                <div className="premium-form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/properties')}
                        style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 700 }}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            padding: '14px 36px', fontSize: '1rem', fontWeight: 700,
                            background: '#0d6933', borderColor: '#0d6933',
                            display: 'flex', alignItems: 'center', gap: 10,
                            opacity: loading ? 0.7 : 1,
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner" style={{ width: 18, height: 18 }} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                {config.publishLabel}
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
