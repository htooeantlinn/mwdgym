import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Plus, Edit2, Trash2, Download, Apple } from 'lucide-react';

export const DietPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/diet-plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load diet plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.post(`/diet-plans/${id}/toggle`);
      fetchPlans();
    } catch (err) {
      console.error('Failed to toggle diet plan', err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete diet plan "${name}"?`)) return;
    try {
      await api.delete(`/diet-plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error('Failed to delete diet plan', err);
    }
  };

  const mealCount = (plan) => {
    try {
      const c = typeof plan.contentJson === 'string' ? JSON.parse(plan.contentJson) : plan.contentJson;
      return c?.meals?.length || 0;
    } catch {
      return 0;
    }
  };

  const foodCount = (plan) => {
    try {
      const c = typeof plan.contentJson === 'string' ? JSON.parse(plan.contentJson) : plan.contentJson;
      return (c?.meals || []).reduce((s, m) => s + (m.items?.length || 0), 0);
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Diet Plans</h1>
          <p className="text-sm text-slate-500">Create meal plans with macros, export to PDF</p>
        </div>
        <Link
          to="/diet-plans/new"
          className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> New Plan
        </Link>
      </div>

      {plans.length === 0 && (
        <div className="surface p-8 text-center text-sm text-slate-500">No diet plans found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="surface p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{plan.name}</div>
                  <div className="text-xs text-slate-500">
                    {mealCount(plan)} meals · {foodCount(plan)} foods
                  </div>
                </div>
              </div>
              <span
                className={`text-[0.6875rem] font-bold px-2 py-0.5 rounded-full ${
                  plan.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                }`}
              >
                {plan.active ? 'Active' : 'Archived'}
              </span>
            </div>
            {plan.notes && <p className="text-xs text-slate-500 line-clamp-2">{plan.notes}</p>}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => navigate(`/diet-plans/${plan.id}`)}
                className="h-8 px-3 inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <a
                href={`/api/diet-plans/${plan.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </a>
              <button
                onClick={() => handleToggle(plan.id)}
                className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                {plan.active ? 'Archive' : 'Restore'}
              </button>
              <button
                onClick={() => handleDelete(plan.id, plan.name)}
                className="h-8 px-3 inline-flex items-center gap-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
