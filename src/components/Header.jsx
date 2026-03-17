import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', sub: 'Overview of your real estate portfolio' },
    '/properties': { title: 'Properties', sub: 'Manage active and sold properties' },
    '/leads': { title: 'Leads', sub: 'Customer enquiries from contact page' },
};

export default function Header({ sidebarCollapsed, onToggleSidebar }) {
    const { user } = useAuth();
    const location = useLocation();

    const path = location.pathname;
    const pageKey = Object.keys(PAGE_TITLES).find(k => path.startsWith(k));
    const pageInfo = PAGE_TITLES[pageKey] || { title: 'Add Property', sub: 'Fill in property details' };

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
                <div className="header-user">
                    <div className="header-avatar">{user?.avatar || user?.name?.[0]}</div>
                    <div className="header-user-info">
                        <span className="header-user-name">{user?.name}</span>
                        <span className="header-user-role">{user?.role}</span>
                    </div>
                    <ChevronDown size={14} className="header-chevron" />
                </div>
            </div>
        </header>
    );
}
