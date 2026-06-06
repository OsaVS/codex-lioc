import React from 'react';
import { useAuthStore } from '../context/useAuthStore';
import TankLevelCard from '../components/tanks/TankLevelCard';
import { ManualMeasurementForm, PumpTotalizerForm } from '../components/tanks/ReadingForms';
import FuelLevelChart from '../components/analytics/FuelLevelChart';
import { Tank } from '../types/fuel';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

// Mock Data
const MOCK_TANKS: Tank[] = [
  {
    tankId: 'TNK-001',
    stationId: 'STN001',
    fuelType: 'Petrol 92 Octane',
    capacity: 15000,
    currentLevel: 6500,
    isActive: true,
    pumps: [{ pumpId: 'P01', name: 'Pump 1' }, { pumpId: 'P02', name: 'Pump 2' }]
  },
  {
    tankId: 'TNK-002',
    stationId: 'STN001',
    fuelType: 'Diesel (Auto)',
    capacity: 20000,
    currentLevel: 1500, // Very low!
    isActive: true,
    pumps: [{ pumpId: 'P03', name: 'Pump 3' }]
  }
];

const MOCK_PUMPS = MOCK_TANKS.flatMap(t => t.pumps);

export default function StationDashboard() {
  const user = useAuthStore(state => state.user);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Basic Navigation / Header */}
      <nav className="bg-blue-900 border-b border-blue-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-extrabold text-xl tracking-wider">LIOC IMS</span>
              <span className="ml-4 px-3 py-1 bg-blue-800 rounded-md text-sm font-medium">Station View</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user?.name || 'Manager'}</span>
              <button className="text-sm bg-blue-700 px-3 py-2 rounded font-medium hover:bg-blue-600 transition">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Quick Actions & Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Station Overview (ID: {user?.stationId || 'N/A'})</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor real-time tank levels and analyze consumption.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition">
            <PlusCircleIcon className="w-5 h-5" />
            Request Replenishment
          </button>
        </div>

        {/* Tank Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {MOCK_TANKS.map(tank => (
             <TankLevelCard key={tank.tankId} tank={tank} />
          ))}
        </div>

        {/* Main Workspace (Chart and Forms) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section takes up 2/3 */}
          <div className="lg:col-span-2">
            <FuelLevelChart />
          </div>

          {/* Data Entry Forms take up 1/3 */}
          <div className="space-y-6">
             <PumpTotalizerForm pumps={MOCK_PUMPS} />
             <ManualMeasurementForm />
          </div>
        </div>

      </main>
    </div>
  );
}