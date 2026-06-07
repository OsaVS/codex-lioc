import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    <div className="glass-card p-6 rounded-2xl h-96 border border-slate-800/80 shadow-lg relative overflow-hidden flex flex-col justify-between">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <h3 className="font-bold text-lg text-slate-100 tracking-tight">Fuel Level Analysis (Past 24h)</h3>
        <p className="text-slate-400 text-xs mt-0.5 mb-4">Hourly volumetric changes for main storage tanks</p>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="95%">
          <AreaChart data={mockData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
            <defs>
              <linearGradient id="fuelLevelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(51, 65, 85, 0.2)" strokeDasharray="5 5" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
              tickLine={false} 
              axisLine={{ stroke: 'rgba(51, 65, 85, 0.3)' }} 
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
              tickLine={false} 
              axisLine={{ stroke: 'rgba(51, 65, 85, 0.3)' }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.7)',
                color: '#f8fafc'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#3b82f6', fontFamily: 'monospace' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="level" 
              name="Volume (L)"
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#fuelLevelGrad)" 
              dot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#0f172a' }} 
              activeDot={{ r: 7, stroke: '#60a5fa', strokeWidth: 2, fill: '#3b82f6' }} 
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}