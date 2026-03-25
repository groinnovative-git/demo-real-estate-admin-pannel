import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

import houseImg      from '../assets/house.jpg';
import famlandImg    from '../assets/famland.jpg';
import appartmentImg from '../assets/Appartment.jpg';
import villaImg      from '../assets/villa.jpg';
import logoImg       from '../assets/logo1.png';

const SLIDES        = [houseImg, famlandImg, appartmentImg, villaImg];
const SLIDE_INTERVAL = 4000;

export default function Login() {
    const { login, error, clearError } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const [form,         setForm]         = useState({ email: '', password: '' });
    const [errors,       setErrors]       = useState({ email: '', password: '' });
    const [showPass,     setShowPass]     = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [successToast, setSuccessToast] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [prevSlide,    setPrevSlide]    = useState(0);
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
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (error) clearError();
    };

    const handleBlur = (e) => {
        validateField(e.target.name, e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEmailValid = validateField('email',    form.email);
        const isPassValid  = validateField('password', form.password);
        if (!isEmailValid || !isPassValid) return;

        setLoading(true);
        const result = await login(form.email, form.password);
        setLoading(false);

        if (result.ok) {
            setSuccessToast(true);
            setTimeout(() => navigate(from, { replace: true }), 1200);
        }
        // On failure, AuthContext sets error — shown via the error banner below
    };

    return (
        <div className="login-page">
            {/* Background slideshow */}
            <div className="login-bg">
                {SLIDES.map((src, i) => {
                    let cls = 'login-slide';
                    if (i === currentSlide) cls += ' active';
                    else if (i === prevSlide) cls += ' prev';
                    return (
                        <img
                            key={i}
                            src={src}
                            alt=""
                            className={cls}
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
                <div className="login-logo">
                    <div className="login-logo-badge">
                        <img src={logoImg} alt="Star Properties" className="login-logo-img" />
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
                            autoComplete="email"
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
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="login-eye"
                                onClick={() => setShowPass(s => !s)}
                                tabIndex={-1}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <div className="login-field-error">{errors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary login-btn ${loading ? 'loading' : ''}`}
                        disabled={loading || successToast}
                    >
                        {loading ? <span className="login-spinner" /> : null}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
