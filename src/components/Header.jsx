import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, PanelLeftClose, PanelLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', sub: 'Overview of your real estate portfolio' },
    '/properties': { title: 'Properties', sub: 'Manage active and sold properties' },
    '/leads': { title: 'Leads', sub: 'Customer enquiries from contact page' },
    '/credentials': { title: 'Login Credentials', sub: 'Manage default login accounts for each role' },
    '/add-property': { title: 'Add Property', sub: 'Fill in property details' },
};

export default function Header({ sidebarCollapsed, onToggleSidebar }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    
    // State for Profile Dropdown
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const path = location.pathname;
    const pageKey = Object.keys(PAGE_TITLES).find(k => path.startsWith(k));
    const pageInfo = PAGE_TITLES[pageKey] || { title: '', sub: '' };

    return (
        <header className="header">
            <div className="header-left">
                <button
                    className="header-sidebar-toggle"
                    onClick={onToggleSidebar}
                    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                </button>
                <div>
                    <h1 className="header-title">{pageInfo.title}</h1>
                    <span className="header-sub">{pageInfo.sub}</span>
                </div>
            </div>
            <div className="header-right">
                <button className="header-icon-btn">
                    <Bell size={18} />
                    <span className="header-notif-dot" />
                </button>
                
                <div className="header-user-wrapper" ref={profileRef}>
                    <div className="header-user" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        <div className="header-avatar">{user?.avatar || user?.name?.[0] || 'U'}</div>
                        <div className="header-user-info">
                            <span className="header-user-name">{user?.name || 'User'}</span>
                            <span className="header-user-role">{user?.role || 'Guest'}</span>
                        </div>
                        <ChevronDown 
                            size={14} 
                            className="header-chevron" 
                            style={{ 
                                transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }} 
                        />
                    </div>

                    {/* Premium Profile Dropdown Panel */}
                    <div className={`profile-dropdown ${isProfileOpen ? 'open' : ''}`}>
                        <div className="profile-dropdown-header">
                            <div className="profile-dropdown-avatar">
                                {user?.avatar || user?.name?.[0] || 'U'}
                            </div>
                            <div className="profile-dropdown-name">{user?.name || 'Unknown User'}</div>
                            <div className="profile-dropdown-badge">{user?.role || 'User'}</div>
                        </div>
                        <div className="profile-dropdown-body">
                            <div className="profile-info-block">
                                <span className="profile-info-label">Name</span>
                                <span className="profile-info-value">{user?.name || '—'}</span>
                            </div>
                            <div className="profile-info-block">
                                <span className="profile-info-label">Role</span>
                                <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
                            </div>
                            <div className="profile-info-block">
                                <span className="profile-info-label">Username</span>
                                <span className="profile-info-value">{user?.username || user?.userName || user?.userId || '—'}</span>
                            </div>
                            <div className="profile-info-block">
                                <span className="profile-info-label">Email</span>
                                <span className="profile-info-value">{user?.email || '—'}</span>
                            </div>
                        </div>
                        <div className="profile-dropdown-footer">
                            <button className="profile-logout-btn" onClick={logout}>
                                <LogOut size={15} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
