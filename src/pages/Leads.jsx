import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Phone, Mail, MessageSquare, Calendar, ChevronRight, Check } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import './Leads.css';

const STATUS_CONFIG = {
    new: { label: 'New', color: '#3B82F6' },
    inprogress: { label: 'In Progress', color: '#F59E0B' },
    closed: { label: 'Closed', color: '#22C55E' },
};

function LeadDrawer({ lead, onClose, onStatusChange }) {
    if (!lead) return null;
    const { label, color } = STATUS_CONFIG[lead.status];

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <div className="drawer">
                <div className="drawer-header">
                    <div>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{lead.name}</h2>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead #{lead.id}</span>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <div style={{ padding: '20px 24px' }}>
                    {/* Status */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {Object.entries(STATUS_CONFIG).map(([key, { label: lbl, color: c }]) => (
                                <button
                                    key={key}
                                    onClick={() => onStatusChange(lead.id, key)}
                                    style={{
                                        padding: '5px 14px',
                                        borderRadius: 999,
                                        border: `1px solid ${c}40`,
                                        background: lead.status === key ? c + '20' : 'transparent',
                                        color: c,
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {lead.status === key && <Check size={12} style={{ display: 'inline', marginRight: 4 }} />}
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                        <div className="lead-info-row"><Mail size={15} /><div><div className="lead-info-label">Email</div><div className="lead-info-value">{lead.email}</div></div></div>
                        <div className="lead-info-row"><Phone size={15} /><div><div className="lead-info-label">Phone</div><div className="lead-info-value">{lead.phone}</div></div></div>
                        <div className="lead-info-row"><ChevronRight size={15} /><div><div className="lead-info-label">Property Interest</div><div className="lead-info-value">{lead.interest}</div></div></div>
                        <div className="lead-info-row"><Calendar size={15} /><div><div className="lead-info-label">Date Received</div><div className="lead-info-value">{new Date(lead.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div></div>
                    </div>

                    <hr className="divider" />

                    {/* Message */}
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MessageSquare size={13} /> Message
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px' }}>
                            {lead.message}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Leads() {
    const { leads, updateLead } = useProperties();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterInterest, setFilterInterest] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);

    const filtered = useMemo(() => {
        return leads.filter(l => {
            const matchSearch = !search ||
                l.name.toLowerCase().includes(search.toLowerCase()) ||
                l.email.toLowerCase().includes(search.toLowerCase()) ||
                l.phone.includes(search);
            const matchStatus = !filterStatus || l.status === filterStatus;
            const matchInterest = !filterInterest || l.interest === filterInterest;
            return matchSearch && matchStatus && matchInterest;
        });
    }, [leads, search, filterStatus, filterInterest]);

    const handleStatusChange = (id, status) => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            updateLead({ ...lead, status });
            if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
        }
    };

    const interests = [...new Set(leads.map(l => l.interest))];

    return (
        <div className="leads-page fade-in">
            {/* Toolbar */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                    <select className="form-control" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="inprogress">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select className="form-control" style={{ width: 180 }} value={filterInterest} onChange={e => setFilterInterest(e.target.value)}>
                        <option value="">All Interests</option>
                        {interests.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
                {(search || filterStatus || filterInterest) && (
                    <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterStatus(''); setFilterInterest(''); }}>
                        <X size={14} /> Clear
                    </button>
                )}
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Summary Badges */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                    <div key={key} style={{ padding: '6px 14px', borderRadius: 999, background: color + '15', border: `1px solid ${color}30`, fontSize: '0.8rem', fontWeight: 600, color }}>
                        {label}: {leads.filter(l => l.status === key).length}
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Interest</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No leads found</td></tr>
                            ) : (
                                filtered.map(l => {
                                    const sc = STATUS_CONFIG[l.status];
                                    return (
                                        <tr
                                            key={l.id}
                                            onClick={() => setSelectedLead(l)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{l.id}</td>
                                            <td>
                                                <div className="name-cell">{l.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.email}</div>
                                            </td>
                                            <td>{l.phone}</td>
                                            <td>
                                                <span className="badge badge-gold">{l.interest}</span>
                                            </td>
                                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                                {l.message}
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {new Date(l.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </td>
                                            <td>
                                                <span style={{ padding: '3px 10px', borderRadius: 999, background: sc.color + '20', color: sc.color, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Drawer */}
            {
                selectedLead && (
                    <LeadDrawer
                        lead={selectedLead}
                        onClose={() => setSelectedLead(null)}
                        onStatusChange={handleStatusChange}
                    />
                )
            }
        </div >
    );
}
