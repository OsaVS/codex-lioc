import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/useAuthStore';
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
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Load/Save state helper from localStorage for cross-dashboard communication
const saveRequestsToStorage = (reqs: RefuelRequest[]) => {
  localStorage.setItem('lioc_refuel_requests', JSON.stringify(reqs));
};

const loadRequestsFromStorage = (): RefuelRequest[] => {
  const data = localStorage.getItem('lioc_refuel_requests');
  if (data) return JSON.parse(data);
  
  // Default seed requests
  const defaults: RefuelRequest[] = [
    { requestId: 'REQ-101', stationId: 'STN001', stationName: 'Colombo 03 LIOC', requestedDate: '2026-06-05T08:00:00Z', fuelType: 'Diesel (Auto)', requestedQuantity: 18500, approvedQuantity: 18000, deliveredQuantity: 18000, status: 'DELIVERED', deliveryTime: '2026-06-06T14:30:00Z' },
    { requestId: 'REQ-102', stationId: 'STN001', stationName: 'Colombo 03 LIOC', requestedDate: '2026-06-06T10:15:00Z', fuelType: 'Petrol 92 Octane', requestedQuantity: 5500, approvedQuantity: 5000, status: 'SCHEDULED', scheduledDeliveryTime: '2026-06-08T09:00:00Z' }
  ];
  saveRequestsToStorage(defaults);
  return defaults;
};

