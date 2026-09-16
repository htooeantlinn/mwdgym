import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Dumbbell,
  Layers,
  X,
  UserCheck,
  Shield
} from 'lucide-react';

export const Exercises = () => {
  const { user } = useAuth();
  const [groupedExercises, setGroupedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL'); // 'ALL' | 'MINE' | 'SYSTEM'
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editExercise, setEditExercise] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'Chest',
    defaultSets: '3',
    defaultReps: '10-12',
    defaultWeight: '20 kg',
    defaultNote: '',
    sortOrder: 0,
    active: true,
  });

  const [message, setMessage] = useState(null);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exercises/grouped');
      setGroupedExercises(res.data || {});
    } catch (err) {
      console.error('Failed to load exercises', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleSaveExercise = async (e) => {
    e.preventDefault();
    try {
      if (editExercise) {
        await api.put(`/exercises/${editExercise.id}`, formData);
        setMessage({ type: 'success', text: 'Exercise updated' });
      } else {
        await api.post('/exercises', formData);
        setMessage({ type: 'success', text: 'Exercise added to your library' });
      }
      setModalOpen(false);
      setEditExercise(null);
      fetchExercises();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to save exercise' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete exercise "${name}"?`)) return;
    try {
      await api.delete(`/exercises/${id}`);
      setMessage({ type: 'success', text: 'Exercise deleted' });
      fetchExercises();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to delete exercise' });
    }
  };

  const openEditModal = (ex) => {
    setEditExercise(ex);
    setFormData({
      name: ex.name || '',
      muscleGroup: ex.muscleGroup || 'Chest',
      defaultSets: ex.defaultSets || '3',
      defaultReps: ex.defaultReps || '10-12',
      defaultWeight: ex.defaultWeight || '',
      defaultNote: ex.defaultNote || '',
      sortOrder: ex.sortOrder || 0,
      active: ex.active ?? true,
    });
    setModalOpen(true);
  };

  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </span>
            Exercise Library
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Standard movements, recommended sets, reps, and muscle groupings for workout planning.
          </p>
        </div>

        <button
          onClick={() => {
            setEditExercise(null);
            setFormData({
              name: '',
              muscleGroup: 'Chest',
              defaultSets: '3',
              defaultReps: '10-12',
              defaultWeight: '',
              defaultNote: '',
              sortOrder: 0,
              active: true,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Exercise
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
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises by movement name or cues..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Scope Tabs (All / My Movements / System Library) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900/80 rounded-xl shrink-0">
            {[
              { key: 'ALL', label: 'All Movements' },
              { key: 'MINE', label: 'My Movements', icon: UserCheck },
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

        {/* Muscle Group Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {['ALL', ...muscleGroups].map((mg) => (
            <button
              key={mg}
              onClick={() => setSelectedMuscle(mg)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedMuscle === mg
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {mg === 'ALL' ? 'All Groups' : mg}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Exercise Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : Object.keys(groupedExercises).length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#121215] rounded-3xl border border-slate-200 dark:border-zinc-800">
          No exercises found. Click "Add Exercise" to create your first movement.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExercises)
            .filter(([muscle]) => selectedMuscle === 'ALL' || muscle.toLowerCase() === selectedMuscle.toLowerCase())
            .map(([muscle, items]) => {
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
                <div key={muscle} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      {muscle}
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                      {filtered.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((ex) => {
                      const canManage = user?.role === 'ADMIN' || ex.isMine;

                      return (
                        <div
                          key={ex.id}
                          className="p-5 surface flex flex-col justify-between hover:border-red-500/40 transition group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-red-500 transition truncate">
                                  {ex.name}
                                </h3>
                                <div>
                                  {ex.isMine ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      <UserCheck className="w-2.5 h-2.5" /> My Movement
                                    </span>
                                  ) : ex.isSystem ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                      <Shield className="w-2.5 h-2.5" /> System Library
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                      By {ex.createdByName || 'Coach'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {canManage && (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                                  <button
                                    onClick={() => openEditModal(ex)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                                    title="Edit Movement"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(ex.id, ex.name)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                    title="Delete Movement"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60">
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Default Sets</span>
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{ex.defaultSets || '3'} Sets</span>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Reps / Duration</span>
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{ex.defaultReps || '10-12'}</span>
                              </div>
                            </div>

                            {ex.defaultWeight && (
                              <div className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Load:</span>
                                <span className="font-semibold text-slate-700 dark:text-zinc-300">{ex.defaultWeight}</span>
                              </div>
                            )}

                            {ex.defaultNote && (
                              <p className="text-xs text-slate-400 mt-3 italic line-clamp-2">
                                "{ex.defaultNote}"
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

      {/* Add / Edit Exercise Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {editExercise ? 'Edit Exercise' : 'Add New Exercise'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Incline Dumbbell Press"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Muscle Group
                </label>
                <select
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  {muscleGroups.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Default Sets
                  </label>
                  <input
                    type="text"
                    value={formData.defaultSets}
                    onChange={(e) => setFormData({ ...formData, defaultSets: e.target.value })}
                    placeholder="3"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Default Reps
                  </label>
                  <input
                    type="text"
                    value={formData.defaultReps}
                    onChange={(e) => setFormData({ ...formData, defaultReps: e.target.value })}
                    placeholder="10-12"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Coaching Notes / Form Tips
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultNote}
                  onChange={(e) => setFormData({ ...formData, defaultNote: e.target.value })}
                  placeholder="Keep elbows at 45 degrees, pause at bottom..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
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
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
