import React from 'react';
import { Tank } from '../../types/fuel';

interface Props {
  tank: Tank;
}

export default function TankLevelCard({ tank }: Props) {
  const percentage = Math.round((tank.currentLevel / tank.capacity) * 100);
  
  let color = 'bg-green-500';
  if (percentage < 30) color = 'bg-yellow-500';
  if (percentage < 15) color = 'bg-red-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-lg">{tank.fuelType}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tank.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {tank.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="text-gray-500 text-sm mb-4">ID: {tank.tankId}</div>

      <div className="relative pt-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-semibold inline-block py-1 uppercase text-gray-600">
              Capacity Level
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold inline-block text-gray-800">
              {percentage}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
          <div style={{ width: `${percentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${color} transition-all duration-500`}></div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4 flex justify-between">
        <span>Current: <strong className="text-gray-900">{tank.currentLevel.toLocaleString()} L</strong></span>
        <span>Max: {tank.capacity.toLocaleString()} L</span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Connected Pumps</p>
        <div className="flex flex-wrap gap-2">
          {tank.pumps.map(pump => (
            <span key={pump.pumpId} className="inline-flex items-center px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-600">
              {pump.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}