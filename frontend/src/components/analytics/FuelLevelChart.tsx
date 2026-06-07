import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Realistic intraday consumption data for a busy Colombo fuel station (FR-4.2)
const mockData = [
  { time: '06:00', petrol92: 13800, petrol95: 7100, diesel: 18900 },
  { time: '07:00', petrol92: 13200, petrol95: 6850, diesel: 18100 },
  { time: '08:00', petrol92: 12400, petrol95: 6500, diesel: 17100 },
  { time: '09:00', petrol92: 11600, petrol95: 6100, diesel: 16200 },
  { time: '10:00', petrol92: 11100, petrol95: 5900, diesel: 15700 },
  { time: '11:00', petrol92: 10600, petrol95: 5600, diesel: 15200 },
  { time: '12:00', petrol92: 10000, petrol95: 5300, diesel: 14600 },
  { time: '13:00', petrol92: 9500,  petrol95: 5100, diesel: 14000 },
  { time: '14:00', petrol92: 9200,  petrol95: 4900, diesel: 13500 },
  { time: '15:00', petrol92: 8800,  petrol95: 4650, diesel: 12900 },
  { time: '16:00', petrol92: 8200,  petrol95: 4400, diesel: 12200 },
  { time: '17:00', petrol92: 7400,  petrol95: 4000, diesel: 11300 },
  { time: '18:00', petrol92: 6700,  petrol95: 3700, diesel: 10600 },
  { time: '19:00', petrol92: 6100,  petrol95: 3450, diesel: 10100 },
  { time: '20:00', petrol92: 5800,  petrol95: 3300, diesel: 9700  },
  { time: '21:00', petrol92: 5600,  petrol95: 3200, diesel: 9500  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 rounded-xl border border-violet-500/25 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <p className="text-violet-300 font-mono font-bold text-xs mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="text-white font-bold font-mono text-xs">
              {entry.value.toLocaleString()} L
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function FuelLevelChart() {
  return (
    <div className="glass-card p-6 rounded-2xl border border-violet-500/15 shadow-lg relative overflow-hidden flex flex-col h-full">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/3 w-40 h-40 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-5">
        <h3 className="font-bold text-white text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
          Fuel Level Telemetry — Today
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          Intraday volumetric depletion across all storage tanks (06:00 – 21:00)
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: 'Petrol 92',  value: '−8,200 L', color: '#7C3AED' },
          { label: 'Petrol 95',  value: '−3,900 L', color: '#2563EB' },
          { label: 'Diesel Auto', value: '−9,400 L', color: '#F59E0B' },
        ].map(c => (
          <div key={c.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
            <span className="text-xs text-slate-400">{c.label}</span>
            <span className="text-xs font-bold font-mono text-red-400">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="grad92"     x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad95"     x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDiesel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(124,58,237,0.08)" strokeDasharray="4 4" vertical={false} />

            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(124,58,237,0.1)' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={36}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px', fontFamily: 'Inter' }}
            />

            <Area type="monotone" dataKey="petrol92"  name="Petrol 92 Oct"  stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#grad92)"     dot={false} activeDot={{ r: 6, stroke: '#7C3AED', strokeWidth: 2, fill: '#06030F' }} />
            <Area type="monotone" dataKey="petrol95"  name="Petrol 95 Oct"  stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#grad95)"     dot={false} activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2, fill: '#06030F' }} />
            <Area type="monotone" dataKey="diesel"    name="Diesel (Auto)"  stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#gradDiesel)" dot={false} activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#06030F' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}