import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

import houseImg from '../assets/house.jpg';
import famlandImg from '../assets/famland.jpg';
import appartmentImg from '../assets/Appartment.jpg';
import villaImg from '../assets/villa.jpg';
import logoImg from '../assets/logo.png';

const SLIDES = [houseImg, famlandImg, appartmentImg, villaImg];
const SLIDE_INTERVAL = 4000;

export default function Login() {
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [prevSlide, setPrevSlide] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrentSlide(prev => {
                setPrevSlide(prev);
                return (prev + 1) % SLIDES.length;
            });
        }, SLIDE_INTERVAL);

        return () => clearInterval(intervalRef.current);
    }, []);

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
            {/* Background image slideshow */}
            <div className="login-bg">
                {SLIDES.map((src, i) => {
                    let slideClass = 'login-slide';
                    if (i === currentSlide) slideClass += ' active';
                    else if (i === prevSlide) slideClass += ' prev';
                    return (
                        <img
                            key={i}
                            src={src}
                            alt=""
                            className={slideClass}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            draggable="false"
                        />
                    );
                })}
                <div className="login-overlay" />
            </div>

            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <img src={logoImg} alt="Star Properties" className="login-logo-img" />
                    <h1 className="login-brand">Star Properties</h1>
                    <p className="login-tagline">Real Estate Management</p>
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
