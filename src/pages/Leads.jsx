import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
    Search, Filter, X, Phone, Mail, MessageSquare, Calendar,
    ChevronRight, ChevronLeft, Check, Building2, Clock, User,
    ArrowRight, Loader, AlertCircle, Home, Eye
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import './Leads.css';

/* ── Status configuration ────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    New: { label: 'New', color: '#3B82F6', bg: '#EFF6FF' },
    Hold: { label: 'Hold', color: '#8B5CF6', bg: '#F5F3FF' },
    'In Progress': { label: 'In Progress', color: '#F59E0B', bg: '#FFFBEB' },
    Closed: { label: 'Closed', color: '#22C55E', bg: '#F0FDF4' },
    Cancel: { label: 'Cancel', color: '#EF4444', bg: '#FEF2F2' },
};

const STATUS_KEYS = Object.keys(STATUS_CONFIG);
const ROWS_PER_PAGE = 12;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getStatusConfig(status) {
    if (!status) return STATUS_CONFIG['New'];
    // Try exact match first
    if (STATUS_CONFIG[status]) return STATUS_CONFIG[status];
    // Case-insensitive match
    const key = STATUS_KEYS.find(k => k.toLowerCase() === status.toLowerCase());
    return key ? STATUS_CONFIG[key] : STATUS_CONFIG['New'];
}

function getStatusKey(status) {
    if (!status) return 'New';
    if (STATUS_CONFIG[status]) return status;
    const key = STATUS_KEYS.find(k => k.toLowerCase() === status.toLowerCase());
    return key || 'New';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    } catch { return '—'; }
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
        });
    } catch { return ''; }
}

/* ─────────────────────────────────────────────────────────────────────────
   LEAD MODAL  (centered 2-column popup)
   ───────────────────────────────────────────────────────────────────────── */
