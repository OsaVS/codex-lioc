import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// 7-day historical end-of-day fuel levels per station (litres)
const STATION_HISTORY: Record<string, Array<{
  day: string;
  petrol92: number;
  petrol95: number;
  diesel: number;
  kerosene: number;
}>> = {
  STN001: [
    { day: 'Jun 2', petrol92: 13800, petrol95: 6900, diesel: 22000, kerosene: 7800 },
    { day: 'Jun 3', petrol92: 12400, petrol95: 6000, diesel: 19500, kerosene: 7650 },
    { day: 'Jun 4', petrol92: 11200, petrol95: 5100, diesel: 16800, kerosene: 7500 },
    { day: 'Jun 5', petrol92: 14500, petrol95: 8200, diesel: 23000, kerosene: 7400 }, // delivery day
    { day: 'Jun 6', petrol92: 13100, petrol95: 7200, diesel: 20000, kerosene: 7400 },
    { day: 'Jun 7', petrol92: 11400, petrol95: 5800, diesel: 16000, kerosene: 7400 },
    { day: 'Jun 8', petrol92:  9500, petrol95: 3100, diesel:  4200, kerosene: 7400 },
  ],
  STN002: [
    { day: 'Jun 2', petrol92: 12500, petrol95: 8200, diesel: 20000, kerosene: 7900 },
    { day: 'Jun 3', petrol92: 10900, petrol95: 7100, diesel: 17500, kerosene: 7700 },
    { day: 'Jun 4', petrol92:  9000, petrol95: 5800, diesel: 14800, kerosene: 7400 },
    { day: 'Jun 5', petrol92:  6800, petrol95: 4200, diesel: 11000, kerosene: 7200 },
    { day: 'Jun 6', petrol92:  5000, petrol95: 3100, diesel:  7500, kerosene: 6900 },
    { day: 'Jun 7', petrol92:  3200, petrol95: 1900, diesel:  4500, kerosene: 6500 },
    { day: 'Jun 8', petrol92:  1800, petrol95:  900, diesel:  2100, kerosene: 6200 },
  ],
  STN003: [
    { day: 'Jun 2', petrol92:  8200, petrol95: 6400, diesel: 22000, kerosene: 7800 },
    { day: 'Jun 3', petrol92:  7000, petrol95: 5500, diesel: 20000, kerosene: 7600 },
    { day: 'Jun 4', petrol92:  6100, petrol95: 4600, diesel: 18200, kerosene: 7400 },
    { day: 'Jun 5', petrol92: 10500, petrol95: 7200, diesel: 20000, kerosene: 7200 }, // partial delivery
    { day: 'Jun 6', petrol92:  8800, petrol95: 6000, diesel: 18400, kerosene: 6900 },
    { day: 'Jun 7', petrol92:  6500, petrol95: 4400, diesel: 16100, kerosene: 6400 },
    { day: 'Jun 8', petrol92:  4200, petrol95: 2800, diesel: 13800, kerosene: 5800 },
  ],
  STN004: [
    { day: 'Jun 2', petrol92: 14500, petrol95: 9500, diesel: 24000, kerosene: 7950 },
    { day: 'Jun 3', petrol92: 13700, petrol95: 9000, diesel: 23000, kerosene: 7950 },
    { day: 'Jun 4', petrol92: 13000, petrol95: 8400, diesel: 22000, kerosene: 7950 },
    { day: 'Jun 5', petrol92: 12200, petrol95: 7900, diesel: 20500, kerosene: 7950 },
    { day: 'Jun 6', petrol92: 11700, petrol95: 7500, diesel: 19200, kerosene: 7950 },
    { day: 'Jun 7', petrol92: 11200, petrol95: 7800, diesel: 18100, kerosene: 7950 },
    { day: 'Jun 8', petrol92: 10800, petrol95: 7200, diesel: 17000, kerosene: 7900 },
  ],
  STN005: [
    { day: 'Jun 2', petrol92: 13000, petrol95: 7800, diesel: 22500, kerosene: 7800 },
    { day: 'Jun 3', petrol92: 11200, petrol95: 6500, diesel: 20000, kerosene: 7600 },
    { day: 'Jun 4', petrol92:  9400, petrol95: 5100, diesel: 17200, kerosene: 7200 },
    { day: 'Jun 5', petrol92:  7600, petrol95: 3800, diesel: 14500, kerosene: 6800 },
    { day: 'Jun 6', petrol92:  6100, petrol95: 2900, diesel: 13000, kerosene: 6000 },
    { day: 'Jun 7', petrol92:  5200, petrol95: 2200, diesel: 12000, kerosene: 5000 },
    { day: 'Jun 8', petrol92:  4350, petrol95: 1500, diesel: 11000, kerosene: 3200 },
  ],
  STN006: [
    { day: 'Jun 2', petrol92: 14800, petrol95: 9600, diesel: 24500, kerosene: 7800 },
    { day: 'Jun 3', petrol92: 14200, petrol95: 9200, diesel: 23800, kerosene: 7700 },
    { day: 'Jun 4', petrol92: 13600, petrol95: 8800, diesel: 23000, kerosene: 7600 },
    { day: 'Jun 5', petrol92: 13100, petrol95: 9200, diesel: 22200, kerosene: 7500 }, // partial refill
    { day: 'Jun 6', petrol92: 12800, petrol95: 9000, diesel: 21500, kerosene: 7000 },
    { day: 'Jun 7', petrol92: 12400, petrol95: 8900, diesel: 20500, kerosene: 6700 },
    { day: 'Jun 8', petrol92: 12150, petrol95: 8800, diesel: 19750, kerosene: 6400 },
  ],
};

