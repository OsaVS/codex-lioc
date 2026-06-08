import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import StationMap from '../components/dashboard/StationMap';
import StationHistoricalChart from '../components/analytics/StationHistoricalChart';
import TankLevelCard from '../components/tanks/TankLevelCard';
import type { StationLocation, RefuelRequest } from '../types/replenishment';
import type { Tank } from '../types/fuel';
import {
  MapIcon,
  ClipboardDocumentCheckIcon,
  PresentationChartBarIcon,
  TruckIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
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

// ── Per-station tank mock data ────────────────────────────────────────────────
const STATION_TANKS: Record<string, Tank[]> = {
  STN001: [
    { tankId: 'TNK-001', stationId: 'STN001', fuelType: 'Petrol 92 Octane', capacity: 15000, currentLevel: 9500, isActive: true, pumps: [{ pumpId: 'P01', name: 'Pump 1A' }, { pumpId: 'P02', name: 'Pump 1B' }] },
    { tankId: 'TNK-002', stationId: 'STN001', fuelType: 'Petrol 95 Octane', capacity: 10000, currentLevel: 3100, isActive: true, pumps: [{ pumpId: 'P04', name: 'Pump 2A' }] },
    { tankId: 'TNK-003', stationId: 'STN001', fuelType: 'Diesel (Auto)', capacity: 25000, currentLevel: 4200, isActive: true, pumps: [{ pumpId: 'P06', name: 'Pump 3A' }, { pumpId: 'P07', name: 'Pump 3B' }] },
    { tankId: 'TNK-004', stationId: 'STN001', fuelType: 'Kerosene', capacity: 8000, currentLevel: 7400, isActive: true, pumps: [{ pumpId: 'P08', name: 'Pump 4A' }] },
  ],
  STN002: [
    { tankId: 'TNK-001', stationId: 'STN002', fuelType: 'Petrol 92 Octane', capacity: 15000, currentLevel: 1800, isActive: true, pumps: [{ pumpId: 'P01', name: 'Pump 1A' }] },
    { tankId: 'TNK-002', stationId: 'STN002', fuelType: 'Petrol 95 Octane', capacity: 10000, currentLevel: 900, isActive: true, pumps: [{ pumpId: 'P04', name: 'Pump 2A' }] },
    { tankId: 'TNK-003', stationId: 'STN002', fuelType: 'Diesel (Auto)', capacity: 25000, currentLevel: 2100, isActive: true, pumps: [{ pumpId: 'P06', name: 'Pump 3A' }] },
    { tankId: 'TNK-004', stationId: 'STN002', fuelType: 'Kerosene', capacity: 8000, currentLevel: 6200, isActive: true, pumps: [{ pumpId: 'P08', name: 'Pump 4A' }] },
  ],
  STN003: [
    { tankId: 'TNK-001', stationId: 'STN003', fuelType: 'Petrol 92 Octane', capacity: 15000, currentLevel: 4200, isActive: true, pumps: [{ pumpId: 'P01', name: 'Pump 1A' }] },
    { tankId: 'TNK-002', stationId: 'STN003', fuelType: 'Petrol 95 Octane', capacity: 10000, currentLevel: 2800, isActive: true, pumps: [{ pumpId: 'P04', name: 'Pump 2A' }] },
    { tankId: 'TNK-003', stationId: 'STN003', fuelType: 'Diesel (Auto)', capacity: 25000, currentLevel: 13800, isActive: true, pumps: [{ pumpId: 'P06', name: 'Pump 3A' }, { pumpId: 'P07', name: 'Pump 3B' }] },
    { tankId: 'TNK-004', stationId: 'STN003', fuelType: 'Kerosene', capacity: 8000, currentLevel: 5800, isActive: true, pumps: [{ pumpId: 'P08', name: 'Pump 4A' }] },
  ],
  STN004: [
    { tankId: 'TNK-001', stationId: 'STN004', fuelType: 'Petrol 92 Octane', capacity: 15000, currentLevel: 10800, isActive: true, pumps: [{ pumpId: 'P01', name: 'Pump 1A' }, { pumpId: 'P02', name: 'Pump 1B' }] },
    { tankId: 'TNK-002', stationId: 'STN004', fuelType: 'Petrol 95 Octane', capacity: 10000, currentLevel: 7200, isActive: true, pumps: [{ pumpId: 'P04', name: 'Pump 2A' }, { pumpId: 'P05', name: 'Pump 2B' }] },
    { tankId: 'TNK-003', stationId: 'STN004', fuelType: 'Diesel (Auto)', capacity: 25000, currentLevel: 17000, isActive: true, pumps: [{ pumpId: 'P06', name: 'Pump 3A' }, { pumpId: 'P07', name: 'Pump 3B' }] },
    { tankId: 'TNK-004', stationId: 'STN004', fuelType: 'Kerosene', capacity: 8000, currentLevel: 7900, isActive: true, pumps: [{ pumpId: 'P08', name: 'Pump 4A' }] },
  ],
  STN005: [
    { tankId: 'TNK-001', stationId: 'STN005', fuelType: 'Petrol 92 Octane', capacity: 15000, currentLevel: 4350, isActive: true, pumps: [{ pumpId: 'P01', name: 'Pump 1A' }] },
    { tankId: 'TNK-002', stationId: 'STN005', fuelType: 'Petrol 95 Octane', capacity: 10000, currentLevel: 1500, isActive: true, pumps: [{ pumpId: 'P04', name: 'Pump 2A' }] },
    { tankId: 'TNK-003', stationId: 'STN005', fuelType: 'Diesel (Auto)', capacity: 25000, currentLevel: 11000, isActive: true, pumps: [{ pumpId: 'P06', name: 'Pump 3A' }] },
    { tankId: 'TNK-004', stationId: 'STN005', fuelType: 'Kerosene', capacity: 8000, currentLevel: 3200, isActive: true, pumps: [{ pumpId: 'P08', name: 'Pump 4A' }] },
  ],
  STN006: [
    { tankId: 'TNK-001', stationId: 'STN006', fuelType: 'Petrol 92 Octane', capacity: 15000, currentLevel: 12150, isActive: true, pumps: [{ pumpId: 'P01', name: 'Pump 1A' }, { pumpId: 'P02', name: 'Pump 1B' }, { pumpId: 'P03', name: 'Pump 1C' }] },
    { tankId: 'TNK-002', stationId: 'STN006', fuelType: 'Petrol 95 Octane', capacity: 10000, currentLevel: 8800, isActive: true, pumps: [{ pumpId: 'P04', name: 'Pump 2A' }, { pumpId: 'P05', name: 'Pump 2B' }] },
    { tankId: 'TNK-003', stationId: 'STN006', fuelType: 'Diesel (Auto)', capacity: 25000, currentLevel: 19750, isActive: true, pumps: [{ pumpId: 'P06', name: 'Pump 3A' }, { pumpId: 'P07', name: 'Pump 3B' }] },
    { tankId: 'TNK-004', stationId: 'STN006', fuelType: 'Kerosene', capacity: 8000, currentLevel: 6400, isActive: true, pumps: [{ pumpId: 'P08', name: 'Pump 4A' }] },
  ],
};

// ── Average daily demand (L/day) by stationId + fuelType ────────────────────
const MOCK_DEMAND: Record<string, number> = {
  'STN001_Diesel (Auto)': 950,
  'STN001_Petrol 92 Octane': 750,
  'STN001_Petrol 95 Octane': 400,
  'STN001_Kerosene': 80,
  'STN002_Diesel (Auto)': 860,
  'STN002_Petrol 92 Octane': 680,
  'STN002_Petrol 95 Octane': 330,
  'STN002_Kerosene': 60,
  'STN003_Diesel (Auto)': 1100,
  'STN003_Petrol 92 Octane': 620,
  'STN003_Petrol 95 Octane': 310,
  'STN003_Kerosene': 75,
  'STN004_Diesel (Auto)': 1200,
  'STN004_Petrol 92 Octane': 820,
  'STN004_Petrol 95 Octane': 480,
  'STN004_Kerosene': 90,
  'STN005_Diesel (Auto)': 790,
  'STN005_Petrol 92 Octane': 540,
  'STN005_Petrol 95 Octane': 280,
  'STN005_Kerosene': 55,
  'STN006_Diesel (Auto)': 1350,
  'STN006_Petrol 92 Octane': 910,
  'STN006_Petrol 95 Octane': 550,
  'STN006_Kerosene': 100,
};

// ── Current inventory (litres) by stationId + fuelType ─────────────────────
const MOCK_INVENTORY: Record<string, { level: number; capacity: number }> = {
  'STN001_Diesel (Auto)': { level: 4200, capacity: 25000 },
  'STN001_Petrol 92 Octane': { level: 9500, capacity: 15000 },
  'STN001_Petrol 95 Octane': { level: 3100, capacity: 10000 },
  'STN001_Kerosene': { level: 7400, capacity: 8000 },
  'STN002_Diesel (Auto)': { level: 2100, capacity: 25000 },
  'STN002_Petrol 92 Octane': { level: 1800, capacity: 15000 },
  'STN002_Petrol 95 Octane': { level: 900, capacity: 10000 },
  'STN002_Kerosene': { level: 6200, capacity: 8000 },
  'STN003_Diesel (Auto)': { level: 13800, capacity: 25000 },
  'STN003_Petrol 92 Octane': { level: 4200, capacity: 15000 },
  'STN003_Petrol 95 Octane': { level: 2800, capacity: 10000 },
  'STN003_Kerosene': { level: 5800, capacity: 8000 },
  'STN004_Diesel (Auto)': { level: 17000, capacity: 25000 },
  'STN004_Petrol 92 Octane': { level: 10800, capacity: 15000 },
  'STN004_Petrol 95 Octane': { level: 7200, capacity: 10000 },
  'STN004_Kerosene': { level: 7900, capacity: 8000 },
  'STN005_Diesel (Auto)': { level: 11000, capacity: 25000 },
  'STN005_Petrol 92 Octane': { level: 4350, capacity: 15000 },
  'STN005_Petrol 95 Octane': { level: 1500, capacity: 10000 },
  'STN005_Kerosene': { level: 3200, capacity: 8000 },
  'STN006_Diesel (Auto)': { level: 19750, capacity: 25000 },
  'STN006_Petrol 92 Octane': { level: 12150, capacity: 15000 },
  'STN006_Petrol 95 Octane': { level: 8800, capacity: 10000 },
  'STN006_Kerosene': { level: 6400, capacity: 8000 },
};

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

// Petrol % / Diesel % macro numbers for station picker cards
const STATION_LEVELS: Record<string, { petrol: number; diesel: number }> = {
  STN001: { petrol: 63, diesel: 17 },
  STN002: { petrol: 18, diesel: 8 },
  STN003: { petrol: 28, diesel: 55 },
  STN004: { petrol: 72, diesel: 68 },
  STN005: { petrol: 29, diesel: 44 },
  STN006: { petrol: 81, diesel: 79 },
};

// ── Inventory level chip ──────────────────────────────────────────────────────
function InventoryChip({ pct }: { pct: number }) {
  const color = pct < 15 ? '#EF4444' : pct < 30 ? '#F59E0B' : '#10B981';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ color, borderColor: `${color}40`, background: `${color}15` }}
    >
      {pct}%
    </span>
  );
}

