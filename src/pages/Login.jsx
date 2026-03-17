import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    const [errors, setErrors] = useState({ email: '', password: '' });
    
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successToast, setSuccessToast] = useState(false);
    
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

    const validateField = (name, value) => {
        let errMsg = '';
        if (!value.trim()) {
            errMsg = name === 'email' ? 'Email is required.' : 'Password is required.';
        } else if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
            errMsg = 'Please enter a valid email address.';
        }
        
        setErrors(prev => ({ ...prev, [name]: errMsg }));
        return !errMsg;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        
        // Clear field error as soon as they type
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (error) clearError();
    };

    const handleBlur = (e) => {
        validateField(e.target.name, e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields manually
        const isEmailValid = validateField('email', form.email);
        const isPassValid = validateField('password', form.password);
        
        if (!isEmailValid || !isPassValid) {
            return; // Don't submit if validation fails
        }
        
        setLoading(true);
        setTimeout(() => {
            const ok = login(form.email, form.password);
            setLoading(false);
            if (ok) {
                setSuccessToast(true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1200); // Wait 1.2s to show success toast then redirect
            }
        }, 600);
    };

    const fillAdmin = () => {
        setForm({ email: 'admin@star.com', password: 'admin123' });
        setErrors({ email: '', password: '' });
        if (error) clearError();
    };
    
    const fillManager = () => {
        setForm({ email: 'manager@star.com', password: 'manager123' });
        setErrors({ email: '', password: '' });
        if (error) clearError();
    };

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

            {/* Success Toast */}
            {successToast && (
                <div className="login-toast-success">
                    <CheckCircle2 size={18} />
                    <span>Successfully logged in</span>
                </div>
            )}

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

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <div className="login-field-error">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="login-pass-wrap">
                            <input
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="login-eye"
                                onClick={() => setShowPass(s => !s)}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <div className="login-field-error">{errors.password}</div>}
                    </div>

                    <button type="submit" className={`btn btn-primary login-btn ${loading ? 'loading' : ''}`} disabled={loading || successToast}>
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
