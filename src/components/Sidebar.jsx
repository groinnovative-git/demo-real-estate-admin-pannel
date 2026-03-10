import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, Users, ChevronDown, ChevronRight,
    LogOut, Building, Home, TreePine, Store, Landmark, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const PROPERTY_TYPES = [
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'villa', label: 'Villa', icon: TreePine },
    { id: 'plot', label: 'Plot', icon: Landmark },
    { id: 'house', label: 'Individual House', icon: Home },
    { id: 'commercial', label: 'Commercial Space', icon: Store },
];

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [addOpen, setAddOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Building2 size={22} />
                </div>
                <div>
                    <div className="sidebar-logo-name">Star Properties</div>
                    <div className="sidebar-logo-sub">Admin Panel</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Main Menu</div>

                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/properties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <Building2 size={18} />
                    <span>Properties</span>
                </NavLink>

                <NavLink to="/leads" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <Users size={18} />
                    <span>Leads</span>
                </NavLink>

                <div className="sidebar-divider" />
                <div className="sidebar-section-label">Add Property</div>

                {/* Add Property Dropdown */}
                <button
                    className={`sidebar-link sidebar-dropdown-btn ${addOpen ? 'open' : ''}`}
                    onClick={() => setAddOpen(!addOpen)}
                >
                    <Plus size={18} />
                    <span>Add Property</span>
                    <span className="sidebar-chevron">{addOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                </button>

                {addOpen && (
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
                                <Icon size={15} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* User / Logout */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{user?.avatar || user?.name?.[0]}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className={`sidebar-role-badge ${user?.role}`}>{user?.role}</div>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
