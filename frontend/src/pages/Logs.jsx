import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import {
  ScrollText,
  Trash2,
  Search,
  RefreshCw,
  X,
  AlertTriangle,
  Info,
  ShieldAlert,
  Activity
} from 'lucide-react';

const LEVEL_STYLES = {
  INFO: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  WARN: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  ERROR: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const CATEGORY_ICONS = {
  AUTH: ShieldAlert,
  MESSAGER: Activity,
};

export const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [actor, setActor] = useState('');
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 30 };
      if (category.trim()) params.category = category.trim();
      if (level.trim()) params.level = level.trim();
      if (actor.trim()) params.actor = actor.trim();
      const res = await api.get('/logs', { params });
      setLogs(res.data?.logs || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load system logs' });
    } finally {
      setLoading(false);
    }
  }, [category, level, actor, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const deleteLog = async (id) => {
    try {
      await api.delete(`/logs/${id}`);
      fetchLogs();
      setMessage({ type: 'success', text: 'Log entry deleted' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete log' });
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all system logs? This cannot be undone.')) return;
    try {
      await api.delete('/logs');
      setLogs([]);
      setTotal(0);
      setMessage({ type: 'success', text: 'All logs cleared' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to clear logs' });
    }
  };

  const resetFilters = () => {
    setCategory(''); setLevel(''); setActor(''); setPage(0);
  };

  const fmt = (s) => {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const inputCls = "w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <ScrollText className="w-4 h-4 text-white" />
            </span>
            System Logs
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Audit trail of authentication, messaging and system events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} disabled={loading} className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-sm font-semibold border transition disabled:opacity-50 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Alert */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 surface grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[0.6875rem] overline text-slate-500 dark:text-zinc-500 mb-1.5">Category</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} placeholder="e.g. AUTH" className={inputCls + " pl-9"} />
          </div>
        </div>
        <div>
          <label className="block text-[0.6875rem] overline text-slate-500 dark:text-zinc-500 mb-1.5">Level</label>
          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(0); }} className={inputCls}>
            <option value="">All levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
        <div>
          <label className="block text-[0.6875rem] overline text-slate-500 dark:text-zinc-500 mb-1.5">Actor</label>
          <input type="text" value={actor} onChange={(e) => { setActor(e.target.value); setPage(0); }} placeholder="username / name" className={inputCls} />
        </div>
        <div className="flex items-end">
          <button onClick={resetFilters} className="w-full inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold border transition text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800">
            Reset
          </button>
        </div>
      </div>

      {/* Logs list */}
      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Log Entries</h2>
          <span className="text-xs font-semibold text-slate-400">{total} total</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No log entries found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {logs.map((l) => {
              const Icon = CATEGORY_ICONS[l.category] || Info;
              return (
                <div key={l.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${l.level === 'ERROR' ? 'bg-red-500/10 text-red-500 border-red-500/20' : l.level === 'WARN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                    {l.level === 'ERROR' ? <AlertTriangle className="w-4 h-4" /> : l.level === 'WARN' ? <AlertTriangle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{l.action}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${LEVEL_STYLES[l.level] || LEVEL_STYLES.INFO}`}>{l.level}</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{l.category}</span>
                      <span className="text-[10px] text-slate-400">{fmt(l.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 break-words">{l.detail || '—'}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                      <span>By: {l.actor || 'system'}</span>
                      {l.ip && <span>IP: {l.ip}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteLog(l.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 shrink-0 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Showing page {page + 1}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 h-8 rounded-lg text-xs font-semibold border transition disabled:opacity-40 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 30} className="px-3 h-8 rounded-lg text-xs font-semibold border transition disabled:opacity-40 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
