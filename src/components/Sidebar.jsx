import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, ChevronDown, ChevronRight,
    LogOut, Building, Home, TreePine, Store, Landmark, Plus, Building2, KeyRound, Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import starLogoImg from '../assets/starlogo.png';
import logo1Img from '../assets/logo1.png';

const PROPERTY_TYPES = [
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'villa', label: 'Villa', icon: TreePine },
    { id: 'plot', label: 'Plot', icon: Landmark },
    { id: 'house', label: 'Individual House', icon: Home },
    { id: 'commercial', label: 'Commercial Space', icon: Store },
    { id: 'farmland', label: 'Farm Land', icon: Leaf },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout, isAdmin, isSuperAdmin, isManager } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
    const [addOpen, setAddOpen] = useState(false);

    // True whenever any /add-property/* child is the active route
    const isAddPropertyActive = location.pathname.startsWith('/add-property');
    const popoverRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showFull = !collapsed || isMobile;

    // Close popover on outside click (collapsed mode)
    useEffect(() => {
        if (!collapsed || !addOpen) return;
        const handleClick = (e) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)
            ) {
                setAddOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [collapsed, addOpen]);

    // Close dropdown when switching between collapsed/expanded
    useEffect(() => {
        setAddOpen(false);
    }, [collapsed]);

    // Auto-expand when navigating to any add-property child (including page refresh)
    useEffect(() => {
        if (location.pathname.startsWith('/add-property')) {
            setAddOpen(true);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${collapsed && !isMobile ? 'collapsed' : ''} ${collapsed && isMobile ? 'mobile-hidden' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-badge">
                    <img src={collapsed && !isMobile ? starLogoImg : logo1Img} alt="Star Properties" className="sidebar-logo-img" />
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {showFull && <div className="sidebar-section-label">Main Menu</div>}

                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Dashboard">
                    <LayoutDashboard size={20} />
                    {showFull && <span>Dashboard</span>}
                </NavLink>

                <NavLink to="/properties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Properties">
                    <Building2 size={20} />
                    {showFull && <span>Properties</span>}
                </NavLink>

                <NavLink to="/leads" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Leads">
                    <Users size={20} />
                    {showFull && <span>Leads</span>}
                </NavLink>

                {(isSuperAdmin || isAdmin || isManager) && (
                    <NavLink to="/credentials" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Login Credentials">
                        <KeyRound size={20} />
                        {showFull && <span>Login Credentials</span>}
                    </NavLink>
                )}

                <div className="sidebar-divider" />
                {showFull && <div className="sidebar-section-label">Add Property</div>}

                {/* Add Property Dropdown */}
                <div className="sidebar-dropdown-wrap" style={{ position: 'relative' }}>
                    <button
                        ref={triggerRef}
                        className={`sidebar-link sidebar-dropdown-btn ${addOpen ? 'open' : ''} ${isAddPropertyActive || addOpen ? 'active' : ''}`}
                        onClick={() => setAddOpen(!addOpen)}
                        title="Add Property"
                    >
                        <Plus size={20} />
                        {showFull && (
                            <>
                                <span>Add Property</span>
                                <span className="sidebar-chevron">{addOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                            </>
                        )}
                    </button>

                    {/* Expanded mode: inline submenu */}
                    {showFull && addOpen && (
                        <div className="sidebar-submenu">
                            {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    className={`sidebar-sub-link${location.pathname === `/add-property/${id}` ? ' active' : ''}`}
                                    onClick={() => navigate(`/add-property/${id}`)}
                                >
                                    <Icon size={17} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Collapsed mode: floating popover */}
                    {!showFull && addOpen && (
                        <div ref={popoverRef} className="sidebar-popover">
                            <div className="sidebar-popover-title">Add Property</div>
                            {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    className={`sidebar-popover-link${location.pathname === `/add-property/${id}` ? ' active' : ''}`}
                                    onClick={() => {
                                        navigate(`/add-property/${id}`);
                                        setAddOpen(false);
                                    }}
                                >
                                    <Icon size={16} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {/* User / Logout */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{user?.avatar || user?.name?.[0]}</div>
                    {showFull && (
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className={`sidebar-role-badge ${user?.role}`}>{user?.role}</div>
                        </div>
                    )}
                </div>
                <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
