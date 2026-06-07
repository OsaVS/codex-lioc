import { useState } from 'react';
import type { MinimartProduct, POSTransaction } from '../../types/minimart';
import { ShoppingCartIcon, ArrowPathIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface Props {
  products: MinimartProduct[];
  onProcessTransaction: (type: 'SALE' | 'RETURN' | 'STOCK_UPDATE', productId: string, quantity: number) => void;
}

export default function MinimartPOSSimulator({ products, onProcessTransaction }: Props) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [transactionType, setTransactionType] = useState<'SALE' | 'RETURN' | 'STOCK_UPDATE'>('SALE');
  const [streamLogs, setStreamLogs] = useState<POSTransaction[]>([]);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const targetProduct = products.find(p => p.id === selectedProductId);
    if (!targetProduct) return;

    // Trigger parent callback to update actual stock
    onProcessTransaction(transactionType, selectedProductId, quantity);

    // Create log record
    const newLog: POSTransaction = {
      id: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: selectedProductId,
      productName: targetProduct.name,
      type: transactionType,
      quantity: quantity,
      timestamp: new Date().toLocaleTimeString(),
    };

    setStreamLogs(prev => [newLog, ...prev].slice(0, 10)); // keep last 10 logs
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <h3 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          POS Integration Console
        </h3>
        <p className="text-slate-400 text-xs mt-0.5 mb-4">Simulate live sales/returns data from checkout registers</p>
        
        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Select Product
              </label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2"
              >
                <option value="">-- Select Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Qty: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Quantity
              </label>
              <input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Action Type
              </label>
              <select 
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as any)}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-xs p-2"
              >
                <option value="SALE">SALE</option>
                <option value="RETURN">RETURN</option>
                <option value="STOCK_UPDATE">STOCK UPDATE</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {transactionType === 'SALE' ? <ShoppingCartIcon className="w-4 h-4" /> :
             transactionType === 'RETURN' ? <ArrowPathIcon className="w-4 h-4" /> :
             <ArrowTrendingUpIcon className="w-4 h-4" />}
            Transmit Transaction
          </button>
        </form>
      </div>

      {/* POS Realtime Stream Log */}
      <div className="mt-6 flex-1 min-h-[120px] flex flex-col justify-between border-t border-slate-800/80 pt-4">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">POS Broadcast Log</p>
        <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3 h-28 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1.5 scrollbar-thin">
          {streamLogs.length === 0 ? (
            <div className="text-slate-600 italic text-center pt-8">No live POS broadcasts...</div>
          ) : (
            streamLogs.map(log => (
              <div key={log.id} className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>
                  <span className="text-slate-500 mr-1.5">[{log.timestamp}]</span>
                  <span className={`font-bold mr-1.5 ${
                    log.type === 'SALE' ? 'text-red-400' :
                    log.type === 'RETURN' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>{log.type}</span>
                  {log.productName}
                </span>
                <span className="font-bold text-slate-200">
                  {log.type === 'SALE' ? '-' : '+'}{log.quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
