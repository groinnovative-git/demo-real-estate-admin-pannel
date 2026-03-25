import React from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Rectangle,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Landmark, BadgeCheck, Handshake, Activity, UserCheck,
    TrendingUp, TrendingDown, Phone, Mail, Clock, Calendar
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { chartMonthlyData, totalVisitors } from '../data/mockData';
import './Dashboard.css';

const GRADIENTS = {
    green:  'linear-gradient(135deg, #86c127 0%, #5da00e 100%)',
    blue:   'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    red:    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gold:   'linear-gradient(135deg, #f5b642 0%, #d9960a 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
};

const StatCard = ({ label, value, icon: Icon, color, gradient }) => (
    <div className="stat-card">
        <div className="stat-card-icon-wrap" style={{ 
            background: gradient || GRADIENTS.green,
            color: '#ffffff',
            boxShadow: `0 6px 16px -2px ${color}40`
        }}>
            {Icon && <Icon size={18} strokeWidth={1.8} />}
        </div>
        <div className="stat-card-content">
            <span className="stat-card-label">{label}</span>
            <span className="stat-card-value">{value}</span>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip-premium">
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}, 2025</div>
                <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0d6933', boxShadow: '0 0 0 3px rgba(13,105,51,0.15)' }} />
                    {payload[0].value} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', transform: 'translateY(1px)' }}>Sold</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { properties, activeProperties, soldProperties, leads } = useProperties();
    // Calculate property type distribution from real API data
    const propertyTypeCounts = properties.reduce((acc, prop) => {
        acc[prop.type] = (acc[prop.type] || 0) + 1;
        return acc;
    }, {});

    const propertyTypeData = Object.entries(propertyTypeCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: name === 'apartment' ? '#86c127' :
               name === 'villa'     ? '#f5b642' :
               name === 'plot'      ? '#3B82F6' :
               name === 'house'     ? '#F59E0B' : '#EF4444',
    }));

    // Chart data — static monthly trend (no backend endpoint for this)
    const soldData = chartMonthlyData.map(d => ({
        month: d.month,
        sold: Math.floor(d.listings * 0.6),
    }));

    const stats = [
        { label: 'Total properties', value: properties.length.toString(), icon: Landmark, color: '#86c127', gradient: GRADIENTS.green },
        { label: 'Active properties', value: activeProperties.length.toString(), icon: BadgeCheck, color: '#3B82F6', gradient: GRADIENTS.blue },
        { label: 'Sold properties', value: soldProperties.length.toString(), icon: Handshake, color: '#ef4444', gradient: GRADIENTS.red },
        { label: 'Leads', value: leads.length.toString(), icon: UserCheck, color: '#f5b642', gradient: GRADIENTS.gold },
        { label: 'Visitors', value: totalVisitors.toLocaleString(), icon: Activity, color: '#8b5cf6', gradient: GRADIENTS.purple },
    ];

    const recentLeads = [...leads].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return (
        <div className="dashboard fade-in">
            {/* Stat Cards */}
            <div className="dashboard-stats">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Charts Row */}
            <div className="dashboard-charts">
                {/* Large AreaChart for Sold Out Properties */}
                <div className="card premium-chart-main" style={{ height: 440 }}>
                    <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 32 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                                <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Properties Sold</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4, fontWeight: 500, margin: '4px 0 0' }}>Performance over the last year</p>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <select className="premium-dropdown">
                                    <option>Monthly</option>
                                    <option>Quarterly</option>
                                    <option>Yearly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={soldData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="premiumSold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0d6933" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#0d6933" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }} axisLine={false} tickLine={false} dy={14} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-14} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="sold"
                                    name="Sold Out"
                                    stroke="#0d6933"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#premiumSold)"
                                    activeDot={{ r: 6, fill: '#ffffff', stroke: '#0d6933', strokeWidth: 3, style: { filter: 'drop-shadow(0 4px 6px rgba(13,105,51,0.3))' } }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card premium-donut-card">
                    <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Property Distribution</h3>
                    </div>

                    <div style={{ position: 'relative', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={propertyTypeData}
                                    cx="50%" cy="50%" innerRadius={76} outerRadius={96} paddingAngle={6} dataKey="value" stroke="none"
                                >
                                    {propertyTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => [v, 'Properties']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px', fontWeight: 600 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center-text">
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.02em' }}>{properties.length}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>Total</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {propertyTypeData.map((type, i) => (
                            <div key={i} className="premium-donut-legend-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 14, height: 14, background: type.color, borderRadius: '4px', boxShadow: `0 2px 8px ${type.color}40` }} />
                                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{type.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{type.value}</span>
                                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', padding: '4px 10px', borderRadius: 16 }}>{((type.value / properties.length) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Latest Leads */}
            <div className="card premium-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Latest Leads</h3>
                        <span style={{ fontSize: '0.75rem', background: '#f8fafc', color: '#64748b', padding: '4px 12px', borderRadius: 20, fontWeight: 700, border: '1px solid #e2e8f0', letterSpacing: '0.02em' }}>{leads.length} Total</span>
                    </div>
                    <button className="btn-text" style={{ color: '#86c127', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View All Leads</button>
                </div>
                <div className="table-responsive" style={{ margin: '0 -32px', overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Property Interest</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLeads.map((lead, i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#059669', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)' }}>
                                                {lead.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>{lead.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>{lead.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{lead.interest}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{lead.date}</div>
                                    </td>
                                    <td>
                                        <span style={{ 
                                            padding: '6px 14px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: lead.status === 'new' ? '#eff6ff' : lead.status === 'inprogress' ? '#fffbeb' : '#f0fdf4',
                                            color: lead.status === 'new' ? '#2563EB' : lead.status === 'inprogress' ? '#D97706' : '#16A34A',
                                            border: `1px solid ${lead.status === 'new' ? '#bfdbfe' : lead.status === 'inprogress' ? '#fde68a' : '#bbf7d0'}`,
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                        }}>
                                            {lead.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
