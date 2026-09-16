import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      const destination = location.state?.from?.pathname || (user.role === 'CLIENT' ? '/profile' : '/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_10%,rgba(220,38,38,0.12),rgba(0,0,0,0))] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-600/30">
            M
          </div>
          <span className="font-black text-3xl tracking-tight text-white">
            MWD <span className="text-red-500">GYM</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-white">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Enter your gym credentials to access the management portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-sm text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-red-600/25 text-sm font-bold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              Demo Quick Fill
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin', 'admin123')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-left transition flex items-center justify-between"
              >
                <span>Admin</span>
                <span className="text-[10px] text-zinc-500 font-mono">admin</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('trainer', 'trainer123')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-left transition flex items-center justify-between"
              >
                <span>Trainer</span>
                <span className="text-[10px] text-zinc-500 font-mono">trainer</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('staff', 'staff123')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-left transition flex items-center justify-between"
              >
                <span>Staff</span>
                <span className="text-[10px] text-zinc-500 font-mono">staff</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('client', 'client123')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-left transition flex items-center justify-between"
              >
                <span>Client</span>
                <span className="text-[10px] text-zinc-500 font-mono">client</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-red-400 hover:text-red-300">
              Sign up as member
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
