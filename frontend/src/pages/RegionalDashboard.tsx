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
  SparklesIcon
} from '@heroicons/react/24/outline';

const MOCK_STATIONS: StationLocation[] = [
  { stationId: 'STN001', name: 'Colombo 03 LIOC', address: 'Galle Rd, Col 03', latitude: 6.9128, longitude: 79.8507, status: 'NORMAL' },
  { stationId: 'STN002', name: 'Nugegoda Shed', address: 'High Level Rd', latitude: 6.8649, longitude: 79.8997, status: 'CRITICAL' },
  { stationId: 'STN003', name: 'Dehiwala Station', address: 'Station Rd', latitude: 6.8402, longitude: 79.8712, status: 'LOW' }
];

const loadRequestsFromStorage = (): RefuelRequest[] => {
  const data = localStorage.getItem('lioc_refuel_requests');
  if (data) return JSON.parse(data);
  return [];
};

const saveRequestsToStorage = (reqs: RefuelRequest[]) => {
  localStorage.setItem('lioc_refuel_requests', JSON.stringify(reqs));
};

export default function RegionalDashboard() {
  const logout = useAuthStore(state => state.logout);
  const [activeTab, setActiveTab] = useState<'map' | 'approvals' | 'analytics'>('map');
  const [requests, setRequests] = useState<RefuelRequest[]>([]);

  // Load requests on mount
  useEffect(() => {
    setRequests(loadRequestsFromStorage());
  }, []);

  // Update requests helper
  const updateRequestStatus = (id: string, updates: Partial<RefuelRequest>) => {
    const updated = requests.map(r => {
      if (r.requestId === id) {
        return { ...r, ...updates };
      }
      return r;
    });
    setRequests(updated);
    saveRequestsToStorage(updated);
  };

  // State workflow transition handlers (FR-3.3 Approval Workflow)
  const handleApprove = (id: string, requestedQty: number) => {
    updateRequestStatus(id, {
      status: 'APPROVED',
      approvedQuantity: requestedQty
    });
    alert('Refuel request APPROVED. Ready for dispatch scheduling.');
  };

  const handleReject = (id: string) => {
    updateRequestStatus(id, { status: 'REJECTED' });
    alert('Refuel request REJECTED.');
  };

  const handleSchedule = (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    updateRequestStatus(id, {
      status: 'SCHEDULED',
      scheduledDeliveryTime: tomorrow.toISOString()
    });
    alert(`Delivery SCHEDULED. Expected arrival: ${tomorrow.toLocaleDateString()} at 9:00 AM.`);
  };

  const handleDeliver = (id: string, approvedQty: number) => {
    updateRequestStatus(id, {
      status: 'DELIVERED',
      deliveredQuantity: approvedQty || 5000,
      deliveryTime: new Date().toISOString()
    });
    alert('Fulfillment logged: Fuel DELIVERED successfully.');
  };

  return (
    <div className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col font-sans">
      {/* Glassmorphic Navbar */}
      <nav className="glass-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 rounded-lg text-xs font-black tracking-widest text-slate-950 uppercase shadow-md shadow-orange-500/10">
                Lanka IOC
              </span>
              <span className="font-bold text-lg text-slate-100">IMS</span>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/10 rounded-md text-[10px] font-semibold uppercase font-mono">
                Regional Manager
              </span>
            </div>

            {/* Tabs Controller */}
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'map' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Network Map
              </button>
              <button 
                onClick={() => {
                  setActiveTab('approvals');
                  setRequests(loadRequestsFromStorage()); // refresh requests
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'approvals' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                Order Approvals
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <PresentationChartBarIcon className="w-3.5 h-3.5" />
                Executive KPIs
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => logout()} 
                className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* ────────── TAB 1: REGIONAL MAP & KPIS ────────── */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Regional Logistics overview</h1>
              <p className="text-sm text-slate-400 mt-1">Geographic distribution metrics and sensor threshold warnings (FR-4.1).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <StationMap stations={MOCK_STATIONS} />
              </div>

              {/* KPI indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-center relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Managed Stations</p>
                  <p className="text-5xl font-black text-white font-mono mt-2">{MOCK_STATIONS.length}</p>
                </div>
                
                <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-center relative overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">Critical Fuel Stock</p>
                  <p className="text-5xl font-black text-red-500 font-mono mt-2">
                    {MOCK_STATIONS.filter(s => s.status === 'CRITICAL').length}
                  </p>
                </div>
                
                <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-center relative overflow-hidden col-span-2 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Active Refuel Tickets</p>
                  <p className="text-5xl font-black text-amber-500 font-mono mt-2">
                    {requests.filter(r => ['SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────── TAB 2: ORDER APPROVALS & DISPATCH ────────── */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Replenishment Workflow Board</h1>
              <p className="text-sm text-slate-400 mt-1">Approve, dispatch, schedule deliveries, and track volumetric discrepancies (FR-3.3 & FR-3.4).</p>
            </div>

            <div className="glass-card border border-slate-800/80 shadow-xl rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                <h3 className="font-bold text-lg text-slate-100 tracking-tight">Replenishment Tickets</h3>
                <p className="text-slate-400 text-xs mt-0.5">Progress orders from Submitted ➔ Approved ➔ Scheduled ➔ Delivered</p>
              </div>

              <div className="overflow-x-auto text-xs font-mono">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Station</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requested Detail</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dispatch Values</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approval Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-transparent">
                    {requests.map(req => (
                      <tr key={req.requestId} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-200 text-sm">{req.stationName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{req.stationId} | ID: {req.requestId}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-300">{req.fuelType}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{req.requestedQuantity.toLocaleString()} L</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-300">
                          {req.approvedQuantity ? (
                            <div>
                              <span>Approved: {req.approvedQuantity.toLocaleString()} L</span>
                              {req.scheduledDeliveryTime && <div className="text-[10px] text-slate-500 mt-0.5">ETA: {new Date(req.scheduledDeliveryTime).toLocaleDateString()}</div>}
                            </div>
                          ) : (
                            <span className="text-slate-600">Pending Approval</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {req.status === 'DELIVERED' ? (
                            <div>
                              <div className="text-emerald-400 font-bold">Fulfillment: {req.deliveredQuantity?.toLocaleString()} L</div>
                              <div className="text-[9px] text-slate-500 mt-0.5">Time: {req.deliveryTime ? new Date(req.deliveryTime).toLocaleTimeString() : 'N/A'}</div>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                            req.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                            req.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            req.status === 'APPROVED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            req.status === 'SCHEDULED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold' :
                            req.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {req.status === 'SUBMITTED' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApprove(req.requestId, req.requestedQuantity)} 
                                className="text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/25 px-2.5 py-1 rounded transition-all active:scale-95 cursor-pointer font-sans text-[10px] font-bold"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(req.requestId)} 
                                className="text-red-500 bg-red-50/5 border border-red-500/10 hover:bg-red-500/25 px-2.5 py-1 rounded transition-all active:scale-95 cursor-pointer font-sans text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {req.status === 'APPROVED' && (
                            <button 
                              onClick={() => handleSchedule(req.requestId)} 
                              className="text-amber-500 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/25 px-3 py-1 rounded transition-all active:scale-95 cursor-pointer font-sans text-[10px] font-bold flex items-center gap-1.5"
                            >
                              <CalendarDaysIcon className="w-3.5 h-3.5" />
                              Schedule Delivery
                            </button>
                          )}
                          {req.status === 'SCHEDULED' && (
                            <button 
                              onClick={() => handleDeliver(req.requestId, req.approvedQuantity || req.requestedQuantity)} 
                              className="text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/25 px-3 py-1 rounded transition-all active:scale-95 cursor-pointer font-sans text-[10px] font-bold flex items-center gap-1.5"
                            >
                              <TruckIcon className="w-3.5 h-3.5" />
                              Fulfill Delivery
                            </button>
                          )}
                          {['DELIVERED', 'REJECTED', 'DRAFT'].includes(req.status) && (
                            <span className="text-slate-600 italic">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">No active requests logged in regional board.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ────────── TAB 3: EXECUTIVE KPIS & ANALYTICS ────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Executive Dashboard</h1>
              <p className="text-sm text-slate-400 mt-1">Network-wide fuel turnover, stockout indices, and fleet dispatch efficiency (FR-4.3).</p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow flex flex-col justify-between">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Network Fuel Inventory</span>
                <div className="mt-4">
                  <p className="text-3xl font-black text-white font-mono">540,000 <span className="text-slate-400 text-xs font-normal">L</span></p>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    +4.2% Capacity from yesterday
                  </span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow flex flex-col justify-between">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fuel Turnover Rate</span>
                <div className="mt-4">
                  <p className="text-3xl font-black text-blue-400 font-mono">78.4%</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Net sales vs storage capacity</span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow flex flex-col justify-between">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Network Stock-Outs</span>
                <div className="mt-4">
                  <p className="text-3xl font-black text-red-500 font-mono">2 incidents</p>
                  <span className="text-[10px] text-red-400/90 font-bold mt-1 block">In the past 30 operating days</span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow flex flex-col justify-between">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Delivery Efficiency</span>
                <div className="mt-4">
                  <p className="text-3xl font-black text-emerald-400 font-mono">94.2%</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Actual delivery vs requested volume</span>
                </div>
              </div>
            </div>

            {/* Consumption Trends Grid (FR-4.2) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 col-span-2 space-y-4">
                <h3 className="font-bold text-base text-slate-100">Consumption Trends & Analysis</h3>
                
                {/* Historical trends chart placeholder */}
                <div className="h-60 rounded-xl bg-slate-950/60 border border-slate-900 flex flex-col justify-around p-4">
                  <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-300">Daily Consumption (Average)</span>
                    <span className="font-mono text-emerald-400">12,400 L / day</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-300">Weekly Sales Trends</span>
                    <span className="font-mono text-blue-400">+8.5% Weekend Surge</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-300">Monthly Performance</span>
                    <span className="font-mono text-white">410,000 L Total Dispatch</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Seasonal Variance</span>
                    <span className="font-mono text-amber-400">Peak demand forecast for Q3 monsoon</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
                <h3 className="font-bold text-base text-slate-100">Audit Logs & Access</h3>
                <div className="space-y-3 text-[10px] font-mono text-slate-400">
                  <div className="border-b border-slate-900 pb-2">
                    <div className="text-white">USER login: manager</div>
                    <div>IP: 192.168.1.150 | Time: Just Now</div>
                  </div>
                  <div className="border-b border-slate-900 pb-2">
                    <div className="text-white">AUTO-REQUEST: Diesel refuel</div>
                    <div>Source: TNK-002 Telemetry | Time: 1h ago</div>
                  </div>
                  <div>
                    <div className="text-white">DISPATCH SCHEDULED: REQ-102</div>
                    <div>User: Jane Smith | Time: 3h ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}