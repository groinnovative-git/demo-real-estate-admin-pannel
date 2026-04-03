import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users,
    Building, Home, TreePine, Store, Landmark, Building2, KeyRound, Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import starLogoImg from '../assets/starlogo.png';
import logo1Img from '../assets/Star.png';

const PROPERTY_TYPES = [
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'villa', label: 'Villa', icon: TreePine },
    { id: 'plot', label: 'Plot', icon: Landmark },
    { id: 'house', label: 'Individual House', icon: Home },
    { id: 'commercial', label: 'Commercial Space', icon: Store },
    { id: 'farmland', label: 'Farm Land', icon: Leaf },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { isAdmin, isSuperAdmin, isManager } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showFull = !collapsed || isMobile;

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

                {/* Static Add Property Links (No Dropdown) */}
                {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                    <NavLink
                        key={id}
                        to={`/add-property/${id}`}
                        className={({ isActive }) => `sidebar-link sidebar-property-link ${isActive ? 'active' : ''}`}
                        title={`Add ${label}`}
                    >
                        <Icon size={20} />
                        {showFull && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User / Logout */}
            {/* <div className="sidebar-footer">
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
            </div> */}
        </aside>
    );
}
