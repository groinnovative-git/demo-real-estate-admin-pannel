import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ChevronDown, ChevronRight,
    LogOut, Building, Home, TreePine, Store, Landmark, Plus, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import logoImg from '../assets/logo.png';

const PROPERTY_TYPES = [
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'villa', label: 'Villa', icon: TreePine },
    { id: 'plot', label: 'Plot', icon: Landmark },
    { id: 'house', label: 'Individual House', icon: Home },
    { id: 'commercial', label: 'Commercial Space', icon: Store },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [addOpen, setAddOpen] = useState(false);
    const popoverRef = useRef(null);
    const triggerRef = useRef(null);

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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <img src={logoImg} alt="Star Properties" className="sidebar-logo-img" />
                {!collapsed && (
                    <>
                        <div className="sidebar-logo-name">Star Properties</div>
                        <div className="sidebar-logo-sub">Admin Panel</div>
                    </>
                )}
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {!collapsed && <div className="sidebar-section-label">Main Menu</div>}

                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Dashboard">
                    <LayoutDashboard size={20} />
                    {!collapsed && <span>Dashboard</span>}
                </NavLink>

                <NavLink to="/properties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Properties">
                    <Building2 size={20} />
                    {!collapsed && <span>Properties</span>}
                </NavLink>

                <NavLink to="/leads" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Leads">
                    <Users size={20} />
                    {!collapsed && <span>Leads</span>}
                </NavLink>

                <div className="sidebar-divider" />
                {!collapsed && <div className="sidebar-section-label">Add Property</div>}

                {/* Add Property Dropdown */}
                <div className="sidebar-dropdown-wrap" style={{ position: 'relative' }}>
                    <button
                        ref={triggerRef}
                        className={`sidebar-link sidebar-dropdown-btn ${addOpen ? 'open' : ''}`}
                        onClick={() => setAddOpen(!addOpen)}
                        title="Add Property"
                    >
                        <Plus size={20} />
                        {!collapsed && (
                            <>
                                <span>Add Property</span>
                                <span className="sidebar-chevron">{addOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                            </>
                        )}
                    </button>

                    {/* Expanded mode: inline submenu */}
                    {!collapsed && addOpen && (
                        <div className="sidebar-submenu">
                            {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    className="sidebar-sub-link"
                                    onClick={() => {
                                        navigate(`/add-property/${id}`);
                                        setAddOpen(false);
                                    }}
                                >
                                    <Icon size={17} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Collapsed mode: floating popover */}
                    {collapsed && addOpen && (
                        <div ref={popoverRef} className="sidebar-popover">
                            <div className="sidebar-popover-title">Add Property</div>
                            {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    className="sidebar-popover-link"
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
                    {!collapsed && (
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