export default function StationDashboard() {
  const logout = useAuthStore(state => state.logout);
  const [activeTab, setActiveTab] = useState<'fuel' | 'minimart' | 'replenishment'>('fuel');

  // 1. Tank Monitoring States (FR-1.1)
  const [tanks, setTanks] = useState<Tank[]>([
    {
      tankId: 'TNK-001',
      stationId: 'STN001',
      fuelType: 'Petrol 92 Octane',
      capacity: 15000,
      currentLevel: 9500,
      isActive: true,
      pumps: [{ pumpId: 'P01', name: 'Pump 1' }, { pumpId: 'P02', name: 'Pump 2' }]
    },
    {
      tankId: 'TNK-002',
      stationId: 'STN001',
      fuelType: 'Diesel (Auto)',
      capacity: 20000,
      currentLevel: 4200, // Close to threshold (4000L)
      isActive: true,
      pumps: [{ pumpId: 'P03', name: 'Pump 3' }]
    }
  ]);

  // 2. Minimart Product States (FR-2.1)
  const [products, setProducts] = useState<MinimartProduct[]>([
    { id: 'MM-001', name: 'Premium Engine Oil 1L', category: 'ENGINE_OIL', currentStock: 45, reorderLevel: 10, supplier: 'Castrol Lanka', expiryDate: '2027-12-15', batchNumber: 'EO-B928', price: 2450 },
    { id: 'MM-002', name: 'Super Coolant 500ml', category: 'COOLANT', currentStock: 4, reorderLevel: 15, supplier: 'Mobil Dist', expiryDate: '2026-07-20', batchNumber: 'CO-A103', price: 950 }, // Low stock!
    { id: 'MM-003', name: 'Heavy Duty Brake Fluid', category: 'BRAKE_FLUID', currentStock: 12, reorderLevel: 5, supplier: 'Mobil Dist', expiryDate: '2026-06-25', batchNumber: 'BF-F402', price: 1800 }, // Expiring soon!
    { id: 'MM-004', name: 'Car Polish Spray', category: 'CAR_CARE', currentStock: 22, reorderLevel: 8, supplier: 'Shell Chem', expiryDate: '2025-11-30', batchNumber: 'CP-X871', price: 1200 }, // Expired!
    { id: 'MM-005', name: 'Car Wash Sponge', category: 'ACCESSORIES', currentStock: 30, reorderLevel: 10, supplier: 'Local Prod', expiryDate: '2030-01-01', batchNumber: 'SP-N5', price: 350 }
  ]);

  // 3. Replenishment Request States (FR-3.3)
  const [requests, setRequests] = useState<RefuelRequest[]>(loadRequestsFromStorage());

  // Manual Replenishment state
  const [manualFuelType, setManualFuelType] = useState('Petrol 92 Octane');
  const [manualQuantity, setManualQuantity] = useState(5000);

  // Sync state changes with localStorage for cross-page mock database
  useEffect(() => {
    saveRequestsToStorage(requests);
  }, [requests]);

  // POS Transaction handler (FR-2.2 POS Integration)
  const handleProcessTransaction = (type: 'SALE' | 'RETURN' | 'STOCK_UPDATE', productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      let newStock = p.currentStock;
      if (type === 'SALE') {
        newStock = Math.max(0, p.currentStock - quantity);
      } else if (type === 'RETURN') {
        newStock = p.currentStock + quantity;
      } else if (type === 'STOCK_UPDATE') {
        newStock = quantity;
      }
      return { ...p, currentStock: newStock };
    }));
  };

  // Manual Measurement dipstick handler (FR-1.2 & FR-1.3)
  const handleManualEntrySubmit = (data: { tankId: string; dipstickValue: number; measuredVolume: number; operator: string }) => {
    setTanks(prev => prev.map(t => {
      if (t.tankId !== data.tankId) return t;
      return {
        ...t,
        currentLevel: data.measuredVolume // Update current level based on manual measured volume
      };
    }));
  };

  // Pump Totalizer reader updates level (simulates sales depletion)
  const handlePumpReadingSubmit = (data: { pumpId: string; readingValue: number }) => {
    setTanks(prev => prev.map(t => {
      const isConnected = t.pumps.some(p => p.pumpId === data.pumpId);
      if (!isConnected) return t;
      // Subtract pump readings value from tank level as sales depletion
      return {
        ...t,
        currentLevel: Math.max(0, t.currentLevel - Math.round(data.readingValue / 100))
      };
    }));
  };

  // Automatic Replenishment (FR-3.1)
  useEffect(() => {
    tanks.forEach(t => {
      // Reorder Threshold: Petrol <= 3000L, Diesel <= 4000L
      const threshold = t.fuelType.toLowerCase().includes('petrol') ? 3000 : 4000;
      if (t.currentLevel <= threshold) {
        // Check if a request already exists that is active
        const existing = requests.some(r => r.fuelType === t.fuelType && ['DRAFT', 'SUBMITTED', 'APPROVED', 'SCHEDULED'].includes(r.status));
        if (!existing) {
          const autoRequest: RefuelRequest = {
            requestId: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
            stationId: 'STN001',
            stationName: 'Colombo 03 LIOC',
            requestedDate: new Date().toISOString(),
            fuelType: t.fuelType,
            requestedQuantity: Math.round(t.capacity - t.currentLevel),
            status: 'SUBMITTED' // Automatically generated & submitted request
          };
          setRequests(prev => [autoRequest, ...prev]);
        }
      }
    });
  }, [tanks, requests]);

  // Create manual refuel requests (FR-3.2)
  const handleManualRequest = (status: 'DRAFT' | 'SUBMITTED') => {
    const newReq: RefuelRequest = {
      requestId: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      stationId: 'STN001',
      stationName: 'Colombo 03 LIOC',
      requestedDate: new Date().toISOString(),
      fuelType: manualFuelType,
      requestedQuantity: manualQuantity,
      status: status
    };
    setRequests(prev => [newReq, ...prev]);
    alert(status === 'DRAFT' ? 'Request saved as Draft.' : 'Refuel request submitted.');
  };

  // Trigger draft request submission
  const handleSubmitDraft = (id: string) => {
    setRequests(prev => prev.map(r => r.requestId === id ? { ...r, status: 'SUBMITTED', requestedDate: new Date().toISOString() } : r));
  };

  // Derive pump list from all tanks (used by PumpTotalizerForm)
  const MOCK_PUMPS = tanks.flatMap(t => t.pumps);

  // Check if any tank has critical levels
  const hasCriticalTank = tanks.some(t => (t.currentLevel / t.capacity) < 0.15);

  // Expiry check helpers (FR-2.4)
  const isProductExpired = (expiryDate: string) => new Date(expiryDate) < new Date();
  const isNearingExpiry = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 30; // within 30 days
  };

  return (
    <div className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="glass-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 rounded-lg text-xs font-black tracking-widest text-slate-950 uppercase shadow-md shadow-orange-500/10">
                Lanka IOC
              </span>
              <span className="font-bold text-lg text-slate-100">IMS</span>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-md text-[10px] font-semibold uppercase font-mono">
                Station Manager
              </span>
            </div>
            
            {/* Dashboard Tabs Toggle */}
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setActiveTab('fuel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'fuel' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <CircleStackIcon className="w-3.5 h-3.5" />
                Fuel Control
              </button>
              <button 
                onClick={() => setActiveTab('minimart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'minimart' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ShoppingBagIcon className="w-3.5 h-3.5" />
                Mini Mart
              </button>
              <button 
                onClick={() => setActiveTab('replenishment')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'replenishment' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Replenishment
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

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Critical Alerts Banner (Fuel & Products) */}
        {activeTab === 'fuel' && hasCriticalTank && (
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-950/30 border border-red-900/40 shadow-[0_0_20px_rgba(220,38,38,0.05)] text-red-400 animate-pulse">
            <ExclamationTriangleIcon className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-200">Critical Tank Warning!</h4>
              <p className="text-xs text-red-400/90 mt-0.5">One or more fuel storage tanks are currently below the 15% threshold. An automatic replenishment request has been generated.</p>
            </div>
          </div>
        )}

        {activeTab === 'minimart' && products.some(p => p.currentStock <= p.reorderLevel || isProductExpired(p.expiryDate)) && (
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-950/20 border border-amber-900/30 text-amber-400">
            <ExclamationTriangleIcon className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-200">Mini Mart Alerts Detected</h4>
              <p className="text-xs text-amber-400/95 mt-0.5">
                Some items are either out of stock, below reorder level, or expired. Review the warnings marked in red/amber inside the store tab.
              </p>
            </div>
          </div>
        )}

        {/* ────────── TAB 1: FUEL CONTROL PANEL ────────── */}
        {activeTab === 'fuel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Fuel Telemetry Control</h1>
                <p className="text-sm text-slate-400 mt-1">Real-time levels from digital tank sensors (FR-1.1) and manual stick readings (FR-1.2).</p>
              </div>
            </div>

            {/* Cylinder Wave Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tanks.map(tank => (
                <TankLevelCard key={tank.tankId} tank={tank} />
              ))}
            </div>

            {/* Analytics Area Chart & Manual Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FuelLevelChart />
              </div>
              <div className="space-y-6">
                <ManualMeasurementForm tanks={tanks} onManualEntrySubmit={handleManualEntrySubmit} />
                <PumpTotalizerForm pumps={MOCK_PUMPS} onPumpReadingSubmit={handlePumpReadingSubmit} />
              </div>
            </div>
          </div>
        )}

        {/* ────────── TAB 2: MINI MART PANEL ────────── */}
        {activeTab === 'minimart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products Table (FR-2.1 & FR-2.3) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card border border-slate-800/80 shadow-xl rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                  <h3 className="font-bold text-lg text-slate-100 tracking-tight">Mini Mart Store Inventory</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Track engine oils, coolants, car care items, and suppliers</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Batch & Supplier</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expiry</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stock Status</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-transparent text-xs">
                      {products.map(prod => {
                        const expired = isProductExpired(prod.expiryDate);
                        const nearExp = isNearingExpiry(prod.expiryDate);
                        const lowStock = prod.currentStock <= prod.reorderLevel;

                        return (
                          <tr key={prod.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-200">{prod.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{prod.category} | {prod.id}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-slate-300 font-mono">{prod.batchNumber}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{prod.supplier}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`font-mono px-2 py-0.5 rounded ${
                                expired ? 'bg-red-500/10 text-red-400 border border-red-500/20 font-bold' :
                                nearExp ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                'text-slate-400'
                              }`}>
                                {prod.expiryDate} {expired && '(Expired)'} {nearExp && '(Nearing)'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-slate-200">{prod.currentStock} Units</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  lowStock ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : 'text-slate-500'
                                }`}>
                                  (Min: {prod.reorderLevel})
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap font-bold font-mono text-white">
                              LKR {prod.price.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* POS simulator wrapper */}
            <div className="lg:col-span-1">
              <MinimartPOSSimulator products={products} onProcessTransaction={handleProcessTransaction} />
            </div>
          </div>
        )}

        {/* ────────── TAB 3: REPLENISHMENT PANEL ────────── */}
        {activeTab === 'replenishment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request creation */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
                <h3 className="font-bold text-lg text-slate-100 border-b border-slate-800 pb-2 mb-4 tracking-tight">
                  Request Refuel (FR-3.2)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Fuel Type Selection
                    </label>
                    <select 
                      value={manualFuelType} 
                      onChange={(e) => setManualFuelType(e.target.value)}
                      className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2.5"
                    >
                      <option value="Petrol 92 Octane">Petrol 92 Octane</option>
                      <option value="Diesel (Auto)">Diesel (Auto)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Quantity (Liters)
                    </label>
                    <input 
                      type="number" 
                      step="500"
                      value={manualQuantity}
                      onChange={(e) => setManualQuantity(Number(e.target.value))}
                      className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2.5 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => handleManualRequest('DRAFT')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-lg text-xs transition-all cursor-pointer border border-slate-700"
                    >
                      Save Draft
                    </button>
                    <button 
                      onClick={() => handleManualRequest('SUBMITTED')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all cursor-pointer shadow"
                    >
                      Submit Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests tracking workflow (FR-3.3 & FR-3.4) */}
            <div className="lg:col-span-2">
              <div className="glass-card border border-slate-800/80 shadow-xl rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                  <h3 className="font-bold text-lg text-slate-100 tracking-tight">Replenishment Workflow tracking</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Approval workflow states: Draft ➔ Submitted ➔ Approved ➔ Scheduled ➔ Delivered</p>
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Request ID</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fuel & Requested Qty</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved & Delivered Qty</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivery Time</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-transparent">
                      {requests.map(req => (
                        <tr key={req.requestId} className="hover:bg-slate-900/20 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-slate-200 font-bold">{req.requestId}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-bold text-slate-300">{req.fuelType}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{req.requestedQuantity.toLocaleString()} L</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-slate-300">
                            {req.status === 'DRAFT' || req.status === 'SUBMITTED' ? (
                              <span className="text-slate-600">-</span>
                            ) : (
                              <div>
                                <div>Approved: {req.approvedQuantity?.toLocaleString() || req.requestedQuantity.toLocaleString()} L</div>
                                {req.status === 'DELIVERED' && <div className="text-[10px] text-emerald-400 font-bold">Delivered: {req.deliveredQuantity?.toLocaleString() || req.approvedQuantity?.toLocaleString() || req.requestedQuantity.toLocaleString()} L</div>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-slate-400">
                            {req.status === 'SCHEDULED' && <div className="text-amber-400 text-[10px]">ETA: {req.scheduledDeliveryTime ? new Date(req.scheduledDeliveryTime).toLocaleTimeString() : 'Pending'}</div>}
                            {req.status === 'DELIVERED' && <div className="text-emerald-400 text-[10px]">Fulfillment: {req.deliveryTime ? new Date(req.deliveryTime).toLocaleTimeString() : 'Completed'}</div>}
                            {['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(req.status) && <span className="text-slate-600">-</span>}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                              req.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                              req.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              req.status === 'APPROVED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              req.status === 'SCHEDULED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              req.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {req.status === 'DRAFT' ? (
                              <button 
                                onClick={() => handleSubmitDraft(req.requestId)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2.5 rounded text-[10px] transition-all cursor-pointer uppercase tracking-wider"
                              >
                                Submit
                              </button>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {requests.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-500">No refuel requests saved.</td>
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