const SERIES = [
  { key: 'petrol92',  name: 'Petrol 92',   color: '#F97316' },
  { key: 'petrol95',  name: 'Petrol 95',   color: '#2563EB' },
  { key: 'diesel',    name: 'Diesel (Auto)',color: '#F59E0B' },
  { key: 'kerosene',  name: 'Kerosene',    color: '#7C3AED' },
];

// Low-stock threshold lines (litres)
const LOW_THRESHOLDS: Record<string, number> = {
  petrol92: 4500,  // 30% of 15000
  petrol95: 3000,  // 30% of 10000
  diesel:   7500,  // 30% of 25000
  kerosene: 2400,  // 30% of 8000
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="glass-card px-4 py-3 rounded-xl shadow-lg"
        style={{ border: '1px solid var(--border-card)' }}
      >
        <p className="font-mono font-bold text-xs mb-2" style={{ color: 'var(--lioc-orange)' }}>{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="font-bold font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
              {(entry.value as number).toLocaleString()} L
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface Props {
  stationId: string;
  stationName: string;
}

export default function StationHistoricalChart({ stationId, stationName }: Props) {
  const data = STATION_HISTORY[stationId] ?? STATION_HISTORY['STN001'];

  // Detect deliveries (where a value increased day-over-day)
  const deliveryDays = data.reduce<string[]>((acc, row, i) => {
    if (i === 0) return acc;
    const prev = data[i - 1];
    if (
      row.petrol92 > prev.petrol92 ||
      row.petrol95 > prev.petrol95 ||
      row.diesel > prev.diesel
    ) {
      acc.push(row.day);
    }
    return acc;
  }, []);

  return (
    <div
      className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col"
      style={{ border: '1px solid var(--border-card)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/3 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'var(--lioc-orange)' }}
      />

      <div className="mb-5 relative z-10">
        <h3
          className="font-bold text-xl tracking-tight"
          style={{ fontFamily: 'Space Grotesk', color: 'var(--text-heading)' }}
        >
          7-Day Fuel History
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          End-of-day tank levels for {stationName} · Jun 2 – Jun 8
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-5 flex-wrap relative z-10">
        {SERIES.map(s => (
          <div
            key={s.key}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-card)' }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
          </div>
        ))}
        {deliveryDays.length > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400" />
            <span className="text-xs text-emerald-500 font-semibold">Delivery: {deliveryDays.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="relative z-10" style={{ height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <defs>
              {SERIES.map(s => (
                <filter key={s.key} id={`glow-${s.key}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <CartesianGrid
              stroke="var(--border-table-row)"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-table-head)' }}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              width={38}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                paddingTop: '12px',
                fontFamily: 'Inter',
              }}
            />

            {/* Low-stock reference lines */}
            {Object.entries(LOW_THRESHOLDS).map(([key, val]) => {
              const series = SERIES.find(s => s.key === key);
              return (
                <ReferenceLine
                  key={key}
                  y={val}
                  stroke={series?.color ?? '#888'}
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                />
              );
            })}

            {/* Delivery markers */}
            {deliveryDays.map(day => (
              <ReferenceLine
                key={day}
                x={day}
                stroke="#10B981"
                strokeDasharray="4 2"
                strokeOpacity={0.5}
                label={{ value: '↑ Refill', position: 'top', fontSize: 10, fill: '#10B981' }}
              />
            ))}

            {SERIES.map(s => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--chart-dot-fill)', stroke: s.color, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: s.color, strokeWidth: 2, fill: 'var(--chart-dot-fill)' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
