import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import TankLevelCard from '../components/tanks/TankLevelCard';
import { ManualMeasurementForm, PumpTotalizerForm } from '../components/tanks/ReadingForms';
import FuelLevelChart from '../components/analytics/FuelLevelChart';
import MinimartPOSSimulator from '../components/minimart/MinimartPOSSimulator';
import type { Tank } from '../types/fuel';
import type { MinimartProduct } from '../types/minimart';
import type { RefuelRequest } from '../types/replenishment';
import {
  ExclamationTriangleIcon,
  CircleStackIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

// ── Persistent storage helpers ───────────────────────────────────────────────
const saveRequestsToStorage = (reqs: RefuelRequest[]) =>
  localStorage.setItem('lioc_refuel_requests', JSON.stringify(reqs));

const loadRequestsFromStorage = (): RefuelRequest[] => {
  const data = localStorage.getItem('lioc_refuel_requests');
  if (data) return JSON.parse(data);

  const defaults: RefuelRequest[] = [
    {
      requestId: 'REQ-2401', stationId: 'STN001', stationName: 'Colombo 03 LIOC',
      requestedDate: '2026-06-05T08:00:00Z', fuelType: 'Diesel (Auto)',
      requestedQuantity: 18500, approvedQuantity: 18000, deliveredQuantity: 18000,
      status: 'DELIVERED', deliveryTime: '2026-06-06T14:30:00Z'
    },
    {
      requestId: 'REQ-2402', stationId: 'STN001', stationName: 'Colombo 03 LIOC',
      requestedDate: '2026-06-06T10:15:00Z', fuelType: 'Petrol 92 Octane',
      requestedQuantity: 12000, approvedQuantity: 12000,
      status: 'SCHEDULED', scheduledDeliveryTime: '2026-06-08T09:00:00Z'
    },
    {
      requestId: 'REQ-2403', stationId: 'STN001', stationName: 'Colombo 03 LIOC',
      requestedDate: '2026-06-07T07:00:00Z', fuelType: 'Petrol 95 Octane',
      requestedQuantity: 8000, approvedQuantity: 8000,
      status: 'APPROVED'
    },
    {
      requestId: 'REQ-2404', stationId: 'STN001', stationName: 'Colombo 03 LIOC',
      requestedDate: '2026-06-07T09:30:00Z', fuelType: 'Kerosene',
      requestedQuantity: 5000,
      status: 'SUBMITTED'
    },
    {
      requestId: 'REQ-2405', stationId: 'STN001', stationName: 'Colombo 03 LIOC',
      requestedDate: '2026-06-07T10:00:00Z', fuelType: 'Diesel (Auto)',
      requestedQuantity: 20000,
      status: 'DRAFT'
    },
  ];
  saveRequestsToStorage(defaults);
  return defaults;
};

// ── Default Tank data (4 tanks) ───────────────────────────────────────────────
const DEFAULT_TANKS: Tank[] = [
  {
    tankId: 'TNK-001', stationId: 'STN001', fuelType: 'Petrol 92 Octane',
    capacity: 15000, currentLevel: 9500, isActive: true,
    pumps: [
      { pumpId: 'P01', name: 'Pump 1A' },
      { pumpId: 'P02', name: 'Pump 1B' },
      { pumpId: 'P03', name: 'Pump 1C' },
    ]
  },
  {
    tankId: 'TNK-002', stationId: 'STN001', fuelType: 'Petrol 95 Octane',
    capacity: 10000, currentLevel: 3100, isActive: true,  // Low stock ~31%
    pumps: [
      { pumpId: 'P04', name: 'Pump 2A' },
      { pumpId: 'P05', name: 'Pump 2B' },
    ]
  },
  {
    tankId: 'TNK-003', stationId: 'STN001', fuelType: 'Diesel (Auto)',
    capacity: 25000, currentLevel: 4200, isActive: true,  // Critical ~17%
    pumps: [
      { pumpId: 'P06', name: 'Pump 3A' },
      { pumpId: 'P07', name: 'Pump 3B' },
    ]
  },
  {
    tankId: 'TNK-004', stationId: 'STN001', fuelType: 'Kerosene',
    capacity: 8000, currentLevel: 7400, isActive: true,
    pumps: [
      { pumpId: 'P08', name: 'Pump 4A' },
    ]
  },
];

// ── Default Minimart inventory (10 products) ─────────────────────────────────
const DEFAULT_PRODUCTS: MinimartProduct[] = [
  { id: 'MM-001', name: 'Castrol GTX 10W-40 1L', category: 'ENGINE_OIL', currentStock: 48, reorderLevel: 12, supplier: 'Castrol Lanka (Pvt) Ltd', expiryDate: '2027-12-15', batchNumber: 'CAS-EO-B928', price: 2450 },
  { id: 'MM-002', name: 'Mobil Super 2000 X1 4L', category: 'ENGINE_OIL', currentStock: 22, reorderLevel: 8, supplier: 'ExxonMobil Lanka', expiryDate: '2028-03-10', batchNumber: 'MOB-EO-T112', price: 8900 },
  { id: 'MM-003', name: 'Shell Helix HX5 15W-40', category: 'LUBRICANT', currentStock: 6, reorderLevel: 15, supplier: 'Shell Lanka (Pvt) Ltd', expiryDate: '2027-06-30', batchNumber: 'SHL-LB-F220', price: 3200 }, // Low!
  { id: 'MM-004', name: 'Prestone Super Coolant 1L', category: 'COOLANT', currentStock: 4, reorderLevel: 10, supplier: 'Prestone Distribtors SL', expiryDate: '2026-07-20', batchNumber: 'PRE-CO-A103', price: 1850 }, // Low + near expiry!
  { id: 'MM-005', name: 'Prestone Brake Fluid DOT4', category: 'BRAKE_FLUID', currentStock: 18, reorderLevel: 6, supplier: 'Prestone Distribtors SL', expiryDate: '2026-06-25', batchNumber: 'PRE-BF-F402', price: 1780 }, // Near expiry!
  { id: 'MM-006', name: 'Bosch Super Wiper 18"', category: 'ACCESSORIES', currentStock: 14, reorderLevel: 5, supplier: 'Bosch Lanka', expiryDate: '2030-01-01', batchNumber: 'BSH-WP-G501', price: 1250 },
  { id: 'MM-007', name: 'Turtle Wax Car Polish 500g', category: 'CAR_CARE', currentStock: 0, reorderLevel: 8, supplier: 'Turtle Wax Sri Lanka', expiryDate: '2025-11-30', batchNumber: 'TWX-CP-X871', price: 1600 }, // Empty + Expired!
  { id: 'MM-008', name: 'Meguiar\'s Tyre Dressing', category: 'CAR_CARE', currentStock: 25, reorderLevel: 5, supplier: 'Meguiar\'s Imports SL', expiryDate: '2028-05-01', batchNumber: 'MEG-TD-H309', price: 2100 },
  { id: 'MM-009', name: 'Michelin Inflator 450ml', category: 'ACCESSORIES', currentStock: 9, reorderLevel: 6, supplier: 'Michelin Lanka', expiryDate: '2027-09-15', batchNumber: 'MCH-IF-J220', price: 890 },
  { id: 'MM-010', name: 'KYB Shock Absorber Grease', category: 'LUBRICANT', currentStock: 11, reorderLevel: 4, supplier: 'KYB Imports SL', expiryDate: '2029-02-28', batchNumber: 'KYB-GR-K405', price: 950 },
];

const STATION_INFO = {
  name: 'Colombo 03 LIOC',
  id: 'STN001',
  manager: 'Kamal Perera',
  shift: 'Day Shift (06:00 – 18:00)',
  region: 'Western Province',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const isProductExpired = (d: string) => new Date(d) < new Date();
const isNearingExpiry = (d: string) => {
  const diff = new Date(d).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  SUBMITTED: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  APPROVED: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  SCHEDULED: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  DELIVERED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/25',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function StationDashboard() {
  const logout = useAuthStore(state => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'fuel' | 'minimart' | 'replenishment'>('fuel');
  const [tanks, setTanks] = useState<Tank[]>(DEFAULT_TANKS);
  const [products, setProducts] = useState<MinimartProduct[]>(DEFAULT_PRODUCTS);
  const [requests, setRequests] = useState<RefuelRequest[]>(loadRequestsFromStorage());
  const [manualFuelType, setManualFuelType] = useState('Petrol 92 Octane');
  const [manualQuantity, setManualQuantity] = useState(10000);

  useEffect(() => { saveRequestsToStorage(requests); }, [requests]);

  // Auto-replenishment trigger (FR-3.1)
  useEffect(() => {
    tanks.forEach(t => {
      const threshold = t.fuelType.toLowerCase().includes('petrol') ? 3000 : 4000;
      if (t.currentLevel <= threshold) {
        const existing = requests.some(r => r.fuelType === t.fuelType && ['DRAFT', 'SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status));
        if (!existing) {
          const autoReq: RefuelRequest = {
            requestId: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
            stationId: 'STN001',
            stationName: STATION_INFO.name,
            requestedDate: new Date().toISOString(),
            fuelType: t.fuelType,
            requestedQuantity: Math.round(t.capacity - t.currentLevel),
            status: 'SUBMITTED',
          };
          setRequests(prev => [autoReq, ...prev]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanks]);

  // Handlers
  const handleProcessTransaction = (type: 'SALE' | 'RETURN' | 'STOCK_UPDATE', productId: string, quantity: number) =>
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      let s = p.currentStock;
      if (type === 'SALE') s = Math.max(0, s - quantity);
      else if (type === 'RETURN') s = s + quantity;
      else s = quantity;
      return { ...p, currentStock: s };
    }));

  const handleManualEntrySubmit = (data: { tankId: string; dipstickValue: number; measuredVolume: number; operator: string }) =>
    setTanks(prev => prev.map(t => t.tankId !== data.tankId ? t : { ...t, currentLevel: data.measuredVolume }));

  const handlePumpReadingSubmit = (data: { pumpId: string; readingValue: number }) =>
    setTanks(prev => prev.map(t => {
      if (!t.pumps.some(p => p.pumpId === data.pumpId)) return t;
      return { ...t, currentLevel: Math.max(0, t.currentLevel - Math.round(data.readingValue / 100)) };
    }));

  const handleManualRequest = (status: 'DRAFT' | 'SUBMITTED') => {
    const newReq: RefuelRequest = {
      requestId: `REQ-${Math.floor(2500 + Math.random() * 500)}`,
      stationId: 'STN001',
      stationName: STATION_INFO.name,
      requestedDate: new Date().toISOString(),
      fuelType: manualFuelType,
      requestedQuantity: manualQuantity,
      status,
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const handleSubmitDraft = (id: string) =>
    setRequests(prev => prev.map(r => r.requestId === id ? { ...r, status: 'SUBMITTED', requestedDate: new Date().toISOString() } : r));

  const MOCK_PUMPS = tanks.flatMap(t => t.pumps);
  const hasCriticalTank = tanks.some(t => (t.currentLevel / t.capacity) < 0.15);
  const hasMinimartAlert = products.some(p => p.currentStock <= p.reorderLevel || isProductExpired(p.expiryDate));

  const TABS: { key: 'fuel' | 'minimart' | 'replenishment'; label: string; Icon: React.ElementType }[] = [
    { key: 'fuel', label: 'Fuel Control', Icon: CircleStackIcon },
    { key: 'minimart', label: 'Mini Mart', Icon: ShoppingBagIcon },
    { key: 'replenishment', label: 'Replenishment', Icon: ArrowPathIcon },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });

  // Tab active gradient varies by theme
  const tabActiveBg     = theme === 'dark'
    ? 'linear-gradient(135deg, #7C3AED, #2563EB)'
    : 'linear-gradient(135deg, #F97316, #2563EB)';
  const tabActiveShadow = theme === 'dark'
    ? '0 2px 12px rgba(124,58,237,0.4)'
    : '0 2px 12px rgba(249,115,22,0.35)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Sticky Navbar ─────────────────────────────────────────────── */}
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
                <span className="font-black text-sm tracking-widest uppercase" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>Lanka IOC</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>IMS</span>
                <span
                  className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: theme === 'dark' ? 'rgba(124,58,237,0.15)' : 'rgba(249,115,22,0.12)',
                    color: theme === 'dark' ? '#A78BFA' : '#C2410C',
                    border: `1px solid ${theme === 'dark' ? 'rgba(124,58,237,0.20)' : 'rgba(249,115,22,0.25)'}`,
                  }}
                >Station Manager</span>
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
                  onClick={() => setActiveTab(key)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer`}
                  style={{
                    color: activeTab === key ? '#fff' : 'var(--text-muted)',
                    ...(activeTab === key ? { background: tabActiveBg, boxShadow: tabActiveShadow } : {}),
                  }}
                >
                  <Icon style={{ width: '15px', height: '15px' }} />
                  {label}
                  {/* Alert dot */}
                  {key === 'minimart' && hasMinimartAlert && activeTab !== 'minimart' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500" style={{ border: '2px solid var(--bg-page)' }} />
                  )}
                  {key === 'fuel' && hasCriticalTank && activeTab !== 'fuel' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" style={{ border: '2px solid var(--bg-page)' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  <BuildingStorefrontIcon style={{ width: '12px', height: '12px' }} />
                  {STATION_INFO.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  <ClockIcon style={{ width: '10px', height: '10px' }} />
                  {timeStr}  ·  {STATION_INFO.shift}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <UserCircleIcon style={{ width: '20px', height: '20px', color: theme === 'dark' ? '#a78bfa' : '#F97316' }} />
                <span className="hidden sm:inline font-medium">{STATION_INFO.manager}</span>
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
                style={{
                  border: `1px solid ${theme === 'dark' ? 'rgba(124,58,237,0.20)' : 'rgba(249,115,22,0.25)'}`,
                  color: theme === 'dark' ? '#A78BFA' : '#C2410C',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-7 w-full space-y-6">

        {/* Station Header Banner */}
        <div className="glass-card rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={{ border: '1px solid var(--border-card)' }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Live · All systems operational</span>
            </div>
            <h1 className="text-2xl font-black" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}>
              {STATION_INFO.name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Station {STATION_INFO.id} · {STATION_INFO.region} · Managed by <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{STATION_INFO.manager}</span>
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-black font-mono" style={{ color: theme === 'dark' ? '#A78BFA' : '#F97316' }}>{tanks.length}</p>
              <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Tanks</p>
            </div>
            <div className="w-px hidden sm:block" style={{ background: 'var(--border-card)' }} />
            <div className="text-center">
              <p className="text-2xl font-black font-mono text-blue-400">{MOCK_PUMPS.length}</p>
              <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Pumps</p>
            </div>
            <div className="w-px hidden sm:block" style={{ background: 'var(--border-card)' }} />
            <div className="text-center">
              <p className="text-2xl font-black font-mono text-amber-400">{requests.filter(r => ['SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status)).length}</p>
              <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Active Orders</p>
            </div>
            <div className="w-px hidden sm:block" style={{ background: 'var(--border-card)' }} />
            <div className="text-center">
              <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-secondary)' }}>{dateStr.split(',')[0]}</p>
              <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{dateStr.split(',').slice(1).join(',').trim()}</p>
            </div>
          </div>
        </div>

        {/* ── Critical Alert Banners ──────────────────────────────────── */}
        {activeTab === 'fuel' && hasCriticalTank && (
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-950/25 border border-red-500/25 text-red-400 animate-pulse">
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-red-200">Critical Tank Warning</p>
              <p className="text-xs text-red-400/90 mt-0.5">
                One or more fuel tanks are below the 15% threshold. An automatic replenishment request has been submitted to the Regional Manager.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'minimart' && hasMinimartAlert && (
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-amber-400">
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-200">Mini Mart Inventory Alerts</p>
              <p className="text-xs text-amber-400/90 mt-0.5">
                {products.filter(p => p.currentStock === 0).length} out-of-stock ·&nbsp;
                {products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length} low stock ·&nbsp;
                {products.filter(p => isProductExpired(p.expiryDate)).length} expired ·&nbsp;
                {products.filter(p => isNearingExpiry(p.expiryDate)).length} nearing expiry
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 1 — FUEL CONTROL
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'fuel' && (
          <div className="space-y-6">
            {/* Tank Cards */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                Live Tank Telemetry
                {/* <span className="ml-3 text-xs font-mono text-slate-500 font-normal">(FR-1.1 Sensor feed · FR-1.2 Manual override)</span> */}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {tanks.map(tank => <TankLevelCard key={tank.tankId} tank={tank} />)}
              </div>
            </div>

            {/* Chart + Entry Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 min-h-[400px]">
                <FuelLevelChart />
              </div>
              <div className="space-y-5">
                <ManualMeasurementForm tanks={tanks} onManualEntrySubmit={handleManualEntrySubmit} />
                <PumpTotalizerForm pumps={MOCK_PUMPS} onPumpReadingSubmit={handlePumpReadingSubmit} />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2 — MINI MART
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'minimart' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Products Table */}
            <div className="xl:col-span-2">
              <div className="glass-card rounded-2xl overflow-hidden border border-violet-500/15">
                <div className="px-6 py-5 border-b border-violet-500/12 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      Mini Mart Store Inventory
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">{products.length} products tracked across {new Set(products.map(p => p.category)).size} categories</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                      {products.filter(p => p.currentStock === 0).length} Empty
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      {products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length} Low Stock
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full lioc-table">
                    <thead style={{ background: 'rgba(124,58,237,0.06)' }}>
                      <tr>
                        <th className="text-left">Product</th>
                        <th className="text-left">Category / Batch</th>
                        <th className="text-left">Expiry</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(prod => {
                        const expired = isProductExpired(prod.expiryDate);
                        const nearExp = isNearingExpiry(prod.expiryDate);
                        const empty = prod.currentStock === 0;
                        const lowStock = prod.currentStock > 0 && prod.currentStock <= prod.reorderLevel;

                        return (
                          <tr key={prod.id} className={empty ? 'opacity-60' : ''}>
                            <td>
                              <div className="font-bold text-slate-100">{prod.name}</div>
                              <div className="text-slate-500 text-xs font-mono mt-0.5">{prod.id} · {prod.supplier}</div>
                            </td>
                            <td>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/15">
                                {prod.category.replace('_', ' ')}
                              </span>
                              <div className="text-slate-500 text-xs font-mono mt-1">{prod.batchNumber}</div>
                            </td>
                            <td>
                              <span className={`text-sm font-mono font-semibold ${expired ? 'text-red-400' : nearExp ? 'text-amber-400' : 'text-slate-400'}`}>
                                {prod.expiryDate}
                              </span>
                              {expired && <div className="text-[10px] text-red-400 font-bold mt-0.5 uppercase tracking-wide">EXPIRED</div>}
                              {!expired && nearExp && <div className="text-[10px] text-amber-400 font-bold mt-0.5 uppercase tracking-wide">Exp. soon</div>}
                            </td>
                            <td className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-white font-black font-mono text-base">{prod.currentStock}</span>
                                <span className="text-xs text-slate-500">/ {prod.reorderLevel} min</span>
                                {empty && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 rounded border border-red-500/20 uppercase">Out of Stock</span>}
                                {lowStock && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 rounded border border-amber-500/20 uppercase animate-pulse">Low Stock</span>}
                              </div>
                            </td>
                            <td className="text-right">
                              <span className="text-white font-bold font-mono text-base">
                                LKR {prod.price.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* POS Simulator */}
            <div>
              <MinimartPOSSimulator products={products} onProcessTransaction={handleProcessTransaction} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3 — REPLENISHMENT
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'replenishment' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* New Request Form */}
            <div className="xl:col-span-1">
              <div className="glass-card p-6 rounded-2xl border border-violet-500/15">
                <h2 className="font-bold text-white text-lg mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                  New Refuel Request
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-violet-300/70 uppercase tracking-widest mb-2">Fuel Type</label>
                    <select
                      value={manualFuelType}
                      onChange={e => setManualFuelType(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/60 border border-violet-500/20 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 text-sm p-3 transition-all"
                    >
                      {['Petrol 92 Octane', 'Petrol 95 Octane', 'Diesel (Auto)', 'Kerosene'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-violet-300/70 uppercase tracking-widest mb-2">Volume (Litres)</label>
                    <input
                      type="number"
                      step="500"
                      value={manualQuantity}
                      onChange={e => setManualQuantity(Number(e.target.value))}
                      className="w-full rounded-xl bg-slate-950/60 border border-violet-500/20 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 text-sm p-3 font-mono transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => handleManualRequest('DRAFT')}
                      className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold py-3 rounded-xl text-sm transition-all cursor-pointer border border-slate-700/60"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => handleManualRequest('SUBMITTED')}
                      className="w-full font-bold py-3 rounded-xl text-sm text-white transition-all cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="xl:col-span-3">
              <div className="glass-card rounded-2xl overflow-hidden border border-violet-500/15">
                <div className="px-6 py-5 border-b border-violet-500/12">
                  <h2 className="font-bold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    Replenishment Workflow
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Draft → Submitted → Approved → Scheduled → Delivered
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full lioc-table">
                    <thead style={{ background: 'rgba(124,58,237,0.06)' }}>
                      <tr>
                        <th className="text-left">Request ID</th>
                        <th className="text-left">Fuel Type</th>
                        <th className="text-right">Requested</th>
                        <th className="text-right">Approved / Delivered</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => (
                        <tr key={req.requestId}>
                          <td>
                            <div className="font-bold font-mono text-slate-200">{req.requestId}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{new Date(req.requestedDate).toLocaleDateString('en-LK')}</div>
                          </td>
                          <td>
                            <div className="font-semibold text-slate-300">{req.fuelType}</div>
                          </td>
                          <td className="text-right">
                            <span className="font-bold font-mono text-white">{req.requestedQuantity.toLocaleString()} L</span>
                          </td>
                          <td className="text-right">
                            {['DRAFT', 'SUBMITTED'].includes(req.status) ? (
                              <span className="text-slate-600 font-mono">—</span>
                            ) : (
                              <div>
                                <div className="font-mono font-semibold text-violet-300">{(req.approvedQuantity ?? req.requestedQuantity).toLocaleString()} L</div>
                                {req.status === 'DELIVERED' && (
                                  <div className="text-xs text-emerald-400 font-bold font-mono mt-0.5">
                                    ✓ {(req.deliveredQuantity ?? req.approvedQuantity ?? req.requestedQuantity).toLocaleString()} L delivered
                                  </div>
                                )}
                                {req.status === 'SCHEDULED' && (
                                  <div className="text-xs text-amber-400 font-mono mt-0.5">
                                    ETA: {req.scheduledDeliveryTime ? new Date(req.scheduledDeliveryTime).toLocaleDateString('en-LK') : '—'}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="text-center">
                            <span className={`status-badge border ${STATUS_BADGE[req.status] ?? STATUS_BADGE.DRAFT}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="text-center">
                            {req.status === 'DRAFT' ? (
                              <button
                                onClick={() => handleSubmitDraft(req.requestId)}
                                className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white transition-all cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                              >
                                Submit
                              </button>
                            ) : (
                              <span className="text-slate-700">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {requests.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-600">No requests recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}