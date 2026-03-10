import React, { useState, useMemo } from 'react';
import {
    Search, Filter, MapPin, Bed, Maximize2, Edit2, Trash2, Eye,
    Home, Building, TreePine, Landmark, Store, Plus, X, Check, AlertTriangle
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import PropertyDetailModal from '../components/PropertyDetailModal';
import EditPropertyModal from '../components/EditPropertyModal';
import './Properties.css';

const TYPE_ICONS = {
    apartment: Building,
    villa: TreePine,
    plot: Landmark,
    house: Home,
    commercial: Store,
};

const TYPE_LABELS = {
    apartment: 'Apartment',
    villa: 'Villa',
    plot: 'Plot',
    house: 'Individual House',
    commercial: 'Commercial',
};



function PropertyCard({ property, onView, onEdit, onDelete, isAdmin }) {
    const Icon = TYPE_ICONS[property.type] || Building;
    return (
        <div className="property-card transition-all">
            <div className="property-card-img-wrap">
                <img
                    src={property.images?.[0]}
                    alt={property.title}
                    className="property-card-image"
                    onError={(e) => { e.target.src = `https://placehold.co/400x200/1E2D3D/f5b642?text=${property.type[0].toUpperCase()}`; }}
                />
                <div className="property-card-type-badge">
                    <Icon size={11} />
                    {TYPE_LABELS[property.type]}
                </div>
                <div className={`property-card-status-badge ${property.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {property.status === 'active' ? 'Active' : 'Sold'}
                </div>
            </div>
            <div className="property-card-body">
                <div className="property-card-title" title={property.title}>{property.title}</div>
                <div className="property-card-loc"><MapPin size={12} />{property.location}</div>
                <div className="property-card-meta">
                    {property.bhk && <span><Bed size={12} /> {property.bhk} BHK</span>}
                    {property.area && <span><Maximize2 size={12} /> {property.area} sqft</span>}
                </div>
            </div>
            <div className="property-card-actions">
                <button className="btn-icon" onClick={() => onView(property)} title="View Detail">
                    <Eye size={15} />
                </button>
                <button className="btn-icon" onClick={() => onEdit(property)} title="Edit Property">
                    <Edit2 size={15} />
                </button>
                {isAdmin && (
                    <button className="btn-icon danger" onClick={() => onDelete(property)} title="Delete Property">
                        <Trash2 size={15} />
                    </button>
                )}
            </div>
        </div>
    );
}

function ConfirmDeleteModal({ property, onConfirm, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
                <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px 16px' }}>
                    <AlertTriangle size={40} color="var(--danger)" style={{ marginBottom: 12 }} />
                    <h3 style={{ marginBottom: 8, fontSize: '1.05rem' }}>Delete Property?</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Are you sure you want to delete <strong>{property?.title}</strong>? This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={onConfirm}><Trash2 size={14} />Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function Properties() {
    const { activeProperties, soldProperties, deleteProperty } = useProperties();
    const { isAdmin } = useAuth();

    const [activeTab, setActiveTab] = useState('active');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [viewProperty, setViewProperty] = useState(null);
    const [editProperty, setEditProperty] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const source = activeTab === 'active' ? activeProperties : soldProperties;

    const filtered = useMemo(() => {
        return source.filter(p => {
            const matchSearch = !search ||
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.location.toLowerCase().includes(search.toLowerCase());
            const matchType = !filterType || p.type === filterType;
            return matchSearch && matchType;
        });
    }, [source, search, filterType]);

    const handleDelete = () => {
        if (deleteTarget) {
            deleteProperty(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="properties-page fade-in">
            {/* Tabs */}
            <div className="properties-header">
                <div className="tabs" style={{ width: 360 }}>
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active ({activeProperties.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'sold' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sold')}
                    >
                        Sold Out ({soldProperties.length})
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar" style={{ marginBottom: 20 }}>
                <div className="search-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
                    <Search size={15} className="search-icon" />
                    <input
                        className="form-control"
                        style={{ paddingLeft: 36 }}
                        placeholder="Search by title or location..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                    <select
                        className="form-control"
                        style={{ width: 180 }}
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="plot">Plot</option>
                        <option value="house">Individual House</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
                {(search || filterType) && (
                    <button
                        className="btn btn-ghost"
                        onClick={() => { setSearch(''); setFilterType(''); }}
                        style={{ gap: 4 }}
                    >
                        <X size={14} /> Clear
                    </button>
                )}
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {filtered.length} property{filtered.length !== 1 ? 'ies' : 'y'}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <Building size={48} />
                    <h3>No properties found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="properties-grid">
                    {filtered.map(p => (
                        <PropertyCard
                            key={p.id}
                            property={p}
                            onView={setViewProperty}
                            onEdit={setEditProperty}
                            onDelete={setDeleteTarget}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {viewProperty && <PropertyDetailModal property={viewProperty} onClose={() => setViewProperty(null)} />}
            {editProperty && <EditPropertyModal property={editProperty} onClose={() => setEditProperty(null)} />}
            {deleteTarget && (
                <ConfirmDeleteModal
                    property={deleteTarget}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