// ── Fuel bar mini ─────────────────────────────────────────────────────────────
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-table-row)' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function RegionalDashboard() {
  const logout = useAuthStore(state => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'map' | 'approvals' | 'analytics' | 'station'>('map');
  const [requests, setRequests] = useState<RefuelRequest[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [approvalModal, setApprovalModal] = useState<{ requestId: string; requestedQuantity: number; approvedQty: number } | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  console.log(requests);

  const toggleFilter = (status: string) => {
    console.log('[toggleFilter] called with status:', status);
    setStatusFilters(prev => {
      const before = [...prev];
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      console.log('[toggleFilter] statusFilters before:', before, '→ after:', [...next]);
      return next;
    });
  };

  const displayedRequests = requests
    .filter(r => statusFilters.size === 0 || statusFilters.has(r.status))
    .filter(r => stationFilter === 'ALL' || r.stationId === stationFilter)
    .slice()
    .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());

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
    { key: 'station' as const, label: 'Station Monitor', Icon: BuildingStorefrontIcon },
  ];

  const activeTickets = requests.filter(r => ['SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status));

  // Colours for tab active state vary by theme
  const tabActiveBg = theme === 'dark'
    ? 'linear-gradient(135deg, #7C3AED, #2563EB)'
    : 'linear-gradient(135deg, #F97316, #2563EB)';
  const tabActiveShadow = theme === 'dark'
    ? '0 2px 12px rgba(124,58,237,0.4)'
    : '0 2px 12px rgba(249,115,22,0.35)';

  const selectedStation = MOCK_STATIONS.find(s => s.stationId === selectedStationId);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="glass-navbar sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[62px] gap-4">

            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15))'
                    : 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(37,99,235,0.10))',
                  border: '1px solid var(--border-card)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 7 7 7 12a5 5 0 0010 0c0-3-2-5-2-5s-.5 2.5-2 3.5C13.5 9 14 6 12 2z"
                    fill={theme === 'dark' ? 'rgba(167,139,250,0.9)' : 'rgba(249,115,22,0.9)'} />
                </svg>
                <span
                  className="font-black text-sm tracking-widest uppercase"
                  style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}
                >Lanka IOC</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>IMS</span>
                <span
                  className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: theme === 'dark' ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.10)',
                    color: '#2563EB',
                    border: '1px solid rgba(37,99,235,0.2)',
                  }}
                >Regional Manager</span>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'var(--bg-tab-strip)', border: '1px solid var(--border-tab)' }}
            >
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    if (key === 'approvals') setRequests(loadRequestsFromStorage());
                    if (key !== 'station') setSelectedStationId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === key ? 'text-white' : ''
                    }`}
                  style={{
                    color: activeTab === key ? '#fff' : 'var(--text-muted)',
                    ...(activeTab === key ? { background: tabActiveBg, boxShadow: tabActiveShadow } : {}),
                  }}
                >
                  <Icon style={{ width: '15px', height: '15px' }} />
                  <span className="hidden md:inline">{label}</span>
                  {key === 'approvals' && activeTickets.length > 0 && activeTab !== 'approvals' && (
                    <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {activeTickets.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <BuildingOffice2Icon style={{ width: '12px', height: '12px' }} />
                  Western Province Region
                </div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  {MOCK_STATIONS.length} Stations Managed
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <UserCircleIcon style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                <span className="hidden sm:inline font-medium">Dilantha Fernando</span>
              </div>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                {theme === 'dark'
                  ? <SunIcon style={{ width: '16px', height: '16px' }} />
                  : <MoonIcon style={{ width: '16px', height: '16px' }} />}
              </button>

              <button
                onClick={logout}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer"
                style={{ border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB' }}
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-7 w-full space-y-6">

        {/* ════════════════════ TAB 1: NETWORK MAP ════════════════════ */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                Regional Network Overview
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StationMap stations={MOCK_STATIONS} />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  { label: 'Managed Stations', value: MOCK_STATIONS.length.toString(), sub: 'Western Province', color: theme === 'dark' ? '#7C3AED' : '#F97316' },
                  { label: 'Critical Fuel Stock', value: MOCK_STATIONS.filter(s => s.status === 'CRITICAL').length.toString(), sub: 'Require immediate replenishment', color: '#EF4444' },
                  { label: 'Active Refuel Orders', value: activeTickets.length.toString(), sub: 'Submitted / Approved / Scheduled', color: '#F59E0B' },
                  { label: 'Stations at Low Level', value: MOCK_STATIONS.filter(s => s.status === 'LOW').length.toString(), sub: 'Below 30% threshold', color: '#2563EB' },
                ].map(kpi => (
                  <div
                    key={kpi.label}
                    className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden"
                    style={{ border: '1px solid var(--border-card)' }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: kpi.color }} />
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
                    <div className="mt-2">
                      <p className="text-5xl font-black font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Station Status Table */}
            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-card)' }}>
              <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-table-head)' }}>
                <h2 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                  Station Status Matrix
                </h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Live fuel level and operational status for all managed stations
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full lioc-table">
                  <thead>
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
                    {MOCK_STATIONS.map(stn => {
                      const stationRequests = requests.filter(r => r.stationId === stn.stationId && ['SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status));
                      const lvls = STATION_LEVELS[stn.stationId];
                      return (
                        <tr key={stn.stationId}>
                          <td>
                            <div className="font-bold" style={{ color: 'var(--text-heading)' }}>{stn.name}</div>
                            <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>{stn.stationId}</div>
                          </td>
                          <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stn.address}</span></td>
                          <td className="text-center">
                            <span className={`status-badge border ${STATION_STATUS_STYLE[stn.status]}`}>{stn.status}</span>
                          </td>
                          <td className="text-right">
                            <span className={`font-bold font-mono text-base ${lvls.petrol < 30 ? 'text-amber-400' : ''}`} style={lvls.petrol >= 30 ? { color: 'var(--text-heading)' } : {}}>{lvls.petrol}%</span>
                          </td>
                          <td className="text-right">
                            <span className={`font-bold font-mono text-base ${lvls.diesel < 20 ? 'text-red-400' : ''}`} style={lvls.diesel >= 20 ? { color: 'var(--text-heading)' } : {}}>{lvls.diesel}%</span>
                          </td>
                          <td className="text-right">
                            <span className="font-mono font-bold text-violet-400">{stationRequests.length || '—'}</span>
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

        {/* ════════════════════ TAB 2: ORDER APPROVALS ════════════════════ */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
              Replenishment Workflow Board
            </h1>

            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-card)' }}>
              <div
                className="px-6 py-4 flex flex-col gap-3"
                style={{ borderBottom: '1px solid var(--border-table-head)' }}
              >
                {/* Row 1: title + status toggle buttons */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                      Replenishment Tickets
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Submitted → Approved → Scheduled → Delivered
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { status: 'SUBMITTED', label: 'pending', onCls: 'bg-blue-500   text-white border-blue-600', offCls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
                      { status: 'APPROVED', label: 'approved', onCls: 'bg-violet-500 text-white border-violet-600', offCls: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
                      { status: 'SCHEDULED', label: 'en route', onCls: 'bg-amber-500  text-white border-amber-600', offCls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
                    ] as const).map(({ status, label, onCls, offCls }) => (
                      <button
                        key={status}
                        onClick={() => toggleFilter(status)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all duration-150 cursor-pointer select-none ${statusFilters.has(status) ? onCls : offCls}`}
                      >
                        {requests.filter(r => r.status === status).length} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 2: station filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Station</span>
                  <select
                    value={stationFilter}
                    onChange={e => setStationFilter(e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      color: stationFilter === 'ALL' ? 'var(--text-muted)' : 'var(--text-heading)',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Stations</option>
                    {Array.from(new Map(requests.map(r => [r.stationId, r.stationName])).entries()).map(([id, name]) => (
                      <option key={id} value={id}>{name} ({id})</option>
                    ))}
                  </select>
                  {stationFilter !== 'ALL' && (
                    <button
                      onClick={() => setStationFilter('ALL')}
                      className="text-xs px-2 py-1 rounded-lg cursor-pointer transition-all"
                      style={{ color: 'var(--text-faint)', border: '1px solid var(--border-card)' }}
                    >
                      ✕ clear
                    </button>
                  )}
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>
                    {displayedRequests.length} of {requests.length} requests · newest first
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full lioc-table">
                  <thead>
                    <tr>
                      <th className="text-left">Station / Request</th>
                      <th className="text-left">Fuel Type</th>
                      <th className="text-right">Volume</th>
                      <th className="text-right">Avg Daily Demand</th>
                      <th className="text-left">Current Inventory</th>
                      <th className="text-left">Dispatch Details</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRequests.map(req => {
                      const key = `${req.stationId}_${req.fuelType}`;
                      const demand = MOCK_DEMAND[key];
                      const inv = MOCK_INVENTORY[key];
                      const invPct = inv ? Math.round((inv.level / inv.capacity) * 100) : null;

                      return (
                        <tr key={req.requestId}>
                          <td>
                            <div className="font-bold" style={{ color: 'var(--text-heading)' }}>{req.stationName}</div>
                            <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>{req.stationId} · {req.requestId}</div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                              {new Date(req.requestedDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td>
                            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{req.fuelType}</span>
                          </td>
                          <td className="text-right">
                            <div className="font-black font-mono text-base" style={{ color: 'var(--text-heading)' }}>
                              {req.requestedQuantity.toLocaleString()} L
                            </div>
                            {req.approvedQuantity && req.approvedQuantity !== req.requestedQuantity && (
                              <div className="text-xs text-violet-400 font-mono mt-0.5">Approved: {req.approvedQuantity.toLocaleString()} L</div>
                            )}
                          </td>
                          {/* NEW: Avg Daily Demand */}
                          <td className="text-right">
                            {demand != null ? (
                              <div>
                                <span className="font-bold font-mono text-sm" style={{ color: theme === 'dark' ? '#F97316' : '#C2410C' }}>
                                  {demand.toLocaleString()} L/day
                                </span>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                                  ~{Math.ceil((req.requestedQuantity / demand))}d supply
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-faint)' }}>—</span>
                            )}
                          </td>
                          {/* NEW: Current Inventory */}
                          <td>
                            {inv && invPct != null ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {inv.level.toLocaleString()} L
                                  </span>
                                  <InventoryChip pct={invPct} />
                                </div>
                                <div className="w-24">
                                  <MiniBar
                                    pct={invPct}
                                    color={invPct < 15 ? '#EF4444' : invPct < 30 ? '#F59E0B' : '#10B981'}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-faint)' }}>—</span>
                            )}
                          </td>
                          <td>
                            {req.status === 'DELIVERED' && (
                              <div>
                                <div className="text-emerald-400 font-bold text-sm">{(req.deliveredQuantity ?? 0).toLocaleString()} L delivered</div>
                                <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>{req.deliveryTime ? new Date(req.deliveryTime).toLocaleString('en-LK') : ''}</div>
                              </div>
                            )}
                            {req.status === 'SCHEDULED' && (
                              <div className="text-amber-400 font-semibold text-sm">
                                ETA: {req.scheduledDeliveryTime ? new Date(req.scheduledDeliveryTime).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                              </div>
                            )}
                            {['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(req.status) && (
                              <span style={{ color: 'var(--text-faint)' }}>—</span>
                            )}
                          </td>
                          <td className="text-center">
                            <span className={`status-badge border ${STATUS_BADGE[req.status] ?? STATUS_BADGE.DRAFT}`}>{req.status}</span>
                          </td>
                          <td>
                            <div className="flex gap-2 justify-center flex-wrap">
                              {req.status === 'SUBMITTED' && (
                                <>
                                  <button

                                    onClick={() => setApprovalModal({ requestId: req.requestId, requestedQuantity: req.requestedQuantity, approvedQty: req.requestedQuantity })}
                                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white cursor-pointer transition-all"
                                    style={{ background: tabActiveBg, boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}
                                  >Approve</button>
                                  <button
                                    onClick={() => handleReject(req.requestId)}
                                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer transition-all"
                                  >Reject</button>
                                </>
                              )}
                              {req.status === 'APPROVED' && (
                                <button
                                  onClick={() => handleSchedule(req.requestId)}
                                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer transition-all"
                                >
                                  <CalendarDaysIcon style={{ width: '13px', height: '13px' }} />
                                  Schedule
                                </button>
                              )}
                              {req.status === 'SCHEDULED' && (
                                <button
                                  onClick={() => handleDeliver(req.requestId, req.approvedQuantity ?? req.requestedQuantity)}
                                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition-all"
                                >
                                  <TruckIcon style={{ width: '13px', height: '13px' }} />
                                  Delivered
                                </button>
                              )}
                              {['DELIVERED', 'REJECTED', 'DRAFT'].includes(req.status) && (
                                <span style={{ color: 'var(--text-faint)' }}>—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {displayedRequests.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-faint)' }}>
                          {requests.length === 0
                            ? 'No active requests. Switch to a Station Manager account to generate requests.'
                            : 'No requests match the selected filters.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 3: EXECUTIVE KPIs ════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
              Executive Dashboard
            </h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Network Fuel Inventory', value: '612,500 L', delta: '+3.8%', deltaColor: 'text-emerald-400', color: theme === 'dark' ? '#7C3AED' : '#F97316' },
                { label: 'Fuel Turnover Rate', value: '81.2%', delta: '+2.1% WoW', deltaColor: 'text-emerald-400', color: '#2563EB' },
                { label: 'Network Stockouts (30d)', value: '3', delta: 'incidents', deltaColor: 'text-red-400', color: '#EF4444' },
                { label: 'Delivery Efficiency', value: '96.7%', delta: 'actual vs approved', deltaColor: 'text-slate-500', color: '#F59E0B' },
              ].map(kpi => (
                <div
                  key={kpi.label}
                  className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between"
                  style={{ border: '1px solid var(--border-card)' }}
                >
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: kpi.color }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
                  <div className="mt-4">
                    <p className="text-4xl font-black font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
                    <p className={`text-sm font-semibold mt-1.5 ${kpi.deltaColor}`}>{kpi.delta}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-5" style={{ border: '1px solid var(--border-card)' }}>
                <div>
                  <h2 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                    Network Performance Metrics
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Aggregated across 6 Western Province stations</p>
                </div>
                <div className="space-y-3">
                  {[
                    { metric: 'Daily Consumption (Network Avg)', value: '14,800 L / day', bar: 74, color: theme === 'dark' ? '#7C3AED' : '#F97316' },
                    { metric: 'Weekend Demand Surge', value: '+11.4%', bar: 85, color: '#2563EB' },
                    { metric: 'Monthly Total Dispatch (June 2026)', value: '432,600 L', bar: 62, color: '#F59E0B' },
                    { metric: 'Average Delivery Lead Time', value: '18.5 hours', bar: 30, color: '#EF4444' },
                    { metric: 'On-Time Delivery Rate', value: '93.2%', bar: 93, color: '#10B981' },
                    { metric: 'Volumetric Discrepancy Rate', value: '0.8% avg', bar: 8, color: '#A78BFA' },
                  ].map(row => (
                    <div key={row.metric} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.metric}</span>
                          <span className="font-bold font-mono text-sm ml-4 shrink-0" style={{ color: 'var(--text-heading)' }}>{row.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-table-head)' }}>
                          <div className="h-full rounded-full" style={{ width: `${row.bar}%`, background: row.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4" style={{ border: '1px solid var(--border-card)' }}>
                <h2 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                  Audit Trail
                </h2>
                <div className="space-y-3">
                  {[
                    { event: 'USER LOGIN: Dilantha Fernando', detail: 'IP: 10.0.1.22 · Just now', color: 'text-violet-400' },
                    { event: 'DELIVERY CONFIRMED: REQ-2401', detail: '18,000 L Diesel · STN001 · 2h ago', color: 'text-emerald-400' },
                    { event: 'AUTO REQUEST: STN002 Diesel', detail: 'Critical threshold triggered · 3h ago', color: 'text-red-400' },
                    { event: 'APPROVED: REQ-2403', detail: '8,000 L Petrol 95 · STN001 · 4h ago', color: 'text-violet-400' },
                    { event: 'SCHEDULED: REQ-2402', detail: 'ETA 08-Jun 09:00 · STN001', color: 'text-amber-400' },
                    { event: 'USER LOGIN: Kamal Perera', detail: 'IP: 10.0.1.45 · 6h ago', color: 'text-blue-400' },
                  ].map((entry, i) => (
                    <div key={i} className="flex gap-2.5 pb-3 last:pb-0" style={{ borderBottom: i < 5 ? '1px solid var(--border-table-row)' : 'none' }}>
                      <div>
                        <div className={`text-sm font-semibold ${entry.color}`}>{entry.event}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>{entry.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 4: STATION MONITOR ════════════════════ */}
        {activeTab === 'station' && (
          <div className="space-y-6">

            {/* Station picker (no selection yet) */}
            {!selectedStationId && (
              <>
                <div>
                  <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                    Station Monitor
                  </h1>
                  <p className="text-base mt-1" style={{ color: 'var(--text-muted)' }}>
                    Select a filling station to view live tank levels and historical trends
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {MOCK_STATIONS.map(stn => {
                    const tanks = STATION_TANKS[stn.stationId] ?? [];
                    const criticalTanks = tanks.filter(t => (t.currentLevel / t.capacity) < 0.15).length;
                    return (
                      <button
                        key={stn.stationId}
                        onClick={() => setSelectedStationId(stn.stationId)}
                        className="glass-card glass-card-hover rounded-2xl p-5 text-left cursor-pointer transition-all relative overflow-hidden w-full"
                        style={{ border: '1px solid var(--border-card)' }}
                      >
                        {/* Status glow */}
                        <div
                          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                          style={{ background: stn.status === 'CRITICAL' ? '#EF4444' : stn.status === 'LOW' ? '#F59E0B' : (theme === 'dark' ? '#7C3AED' : '#F97316') }}
                        />

                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-base leading-tight" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                              {stn.name}
                            </h3>
                            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>{stn.stationId}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stn.address}</p>
                          </div>
                          <span className={`status-badge border ${STATION_STATUS_STYLE[stn.status]} shrink-0 ml-2`}>{stn.status}</span>
                        </div>

                        {/* Fuel bars */}
                        <div className="space-y-2.5">
                          {[
                            { label: 'Petrol 92', pct: Math.round((STATION_TANKS[stn.stationId][0].currentLevel / STATION_TANKS[stn.stationId][0].capacity) * 100), color: theme === 'dark' ? '#7C3AED' : '#F97316' },
                            { label: 'Petrol 95', pct: Math.round((STATION_TANKS[stn.stationId][1].currentLevel / STATION_TANKS[stn.stationId][1].capacity) * 100), color: '#2563EB' },
                            { label: 'Diesel', pct: Math.round((STATION_TANKS[stn.stationId][2].currentLevel / STATION_TANKS[stn.stationId][2].capacity) * 100), color: '#F59E0B' },
                            { label: 'Kerosene', pct: Math.round((STATION_TANKS[stn.stationId][3].currentLevel / STATION_TANKS[stn.stationId][3].capacity) * 100), color: '#A78BFA' },
                          ].map(bar => (
                            <div key={bar.label}>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span style={{ color: 'var(--text-muted)' }}>{bar.label}</span>
                                <span className="font-bold font-mono" style={{ color: bar.pct < 15 ? '#EF4444' : bar.pct < 30 ? '#F59E0B' : 'var(--text-heading)' }}>{bar.pct}%</span>
                              </div>
                              <MiniBar pct={bar.pct} color={bar.pct < 15 ? '#EF4444' : bar.pct < 30 ? '#F59E0B' : bar.color} />
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{tanks.length} tanks · {tanks.flatMap(t => t.pumps).length} pumps</span>
                          {criticalTanks > 0 && (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                              {criticalTanks} critical
                            </span>
                          )}
                          <span className="text-xs font-semibold" style={{ color: theme === 'dark' ? '#A78BFA' : '#F97316' }}>
                            View detail →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Station detail view */}
            {selectedStationId && selectedStation && (
              <>
                {/* Back + title */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedStationId(null)}
                    className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                  >
                    <ArrowLeftIcon style={{ width: '14px', height: '14px' }} />
                    All Stations
                  </button>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                      {selectedStation.name}
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {selectedStation.stationId} · {selectedStation.address}
                      <span className={`ml-2 status-badge border ${STATION_STATUS_STYLE[selectedStation.status]}`}>{selectedStation.status}</span>
                    </p>
                  </div>
                </div>

                {/* Tank level cards */}
                <div>
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
                    Live Tank Levels
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {(STATION_TANKS[selectedStationId] ?? []).map(tank => (
                      <TankLevelCard key={tank.tankId} tank={tank} />
                    ))}
                  </div>
                </div>

                {/* Historical chart */}
                <StationHistoricalChart stationId={selectedStationId} stationName={selectedStation.name} />

                {/* Summary KPIs for selected station */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Capacity', value: `${(STATION_TANKS[selectedStationId]?.reduce((s, t) => s + t.capacity, 0) ?? 0).toLocaleString()} L`, color: theme === 'dark' ? '#7C3AED' : '#F97316' },
                    { label: 'Current Volume', value: `${(STATION_TANKS[selectedStationId]?.reduce((s, t) => s + t.currentLevel, 0) ?? 0).toLocaleString()} L`, color: '#2563EB' },
                    { label: 'Critical Tanks', value: (STATION_TANKS[selectedStationId]?.filter(t => (t.currentLevel / t.capacity) < 0.15).length ?? 0).toString(), color: '#EF4444' },
                    { label: 'Active Pumps', value: (STATION_TANKS[selectedStationId]?.flatMap(t => t.pumps).length ?? 0).toString(), color: '#10B981' },
                  ].map(kpi => (
                    <div
                      key={kpi.label}
                      className="glass-card p-4 rounded-2xl relative overflow-hidden"
                      style={{ border: '1px solid var(--border-card)' }}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: kpi.color }} />
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
                      <p className="text-2xl font-black font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </main>

      {/* Approval Volume Modal */}
      {approvalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(6,3,15,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setApprovalModal(null)}
        >
          <div
            className="glass-card rounded-2xl border border-violet-500/25 p-8 w-full max-w-sm shadow-2xl"
            style={{ boxShadow: '0 8px 40px rgba(124,58,237,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>Approve Request</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-mono">{approvalModal.requestId}</p>
              </div>
              <button
                onClick={() => setApprovalModal(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-xl leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Volume input */}
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              Approved Volume (Litres)
            </label>
            <div className="relative mb-1">
              <input
                id="approval-volume-input"
                type="number"
                min={1}
                value={approvalModal.approvedQty}
                onChange={e => {
                  const rawValue = e.target.value;
                  if (rawValue === "") {
                    setApprovalModal(prev => prev ? { ...prev, approvedQty: null } : null);
                  } else {
                    setApprovalModal(prev => prev ? { ...prev, approvedQty: Number(rawValue) } : null);
                  }
                }}
                className="w-full rounded-xl px-4 py-3 text-white font-mono text-lg font-bold bg-slate-950/80 border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                style={{ background: 'rgba(15,10,30,0.85)' }}
              />
            </div>
            {approvalModal.approvedQty !== approvalModal.requestedQuantity && (
              <p className="text-amber-400 text-xs font-mono mb-4 mt-1">
                Requested: {approvalModal.requestedQuantity.toLocaleString()} L
                {approvalModal.approvedQty < approvalModal.requestedQuantity ? ' · Partial approval' : ' · Exceeds request'}
              </p>
            )}
            {approvalModal.approvedQty === approvalModal.requestedQuantity && (
              <p className="text-slate-600 text-xs font-mono mb-4 mt-1">Full requested volume</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setApprovalModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 bg-slate-800/60 border border-slate-700/40 hover:bg-slate-700/60 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleApprove(approvalModal.requestId, approvalModal.approvedQty);
                  setApprovalModal(null);
                }}
                disabled={!approvalModal.approvedQty || approvalModal.approvedQty <= 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 2px 12px rgba(124,58,237,0.4)' }}
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}