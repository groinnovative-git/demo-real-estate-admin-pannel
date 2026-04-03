import React, { useState, useEffect, useMemo } from 'react';
import {
    ShieldCheck, Eye, EyeOff, Save, CheckCircle, Search, RefreshCw,
    AlertCircle, Loader, Briefcase, User,
    Plus, Trash2, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCredentials, updateCredential, createCredential, deleteCredential } from '../api/credentialApi';
import './CredentialManagement.css';

// ── Role display metadata ───────────────────────────────────────────────────
const ROLE_META = {
    Admin:    { color: 'gold',  Icon: ShieldCheck },
    Manager:  { color: 'blue',  Icon: Briefcase   },
    Employee: { color: 'green', Icon: User         },
};

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ── Modals ─────────────────────────────────────────────────────────────────

function ResetCredentialModal({ credential, onClose, onSaved }) {
    // New payload states: name, emailid, username
    const [name, setName]         = useState(credential?.name || credential?.username || '');
    const [emailid, setEmailid]   = useState(credential?.emailid || '');
    const [username, setUsername] = useState(credential?.username || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    
    const [errors, setErrors]     = useState({});
    const [saving, setSaving]     = useState(false);
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirm, setShowConfirm]         = useState(false);

    if (!credential) return null;
    
    // Check if any field differs; since user requested "password and confirm password new ah kekanum", make password effectively mandatory for Reset.
    const isDirty = name !== credential.name || emailid !== credential.emailid || username !== credential.username || newPassword !== '';

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required.';
        if (!username.trim()) errs.username = 'Username is required.';
        
        if (!emailid.trim()) errs.emailid = 'Email ID is required.';
        else if (!emailid.includes('@')) errs.emailid = 'Enter a valid email address.';
        
        if (!newPassword.trim()) {
            errs.newPassword = 'New password is required.';
        } else if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
            errs.newPassword = 'Requires 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.';
        }
        
        if (newPassword !== confirm) errs.confirm = 'Passwords do not match.';
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSaving(true);
        try {
            await updateCredential(credential.id, { name, username, emailid, password: newPassword, role: credential.role });
            onSaved(credential.id, { name, username, emailid, password: newPassword });
        } catch (error) {
            let errorMsg = 'Failed to reset user. Try again.';
            if (error?.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                } else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                } else if (error.message) {
                    errorMsg = error.message;
                }
            }
            setErrors({ submit: errorMsg });
            setSaving(false);
        }
    };

    return (
        <div className="cred-modal-overlay">
            <div className="cred-modal">
                <div className="cred-modal__header">
                    <h3>Reset {credential.role}</h3>
                    <button className="cred-modal__close" onClick={onClose} disabled={saving}><X size={18} /></button>
                </div>
                <div className="cred-modal__body">
                    {errors.submit && (
                        <div className="cred-error-msg"><AlertCircle size={14}/> {errors.submit}</div>
                    )}
                    <div className="form-group">
                        <label className="cred-field-label">Name</label>
                        <input 
                            type="text" 
                            className={`cred-input ${errors.name ? 'cred-input--error' : ''}`}
                            value={name} 
                            onChange={(e) => { setName(e.target.value); setErrors(p => ({...p, name: undefined})); }}
                            placeholder="John Doe"
                        />
                        {errors.name && <span className="cred-error-msg">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Email ID</label>
                        <input 
                            type="email" 
                            className={`cred-input ${errors.emailid ? 'cred-input--error' : ''}`}
                            value={emailid} 
                            onChange={(e) => { setEmailid(e.target.value); setErrors(p => ({...p, emailid: undefined})); }}
                            placeholder="user@example.com"
                        />
                        {errors.emailid && <span className="cred-error-msg">{errors.emailid}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Username</label>
                        <input 
                            type="text" 
                            className={`cred-input ${errors.username ? 'cred-input--error' : ''}`}
                            value={username} 
                            onChange={(e) => { setUsername(e.target.value); setErrors(p => ({...p, username: undefined})); }}
                            placeholder="johndoe123"
                        />
                        {errors.username && <span className="cred-error-msg">{errors.username}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">New Password</label>
                        <div className="cred-pass-wrap">
                            <input 
                                type={showNewPassword ? 'text' : 'password'}
                                className={`cred-input cred-pass-input ${errors.newPassword ? 'cred-input--error' : ''}`}
                                value={newPassword} 
                                onChange={(e) => { setNewPassword(e.target.value); setErrors(p => ({...p, newPassword: undefined})); }}
                                placeholder="Enter strong password"
                            />
                            <button
                                type="button"
                                className="cred-pass-toggle"
                                onClick={() => setShowNewPassword((v) => !v)}
                                title={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.newPassword && <span className="cred-error-msg">{errors.newPassword}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Confirm Password</label>
                        <div className="cred-pass-wrap">
                            <input 
                                type={showConfirm ? 'text' : 'password'}
                                className={`cred-input cred-pass-input ${errors.confirm ? 'cred-input--error' : ''}`}
                                value={confirm} 
                                onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({...p, confirm: undefined})); }}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                className="cred-pass-toggle"
                                onClick={() => setShowConfirm((v) => !v)}
                                title={showConfirm ? 'Hide password' : 'Show password'}
                            >
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.confirm && <span className="cred-error-msg">{errors.confirm}</span>}
                    </div>
                </div>
                <div className="cred-modal__footer">
                    <button className="cred-btn cred-btn--secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    <button 
                        className="cred-btn cred-btn--primary" 
                        onClick={handleSubmit} 
                        disabled={saving || !isDirty}
                    >
                        {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
                        Reset User
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddCredentialModal({ role, onClose, onCreated }) {
    const [name, setName]         = useState('');
    const [emailid, setEmailid]   = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [errors, setErrors]     = useState({});
    const [saving, setSaving]     = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required.';
        if (!username.trim()) errs.username = 'Username is required.';
        
        if (!emailid.trim()) errs.emailid = 'Email ID is required.';
        else if (!emailid.includes('@')) errs.emailid = 'Enter a valid email address.';
        
        if (!password) errs.password = 'Password is required.';
        else if (!STRONG_PASSWORD_REGEX.test(password)) {
            errs.password = 'Requires 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.';
        }
        
        if (password !== confirm) errs.confirm = 'Passwords do not match.';
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSaving(true);
        try {
            const newCred = await createCredential({ name, username, emailid, password, role });
            onCreated(newCred);
        } catch (error) {
            let errorMsg = 'Failed to create user. Try again.';
            if (error?.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                } else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                } else if (error.message) {
                    errorMsg = error.message;
                }
            }
            setErrors({ submit: errorMsg });
            setSaving(false);
        }
    };

    return (
        <div className="cred-modal-overlay">
            <div className="cred-modal">
                <div className="cred-modal__header">
                    <h3>Add {role}</h3>
                    <button className="cred-modal__close" onClick={onClose} disabled={saving}><X size={18} /></button>
                </div>
                <div className="cred-modal__body">
                    {errors.submit && (
                        <div className="cred-error-msg"><AlertCircle size={14}/> {errors.submit}</div>
                    )}
                    <div className="form-group">
                        <label className="cred-field-label">Role</label>
                        <input type="text" className="cred-input" value={role} disabled />
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Name</label>
                        <input 
                            type="text" 
                            className={`cred-input ${errors.name ? 'cred-input--error' : ''}`}
                            value={name} 
                            onChange={(e) => { setName(e.target.value); setErrors(p => ({...p, name: undefined})); }}
                            placeholder="John Doe"
                        />
                        {errors.name && <span className="cred-error-msg">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Email ID</label>
                        <input 
                            type="email" 
                            className={`cred-input ${errors.emailid ? 'cred-input--error' : ''}`}
                            value={emailid} 
                            onChange={(e) => { setEmailid(e.target.value); setErrors(p => ({...p, emailid: undefined})); }}
                            placeholder="user@example.com"
                        />
                        {errors.emailid && <span className="cred-error-msg">{errors.emailid}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Username</label>
                        <input 
                            type="text" 
                            className={`cred-input ${errors.username ? 'cred-input--error' : ''}`}
                            value={username} 
                            onChange={(e) => { setUsername(e.target.value); setErrors(p => ({...p, username: undefined})); }}
                            placeholder="johndoe123"
                        />
                        {errors.username && <span className="cred-error-msg">{errors.username}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Password</label>
                        <div className="cred-pass-wrap">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                className={`cred-input cred-pass-input ${errors.password ? 'cred-input--error' : ''}`}
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }}
                                placeholder="Strong@123"
                            />
                            <button
                                type="button"
                                className="cred-pass-toggle"
                                onClick={() => setShowPassword((v) => !v)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.password && <span className="cred-error-msg">{errors.password}</span>}
                    </div>
                    <div className="form-group">
                        <label className="cred-field-label">Confirm Password</label>
                        <div className="cred-pass-wrap">
                            <input 
                                type={showConfirm ? 'text' : 'password'}
                                className={`cred-input cred-pass-input ${errors.confirm ? 'cred-input--error' : ''}`}
                                value={confirm} 
                                onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({...p, confirm: undefined})); }}
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                className="cred-pass-toggle"
                                onClick={() => setShowConfirm((v) => !v)}
                                title={showConfirm ? 'Hide password' : 'Show password'}
                            >
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.confirm && <span className="cred-error-msg">{errors.confirm}</span>}
                    </div>
                </div>
                <div className="cred-modal__footer">
                    <button className="cred-btn cred-btn--secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="cred-btn cred-btn--primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
                        Save {role}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteConfirmModal({ credential, onClose, onConfirm, saving }) {
    if (!credential) return null;
    return (
        <div className="cred-modal-overlay">
            <div className="cred-modal" style={{ maxWidth: '400px' }}>
                <div className="cred-modal__header">
                    <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem' }}>
                        <AlertCircle size={20} /> Delete User
                    </h3>
                    <button className="cred-modal__close" onClick={onClose} disabled={saving}><X size={18} /></button>
                </div>
                <div className="cred-modal__body">
                    <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        Are you sure you want to delete the <strong>{credential.role}</strong> account for <strong>{credential.username}</strong>?
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
                        This action cannot be undone.
                    </p>
                </div>
                <div className="cred-modal__footer">
                    <button className="cred-btn cred-btn--secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="cred-btn cred-btn--danger" onClick={() => onConfirm(credential.id)} disabled={saving}>
                        {saving ? <Loader size={16} className="spin" /> : <Trash2 size={16} />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Toasts container ───────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
    if (!toasts.length) return null;
    return (
        <div className="cred-toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`cred-toast cred-toast--${t.type}`}>
                    {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{t.msg}</span>
                </div>
            ))}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function CredentialManagement() {
    const { user, isAdmin, isSuperAdmin, isManager } = useAuth();
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [fetchError, setFetchError]   = useState(null);

    // Modals state
    const [addRole, setAddRole]       = useState(null); // 'Manager' | 'Employee' | null
    const [editCred, setEditCred]     = useState(null);
    const [deleteCred, setDeleteCred] = useState(null);
    const [deleting, setDeleting]     = useState(false);

    // Tabs, Search and Pagination
    const [activeRole, setActiveRole]   = useState('Admin');
    const [searchTerm, setSearchTerm]   = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 10;

    const [toasts, setToasts] = useState([]);

    const showToast = (type, msg) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, msg }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // Block employee (and any unknown role) even on direct URL access
    useEffect(() => {
        if (!isAdmin && !isSuperAdmin && !isManager) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAdmin, isSuperAdmin, isManager, navigate]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getCredentials();
                if (!cancelled) setCredentials(data);
            } catch {
                if (!cancelled) setFetchError('Failed to load credentials. Please refresh.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleSaved = (id, updated) => {
        setCredentials(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
        setEditCred(null);
        showToast('success', 'Credentials updated successfully.');
    };

    const handleCreated = async (newCred) => {
        // Refetch credentials immediately so we get the accurate backend-generated userId
        try {
            const data = await getCredentials();
            setCredentials(data);
        } catch {
            setCredentials(prev => [...prev, newCred]);
        }
        setAddRole(null);
        showToast('success', `${newCred.role} added successfully.`);
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await deleteCredential(id);
            setCredentials(prev => prev.filter(c => c.id !== id));
            showToast('success', 'User deleted successfully.');
            setDeleteCred(null);
        } catch {
            showToast('error', 'Failed to delete user.');
        } finally {
            setDeleting(false);
        }
    };

    // Filter logic based on Role permissions
    const permittedCredentials = useMemo(() => {
        return credentials.filter(c => {
            if (isSuperAdmin) return true;
            if (isAdmin) {
                return c.role?.toLowerCase() !== 'superadmin';
            }
            if (isManager) {
                return c.role === 'Employee' || (c.role === 'Manager' && (c.emailid || c.username).toLowerCase() === user?.email?.toLowerCase());
            }
            return false;
        });
    }, [credentials, isAdmin, isSuperAdmin, isManager, user]);

    // Apply Role Tab + Search Term
    // When searching: search across ALL roles (ignore active tab)
    // When not searching: show only active tab's role
    const filteredCredentials = useMemo(() => {
        const trimmed = searchTerm.trim();
        if (trimmed) {
            const low = trimmed.toLowerCase();
            return permittedCredentials.filter(c =>
                c.username?.toLowerCase().includes(low) ||
                c.emailid?.toLowerCase().includes(low) ||
                (c.name || '').toLowerCase().includes(low)
            );
        }
        return permittedCredentials.filter(c => c.role === activeRole);
    }, [permittedCredentials, activeRole, searchTerm]);

    // Apply Pagination
    const totalPages = Math.ceil(filteredCredentials.length / ROWS_PER_PAGE) || 1;
    const paginatedCredentials = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredCredentials.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [filteredCredentials, currentPage]);

    // Reset pagination when search or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeRole]);

    // Permission checks for Table Actions
    const checkCanEdit = (cred) => {
        const isSelf = (cred.emailid || cred.username).toLowerCase() === user?.email?.toLowerCase();
        return (isAdmin || isSuperAdmin) || (isManager && (cred.role === 'Employee' || isSelf));
    };

    const checkCanDelete = (cred) => {
        return ((isAdmin || isSuperAdmin) && cred.role !== 'Admin') || (isManager && cred.role === 'Employee');
    };

    return (
        <div className="cred-page">
            <ToastContainer toasts={toasts} />

            <div className="cred-action-bar">
                <div className="cred-search-box">
                    <Search size={16} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="cred-action-buttons">
                    {(isAdmin || isSuperAdmin) && (
                        <button className="cred-btn cred-btn--secondary" onClick={() => setAddRole('Manager')}>
                            <Plus size={16} /> Add Manager
                        </button>
                    )}
                    {(isAdmin || isSuperAdmin || isManager) && (
                        <button className="cred-btn cred-btn--primary" onClick={() => setAddRole('Employee')}>
                            <Plus size={16} /> Add Employee
                        </button>
                    )}
                </div>
            </div>

            {/* Role Tabs */}
            <div className="cred-role-tabs">
                {['Admin', 'Manager', 'Employee'].map(role => {
                    return (
                        <button
                            key={role}
                            className={`cred-role-tab${activeRole === role ? ' cred-role-tab--active' : ''}`}
                            onClick={() => setActiveRole(role)}
                        >
                            {role}
                        </button>
                    );
                })}
            </div>

            {loading && (
                <div className="cred-loading">
                    <Loader size={26} className="spin" />
                    <span>Loading credentials…</span>
                </div>
            )}

            {!loading && fetchError && (
                <div className="cred-fetch-error">
                    <AlertCircle size={17} />
                    <span>{fetchError}</span>
                </div>
            )}

            {!loading && !fetchError && (
                <div className="cred-table-container">
                    <table className="cred-table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Name</th>
                                <th>Email ID</th>
                                <th>Username</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCredentials.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="cred-empty-state">
                                            <ShieldCheck size={32} opacity={0.5} />
                                            <p>No credentials found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCredentials.map((cred) => {
                                    const meta = ROLE_META[cred.role] || { color: 'gold' };
                                    const canEdit = checkCanEdit(cred);
                                    const canDelete = checkCanDelete(cred);

                                    return (
                                        <tr key={cred.id}>
                                            <td>
                                                <div className={`cred-role-badge cred-role-badge--${meta.color}`}>
                                                    {cred.role}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="cred-user-cell">
                                                    <div className="cred-user-avatar">
                                                        {(cred.name || cred.username || '').charAt(0).toUpperCase()}
                                                    </div>
                                                    {cred.name || cred.username}
                                                </div>
                                            </td>
                                            <td>
                                                <span>{cred.emailid}</span>
                                            </td>
                                            <td>
                                                <span>{cred.username}</span>
                                            </td>
                                            <td>
                                                <div className="cred-actions-cell">
                                                    {canEdit && (
                                                        <button 
                                                            className="cred-action-icon cred-action-icon--view"
                                                            onClick={() => setEditCred(cred)}
                                                            title="Reset User"
                                                            style={{ color: '#0ea5e9', background: '#e0f2fe' }}
                                                        >
                                                            <RefreshCw size={16} />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button 
                                                            className="cred-action-icon cred-action-icon--delete"
                                                            onClick={() => setDeleteCred(cred)}
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Bar */}
                    {filteredCredentials.length > 0 && (
                        <div className="cred-pagination-bar">
                            <div className="cred-pagination-info">
                                Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1} to {Math.min(currentPage * ROWS_PER_PAGE, filteredCredentials.length)} of {filteredCredentials.length} entries
                            </div>
                            <div className="cred-pagination-controls">
                                <button 
                                    className="cred-page-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`cred-page-btn ${currentPage === idx + 1 ? 'cred-page-btn--active' : ''}`}
                                        onClick={() => setCurrentPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button 
                                    className="cred-page-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Render Modals securely */}
            {editCred && (
                <ResetCredentialModal 
                    credential={editCred} 
                    onClose={() => setEditCred(null)} 
                    onSaved={handleSaved}
                />
            )}

            {addRole && (
                <AddCredentialModal 
                    role={addRole} 
                    onClose={() => setAddRole(null)} 
                    onCreated={handleCreated} 
                />
            )}

            {deleteCred && (
                <DeleteConfirmModal 
                    credential={deleteCred}
                    onClose={() => setDeleteCred(null)}
                    onConfirm={handleDelete}
                    saving={deleting}
                />
            )}
        </div>
    );
}
