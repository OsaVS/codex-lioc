import { useAuthStore } from '../context/useAuthStore';
import TankLevelCard from '../components/tanks/TankLevelCard';
import { ManualMeasurementForm, PumpTotalizerForm } from '../components/tanks/ReadingForms';
import FuelLevelChart from '../components/analytics/FuelLevelChart';
import type { Tank } from '../types/fuel';
import { PlusCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MOCK_TANKS: Tank[] = [
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
    currentLevel: 1500, // Very low (<15%) -> triggers critical alarm
    isActive: true,
    pumps: [{ pumpId: 'P03', name: 'Pump 3' }]
  }
];

const MOCK_PUMPS = MOCK_TANKS.flatMap(t => t.pumps);

export default function StationDashboard() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  // Check if any tank is critical (< 15%)
  const hasCriticalTank = MOCK_TANKS.some(t => (t.currentLevel / t.capacity) < 0.15);

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
              <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-md text-[10px] font-semibold tracking-wider uppercase">
                Station Manager
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden md:inline-block">
                Manager: <strong className="text-slate-200">{user?.name || 'John Doe'}</strong>
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

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Critical Level Alert Banner */}
        {hasCriticalTank && (
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-950/30 border border-red-900/40 shadow-[0_0_20px_rgba(220,38,38,0.05)] text-red-400 animate-pulse">
            <ExclamationTriangleIcon className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-200">Critical Stock Warning!</h4>
              <p className="text-xs text-red-400/90 mt-0.5">One or more fuel storage tanks are currently below the 15% threshold. Please request an immediate refuel delivery to avoid supply disruption.</p>
            </div>
          </div>
        )}

        {/* Dashboard Title & Overview Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Station Overview <span className="text-slate-500 text-lg font-normal font-mono">(ID: {user?.stationId || 'STN001'})</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">Real-time telemetry indicators, sales statistics, and physical tank checks.</p>
          </div>
          <button 
            onClick={() => alert("Replenishment request submitted for Western Province Regional Manager approval.")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-[0_4px_16px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all cursor-pointer text-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Request Replenishment
          </button>
        </div>

        {/* Dynamic Tank Level Wave Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_TANKS.map(tank => (
             <TankLevelCard key={tank.tankId} tank={tank} />
          ))}
        </div>

        {/* Analytics & Data Submission Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Recharts Area Chart */}
          <div className="lg:col-span-2">
            <FuelLevelChart />
          </div>

          {/* Forms Section */}
          <div className="space-y-6">
             <PumpTotalizerForm pumps={MOCK_PUMPS} />
             <ManualMeasurementForm />
          </div>
        </div>

      </main>
    </div>
  );
}