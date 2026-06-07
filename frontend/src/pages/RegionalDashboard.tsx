import { useState } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import StationMap from '../components/dashboard/StationMap';
import type { StationLocation, RefuelRequest } from '../types/replenishment';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Mock Data
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-green-900 border-b border-green-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-extrabold text-xl tracking-wider">LIOC IMS</span>
              <span className="ml-4 px-3 py-1 bg-green-800 rounded-md text-sm font-medium">Regional View</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Region: {user?.regionId || 'WEST'}</span>
              <button onClick={() => logout()} className="text-sm bg-green-700 px-3 py-2 rounded font-medium hover:bg-green-600 transition">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Regional Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Manage stations, monitor critical stocks, and approve requests.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Station Map */}
          <div>
            <StationMap stations={MOCK_STATIONS} />
          </div>

          {/* Quick KPIs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-gray-500 text-sm font-medium">Total Stations</p>
              <p className="text-4xl font-extrabold text-blue-900 mt-2">{MOCK_STATIONS.length}</p>
            </div>
            <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100 flex flex-col justify-center">
              <p className="text-red-600 text-sm font-medium">Critical Stock</p>
              <p className="text-4xl font-extrabold text-red-700 mt-2">
                {MOCK_STATIONS.filter(s => s.status === 'CRITICAL').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-100 flex flex-col justify-center col-span-2">
              <p className="text-yellow-700 text-sm font-medium">Pending Requests</p>
              <p className="text-4xl font-extrabold text-yellow-800 mt-2">
                {requests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        {/* Replenishment Approval Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-lg text-gray-800">Pending Replenishment Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (L)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map(req => (
                  <tr key={req.requestId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{req.stationName}</div>
                      <div className="text-xs text-gray-500">{req.stationId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.fuelType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{req.requestedQuantity.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {req.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button onClick={() => handleDecision(req.requestId, 'APPROVED')} className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded transition">
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDecision(req.requestId, 'REJECTED')} className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded transition">
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">No requests available.</div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}