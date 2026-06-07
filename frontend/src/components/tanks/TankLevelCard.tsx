import type { Tank } from '../../types/fuel';

interface Props {
  tank: Tank;
}

export default function TankLevelCard({ tank }: Props) {
  const percentage = Math.round((tank.currentLevel / tank.capacity) * 100);

  // Remaining days calculation (FR-1.4)
  const consumptionRate = tank.fuelType.toLowerCase().includes('petrol') ? 750 : 950;
  const remainingDays = Math.max(0.1, Number((tank.currentLevel / consumptionRate).toFixed(1)));

  // Color theme based on level (FR-1.4 Stock status) — LIOC brand palette
  let liquidColor     = '#7C3AED'; // LIOC Purple  — Normal
  let liquidColorDark = '#5B21B6'; // Violet dark
  let badgeClass      = 'bg-violet-500/15 text-violet-300 border-violet-500/25';
  let glowClass       = 'shadow-[0_0_20px_rgba(124,58,237,0.25)]';
  let headerAccent    = 'from-violet-500/10';
  let statusText      = 'Normal';

  if (percentage <= 0) {
    statusText      = 'Empty';
    liquidColor     = '#475569';
    liquidColorDark = '#334155';
    badgeClass      = 'bg-slate-500/15 text-slate-400 border-slate-500/25';
    glowClass       = 'shadow-none';
    headerAccent    = 'from-slate-500/5';
  } else if (percentage < 15) {
    statusText      = 'Critical';
    liquidColor     = '#EF4444';
    liquidColorDark = '#DC2626';
    badgeClass      = 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse';
    glowClass       = 'shadow-[0_0_24px_rgba(220,38,38,0.55)]';
    headerAccent    = 'from-red-500/10';
  } else if (percentage < 30) {
    statusText      = 'Low Stock';
    liquidColor     = '#F59E0B';
    liquidColorDark = '#D97706';
    badgeClass      = 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    glowClass       = 'shadow-[0_0_20px_rgba(245,158,11,0.3)]';
    headerAccent    = 'from-amber-500/10';
  } else if (percentage < 60) {
    // Medium level — LIOC Blue
    liquidColor     = '#2563EB';
    liquidColorDark = '#1D4ED8';
    badgeClass      = 'bg-blue-500/15 text-blue-400 border-blue-500/25';
    glowClass       = 'shadow-[0_0_20px_rgba(37,99,235,0.2)]';
    headerAccent    = 'from-blue-500/10';
    statusText      = 'Normal';
  }

  const availableCapacity = tank.capacity - tank.currentLevel;
  const fuelTypeAbbr = tank.fuelType.replace('Octane', 'OCT').replace('(Auto)', '').trim();

  return (
    <div className={`glass-card glass-card-hover rounded-2xl relative overflow-hidden flex flex-col ${glowClass}`}>
      {/* Gradient top accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${headerAccent.replace('from-', 'from-')} to-transparent`}
        style={{ background: `linear-gradient(90deg, ${liquidColor}55 0%, transparent 100%)` }} />

      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-white text-lg leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
              {tank.fuelType}
            </h3>
            <p className="text-slate-500 text-xs font-mono mt-0.5">Tank {tank.tankId}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeClass} uppercase tracking-wide`}>
            {statusText}
          </span>
        </div>

        {/* Main content: cylinder + stats */}
        <div className="flex items-center gap-5 mt-4">
          {/* Animated Wave Tank */}
          <div
            className="cylinder-tank shrink-0"
            style={{
              '--liquid-level': `${percentage}%`,
              '--liquid-color': liquidColor,
              '--liquid-color-dark': liquidColorDark,
            } as React.CSSProperties}
          >
            <div className="tank-liquid">
              <div className="wave-back" />
              <div className="wave-front" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-white text-lg font-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-mono">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex flex-col gap-3.5">
            <div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Current Volume</p>
              <p className="text-white text-2xl font-black font-mono leading-tight mt-0.5">
                {tank.currentLevel.toLocaleString()}
                <span className="text-slate-400 text-sm font-medium ml-1">L</span>
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Capacity</p>
              <p className="text-slate-300 text-base font-bold font-mono mt-0.5">
                {tank.capacity.toLocaleString()}
                <span className="text-slate-500 text-sm font-normal ml-1">L total</span>
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Free Space</p>
              <p className="text-slate-400 text-sm font-bold font-mono mt-0.5">
                {availableCapacity.toLocaleString()} L
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1.5">
            <span>0 L</span>
            <span>{tank.capacity.toLocaleString()} L</span>
          </div>
          <div className="h-2 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(90deg, ${liquidColorDark}, ${liquidColor})`
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 px-5 py-3 bg-slate-950/40 border-t border-violet-500/8 flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {tank.pumps.map(pump => (
            <span
              key={pump.pumpId}
              className="inline-flex items-center px-2 py-0.5 bg-violet-500/8 border border-violet-500/15 rounded text-[10px] font-bold text-violet-300/80 font-mono hover:border-violet-400/30 transition-all"
            >
              {pump.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">
            ~{remainingDays}d left
          </span>
          <span className={`w-2.5 h-2.5 rounded-full ${tank.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
        </div>
      </div>
    </div>
  );
}