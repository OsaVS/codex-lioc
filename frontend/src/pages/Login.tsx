import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // MOCK LOGIN FOR PROOF OF CONCEPT
    if (username === 'manager' && password === 'admin') {
      login(
        { userId: 'USR1', userName: 'manager', name: 'John Doe', email: 'john@lioc.app', role: 'STATION_MANAGER', stationId: 'STN001' },
        'mock-jwt-token'
      );
      navigate('/station-dashboard');
    } else if (username === 'region' && password === 'admin') {
      login(
        { userId: 'USR2', userName: 'region', name: 'Jane Smith', email: 'jane@lioc.app', role: 'REGIONAL_MANAGER', regionId: 'REG_WEST' },
        'mock-jwt-token'
      );
      navigate('/region-dashboard');
    } else {
      setError('Invalid credentials. Use manager / region (password: admin)');
    }
  };

  return (
    <div className="mesh-gradient-bg min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl relative border border-slate-800/80 shadow-[0_0_50px_rgba(59,130,246,0.15)] z-10">
        <div>
          {/* Brand Logo */}
          <div className="flex justify-center mb-4">
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest text-slate-950 uppercase shadow-lg shadow-orange-500/10">
              Lanka IOC
            </span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold bg-gradient-to-r from-slate-100 via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
            IMS Portal
          </h2>
          <p className="mt-1.5 text-center text-sm text-slate-400 font-medium">
            Inventory & Distribution Management
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Username
              </label>
              <div className="absolute top-[32px] left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-11 bg-slate-900/60 border border-slate-800/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-sm font-sans"
                placeholder="e.g. manager or region"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="absolute top-[32px] left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-11 bg-slate-900/60 border border-slate-800/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-sm font-sans"
                placeholder="e.g. admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center font-medium bg-red-950/40 border border-red-900/40 p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}