import type { Tank } from '../../types/fuel';

interface Props {
  tank: Tank;
}

export default function TankLevelCard({ tank }: Props) {
  const percentage = Math.round((tank.currentLevel / tank.capacity) * 100);
  
  // Set wave color based on levels
  let liquidColor = '#0284c7'; // Sky 600
  let liquidColorDark = '#0369a1'; // Sky 700
  let badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  let glowColor = 'shadow-[0_0_15px_rgba(3,105,161,0.2)]';

  if (percentage < 30) {
    liquidColor = '#f59e0b'; // Amber 500
    liquidColorDark = '#d97706'; // Amber 600
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    glowColor = 'shadow-[0_0_15px_rgba(217,119,6,0.35)]';
  }
  if (percentage < 15) {
    liquidColor = '#ef4444'; // Red 500
    liquidColorDark = '#dc2626'; // Red 600
    badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse';
    glowColor = 'shadow-[0_0_20px_rgba(220,38,38,0.5)]';
  }

  return (
    <div className={`glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-80 ${glowColor}`}>
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-100 text-xl tracking-tight">{tank.fuelType}</h3>
            <span className="text-slate-500 text-xs font-mono">ID: {tank.tankId}</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {percentage < 15 ? 'Critical' : percentage < 30 ? 'Low Stock' : 'Normal'}
          </span>
        </div>

        <div className="flex items-center gap-6 mt-4">
          {/* Animated 3D-like Tank Cylinder */}
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
            {/* Center percentage label inside the cylinder */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-white text-base font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Stats info */}
          <div className="flex flex-col justify-center gap-3 flex-1">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Current Volume</p>
              <p className="text-2xl font-black text-white font-mono mt-0.5">
                {tank.currentLevel.toLocaleString()} <span className="text-slate-400 text-sm font-normal">L</span>
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Max Capacity</p>
              <p className="text-lg font-bold text-slate-300 font-mono mt-0.5">
                {tank.capacity.toLocaleString()} <span className="text-slate-500 text-xs font-normal">L</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex gap-1.5 overflow-hidden">
          {tank.pumps.map(pump => (
            <span 
              key={pump.pumpId} 
              className="inline-flex items-center px-2 py-0.5 bg-slate-900/50 border border-slate-800 rounded-md text-[10px] font-medium text-slate-400 hover:text-blue-400 hover:border-blue-500/20 transition-all font-mono"
            >
              {pump.name}
            </span>
          ))}
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${tank.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} title={tank.isActive ? 'Active' : 'Inactive'} />
      </div>
    </div>
  );
}