import { useState } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import StationMap from '../components/dashboard/StationMap';
import type { StationLocation, RefuelRequest } from '../types/replenishment';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MOCK_STATIONS: StationLocation[] = [
  { stationId: 'STN001', name: 'Colombo 03 LIOC', address: 'Galle Rd, Col 03', latitude: 6.9128, longitude: 79.8507, status: 'NORMAL' },
  { stationId: 'STN002', name: 'Nugegoda Shed', address: 'High Level Rd', latitude: 6.8649, longitude: 79.8997, status: 'CRITICAL' },
  { stationId: 'STN003', name: 'Dehiwala Station', address: 'Station Rd', latitude: 6.8402, longitude: 79.8712, status: 'LOW' }
];

const INIT_REQUESTS: RefuelRequest[] = [
  { requestId: 'REQ-001', stationId: 'STN002', stationName: 'Nugegoda Shed', requestedDate: '2026-06-06T08:30:00Z', fuelType: 'Diesel (Auto)', requestedQuantity: 6600, status: 'PENDING' },
  { requestId: 'REQ-002', stationId: 'STN003', stationName: 'Dehiwala Station', requestedDate: '2026-06-05T14:15:00Z', fuelType: 'Petrol 92 Octane', requestedQuantity: 4000, status: 'PENDING' }
];

export default function RegionalDashboard() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [requests, setRequests] = useState<RefuelRequest[]>(INIT_REQUESTS);

  const handleDecision = (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => prev.map(req => req.requestId === id ? { ...req, status: decision } : req));
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
              <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/10 rounded-md text-[10px] font-semibold tracking-wider uppercase">
                Regional Manager
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden md:inline-block font-mono">
                Region: <strong className="text-slate-200">{user?.regionId || 'WEST'}</strong>
              </span>
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
        
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Regional Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Manage network filling stations, oversee stock alerts, and resolve replenishment tickets.</p>
        </div>

        {/* Map & KPI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Station Map */}
          <div>
            <StationMap stations={MOCK_STATIONS} />
          </div>

          {/* Quick KPIs Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-center relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.05)]">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Stations</p>
              <p className="text-5xl font-black text-white font-mono mt-2">{MOCK_STATIONS.length}</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-center relative overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.05)]">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">Critical Stock</p>
              <p className="text-5xl font-black text-red-500 font-mono mt-2">
                {MOCK_STATIONS.filter(s => s.status === 'CRITICAL').length}
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-center relative overflow-hidden col-span-2 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Pending Requests</p>
              <p className="text-5xl font-black text-amber-500 font-mono mt-2">
                {requests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        {/* Replenishment Approval Table */}
        <div className="glass-card border border-slate-800/80 shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
            <h3 className="font-bold text-lg text-slate-100 tracking-tight">Pending Replenishment Requests</h3>
            <p className="text-slate-400 text-xs mt-0.5">Approve or reject fuel orders from station managers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fuel Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity (L)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-transparent">
                {requests.map(req => (
                  <tr key={req.requestId} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-200 text-sm">{req.stationName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{req.stationId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{req.fuelType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-white font-mono">{req.requestedQuantity.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {req.status === 'PENDING' ? (
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleDecision(req.requestId, 'APPROVED')} 
                            className="text-emerald-500 hover:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/10 hover:border-emerald-500/30 p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
                            title="Approve request"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDecision(req.requestId, 'REJECTED')} 
                            className="text-red-500 hover:text-red-400 bg-red-50/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
                            title="Reject request"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm">No replenishment requests found.</div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}