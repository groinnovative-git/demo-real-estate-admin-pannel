import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Landmark, BadgeCheck, Handshake, Activity, UserCheck,
    Eye, ArrowRight,
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { totalVisitors } from '../data/mockData';
import './Dashboard.css';

/* ── Constants ───────────────────────────────────────────────────────────── */
const GRADIENTS = {
    green:  'linear-gradient(135deg, #86c127 0%, #5da00e 100%)',
    blue:   'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    red:    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gold:   'linear-gradient(135deg, #f5b642 0%, #d9960a 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
};

const BASE_YEAR = 2022;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
    { length: CURRENT_YEAR - BASE_YEAR + 1 },
    (_, i) => BASE_YEAR + i
);

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── Seed-based deterministic random (for stable mock data) ──────────── */
const CHART_COLORS = {
    active: '#16a34a',
    sold:   '#ef4444',
};

function seededRand(seed) {
    let h = seed | 0;
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507);
                   h = Math.imul(h ^ (h >>> 13), 3266489909);
                   return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

function generateMonthlyData(year) {
    const rand = seededRand(year * 7919);
    const maxMonth = year === CURRENT_YEAR ? new Date().getMonth() + 1 : 12;
    return MONTH_LABELS.slice(0, maxMonth).map(month => {
        const total = Math.floor(rand() * 12) + 3;
        const sold  = Math.floor(total * (0.3 + rand() * 0.4));
        return { label: month, active: total - sold, sold };
    });
}



/* ── Sub-components ──────────────────────────────────────────────────────── */

const StatCard = ({ label, value, icon: Icon, color, gradient }) => (
    <div className="stat-card">
        <div className="stat-card-icon-wrap" style={{
            background: gradient || GRADIENTS.green,
            boxShadow: `0 4px 12px -2px ${color}40`,
        }}>
            {Icon && <Icon size={16} strokeWidth={1.8} />}
        </div>
        <div className="stat-card-content">
            <span className="stat-card-label">{label}</span>
            <span className="stat-card-value">{value}</span>
        </div>
    </div>
);

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const key = payload[0].dataKey;
    const labelText = key === 'sold' ? 'Sold' : 'Active';
    return (
        <div className="chart-tooltip-premium">
            <div className="tooltip-label">{label}</div>
            <div className="tooltip-value" style={{ color: payload[0].color }}>
                <span className="tooltip-dot" style={{ background: payload[0].color }} />
                {payload[0].value}
                <span className="tooltip-unit">{labelText}</span>
            </div>
        </div>
    );
};

const DonutTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="donut-tooltip-custom">
            <div className="donut-tooltip-name">{payload[0].name}</div>
            <div className="donut-tooltip-value">
                {payload[0].value} <span>properties</span>
            </div>
        </div>
    );
};

import * as propertyApi from '../api/propertyApi';

