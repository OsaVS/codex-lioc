import React from 'react';
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4 text-blue-900 border-b pb-2">Manual Dip Stick Entry</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Measured Time</label>
          <input 
            type="datetime-local" 
            {...register('measuredTime', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dip Stick Reading (mm)</label>
          <input 
            type="number" 
            step="0.1" 
            {...register('dipstickValue', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="e.g. 1500"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4 text-blue-900 border-b pb-2">Pump Totalizer Entry</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Pump</label>
          <select 
            {...register('pumpId', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          >
            <option value="">-- Choose Pump --</option>
            {pumps.map(p => (
              <option key={p.pumpId} value={p.pumpId}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Timestamp</label>
          <input 
            type="datetime-local" 
            {...register('timestamp', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Totalizer Reading (Liters)</label>
          <input 
            type="number" 
            step="0.01" 
            {...register('readingValue', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="e.g. 560400"
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
          Submit Reading
        </button>
      </form>
    </div>
  );
}