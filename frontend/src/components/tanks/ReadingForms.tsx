import { useForm } from 'react-hook-form';

interface DipstickForm {
  dipstickValue: number;
  measuredTime: string;
}

interface TotalizerForm {
  pumpId: string;
  readingValue: number;
  timestamp: string;
}

export function ManualMeasurementForm() {
  const { register, handleSubmit, reset } = useForm<DipstickForm>();

  const onSubmit = (data: DipstickForm) => {
    alert(`Dipstick measurement logged: ${data.dipstickValue} mm`);
    reset();
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
      <h3 className="font-bold text-lg text-slate-100 border-b border-slate-800 pb-2 mb-4 tracking-tight">
        Manual Dip Stick Entry
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Measured Time
          </label>
          <input 
            type="datetime-local" 
            {...register('measuredTime', { required: true })}
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-sm p-2.5 font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Dip Stick Reading (mm)
          </label>
          <input 
            type="number" 
            step="0.1" 
            {...register('dipstickValue', { required: true })}
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-sm p-2.5 font-mono"
            placeholder="e.g. 1500"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] active:scale-[0.98] transition-all"
        >
          Submit Measurement
        </button>
      </form>
    </div>
  );
}

export function PumpTotalizerForm({ pumps }: { pumps: { pumpId: string; name: string }[] }) {
  const { register, handleSubmit, reset } = useForm<TotalizerForm>();

  const onSubmit = (data: TotalizerForm) => {
    alert(`Pump ${data.pumpId} totalizer logged: ${data.readingValue} L`);
    reset();
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
      <h3 className="font-bold text-lg text-slate-100 border-b border-slate-800 pb-2 mb-4 tracking-tight">
        Pump Totalizer Entry
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Select Pump
          </label>
          <select 
            {...register('pumpId', { required: true })}
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all sm:text-sm p-2.5"
          >
            <option value="" className="bg-slate-900">-- Choose Pump --</option>
            {pumps.map(p => (
              <option key={p.pumpId} value={p.pumpId} className="bg-slate-900">{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Timestamp
          </label>
          <input 
            type="datetime-local" 
            {...register('timestamp', { required: true })}
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all sm:text-sm p-2.5 font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Totalizer Reading (Liters)
          </label>
          <input 
            type="number" 
            step="0.01" 
            {...register('readingValue', { required: true })}
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all sm:text-sm p-2.5 font-mono"
            placeholder="e.g. 560400"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all"
        >
          Submit Reading
        </button>
      </form>
    </div>
  );
}