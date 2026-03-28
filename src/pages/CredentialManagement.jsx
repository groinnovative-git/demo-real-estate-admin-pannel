import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Eye, EyeOff, Save, CheckCircle,
    AlertCircle, Loader, Briefcase, User, Lock, AtSign, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCredentials, updateCredential } from '../api/credentialApi';
import './CredentialManagement.css';

// ── Role display metadata (UI only — not from API) ────────────────────────
const ROLE_META = {
    admin:    { color: 'gold',  Icon: ShieldCheck },
    manager:  { color: 'blue',  Icon: Briefcase   },
    employee: { color: 'green', Icon: User         },
};

// ── Individual credential card ─────────────────────────────────────────────
function CredentialCard({ credential, onSaved }) {
    const [username, setUsername] = useState(credential.username);
    const [password, setPassword] = useState(credential.password);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors]     = useState({});
    const [saving, setSaving]     = useState(false);
    const [toast, setToast]       = useState(null);

    const meta     = ROLE_META[credential.id] || { color: 'gold', Icon: User };
    const isDirty  = username !== credential.username || password !== credential.password;

    const validate = () => {
        const errs = {};
        if (!username.trim())            errs.username = 'Username cannot be empty.';
        else if (!username.includes('@')) errs.username = 'Enter a valid email address.';
        if (!password.trim())            errs.password = 'Password cannot be empty.';
        else if (password.length < 6)    errs.password = 'Password must be at least 6 characters.';
        return errs;
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setSaving(true);
        try {
            await updateCredential(credential.id, { username, password });
            onSaved(credential.id, { username, password });
            showToast('success', `${credential.role} credentials updated.`);
        } catch {
            showToast('error', 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`cred-card cred-card--${meta.color}`}>

            {/* ── Identity header ── */}
            <div className={`cred-card__identity cred-identity--${meta.color}`}>
                <div className="cred-card__role-wrap">
                    <div className="cred-card__role-icon">
                        <meta.Icon size={22} strokeWidth={1.6} />
                    </div>
                    <div className="cred-card__role-info">
                        <span className={`cred-card__role-name cred-role-name--${meta.color}`}>
                            {credential.role}
                        </span>
                        <span className="cred-card__role-sub">System Account</span>
                    </div>
                </div>
                <div className="cred-card__readonly-chip">
                    <Lock size={11} strokeWidth={2.5} />
                    <span>Read-only</span>
                </div>
            </div>

            {/* ── Inline toast ── */}
            {toast && (
                <div className={`cred-toast cred-toast--${toast.type}`}>
                    {toast.type === 'success'
                        ? <CheckCircle size={14} />
                        : <AlertCircle size={14} />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* ── Fields ── */}
            <div className="cred-card__body">
                <div className="form-group">
                    <label className="cred-field-label">
                        <AtSign size={13} strokeWidth={2} />
                        Username / Email
                    </label>
                    <input
                        type="email"
                        className={`cred-input cred-input--${meta.color}${errors.username ? ' cred-input--error' : ''}`}
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                        }}
                        placeholder="Enter email address"
                        autoComplete="off"
                    />
                    {errors.username && <span className="cred-error-msg">{errors.username}</span>}
                </div>

                <div className="form-group">
                    <label className="cred-field-label">
                        <Key size={13} strokeWidth={2} />
                        Password
                    </label>
                    <div className="cred-pass-wrap">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className={`cred-input cred-pass-input cred-input--${meta.color}${errors.password ? ' cred-input--error' : ''}`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                            }}
                            placeholder="Enter password"
                            autoComplete="new-password"
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
            </div>

            {/* ── Footer ── */}
            <div className="cred-card__footer">
                <button
                    className={`cred-save-btn${isDirty ? ' cred-save-btn--dirty' : ''}`}
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                >
                    {saving ? (
                        <>
                            <Loader size={14} className="spin" />
                            <span>Saving…</span>
                        </>
                    ) : isDirty ? (
                        <>
                            <Save size={14} />
                            <span>Save Changes</span>
                        </>
                    ) : (
                        <span>No Changes</span>
                    )}
                </button>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function CredentialManagement() {
    const { isAdmin, isSuperAdmin, isManager } = useAuth();
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [fetchError, setFetchError]   = useState(null);

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
        setCredentials((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
        );
    };

    return (
        <div className="cred-page">

            {/* Info banner */}
            <div className="cred-info-banner">
                <ShieldCheck size={16} />
                <span>
                    <strong>3 fixed role accounts</strong> — Only username and password can be edited. Roles are read-only.
                </span>
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
                <div className="cred-grid">
                    {credentials.map((cred) => (
                        <CredentialCard key={cred.id} credential={cred} onSaved={handleSaved} />
                    ))}
                </div>
            )}
        </div>
    );
}
