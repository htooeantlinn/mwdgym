import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Apple,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  UserCheck,
  Shield
} from 'lucide-react';

export const Foods = () => {
  const { user } = useAuth();
  const [groupedFoods, setGroupedFoods] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL'); // 'ALL' | 'MINE' | 'SYSTEM'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editFood, setEditFood] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Protein',
    defaultQuantity: '100g',
    defaultCalories: '',
    defaultProtein: '',
    defaultCarbs: '',
    defaultFat: '',
    defaultNote: '',
    sortOrder: 0,
    active: true,
    system: false,
  });

  const [message, setMessage] = useState(null);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/foods/grouped');
      setGroupedFoods(res.data || {});
    } catch (err) {
      console.error('Failed to load foods', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      if (editFood) {
        await api.put(`/foods/${editFood.id}`, formData);
        setMessage({ type: 'success', text: 'Food updated' });
      } else {
        await api.post('/foods', formData);
        setMessage({ type: 'success', text: 'Food added to your library' });
      }
      setModalOpen(false);
      setEditFood(null);
      fetchFoods();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to save food' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete food "${name}"?`)) return;
    try {
      await api.delete(`/foods/${id}`);
      setMessage({ type: 'success', text: 'Food deleted' });
      fetchFoods();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to delete food' });
    }
  };

  const openEditModal = (f) => {
    setEditFood(f);
    setFormData({
      name: f.name || '',
      category: f.category || 'Protein',
      defaultQuantity: f.defaultQuantity || '100g',
      defaultCalories: f.defaultCalories || '',
      defaultProtein: f.defaultProtein || '',
      defaultCarbs: f.defaultCarbs || '',
      defaultFat: f.defaultFat || '',
      defaultNote: f.defaultNote || '',
      sortOrder: f.sortOrder || 0,
      active: f.active ?? true,
      system: !!f.isSystem,
    });
    setModalOpen(true);
  };

  const categories = ['Protein', 'Carbs', 'Vegetables', 'Fruits', 'Dairy', 'Fats', 'Snacks', 'Supplements'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0">
              <Apple className="w-4 h-4 text-white" />
            </span>
            Food Library
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Standard foods with default portions and macros for quick diet planning.
          </p>
        </div>

        <button
          onClick={() => {
            setEditFood(null);
            setFormData({
              name: '',
              category: 'Protein',
              defaultQuantity: '100g',
              defaultCalories: '',
              defaultProtein: '',
              defaultCarbs: '',
              defaultFat: '',
              defaultNote: '',
              sortOrder: 0,
              active: true,
              system: false,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Food
        </button>
      </div>

      {/* Toast Alert */}
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

      {/* Search & Scope Filters */}
      <div className="p-4 surface space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods by name..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900/80 rounded-xl shrink-0">
            {[
              { key: 'ALL', label: 'All Foods' },
              { key: 'MINE', label: 'My Foods', icon: UserCheck },
              { key: 'SYSTEM', label: 'System Library', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setScopeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  scopeFilter === tab.key
                    ? 'bg-white dark:bg-[#121215] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                {tab.icon && <tab.icon className="w-3 h-3" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {['ALL', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {c === 'ALL' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Food Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : Object.keys(groupedFoods).length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#121215] rounded-3xl border border-slate-200 dark:border-zinc-800">
          No foods found. Click "Add Food" to create your first item.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFoods)
            .filter(([cat]) => selectedCategory === 'ALL' || cat.toLowerCase() === selectedCategory.toLowerCase())
            .map(([cat, items]) => {
              const filtered = items.filter((i) => {
                const matchesSearch =
                  i.name.toLowerCase().includes(search.toLowerCase()) ||
                  (i.defaultNote && i.defaultNote.toLowerCase().includes(search.toLowerCase()));
                const matchesScope =
                  scopeFilter === 'ALL'
                    ? true
                    : scopeFilter === 'MINE'
                    ? i.isMine
                    : i.isSystem;
                return matchesSearch && matchesScope;
              });

              if (filtered.length === 0) return null;

              return (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      {cat}
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                      {filtered.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((f) => {
                      const canManage = user?.role === 'ADMIN' || f.isMine;

                      return (
                        <div
                          key={f.id}
                          className="p-5 surface flex flex-col justify-between hover:border-emerald-500/40 transition group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-500 transition truncate">
                                  {f.name}
                                </h3>
                                <div>
                                  {f.isMine ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      <UserCheck className="w-2.5 h-2.5" /> My Food
                                    </span>
                                  ) : f.isSystem ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                      <Shield className="w-2.5 h-2.5" /> System Library
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                      By {f.createdByName || 'Coach'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {canManage && (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                                  <button
                                    onClick={() => openEditModal(f)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                                    title="Edit Food"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(f.id, f.name)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                    title="Delete Food"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60">
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Portion</span>
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{f.defaultQuantity || '—'}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Calories</span>
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{f.defaultCalories || '—'}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Protein</span>
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{f.defaultProtein || '—'}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Carbs / Fat</span>
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                  {(f.defaultCarbs || '—') + ' / ' + (f.defaultFat || '—')}
                                </span>
                              </div>
                            </div>

                            {f.defaultNote && (
                              <p className="text-xs text-slate-400 mt-3 italic line-clamp-2">
                                "{f.defaultNote}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {editFood ? 'Edit Food' : 'Add New Food'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Grilled Chicken Breast"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Portion
                  </label>
                  <input
                    type="text"
                    value={formData.defaultQuantity}
                    onChange={(e) => setFormData({ ...formData, defaultQuantity: e.target.value })}
                    placeholder="100g"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Calories
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCalories}
                    onChange={(e) => setFormData({ ...formData, defaultCalories: e.target.value })}
                    placeholder="150"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Protein
                  </label>
                  <input
                    type="text"
                    value={formData.defaultProtein}
                    onChange={(e) => setFormData({ ...formData, defaultProtein: e.target.value })}
                    placeholder="25g"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Carbs
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCarbs}
                    onChange={(e) => setFormData({ ...formData, defaultCarbs: e.target.value })}
                    placeholder="0g"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Fat
                  </label>
                  <input
                    type="text"
                    value={formData.defaultFat}
                    onChange={(e) => setFormData({ ...formData, defaultFat: e.target.value })}
                    placeholder="5g"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Note
                  </label>
                  <input
                    type="text"
                    value={formData.defaultNote}
                    onChange={(e) => setFormData({ ...formData, defaultNote: e.target.value })}
                    placeholder="e.g. skinless"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {user?.role === 'ADMIN' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.system}
                    onChange={(e) => setFormData({ ...formData, system: e.target.checked })}
                  />
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Save as System Library (visible to everyone)
                </label>
              )}

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
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
