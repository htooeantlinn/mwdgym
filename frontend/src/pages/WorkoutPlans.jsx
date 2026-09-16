import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Printer,
  Download,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';

export const WorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workout-plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load workout plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.post(`/workout-plans/${id}/toggle`);
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle status' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete workout plan "${name}"?`)) return;
    try {
      await api.delete(`/workout-plans/${id}`);
      setMessage({ type: 'success', text: 'Workout plan deleted' });
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete plan' });
    }
  };

  const handleDownloadPdf = async (plan) => {
    try {
      const res = await api.get(`/workout-plans/${plan.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to download PDF' });
    }
  };

  const parseContent = (json) => {
    try {
      const p = typeof json === 'string' ? JSON.parse(json) : json;
      if (!p) return { days: [] };
      // handle legacy warmUp/days/sections/rows(col1-4) — normalize for display
      const isLegacy = p.warmUp || (p.days && p.days[0] && (p.days[0].day || p.days[0].sections));
      if (!isLegacy) return p;
      const days = [];
      if (p.warmUp && Array.isArray(p.warmUp)) {
        for (const w of p.warmUp) {
          const rows = (w.rows || []).filter(r => r.name && r.name.trim());
          if (rows.length === 0) continue;
          days.push({
            name: w.label || 'Warm Up',
            exercises: rows.map(r => ({ name: r.name, sets: r.col1, reps: r.col2, weight: r.col3, notes: r.col4, muscleGroup: 'Warm Up' })),
          });
        }
      }
      for (const d of (p.days || [])) {
        const dayName = d.day || d.name || '';
        for (const sec of (d.sections || [])) {
          const rows = (sec.rows || []).filter(r => r.name && r.name.trim());
          if (rows.length === 0) continue;
          days.push({
            name: sec.label ? `${dayName} - ${sec.label}` : dayName,
            exercises: rows.map(r => ({ name: r.name, sets: r.col1, reps: r.col2, weight: r.col3, notes: r.col4, muscleGroup: sec.label || dayName })),
          });
        }
      }
      return { days };
    } catch {
      return { days: [] };
    }
  };

  const getCounts = (plan) => {
    const c = parseContent(plan.contentJson);
    const days = c?.days || [];
    const dayCount = days.length;
    const totalExercises = days.reduce((acc, d) => acc + (d.exercises?.length || 0), 0);
    return { dayCount, totalExercises, days };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-white" />
            </span>
            Workout Routine Builder
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Build day-by-day training splits, assign exercises, and generate print-ready member workout cards.
          </p>
        </div>

        <Link
          to="/workout-plans/new"
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Routine
        </Link>
      </div>

      {/* Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
              : 'bg-red-500/10 border border-red-500/20 text-red-500'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid of Plans */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#121215] rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Dumbbell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="font-bold text-slate-700 dark:text-zinc-300">No workout plans created yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-6">Create personalized multi-day training splits for your athletes.</p>
          <Link
            to="/workout-plans/new"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider"
          >
            Create Routine
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const { dayCount, totalExercises } = getCounts(plan);

            return (
              <div
                key={plan.id}
                className="p-6 surface flex flex-col justify-between hover:border-red-500/40 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      onClick={() => handleToggle(plan.id)}
                      className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        plan.active
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${plan.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {plan.active ? 'Active Split' : 'Archived'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-red-500 transition mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-4">
                    {plan.notes || 'Full training split customized for hypertrophy and strength.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 text-xs mb-6">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Split Length</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{dayCount} Days</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Total Movements</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{totalExercises} Exercises</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Card
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/workout-plans/${plan.id}`}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                      title="Edit Routine"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(plan.id, plan.name)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine Preview Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedPlan.name}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{selectedPlan.notes}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedPlan)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {getCounts(selectedPlan).days.map((day, didx) => (
                <div key={didx} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                  <h4 className="font-extrabold text-sm text-red-500 uppercase tracking-wider mb-3">
                    {day.name || `Day ${didx + 1}`}
                  </h4>
                  <div className="space-y-2">
                    {(day.exercises || []).map((ex, eidx) => (
                      <div
                        key={eidx}
                        className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">{ex.name}</span>
                          <span className="text-[10px] text-slate-400">{ex.muscleGroup}</span>
                          {ex.notes && <span className="text-slate-400 italic text-[11px] block">{ex.notes}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-300 font-semibold shrink-0 ml-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">{ex.sets || '-'}×{ex.reps || '-'}</span>
                          {ex.weight && <span className="text-[11px] text-amber-600 dark:text-amber-400">{ex.weight}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
