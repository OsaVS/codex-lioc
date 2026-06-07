import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import { LockClosedIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // simulate network

    if (username === 'manager' && password === 'admin') {
      login(
        { userId: 'USR1', userName: 'manager', name: 'Kamal Perera', email: 'kamal.perera@lankaioc.lk', role: 'STATION_MANAGER', stationId: 'STN001' },
        'mock-jwt-token'
      );
      navigate('/station-dashboard');
    } else if (username === 'region' && password === 'admin') {
      login(
        { userId: 'USR2', userName: 'region', name: 'Dilantha Fernando', email: 'dilantha.fernando@lankaioc.lk', role: 'REGIONAL_MANAGER', regionId: 'REG_WEST' },
        'mock-jwt-token'
      );
      navigate('/region-dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mesh-gradient-bg min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Purple ambient blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-700/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-700/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          {/* LIOC Logo Mark */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-violet-600/20 rounded-2xl blur-xl" />
              <div className="relative flex items-center justify-center bg-gradient-to-br from-violet-700 to-blue-700 px-6 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(124,58,237,0.4)]">
                {/* Flame icon SVG */}
                {/* <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2C12 2 7 7 7 12a5 5 0 0010 0c0-3-2-5-2-5s-.5 2.5-2 3.5C13.5 9 14 6 12 2z" fill="rgba(255,255,255,0.9)" />
                  <path d="M12 22c4.418 0 8-3.582 8-8 0-2.5-1-5-3-6.5.5 2-1 4-2.5 4.5C16 10.5 14.5 7 12 4 10 7 10 9.5 11.5 11.5 10 11 8 9 8.5 7 6.5 8.5 4 11 4 14c0 4.418 3.582 8 8 8z" fill="rgba(255,255,255,0.4)" />
                </svg> */}
                <div>
                  <div className="text-white font-black text-lg tracking-widest uppercase leading-none" style={{ fontFamily: 'Space Grotesk' }}>
                    Lanka IOC
                  </div>
                  <div className="text-violet-200/80 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">
                    Lanka Indian Oil Corporation
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
            IMS Portal
          </h1>
          <p className="mt-2 text-violet-300/70 text-base font-medium">
            Inventory & Distribution Management System
          </p>
          {/* <p className="mt-1 text-slate-500 text-xs font-mono tracking-wider">
            v2.1.0 · Western Province Network
          </p> */}
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-3xl shadow-[0_0_60px_rgba(124,58,237,0.2)] border border-violet-500/20">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-violet-300/80 uppercase tracking-widest mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-4.5 w-4.5 text-violet-400/60" style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-violet-500/20 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-300/80 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4.5 w-4.5 text-violet-400/60" style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-violet-500/20 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm text-center font-medium bg-red-950/40 border border-red-700/30 p-3.5 rounded-xl">
                <span className="w-4 h-4 rounded-full bg-red-500 shrink-0 flex items-center justify-center text-[9px] font-black text-white">!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>
                  <ShieldCheckIcon style={{ width: '18px', height: '18px' }} />
                  Sign In to IMS
                </>
              )}
            </button>
          </form>

          {/* Credential Hints */}
          <div className="mt-6 pt-5 border-t border-violet-500/10">
            <p className="text-center text-xs text-slate-500 font-mono mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setUsername('manager'); setPassword('admin'); }}
                className="flex flex-col items-start p-3 rounded-xl border border-violet-500/15 bg-violet-500/5 hover:bg-violet-500/12 hover:border-violet-500/30 transition-all cursor-pointer text-left"
              >
                <span className="text-[10px] font-bold text-violet-400/70 uppercase tracking-wider">Station Mgr</span>
                <span className="text-xs text-slate-300 font-mono mt-0.5">manager / admin</span>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('region'); setPassword('admin'); }}
                className="flex flex-col items-start p-3 rounded-xl border border-blue-500/15 bg-blue-500/5 hover:bg-blue-500/12 hover:border-blue-500/30 transition-all cursor-pointer text-left"
              >
                <span className="text-[10px] font-bold text-blue-400/70 uppercase tracking-wider">Regional Mgr</span>
                <span className="text-xs text-slate-300 font-mono mt-0.5">region / admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          © 2025 Lanka Indian Oil Corporation (Lanka) Ltd.
        </p> */}
      </div>
    </div>
  );
}