function LeadModal({ lead, onClose, onStatusChange, auditLog, auditLoading, properties }) {
    if (!lead) return null;

    const sc = getStatusConfig(lead.leadStatus);
    const currentKey = getStatusKey(lead.leadStatus);

    const propertyName = useMemo(() => {
        if (lead.propertyName) return lead.propertyName;
        if (!lead.propertyId) return '—';
        const prop = properties.find(p => p.id === lead.propertyId);
        return prop ? prop.title : '—';
    }, [lead, properties]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return ReactDOM.createPortal(
        <div className="lm-overlay" onClick={onClose}>
            <div className="lm-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>

                {/* ── Header ──────────────────────────────────────────── */}
                <div className="lm-header">
                    <div className="lm-header-left">
                        <div className="lm-header-title">{lead.fullName}</div>
                        <span className="lm-header-id">
                            Lead #{(lead.contactId || '').slice(0, 8).toUpperCase()}
                        </span>
                    </div>
                    <div className="lm-header-right">
                        <span
                            className="lm-header-status-badge"
                            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}35` }}
                        >
                            <span className="lm-header-status-dot" style={{ background: sc.color }} />
                            {sc.label}
                        </span>
                        <button className="lm-close" onClick={onClose} aria-label="Close modal">
                            <X size={17} />
                        </button>
                    </div>
                </div>

                {/* ── Status Toolbar ──────────────────────────────────── */}
                <div className="lm-status-bar">
                    <span className="lm-status-bar-label">Status</span>
                    <div className="lm-status-pills">
                        {STATUS_KEYS.map(key => {
                            const cfg = STATUS_CONFIG[key];
                            const isActive = currentKey === key;
                            return (
                                <button
                                    key={key}
                                    className={`lm-status-pill ${isActive ? 'lm-status-pill--active' : ''}`}
                                    style={{ '--pill-color': cfg.color, '--pill-bg': cfg.bg }}
                                    onClick={() => onStatusChange(lead, key)}
                                >
                                    {isActive && <Check size={12} strokeWidth={3} />}
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Body: 2-column ──────────────────────────────────── */}
                <div className="lm-body">

                    {/* LEFT — Contact Details */}
                    <div className="lm-left">
                        <div className="lm-section-title">
                            <User size={13} /> Contact Details
                        </div>

                        <div className="lm-field">
                            <div className="lm-field-icon"><User size={14} /></div>
                            <div>
                                <div className="lm-field-label">Customer Name</div>
                                <div className="lm-field-value">{lead.fullName || '—'}</div>
                            </div>
                        </div>

                        <div className="lm-field">
                            <div className="lm-field-icon"><Mail size={14} /></div>
                            <div>
                                <div className="lm-field-label">Email ID</div>
                                <div className="lm-field-value lm-field-value--mono">{lead.email || '—'}</div>
                            </div>
                        </div>

                        <div className="lm-field">
                            <div className="lm-field-icon"><Phone size={14} /></div>
                            <div>
                                <div className="lm-field-label">Phone Number</div>
                                <div className="lm-field-value">{lead.phoneNumber || '—'}</div>
                            </div>
                        </div>

                        <div className="lm-field">
                            <div className="lm-field-icon"><ChevronRight size={14} /></div>
                            <div>
                                <div className="lm-field-label">Interest</div>
                                <div className="lm-field-value">{lead.customerInterest || '—'}</div>
                            </div>
                        </div>

                        <div className="lm-field">
                            <div className="lm-field-icon"><Home size={14} /></div>
                            <div>
                                <div className="lm-field-label">Property Name</div>
                                <div className="lm-field-value">{propertyName}</div>
                            </div>
                        </div>

                        <div className="lm-field">
                            <div className="lm-field-icon"><Calendar size={14} /></div>
                            <div>
                                <div className="lm-field-label">Date Received</div>
                                <div className="lm-field-value">{formatDate(lead.createdDate)}</div>
                            </div>
                        </div>

                        <div className="lm-message-wrap">
                            <div className="lm-message-label">
                                <MessageSquare size={13} /> Message
                            </div>
                            <p className="lm-message-box">
                                {lead.message || 'No message provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="lm-col-divider" />

                    {/* RIGHT — Activity Log */}
                    <div className="lm-right">
                        <div className="lm-section-title">
                            <Clock size={13} /> Activity Log
                        </div>

                        {auditLoading ? (
                            <div className="audit-loading">
                                <Loader size={18} className="spin" />
                                <span>Loading history…</span>
                            </div>
                        ) : auditLog.length === 0 ? (
                            <div className="audit-empty">
                                <AlertCircle size={20} />
                                <span>No status changes recorded yet</span>
                            </div>
                        ) : (
                            <div className="audit-timeline">
                                {auditLog.map((entry, i) => {
                                    let oldSt = entry.oldStatus || entry.OldStatus || entry.oldLeadStatus || '—';
                                    let newSt = entry.newStatus || entry.NewStatus || entry.newLeadStatus || entry.leadStatus || '—';

                                    if (entry.description) {
                                        const m = entry.description.match(/from '([^']+)' to '([^']+)'/i);
                                        if (m) { oldSt = m[1]; newSt = m[2]; }
                                    }

                                    const who = entry.name || entry.Name || entry.changedByUsername || entry.ChangedByUsername
                                        || entry.changedBy || entry.ChangedBy
                                        || entry.userName || entry.UserName || 'System';
                                    const when = entry.modifiedOn || entry.ModifiedOn || entry.changedAt || entry.ChangedAt
                                        || entry.createdDate || entry.CreatedDate || '';
                                    const newCfg = getStatusConfig(newSt);

                                    return (
                                        <div key={i} className="audit-entry">
                                            <div className="audit-dot-col">
                                                <span className="audit-dot" style={{ background: newCfg.color }} />
                                                {i < auditLog.length - 1 && <span className="audit-line" />}
                                            </div>
                                            <div className="audit-content">
                                                <div className="audit-transition">
                                                    <span className="audit-status-label">{oldSt}</span>
                                                    <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                    <span
                                                        className="audit-status-label"
                                                        style={{ color: newCfg.color, fontWeight: 700 }}
                                                    >
                                                        {newSt}
                                                    </span>
                                                </div>
                                                <div className="audit-meta">
                                                    <User size={11} />
                                                    <span className="audit-user">{who}</span>
                                                    {when && (
                                                        <>
                                                            <span className="audit-sep">·</span>
                                                            <span className="audit-time">{formatDateTime(when)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   LEADS PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function Leads() {
    const { leads, properties, updateLeadStatus, fetchLeadAudit, fetchLeads } = useProperties();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterInterest, setFilterInterest] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLead, setSelectedLead] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    /* ── Auto-open lead from URL query (?id=contactId) ─────────────────── */
    useEffect(() => {
        const id = searchParams.get('id');
        if (id && leads.length > 0 && !selectedLead) {
            const target = leads.find(l => l.contactId === id);
            if (target) {
                openDrawer(target);
                // Clear the query param so it doesn't re-trigger
                setSearchParams({}, { replace: true });
            }
        }
    }, [leads, searchParams]);

    /* ── Filtered data ──────────────────────────────────────────────────── */
    const filtered = useMemo(() => {
        return leads.filter(l => {
            const matchSearch = !search ||
                (l.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
                (l.phoneNumber || '').includes(search);
            const matchStatus = !filterStatus || getStatusKey(l.leadStatus) === filterStatus;
            const matchInterest = !filterInterest || l.customerInterest === filterInterest;
            return matchSearch && matchStatus && matchInterest;
        });
    }, [leads, search, filterStatus, filterInterest]);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [search, filterStatus, filterInterest]);

    /* ── Pagination ───────────────────────────────────────────────────── */
    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        return filtered.slice(start, start + ROWS_PER_PAGE);
    }, [filtered, currentPage]);

    const startRow = (currentPage - 1) * ROWS_PER_PAGE + 1;
    const endRow = Math.min(currentPage * ROWS_PER_PAGE, filtered.length);

    /* ── Interests for filter dropdown ────────────────────────────────── */
    const interests = useMemo(() =>
        [...new Set(leads.map(l => l.customerInterest).filter(Boolean))],
        [leads]);

    /* ── Open drawer & fetch audit ────────────────────────────────────── */
    const openDrawer = useCallback(async (lead) => {
        setSelectedLead(lead);
        setAuditLog([]);
        setAuditLoading(true);
        try {
            const history = await fetchLeadAudit(lead.contactId);
            setAuditLog(history);
        } catch {
            setAuditLog([]);
        } finally {
            setAuditLoading(false);
        }
    }, [fetchLeadAudit]);

    /* ── Status change handler ────────────────────────────────────────── */
    const handleStatusChange = useCallback(async (lead, newStatusKey) => {
        if (getStatusKey(lead.leadStatus) === newStatusKey || statusUpdating) return;
        setStatusUpdating(true);
        try {
            await updateLeadStatus(lead, newStatusKey);
            // Update selected lead locally
            const updated = { ...lead, leadStatus: newStatusKey };
            setSelectedLead(updated);
            // Re-fetch audit trail to show the new entry
            const history = await fetchLeadAudit(lead.contactId);
            setAuditLog(history);
            // Refresh full leads list to update table
            await fetchLeads();
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setStatusUpdating(false);
        }
    }, [updateLeadStatus, fetchLeadAudit, fetchLeads, statusUpdating]);

    /* ── Property name resolver ───────────────────────────────────────── */
    const getPropertyName = useCallback((lead) => {
        if (lead.propertyName) return lead.propertyName;
        if (!lead.propertyId) return '—';
        const prop = properties.find(p => p.id === lead.propertyId);
        return prop ? prop.title : '—';
    }, [properties]);

    /* ── Pagination controls ─────────────────────────────────────────── */
    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className="leads-page fade-in">
            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="toolbar" style={{ marginBottom: 20 }}>
                <div className="search-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
                    <Search size={15} className="search-icon" />
                    <input
                        className="form-control"
                        style={{ paddingLeft: 36 }}
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', width: 180 }}>
                        <Filter
                            size={15}
                            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                        />
                        <select
                            className="form-control"
                            style={{ width: '100%', paddingLeft: 40, paddingRight: 16 }}
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            {STATUS_KEYS.map(k => (
                                <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ position: 'relative', width: 200 }}>
                        <Filter
                            size={15}
                            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                        />
                        <select
                            className="form-control"
                            style={{ width: '100%', paddingLeft: 40, paddingRight: 16 }}
                            value={filterInterest}
                            onChange={e => setFilterInterest(e.target.value)}
                        >
                            <option value="">All Interests</option>
                            {interests.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>

                    {(search || filterStatus || filterInterest) && (
                        <button
                            className="btn btn-ghost"
                            onClick={() => { setSearch(''); setFilterStatus(''); setFilterInterest(''); }}
                            style={{ gap: 4 }}
                        >
                            <X size={14} /> Clear
                        </button>
                    )}

                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: 80, textAlign: 'right' }}>
                        {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* ── Summary Badges ───────────────────────────────────────── */}
            <div className="leads-summary-badges">
                {STATUS_KEYS.map(key => {
                    const cfg = STATUS_CONFIG[key];
                    const count = leads.filter(l => getStatusKey(l.leadStatus) === key).length;
                    return (
                        <div
                            key={key}
                            className="leads-summary-badge"
                            style={{
                                background: cfg.bg,
                                border: `1px solid ${cfg.color}25`,
                                color: cfg.color,
                            }}
                        >
                            <span className="leads-badge-dot" style={{ background: cfg.color }} />
                            {cfg.label}: {count}
                        </div>
                    );
                })}
            </div>

            {/* ── Table ────────────────────────────────────────────────── */}
            <div className="card leads-table-card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 48 }}>#</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Interest</th>
                                <th>Property Name</th>
                                <th>Date</th>
                                <th style={{ width: 120 }}>Status</th>
                                <th style={{ width: 60, textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                        <Building2 size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                                        <div style={{ fontWeight: 600 }}>No leads found</div>
                                        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Try adjusting your search or filters</div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((l, idx) => {
                                    const sc = getStatusConfig(l.leadStatus);
                                    const rowNum = startRow + idx;
                                    return (
                                        <tr
                                            key={l.contactId}
                                            className="leads-table-row"
                                            onClick={() => openDrawer(l)}
                                        >
                                            <td className="leads-row-num">{rowNum}</td>
                                            <td>
                                                <div className="name-cell">{l.fullName}</div>
                                            </td>
                                            <td className="leads-email-cell">{l.email || '—'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{l.phoneNumber || '—'}</td>
                                            <td>
                                                <span className="badge badge-gold">{l.customerInterest || '—'}</span>
                                            </td>
                                            <td className="leads-property-cell">
                                                {getPropertyName(l)}
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {formatDate(l.createdDate || l.submittedDate)}
                                            </td>
                                            <td>
                                                <span
                                                    className="leads-status-badge"
                                                    style={{
                                                        background: sc.bg,
                                                        color: sc.color,
                                                        border: `1px solid ${sc.color}30`,
                                                    }}
                                                >
                                                    <span className="leads-status-dot" style={{ background: sc.color }} />
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="lead-view-btn"
                                                    title="View lead details"
                                                    onClick={(e) => { e.stopPropagation(); openDrawer(l); }}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: '6px' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ──────────────────────────────────────── */}
                {filtered.length > ROWS_PER_PAGE && (
                    <div className="leads-pagination">
                        <div className="leads-pagination-info">
                            Showing {startRow}–{endRow} of {filtered.length}
                        </div>
                        <div className="leads-pagination-controls">
                            <button
                                className="leads-page-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                <ChevronLeft size={15} /> Previous
                            </button>
                            {pageNumbers.map(n => (
                                <button
                                    key={n}
                                    className={`leads-page-btn leads-page-num ${n === currentPage ? 'leads-page-num--active' : ''}`}
                                    onClick={() => setCurrentPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                className="leads-page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Next <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal ───────────────────────────────────────────────── */}
            {selectedLead && (
                <LeadModal
                    lead={selectedLead}
                    onClose={() => { setSelectedLead(null); setAuditLog([]); }}
                    onStatusChange={handleStatusChange}
                    auditLog={auditLog}
                    auditLoading={auditLoading}
                    properties={properties}
                />
            )}
        </div>
    );
}
