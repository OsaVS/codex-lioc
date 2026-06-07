import { useForm } from 'react-hook-form';
import type { Tank } from '../../types/fuel';

interface DipstickFormInputs {
  tankId: string;
  dipstickValue: number;
  measuredVolume: number;
  measuredTime: string;
  operator: string;
}

interface TotalizerFormInputs {
  pumpId: string;
  readingValue: number;
  timestamp: string;
}

interface ManualFormProps {
  tanks: Tank[];
  onManualEntrySubmit: (data: DipstickFormInputs) => void;
}

export function ManualMeasurementForm({ tanks, onManualEntrySubmit }: ManualFormProps) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<DipstickFormInputs>({
    defaultValues: {
      measuredTime: new Date().toISOString().slice(0, 16),
    }
  });

  const selectedTankId = watch('tankId');
  const dipstickValue = watch('dipstickValue');

  // Dynamically calculate volume if dipstick value is entered (FR-1.3 Inventory Calculation)
  // Let's assume a cross sectional area constant for simulation (e.g. 1.25L per mm)
  const handleAutoCalculate = () => {
    if (!selectedTankId || !dipstickValue) return;
    const selectedTank = tanks.find(t => t.tankId === selectedTankId);
    if (!selectedTank) return;
    // Calculate volume: e.g. capacity * (dipstickValue / height_of_tank)
    // Assume typical height is 4000mm
    const calculated = Math.round((dipstickValue / 4000) * selectedTank.capacity);
    setValue('measuredVolume', Math.min(selectedTank.capacity, calculated));
  };

  const onSubmit = (data: DipstickFormInputs) => {
    onManualEntrySubmit(data);
    alert(`Dipstick measurement logged successfully!\nTank: ${data.tankId}\nCalculated Volume: ${data.measuredVolume} L\nOperator: ${data.operator}`);
    reset({
      tankId: '',
      dipstickValue: undefined,
      measuredVolume: undefined,
      measuredTime: new Date().toISOString().slice(0, 16),
      operator: '',
    });
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
      <h3 className="font-bold text-lg text-slate-100 border-b border-slate-800 pb-2 mb-4 tracking-tight">
        Manual Dip Stick Entry
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Select Tank
          </label>
          <select 
            {...register('tankId', { required: true })}
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2.5"
          >
            <option value="" className="bg-slate-900">-- Choose Tank --</option>
            {tanks.map(t => (
              <option key={t.tankId} value={t.tankId} className="bg-slate-900">{t.fuelType} ({t.tankId})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Dip Stick (mm)
            </label>
            <input 
              type="number" 
              step="0.1" 
              {...register('dipstickValue', { required: true, min: 0 })}
              onBlur={handleAutoCalculate}
              placeholder="e.g. 1500"
              className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2.5 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Fuel Volume (L)
            </label>
            <input 
              type="number" 
              {...register('measuredVolume', { required: true, min: 0 })}
              placeholder="Auto-calculated or enter"
              className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2.5 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Date & Time
            </label>
            <input 
              type="datetime-local" 
              {...register('measuredTime', { required: true })}
              className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2.5 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Operator / Staff
            </label>
            <input 
              type="text" 
              {...register('operator', { required: true })}
              placeholder="e.g. Staff A"
              className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2.5 font-sans"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] active:scale-[0.98] transition-all cursor-pointer text-xs uppercase tracking-wider"
        >
          Submit Measurement
        </button>
      </form>
    </div>
  );
}

interface PumpFormProps {
  pumps: { pumpId: string; name: string }[];
  onPumpReadingSubmit: (data: TotalizerFormInputs) => void;
}

export function PumpTotalizerForm({ pumps, onPumpReadingSubmit }: PumpFormProps) {
  const { register, handleSubmit, reset } = useForm<TotalizerFormInputs>({
    defaultValues: {
      timestamp: new Date().toISOString().slice(0, 16),
    }
  });

  const onSubmit = (data: TotalizerFormInputs) => {
    onPumpReadingSubmit(data);
    alert(`Pump ${data.pumpId} totalizer logged: ${data.readingValue} L`);
    reset({
      pumpId: '',
      readingValue: undefined,
      timestamp: new Date().toISOString().slice(0, 16),
    });
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
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all sm:text-xs p-2.5"
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
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all sm:text-xs p-2.5 font-mono"
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
            className="mt-1 block w-full rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all sm:text-xs p-2.5 font-mono"
            placeholder="e.g. 560400"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all cursor-pointer text-xs uppercase tracking-wider"
        >
          Submit Reading
        </button>
      </form>
    </div>
  );
}