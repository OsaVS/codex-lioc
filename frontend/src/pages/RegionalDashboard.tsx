import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import StationMap from '../components/dashboard/StationMap';
import type { StationLocation, RefuelRequest } from '../types/replenishment';
import {
  MapIcon,
  ClipboardDocumentCheckIcon,
  PresentationChartBarIcon,
  TruckIcon,
  CalendarDaysIcon,
  SparklesIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

// ── 6 Sri Lankan LIOC stations in Western Province ──────────────────────────
const MOCK_STATIONS: StationLocation[] = [
  { stationId: 'STN001', name: 'Colombo 03 LIOC', address: '12/1 Galle Rd, Colombo 03', latitude: 6.9128, longitude: 79.8507, status: 'NORMAL' },
  { stationId: 'STN002', name: 'Nugegoda Junction', address: 'High Level Rd, Nugegoda', latitude: 6.8649, longitude: 79.8997, status: 'CRITICAL' },
  { stationId: 'STN003', name: 'Dehiwala LIOC', address: '45 Station Rd, Dehiwala', latitude: 6.8402, longitude: 79.8712, status: 'LOW' },
  { stationId: 'STN004', name: 'Moratuwa City', address: 'New Rd, Moratuwa', latitude: 6.7731, longitude: 79.8820, status: 'NORMAL' },
  { stationId: 'STN005', name: 'Panadura Central', address: 'Galle Rd, Panadura', latitude: 6.7135, longitude: 79.9069, status: 'LOW' },
  { stationId: 'STN006', name: 'Kaduwela Express', address: 'Colombo–Kandy Rd, Kaduwela', latitude: 6.9278, longitude: 79.9844, status: 'NORMAL' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const loadRequestsFromStorage = (): RefuelRequest[] => {
  const data = localStorage.getItem('lioc_refuel_requests');
  if (data) return JSON.parse(data);
  return [];
};

const saveRequestsToStorage = (reqs: RefuelRequest[]) =>
  localStorage.setItem('lioc_refuel_requests', JSON.stringify(reqs));

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  SUBMITTED: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  APPROVED: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  SCHEDULED: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  DELIVERED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const STATION_STATUS_STYLE: Record<string, string> = {
  NORMAL: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  LOW: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse',
};

export default function RegionalDashboard() {
  const logout = useAuthStore(state => state.logout);
  const [activeTab, setActiveTab] = useState<'map' | 'approvals' | 'analytics'>('map');
  const [requests, setRequests] = useState<RefuelRequest[]>([]);

  useEffect(() => { setRequests(loadRequestsFromStorage()); }, []);

  const updateRequestStatus = (id: string, updates: Partial<RefuelRequest>) => {
    const updated = requests.map(r => r.requestId === id ? { ...r, ...updates } : r);
    setRequests(updated);
    saveRequestsToStorage(updated);
  };

  const handleApprove = (id: string, qty: number) => updateRequestStatus(id, { status: 'APPROVED', approvedQuantity: qty });
  const handleReject = (id: string) => updateRequestStatus(id, { status: 'REJECTED' });
  const handleSchedule = (id: string) => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0);
    updateRequestStatus(id, { status: 'SCHEDULED', scheduledDeliveryTime: d.toISOString() });
  };
  const handleDeliver = (id: string, qty: number) => updateRequestStatus(id, { status: 'DELIVERED', deliveredQuantity: qty, deliveryTime: new Date().toISOString() });

  const TABS = [
    { key: 'map' as const, label: 'Network Map', Icon: MapIcon },
    { key: 'approvals' as const, label: 'Order Approvals', Icon: ClipboardDocumentCheckIcon },
    { key: 'analytics' as const, label: 'Executive KPIs', Icon: PresentationChartBarIcon },
  ];

  const activeTickets = requests.filter(r => ['SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#06030F', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="glass-navbar sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[62px] gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-500/25" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15))' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 7 7 7 12a5 5 0 0010 0c0-3-2-5-2-5s-.5 2.5-2 3.5C13.5 9 14 6 12 2z" fill="rgba(167,139,250,0.9)" />
                </svg>
                <span className="font-black text-white text-sm tracking-widest uppercase" style={{ fontFamily: 'Space Grotesk' }}>Lanka IOC</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-100 font-bold text-base" style={{ fontFamily: 'Space Grotesk' }}>IMS</span>
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/20">Regional Manager</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-violet-500/12">
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); if (key === 'approvals') setRequests(loadRequestsFromStorage()); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === key ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  style={activeTab === key ? { background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 2px 12px rgba(124,58,237,0.4)' } : {}}
                >
                  <Icon style={{ width: '15px', height: '15px' }} />
                  {label}
                  {key === 'approvals' && activeTickets.length > 0 && activeTab !== 'approvals' && (
                    <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {activeTickets.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <BuildingOffice2Icon style={{ width: '12px', height: '12px' }} />
                  Western Province Region
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-mono">{MOCK_STATIONS.length} Stations Managed</div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-300">
                <UserCircleIcon style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                <span className="hidden sm:inline font-medium">Dilantha Fernando</span>
              </div>
              <button onClick={logout} className="text-xs border border-blue-500/20 text-blue-300 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-7 w-full space-y-6">

        {/* ════════════════════════════════════════════════════════
            TAB 1: NETWORK MAP
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
                Regional Network Overview
              </h1>
              {/* <p className="text-slate-500 text-base mt-1">
                Geographic distribution, sensor alerts, and fleet status (FR-4.1)
              </p> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <StationMap stations={MOCK_STATIONS} />
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  {
                    label: 'Managed Stations', value: MOCK_STATIONS.length.toString(),
                    sub: 'Western Province', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)'
                  },
                  {
                    label: 'Critical Fuel Stock', value: MOCK_STATIONS.filter(s => s.status === 'CRITICAL').length.toString(),
                    sub: 'Require immediate replenishment', color: '#EF4444', bg: 'rgba(239,68,68,0.1)'
                  },
                  {
                    label: 'Active Refuel Orders', value: activeTickets.length.toString(),
                    sub: 'Submitted / Approved / Scheduled', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'
                  },
                  {
                    label: 'Stations at Low Level', value: MOCK_STATIONS.filter(s => s.status === 'LOW').length.toString(),
                    sub: 'Below 30% threshold', color: '#2563EB', bg: 'rgba(37,99,235,0.1)'
                  },
                ].map(kpi => (
                  <div key={kpi.label} className="glass-card p-5 rounded-2xl border border-violet-500/15 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: kpi.color }} />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{kpi.label}</p>
                    <div className="mt-2">
                      <p className="text-5xl font-black font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
                      <p className="text-slate-500 text-xs mt-1">{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Station Status Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-violet-500/15">
              <div className="px-6 py-5 border-b border-violet-500/12">
                <h2 className="font-bold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Station Status Matrix
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">Live fuel level and operational status for all managed stations</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full lioc-table">
                  <thead style={{ background: 'rgba(124,58,237,0.06)' }}>
                    <tr>
                      <th className="text-left">Station</th>
                      <th className="text-left">Location</th>
                      <th className="text-center">Status</th>
                      <th className="text-right">Est. Petrol Lvl</th>
                      <th className="text-right">Est. Diesel Lvl</th>
                      <th className="text-right">Active Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_STATIONS.map((stn, i) => {
                      const stationRequests = requests.filter(r => r.stationId === stn.stationId && ['SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status));
                      // Mock fuel levels per station
                      const petrolLevels = [63, 31, 28, 72, 29, 81];
                      const dieselLevels = [17, 8, 55, 68, 44, 79];
                      const petrol = petrolLevels[i];
                      const diesel = dieselLevels[i];

                      return (
                        <tr key={stn.stationId}>
                          <td>
                            <div className="font-bold text-slate-100">{stn.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{stn.stationId}</div>
                          </td>
                          <td>
                            <span className="text-slate-400 text-sm">{stn.address}</span>
                          </td>
                          <td className="text-center">
                            <span className={`status-badge border ${STATION_STATUS_STYLE[stn.status]}`}>
                              {stn.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <span className={`font-bold font-mono text-base ${petrol < 30 ? 'text-amber-400' : 'text-white'}`}>{petrol}%</span>
                          </td>
                          <td className="text-right">
                            <span className={`font-bold font-mono text-base ${diesel < 20 ? 'text-red-400' : 'text-white'}`}>{diesel}%</span>
                          </td>
                          <td className="text-right">
                            <span className="font-mono font-bold text-violet-300">{stationRequests.length || '—'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB 2: ORDER APPROVALS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Replenishment Workflow Board
              </h1>
              {/* <p className="text-slate-500 text-base mt-1">
                Approve, schedule deliveries, and log fulfilment across all stations (FR-3.3 & FR-3.4)
              </p> */}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-violet-500/15">
              <div className="px-6 py-5 border-b border-violet-500/12 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    Replenishment Tickets
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">Submitted → Approved → Scheduled → Delivered</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    {requests.filter(r => r.status === 'SUBMITTED').length} pending
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                    {requests.filter(r => r.status === 'APPROVED').length} approved
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    {requests.filter(r => r.status === 'SCHEDULED').length} en route
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full lioc-table">
                  <thead style={{ background: 'rgba(124,58,237,0.06)' }}>
                    <tr>
                      <th className="text-left">Station / Request</th>
                      <th className="text-left">Fuel Type</th>
                      <th className="text-right">Volume</th>
                      <th className="text-left">Dispatch Details</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.requestId}>
                        <td>
                          <div className="font-bold text-slate-100">{req.stationName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{req.stationId} · {req.requestId}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{new Date(req.requestedDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-300">{req.fuelType}</span>
                        </td>
                        <td className="text-right">
                          <div className="font-black font-mono text-base text-white">{req.requestedQuantity.toLocaleString()} L</div>
                          {req.approvedQuantity && req.approvedQuantity !== req.requestedQuantity && (
                            <div className="text-xs text-violet-400 font-mono mt-0.5">Approved: {req.approvedQuantity.toLocaleString()} L</div>
                          )}
                        </td>
                        <td>
                          {req.status === 'DELIVERED' && (
                            <div>
                              <div className="text-emerald-400 font-bold text-sm">{(req.deliveredQuantity ?? 0).toLocaleString()} L delivered</div>
                              <div className="text-slate-500 text-xs font-mono mt-0.5">{req.deliveryTime ? new Date(req.deliveryTime).toLocaleString('en-LK') : ''}</div>
                            </div>
                          )}
                          {req.status === 'SCHEDULED' && (
                            <div>
                              <div className="text-amber-400 font-semibold text-sm">ETA: {req.scheduledDeliveryTime ? new Date(req.scheduledDeliveryTime).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                            </div>
                          )}
                          {['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(req.status) && (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`status-badge border ${STATUS_BADGE[req.status] ?? STATUS_BADGE.DRAFT}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {req.status === 'SUBMITTED' && (
                              <>
                                <button onClick={() => handleApprove(req.requestId, req.requestedQuantity)}
                                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white cursor-pointer transition-all"
                                  style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
                                  Approve
                                </button>
                                <button onClick={() => handleReject(req.requestId)}
                                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer transition-all">
                                  Reject
                                </button>
                              </>
                            )}
                            {req.status === 'APPROVED' && (
                              <button onClick={() => handleSchedule(req.requestId)}
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer transition-all">
                                <CalendarDaysIcon style={{ width: '13px', height: '13px' }} />
                                Schedule
                              </button>
                            )}
                            {req.status === 'SCHEDULED' && (
                              <button onClick={() => handleDeliver(req.requestId, req.approvedQuantity ?? req.requestedQuantity)}
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition-all">
                                <TruckIcon style={{ width: '13px', height: '13px' }} />
                                Delivered
                              </button>
                            )}
                            {['DELIVERED', 'REJECTED', 'DRAFT'].includes(req.status) && (
                              <span className="text-slate-700">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-600">
                          No active requests in the regional board. Switch to a Station Manager account to generate requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB 3: EXECUTIVE KPIs
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Executive Dashboard
              </h1>
              {/* <p className="text-slate-500 text-base mt-1">
                Network-wide fuel turnover, stockout indices, and fleet dispatch efficiency (FR-4.3)
              </p> */}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Network Fuel Inventory', value: '612,500 L', delta: '+3.8%', deltaColor: 'text-emerald-400', icon: SparklesIcon, color: '#7C3AED' },
                { label: 'Fuel Turnover Rate', value: '81.2%', delta: '+2.1% WoW', deltaColor: 'text-emerald-400', color: '#2563EB' },
                { label: 'Network Stockouts (30d)', value: '3', delta: 'incidents', deltaColor: 'text-red-400', color: '#EF4444' },
                { label: 'Delivery Efficiency', value: '96.7%', delta: 'actual vs approved', deltaColor: 'text-slate-500', color: '#F59E0B' },
              ].map(kpi => (
                <div key={kpi.label} className="glass-card p-6 rounded-2xl border border-violet-500/15 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: kpi.color }} />
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{kpi.label}</p>
                  <div className="mt-4">
                    <p className="text-4xl font-black font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
                    <p className={`text-sm font-semibold mt-1.5 ${kpi.deltaColor}`}>{kpi.delta}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Consumption Trends + Audit Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-violet-500/15 lg:col-span-2 space-y-5">
                <div>
                  <h2 className="font-bold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    Network Performance Metrics
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">Aggregated across 6 Western Province stations</p>
                </div>
                <div className="space-y-3">
                  {[
                    { metric: 'Daily Consumption (Network Avg)', value: '14,800 L / day', bar: 74, color: '#7C3AED' },
                    { metric: 'Weekend Demand Surge', value: '+11.4%', bar: 85, color: '#2563EB' },
                    { metric: 'Monthly Total Dispatch (June 2026)', value: '432,600 L', bar: 62, color: '#F59E0B' },
                    { metric: 'Average Delivery Lead Time', value: '18.5 hours', bar: 30, color: '#EF4444' },
                    { metric: 'On-Time Delivery Rate', value: '93.2%', bar: 93, color: '#10B981' },
                    { metric: 'Volumetric Discrepancy Rate', value: '0.8% avg', bar: 8, color: '#A78BFA' },
                  ].map(row => (
                    <div key={row.metric} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-slate-400 text-sm">{row.metric}</span>
                          <span className="font-bold font-mono text-white text-sm ml-4 shrink-0">{row.value}</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
                          <div className="h-full rounded-full" style={{ width: `${row.bar}%`, background: row.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-violet-500/15 space-y-4">
                <h2 className="font-bold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Audit Trail
                </h2>
                <div className="space-y-3">
                  {[
                    { event: 'USER LOGIN: Dilantha Fernando', detail: 'IP: 10.0.1.22 · Just now', color: 'text-violet-300' },
                    { event: 'DELIVERY CONFIRMED: REQ-2401', detail: '18,000 L Diesel · STN001 · 2h ago', color: 'text-emerald-400' },
                    { event: 'AUTO REQUEST: STN002 Diesel', detail: 'Critical threshold triggered · 3h ago', color: 'text-red-400' },
                    { event: 'APPROVED: REQ-2403', detail: '8,000 L Petrol 95 · STN001 · 4h ago', color: 'text-violet-300' },
                    { event: 'SCHEDULED: REQ-2402', detail: 'ETA 08-Jun 09:00 · STN001', color: 'text-amber-400' },
                    { event: 'USER LOGIN: Kamal Perera', detail: 'IP: 10.0.1.45 · 6h ago', color: 'text-blue-400' },
                  ].map((entry, i) => (
                    <div key={i} className="flex gap-2.5 pb-3 border-b border-violet-500/8 last:border-0 last:pb-0">
                      {/* <span className="shrink-0 text-base leading-tight mt-0.5">{entry.icon}</span> */}
                      <div>
                        <div className={`text-sm font-semibold ${entry.color}`}>{entry.event}</div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5">{entry.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}