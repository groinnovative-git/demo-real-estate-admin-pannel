import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
    Search, Filter, MapPin, Edit2, Trash2, Eye,
    X, AlertTriangle, Loader,
    Home, Building, TreePine, Landmark, Store, Leaf, Bed
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, normalizeProperty } from '../utils/propertyPayloadMapper';
import * as propertyApi from '../api/propertyApi';
import PropertyDetailModal from '../components/PropertyDetailModal';
import EditPropertyModal from '../components/EditPropertyModal';
import Toast from '../components/Toast';
import './Properties.css';

const TYPE_ICONS = {
    apartment: Building, villa: TreePine, plot: Landmark, house: Home, commercial: Store, farmland: Leaf, pg: Bed,
};
const TYPE_LABELS = {
    apartment: 'Apartment', villa: 'Villa', plot: 'Plot',
    house: 'Individual House', commercial: 'Commercial', farmland: 'Farm Land', pg: 'PG',
};

function PropertyCard({ property, onView, onEdit, onDelete, isAdmin }) {
    const Icon = TYPE_ICONS[property.type] || Building;
    return (
        <div className="property-card">
            {/* ── Image ── */}
            <div className="property-card-img-wrap">
                <img
                    src={property.images?.[0]}
                    alt={property.title}
                    className="property-card-image"
                    onError={(e) => {
                        e.target.src = `https://placehold.co/400x200/1E2D3D/f5b642?text=${(property.type || 'P')[0].toUpperCase()}`;
                    }}
                />
                <div className="property-card-img-overlay" />
                <div className="property-card-type-badge">
                    <Icon size={11} />
                    {TYPE_LABELS[property.type] || property.type}
                </div>
                <div className={`property-card-status-badge ${property.status === 'sold' ? 'badge-danger' : 'badge-success'}`}>
                    {property.status === 'sold' ? 'Sold' : 'Active'}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="property-card-body">
                <div className="property-card-title" title={property.title}>{property.title}</div>
                <div className="property-card-loc">
                    <MapPin size={12} />
                    <span>{property.location}</span>
                </div>
                {property.price > 0 && (
                    <div className="property-card-price">
                        ₹{Number(property.price).toLocaleString('en-IN')}
                    </div>
                )}
            </div>

            {/* ── Segmented action footer ── */}
            <div className="property-card-actions">
                <button className="pc-action-btn pc-btn-view" onClick={() => onView(property)}>
                    <Eye size={14} /><span>View</span>
                </button>
                <span className="pc-action-sep" />
                <button className="pc-action-btn pc-btn-edit" onClick={() => onEdit(property)}>
                    <Edit2 size={14} /><span>Edit</span>
                </button>
                {isAdmin && (
                    <>
                        <span className="pc-action-sep" />
                        <button className="pc-action-btn pc-btn-delete" onClick={() => onDelete(property)}>
                            <Trash2 size={14} /><span>Delete</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function ConfirmDeleteModal({ property, onConfirm, onClose, loading }) {
    if (!property) return null;
    return ReactDOM.createPortal(
        <div className="pm-overlay" onClick={onClose} style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="pm-modal confirm-dialog" style={{ maxWidth: 420, padding: 0 }} onClick={e => e.stopPropagation()}>
                <div className="modal-body" style={{ textAlign: 'center', padding: '36px 24px 20px' }}>
                    <AlertTriangle size={44} color="var(--danger)" style={{ marginBottom: 16 }} />
                    <h3 style={{ marginBottom: 12, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Delete Property?</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Are you sure you want to delete <strong>{property?.title}</strong>?<br/>This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer" style={{ padding: '16px 24px 24px', display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={loading}>
                        {loading ? <Loader size={16} className="spin" /> : <Trash2 size={16} />}
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function Properties() {
    const {
        activeProperties, soldProperties, deleteProperty,
        loading: listLoading, error: listError,
    } = useProperties();
    const { canDelete } = useAuth();

    const [activeTab,     setActiveTab]     = useState('active');
    const [search,        setSearch]        = useState('');
    const [filterType,    setFilterType]    = useState('');
    const [page,          setPage]          = useState(1);
    const [viewProperty,  setViewProperty]  = useState(null);
    const [editProperty,  setEditProperty]  = useState(null);
    const [deleteTarget,  setDeleteTarget]  = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast,         setToast]         = useState({ visible: false, message: '', type: 'error' });

    const showToast  = (message, type = 'error') => setToast({ visible: true, message, type });
    const closeToast = () => setToast({ visible: false, message: '', type: 'error' });

    const handleAction = async (property, action) => {
        try {
            const res = await propertyApi.getPropertyById(property.id);
            // If the API nests data inside a data object or result array, extract it
            const rawData = Array.isArray(res.data) 
                                ? res.data[0] 
                                : res.data;
            
            if (!rawData) {
                showToast('Property details not found.', 'error');
                return;
            }

            const normalized = normalizeProperty(rawData);
            
            if (action === 'view') {
                setViewProperty(normalized);
            } else if (action === 'edit') {
                setEditProperty(normalized);
            }
        } catch (err) {
            showToast(getErrorMessage(err), 'error');
        }
    };

    const source = activeTab === 'active' ? activeProperties : soldProperties;

    const filtered = useMemo(() =>
        source.filter(p => {
            const matchSearch = !search ||
                (p.title    || '').toLowerCase().includes(search.toLowerCase()) ||
                (p.location || '').toLowerCase().includes(search.toLowerCase());
            return matchSearch && (!filterType || p.type === filterType);
        }),
    [source, search, filterType]);

    const PAGE_SIZE  = 8;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset to page 1 whenever search / filter / tab changes
    useEffect(() => { setPage(1); }, [search, filterType, activeTab]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteProperty(deleteTarget.id);
            setDeleteTarget(null);
            showToast('Property deleted successfully.', 'success');
        } catch (err) {
            showToast(getErrorMessage(err), 'error');
            setDeleteTarget(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="properties-page fade-in">

            {toast.visible && (
                <Toast message={toast.message} type={toast.type} onClose={closeToast} />
            )}

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
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', width: 220 }}>
                        <Filter 
                            size={15} 
                            style={{ 
                                color: 'var(--text-muted)', 
                                position: 'absolute', 
                                left: 14, 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                pointerEvents: 'none' 
                            }} 
                        />
                        <select
                            className="form-control"
                            style={{ 
                                width: '100%', 
                                paddingLeft: 40, 
                                paddingRight: 16
                            }}
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="apartment">Apartment</option>
                            <option value="villa">Villa</option>
                            <option value="plot">Plot</option>
                            <option value="house">Individual House</option>
                            <option value="commercial">Commercial</option>
                            <option value="farmland">Farm Land</option>
                            <option value="pg">PG</option>
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
                    
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: 80, textAlign: 'right' }}>
                        {filtered.length} propert{filtered.length !== 1 ? 'ies' : 'y'}
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {listLoading && (
                <div className="empty-state">
                    <Loader size={40} className="spin" style={{ color: '#0d6933' }} />
                    <p style={{ marginTop: 12 }}>Loading properties...</p>
                </div>
            )}

            {/* Error state */}
            {!listLoading && listError && (
                <div className="empty-state">
                    <AlertTriangle size={40} color="var(--danger)" />
                    <h3>Failed to load properties</h3>
                    <p>{listError}</p>
                </div>
            )}

            {/* Empty state */}
            {!listLoading && !listError && filtered.length === 0 && (
                <div className="empty-state">
                    <Building size={48} />
                    <h3>No properties found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}

            {/* Grid */}
            {!listLoading && !listError && filtered.length > 0 && (
                <>
                    <div className="properties-grid">
                        {paginated.map(p => (
                            <PropertyCard
                                key={p.id}
                                property={p}
                                onView={() => handleAction(p, 'view')}
                                onEdit={() => handleAction(p, 'edit')}
                                onDelete={setDeleteTarget}
                                isAdmin={canDelete}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pg-btn"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                ‹ Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    className={`pg-btn${n === page ? ' pg-btn--active' : ''}`}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}

                            <button
                                className="pg-btn"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next ›
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {viewProperty && (
                <PropertyDetailModal property={viewProperty} onClose={() => setViewProperty(null)} />
            )}
            {editProperty && (
                <EditPropertyModal
                    property={editProperty}
                    onClose={() => setEditProperty(null)}
                    onSaved={() => { setEditProperty(null); showToast('Property updated successfully.', 'success'); }}
                />
            )}
            {deleteTarget && (
                <ConfirmDeleteModal
                    property={deleteTarget}
                    onConfirm={handleDelete}
                    onClose={() => !deleteLoading && setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
}
