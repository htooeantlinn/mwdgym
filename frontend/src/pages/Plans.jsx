import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  const [formData, setFormData] = useState({
    planName: '',
    category: 'BASIC',
    durationDays: 30,
    price: '',
    description: '',
    active: true,
    showOnHome: true,
    featuresText: 'Access to gym equipment\nLocker room & shower access\nFitness assessment',
  });

  const [message, setMessage] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const featureList = formData.featuresText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        planName: formData.planName,
        category: formData.category,
        durationDays: parseInt(formData.durationDays) || 30,
        price: formData.price,
        description: formData.description,
        active: formData.active,
        showOnHome: formData.showOnHome,
        features: featureList,
      };

      if (editPlan) {
        await api.put(`/plans/${editPlan.id}`, payload);
        setMessage({ type: 'success', text: 'Plan updated' });
      } else {
        await api.post('/plans', payload);
        setMessage({ type: 'success', text: 'Membership plan created' });
      }
      setModalOpen(false);
      setEditPlan(null);
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save plan' });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.post(`/plans/${id}/toggle`);
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle status' });
    }
  };

  const handleDeletePlan = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"?`)) return;
    try {
      await api.delete(`/plans/${id}`);
      setMessage({ type: 'success', text: 'Plan deleted' });
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete plan' });
    }
  };

  const openEditModal = (p) => {
    setEditPlan(p);
    const featuresStr = (p.features || []).map(f => (typeof f === 'string' ? f : f.text)).join('\n');
    setFormData({
      planName: p.planName || '',
      category: p.category || 'BASIC',
      durationDays: p.durationDays || 30,
      price: p.price || '',
      description: p.description || '',
      active: p.active ?? true,
      showOnHome: p.showOnHome ?? true,
      featuresText: featuresStr || 'Access to gym equipment\nLocker room access',
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </span>
            Membership Plans & Pricing Tiers
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Configure subscription packages, duration days, pricing in MMK, and landing page showcase.
          </p>
        </div>

        <button
          onClick={() => {
            setEditPlan(null);
            setFormData({
              planName: '',
              category: 'BASIC',
              durationDays: 30,
              price: '',
              description: '',
              active: true,
              showOnHome: true,
              featuresText: 'Access to gym equipment\nLocker room & shower access\nFitness assessment',
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Plan
        </button>
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

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-6 surface flex flex-col justify-between transition ${
                p.category === 'PREMIUM'
                  ? 'border-red-500/40 ring-1 ring-red-500/20'
                  : 'border-slate-200 dark:border-zinc-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {p.showOnHome && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                        Featured on Home
                      </span>
                    )}
                    <span
                      onClick={() => handleToggleActive(p.id)}
                      className={`cursor-pointer text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.active
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {p.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{p.planName}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">{p.description || 'Full gym facility access'}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {p.price ? Number(p.price).toLocaleString() : '0'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">MMK / {p.durationDays} Days</span>
                </div>

                <div className="space-y-2 mb-6">
                  {p.features?.map((f, fidx) => (
                    <div key={fidx} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{typeof f === 'string' ? f : f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                  title="Edit Plan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(p.id, p.planName)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {editPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  placeholder="e.g. VIP Monthly 30"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Price (MMK)
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="300000"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full gym access & training assessment"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Included Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  Show on Homepage
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  Active Plan
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
