import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const ok = login(form.email, form.password);
            setLoading(false);
            if (ok) navigate('/dashboard');
        }, 600);
    };

    const fillAdmin = () => setForm({ email: 'admin@star.com', password: 'admin123' });
    const fillManager = () => setForm({ email: 'manager@star.com', password: 'manager123' });

    return (
        <div className="login-page">
            {/* Animated background blobs */}
            <div className="login-bg">
                <div className="login-blob login-blob-1" />
                <div className="login-blob login-blob-2" />
                <div className="login-blob login-blob-3" />
            </div>

            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <h1 className="login-brand">Star Properties</h1>
                        <p className="login-tagline">Real Estate Management</p>
                    </div>
                </div>

                <h2 className="login-title">Welcome back</h2>
                <p className="login-sub">Sign in to access your admin panel</p>

                {error && (
                    <div className="login-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="login-pass-wrap">
                            <input
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="login-eye"
                                onClick={() => setShowPass(s => !s)}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={`btn btn-primary login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? <span className="login-spinner" /> : null}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Quick demo fill */}
                <div className="login-demo">
                    <span>Quick login:</span>
                    <button type="button" onClick={fillAdmin} className="login-demo-btn">Admin</button>
                    <button type="button" onClick={fillManager} className="login-demo-btn">Manager</button>
                </div>

                <div className="login-creds">
                    <div className="login-cred-row">
                        <span className="badge badge-gold">Admin</span>
                        <code>admin@star.com</code>
                        <code>admin123</code>
                    </div>
                    <div className="login-cred-row">
                        <span className="badge badge-info">Manager</span>
                        <code>manager@star.com</code>
                        <code>manager123</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
