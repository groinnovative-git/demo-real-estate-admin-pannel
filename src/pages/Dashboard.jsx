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
import { dashboardStats } from '../data/mockData';
import './Dashboard.css';

const GRADIENTS = {
    green:  'linear-gradient(135deg, #86c127 0%, #5da00e 100%)',
    blue:   'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    red:    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gold:   'linear-gradient(135deg, #f5b642 0%, #d9960a 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
};

const StatCard = ({ label, value, icon: Icon, color, gradient }) => (
    <div className="stat-card" style={{ 
        padding: '20px 22px', 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center', 
        gap: 16, 
        height: '100%'
    }}>
        <div style={{ 
            width: 46, 
            height: 46, 
            borderRadius: '12px', 
            background: gradient || GRADIENTS.green,
            color: '#ffffff',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 6px 16px -2px ${color}40`
        }}>
            {Icon && <Icon size={20} strokeWidth={1.8} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                color: '#94a3b8', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                lineHeight: 1.2
            }}>
                {label}
            </span>
            <span style={{ 
                fontSize: '1.55rem', 
                fontWeight: 800, 
                lineHeight: 1.2, 
                color: '#0f172a',
                letterSpacing: '-0.02em'
            }}>
                {value}
            </span>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip-label">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { properties, activeProperties, soldProperties, leads } = useProperties();
    const { monthlyData, totalVisitors } = dashboardStats;

    // Calculate property type distribution
    const propertyTypeCounts = properties.reduce((acc, prop) => {
        acc[prop.type] = (acc[prop.type] || 0) + 1;
        return acc;
    }, {});

    const propertyTypeData = Object.entries(propertyTypeCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: name === 'apartment' ? '#86c127' :
               name === 'villa' ? '#f5b642' :
               name === 'plot' ? '#3B82F6' :
               name === 'house' ? '#F59E0B' : '#EF4444'
    }));

    // Data for Sold Out Properties
    const soldData = monthlyData.map(d => ({
        month: d.month,
        sold: Math.floor(d.listings * 0.6)
    }));

    const stats = [
        { label: 'Total properties', value: properties.length.toString(), icon: Landmark, color: '#86c127', gradient: GRADIENTS.green },
        { label: 'Active properties', value: activeProperties.length.toString(), icon: BadgeCheck, color: '#3B82F6', gradient: GRADIENTS.blue },
        { label: 'Sold properties', value: soldProperties.length.toString(), icon: Handshake, color: '#ef4444', gradient: GRADIENTS.red },
        { label: 'Leads', value: leads.length.toString(), icon: UserCheck, color: '#f5b642', gradient: GRADIENTS.gold },
        { label: 'Visitors', value: totalVisitors.toLocaleString(), icon: Activity, color: '#8b5cf6', gradient: GRADIENTS.purple },
    ];

    const recentLeads = [...leads].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

    return (
        <div className="dashboard fade-in">
            {/* Stat Cards */}
            <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 24 }}>
                {/* Large AreaChart for Sold Out Properties */}
                <div className="card dashboard-chart-main" style={{ height: 420, display: 'flex', flexDirection: 'column', padding: '24px' }}>
                    <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Properties Sold</div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <select className="form-control" style={{ width: 120, padding: '6px 12px' }}>
                                    <option>Monthly</option>
                                    <option>Yearly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <AreaChart data={soldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#86c127" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#86c127" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div style={{ background: '#111827', color: 'white', padding: '8px 12px', borderRadius: 4, fontSize: '0.8rem', textAlign: 'center' }}>
                                            <div style={{ color: '#9ca3af', marginBottom: 4 }}>{label}, 2025</div>
                                            <div style={{ fontWeight: 500 }}>{payload[0].value} Properties Sold</div>
                                        </div>
                                    );
                                }
                                return null;
                            }} cursor={{ stroke: '#86c127', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area
                                type="monotone"
                                dataKey="sold"
                                name="Sold Out"
                                stroke="#86c127"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorSold)"
                                activeDot={{ r: 6, fill: '#86c127', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
                    <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Property Distribution</span>
                    </div>

                    <div style={{ position: 'relative', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={propertyTypeData}
                                    cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none"
                                >
                                    {propertyTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => [v, 'Properties']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{properties.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>Total</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {propertyTypeData.map((type, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 10, height: 10, background: type.color, borderRadius: '50%' }} />
                                    <span style={{ fontWeight: 500, color: '#475569' }}>{type.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{type.value}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{((type.value / properties.length) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Latest Leads */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Latest Leads</span>
                        <span style={{ fontSize: '0.75rem', background: '#f8fafc', color: '#64748b', padding: '2px 10px', borderRadius: 20, fontWeight: 600, border: '1px solid #e2e8f0' }}>{leads.length} total</span>
                    </div>
                    <button className="btn-text" style={{ color: '#86c127', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>View all leads</button>
                </div>
                <div style={{ margin: '0 -24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                                <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property Interest</th>
                                <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLeads.map((lead, i) => (
                                <tr key={i} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>
                                                {lead.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{lead.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lead.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{lead.interest}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{lead.date}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ 
                                            padding: '6px 12px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em',
                                            background: lead.status === 'new' ? '#eff6ff' : lead.status === 'inprogress' ? '#fffbeb' : '#f0fdf4',
                                            color: lead.status === 'new' ? '#3B82F6' : lead.status === 'inprogress' ? '#F59E0B' : '#22C55E'
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