/* ═════════════════════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
    const navigate = useNavigate();
    const { leads } = useProperties();

    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
    const [chartFilter, setChartFilter]   = useState('active');

    const [apiCounts, setApiCounts] = useState(null);
    const [apiDashboard, setApiDashboard] = useState(null);

    React.useEffect(() => {
        propertyApi.getCountsAndDistribution()
            .then(res => setApiCounts(res.data))
            .catch(err => console.error("Failed to load distribution:", err));
    }, []);

    React.useEffect(() => {
        propertyApi.getPropertyDashboard({ year: selectedYear })
            .then(res => setApiDashboard(res.data))
            .catch(err => console.error("Failed to load dashboard graph:", err));
    }, [selectedYear]);


    /* ── Stats ── */
    const stats = [
        { label: 'Total Properties',  value: apiCounts?.totalProperties ?? 0,  icon: Landmark,  color: '#86c127', gradient: GRADIENTS.green  },
        { label: 'Active Properties', value: apiCounts?.activeProperties ?? 0, icon: BadgeCheck,color: '#3B82F6', gradient: GRADIENTS.blue   },
        { label: 'Sold Properties',   value: apiCounts?.soldProperties ?? 0,   icon: Handshake, color: '#ef4444', gradient: GRADIENTS.red    },
        { label: 'Total Leads',       value: apiCounts?.totalLeads ?? 0,       icon: UserCheck, color: '#f5b642', gradient: GRADIENTS.gold   },
        { label: 'Visitors',          value: totalVisitors.toLocaleString(),   icon: Activity,  color: '#8b5cf6', gradient: GRADIENTS.purple },
    ];

    /* ── Chart data ── */
    const chartData = useMemo(() => {
        if (!apiDashboard || !apiDashboard.graphData) return generateMonthlyData(selectedYear);
        return apiDashboard.graphData.map(item => ({
            label: item.monthName || MONTH_LABELS[item.month - 1],
            active: item.activeCount || 0,
            sold: item.soldOutCount || 0
        }));
    }, [apiDashboard, selectedYear]);

    const chartColor  = CHART_COLORS[chartFilter];
    const gradientId  = `grad_${chartFilter}`;

    /* ── Distribution ── */
    const propertyTypeData = useMemo(() => {
        if (!apiCounts || !apiCounts.distributionByProperties) return [];
        return apiCounts.distributionByProperties.map(entry => {
            const nameLower = (entry.propertyType || '').toLowerCase();
            return {
                name: entry.propertyType,
                value: entry.count,
                percentage: entry.percentage,
                color: nameLower === 'apartment' ? '#86c127' :
                       nameLower === 'villa'     ? '#f5b642' :
                       nameLower === 'plot'      ? '#3B82F6' :
                       nameLower === 'house'     ? '#F59E0B' :
                       nameLower === 'pg'        ? '#0f766e' : '#EF4444',
            };
        });
    }, [apiCounts]);

    const totalPropCount = apiCounts?.totalProperties || 1;

    /* ── Latest leads ── */
    const recentLeads = useMemo(() =>
        [...leads]
            .sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0))
            .slice(0, 6),
    [leads]);

    const handleViewLead = (lead) => {
        navigate(`/leads?id=${lead.contactId}`);
    };

    const formatLeadDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short',
            });
        } catch { return '—'; }
    };

    /* ── Render ── */
    return (
        <div className="dashboard fade-in">

            {/* ═══ Stat Cards ═══ */}
            <div className="dashboard-stats">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* ═══ Full-Width Properties Overview Chart ═══ */}
            <div className="card premium-chart-main">
                <div className="chart-header">
                    <div className="chart-header-left">
                        <h3 className="chart-title">Properties Overview</h3>
                        <p className="chart-subtitle">Jan – Dec {selectedYear}</p>
                    </div>
                    <div className="chart-controls">
                        {/* Active / Sold filter */}
                        <div className="chart-filter-group">
                            {['active', 'sold'].map(f => (
                                <button
                                    key={f}
                                    className={`chart-filter-btn${chartFilter === f ? ' active' : ''}`}
                                    onClick={() => setChartFilter(f)}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        {/* Year Dropdown */}
                        <select
                            className="premium-dropdown"
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                        >
                            {YEAR_OPTIONS.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -28, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor={chartColor} stopOpacity={0.18} />
                                    <stop offset="100%" stopColor={chartColor} stopOpacity={0}    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}
                                axisLine={false} tickLine={false} dy={10}
                            />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}
                                axisLine={false} tickLine={false} dx={-8}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={<ChartTooltip />}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Area
                                type="monotone"
                                dataKey={chartFilter}
                                stroke={chartColor}
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                animationDuration={600}
                                activeDot={{
                                    r: 5,
                                    fill: '#ffffff',
                                    stroke: chartColor,
                                    strokeWidth: 2.5,
                                    style: { filter: `drop-shadow(0 3px 5px ${chartColor}40)` },
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ═══ Distribution + Latest Leads Row ═══ */}
            <div className="dashboard-bottom-row">

                {/* ── Distribution Card (Left) ── */}
                <div className="card premium-donut-card">
                    <div className="donut-header">
                        <h3 className="chart-title">Distribution</h3>
                        <p className="chart-subtitle">By property type</p>
                    </div>

                    <div className="donut-chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={propertyTypeData}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={68}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {propertyTypeData.map((entry, i) => (
                                        <Cell key={`cell-${i}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={<DonutTooltip />}
                                    wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center-text">
                            <div className="donut-center-count">{totalPropCount}</div>
                            <div className="donut-center-label">Total</div>
                        </div>
                    </div>

                    <div className="donut-legend">
                        {propertyTypeData.map((type, i) => (
                            <div key={i} className="donut-legend-item">
                                <div className="donut-legend-left">
                                    <div className="donut-legend-dot" style={{ background: type.color }} />
                                    <span className="donut-legend-name">{type.name}</span>
                                </div>
                                <div className="donut-legend-right">
                                    <span className="donut-legend-count">{type.value}</span>
                                    <span className="donut-legend-pct">
                                        {type.percentage != null ? type.percentage.toFixed(0) : ((type.value / totalPropCount) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Latest Leads Card (Right) ── */}
                <div className="card premium-table-card">
                    <div className="table-card-header">
                        <div className="table-card-title-wrap">
                            <h3 className="chart-title">Latest Leads</h3>
                            <span className="leads-badge">{apiCounts?.totalLeads ?? leads.length} Total</span>
                        </div>
                        <button
                            className="btn-text view-all-btn"
                            onClick={() => navigate('/leads')}
                        >
                            View All <ArrowRight size={13} style={{ marginLeft: 3 }} />
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th style={{ width: 60, textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: 28, color: '#94a3b8', fontSize: '0.82rem' }}>
                                            No leads found
                                        </td>
                                    </tr>
                                ) : (
                                    recentLeads.map((lead, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="lead-customer">
                                                    <div className="lead-avatar">
                                                        {(lead.fullName || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <div className="lead-name">{lead.fullName || '—'}</div>
                                                </div>
                                            </td>
                                            <td><span className="lead-phone">{lead.phoneNumber || '—'}</span></td>
                                            <td><span className="lead-date">{formatLeadDate(lead.createdDate)}</span></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="lead-view-btn"
                                                    title="View lead details"
                                                    onClick={() => handleViewLead(lead)}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
