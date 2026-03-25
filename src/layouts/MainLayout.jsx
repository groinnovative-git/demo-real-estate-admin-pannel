import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { PropertyProvider } from '../context/PropertyContext';

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 72;

export default function MainLayout() {
    const { isAuthenticated } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 1024);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <PropertyProvider>
            <div
                className="app-shell"
                style={{ '--sidebar-width': `${sidebarWidth}px` }}
            >
                {/* Mobile Overlay */}
                {!sidebarCollapsed && (
                    <div
                        className="sidebar-mobile-overlay"
                        onClick={() => setSidebarCollapsed(true)}
                    />
                )}
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(c => !c)}
                />
                <div className="main-content">
                    <Header
                        sidebarCollapsed={sidebarCollapsed}
                        onToggleSidebar={() => setSidebarCollapsed(c => !c)}
                    />
                    <div className="page-content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </PropertyProvider>
    );
}
