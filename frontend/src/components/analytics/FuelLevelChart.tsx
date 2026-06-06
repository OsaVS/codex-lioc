import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '08:00', level: 9000 },
  { time: '10:00', level: 8600 },
  { time: '12:00', level: 8100 },
  { time: '14:00', level: 7500 },
  { time: '16:00', level: 6900 },
  { time: '18:00', level: 6500 },
  { time: '20:00', level: 6200 },
  { time: '22:00', level: 6000 }
];

export default function FuelLevelChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Fuel Level Analysis (Past 24h)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <Line type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
          <YAxis tick={{ fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}