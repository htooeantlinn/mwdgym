import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  Check,
  MoveUp,
  MoveDown,
  Layers,
  X,
  AlertCircle
} from 'lucide-react';

export const WorkoutPlanEdit = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [days, setDays] = useState([
    { name: 'Day 1 - Push (Chest & Shoulders)', exercises: [] },
    { name: 'Day 2 - Pull (Back & Biceps)', exercises: [] },
    { name: 'Day 3 - Legs & Core', exercises: [] },
  ]);

  // Exercise library state for picker
  const [exerciseLib, setExerciseLib] = useState([]);
  const [pickerDayIndex, setPickerDayIndex] = useState(null);
  const [libSearch, setLibSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Convert legacy JSON (warmUp/days/sections/rows with col1-col4) to new days/exercises format
  const normalizePlanContent = (contentJson) => {
    if (!contentJson) return null;
    try {
      const parsed = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson;
      const isOldFormat = parsed.warmUp || (parsed.days && parsed.days[0] && (parsed.days[0].day || parsed.days[0].sections));
      if (!isOldFormat) {
        if (parsed.days && Array.isArray(parsed.days) && parsed.days[0] && parsed.days[0].exercises !== undefined) {
          return parsed.days;
        }
        return parsed.days || null;
      }
      const newDays = [];
      if (parsed.warmUp && Array.isArray(parsed.warmUp)) {
        for (const w of parsed.warmUp) {
          const label = w.label || 'Warm Up';
          const rows = w.rows || [];
          const exercises = rows.filter(r => r.name && r.name.trim()).map(r => ({
            id: Date.now() + Math.random(),
            name: r.name,
            muscleGroup: 'Warm Up',
            sets: r.col1 || '',
            reps: r.col2 || '',
            weight: r.col3 || '',
            notes: r.col4 || '',
          }));
          if (exercises.length > 0) newDays.push({ name: label, exercises });
        }
      }
      if (parsed.days && Array.isArray(parsed.days)) {
        for (const d of parsed.days) {
          const dayName = d.day || d.name || '';
          if (!dayName) continue;
          const sections = d.sections || [];
          for (const sec of sections) {
            const secLabel = sec.label || '';
            const rows = sec.rows || [];
            const exercises = rows.filter(r => r.name && r.name.trim()).map(r => ({
              id: Date.now() + Math.random(),
              name: r.name,
              muscleGroup: secLabel || dayName,
              sets: r.col1 || '',
              reps: r.col2 || '',
              weight: r.col3 || '',
              notes: r.col4 || '',
            }));
            if (exercises.length === 0) continue;
            const dayDisplayName = secLabel ? `${dayName} - ${secLabel}` : dayName;
            newDays.push({ name: dayDisplayName, exercises });
          }
        }
      }
      return newDays.length > 0 ? newDays : null;
    } catch (e) {
      console.error('Failed to parse contentJson', e);
      return null;
    }
  };

  useEffect(() => {
    const fetchLib = async () => {
      try {
        const res = await api.get('/exercises');
        setExerciseLib(res.data || []);
      } catch (err) {
        console.error('Failed to load exercises', err);
      }
    };
    fetchLib();

    if (!isNew) {
      setLoading(true);
      api.get(`/workout-plans/${id}`)
        .then(res => {
          const plan = res.data;
          setName(plan.name || '');
          setNotes(plan.notes || '');
          setActive(plan.active ?? true);
          const normalized = normalizePlanContent(plan.contentJson);
          if (normalized && normalized.length > 0) {
            setDays(normalized);
          }
        })
        .catch(err => {
          setError('Failed to load workout plan');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleAddDay = () => {
    setDays([...days, { name: `Day ${days.length + 1} - Routine`, exercises: [] }]);
  };

  const handleRemoveDay = (didx) => {
    setDays(days.filter((_, i) => i !== didx));
  };

  const handleDayNameChange = (didx, val) => {
    const updated = [...days];
    updated[didx].name = val;
    setDays(updated);
  };

  const handleAddExerciseToDay = (ex) => {
    if (pickerDayIndex === null) return;
    const updated = [...days];
    updated[pickerDayIndex].exercises.push({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.defaultSets || '3',
      reps: ex.defaultReps || '10-12',
      weight: ex.defaultWeight || '',
      notes: ex.defaultNote || '',
    });
    setDays(updated);
    setPickerDayIndex(null);
  };

  const handleExerciseChange = (didx, eidx, field, val) => {
    const updated = [...days];
    updated[didx].exercises[eidx][field] = val;
    setDays(updated);
  };

  const handleRemoveExercise = (didx, eidx) => {
    const updated = [...days];
    updated[didx].exercises = updated[didx].exercises.filter((_, i) => i !== eidx);
    setDays(updated);
  };

  const handleMoveExercise = (didx, eidx, dir) => {
    const updated = [...days];
    const targetIdx = eidx + dir;
    if (targetIdx < 0 || targetIdx >= updated[didx].exercises.length) return;
    const temp = updated[didx].exercises[eidx];
    updated[didx].exercises[eidx] = updated[didx].exercises[targetIdx];
    updated[didx].exercises[targetIdx] = temp;
    setDays(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a workout plan name');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name,
      notes,
      active,
      contentJson: JSON.stringify({ days }),
    };

    try {
      if (isNew) {
        await api.post('/workout-plans', payload);
      } else {
        await api.put(`/workout-plans/${id}`, payload);
      }
      navigate('/workout-plans');
    } catch (err) {
      setError(err.message || 'Failed to save workout plan');
      setSaving(false);
    }
  };

  const filteredLib = exerciseLib.filter(ex =>
    ex.name?.toLowerCase().includes(libSearch.toLowerCase()) ||
    ex.muscleGroup?.toLowerCase().includes(libSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/workout-plans"
            className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isNew ? 'Create Training Routine' : 'Edit Workout Plan'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Customize daily exercise splits, target reps, sets, and training tempo.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Workout Routine
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !isNew && (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading workout plan…</span>
        </div>
      )}

      {/* Plan Details Card */}
      <div className="p-6 surface space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Plan Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 4-Day Hypertrophy Upper/Lower Split"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Status
            </label>
            <select
              value={active ? 'true' : 'false'}
              onChange={(e) => setActive(e.target.value === 'true')}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="true">Active Routine</option>
              <option value="false">Archived / Draft</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
            Routine Overview Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Focus on Progressive Overload, 2 mins rest between compound lifts..."
            className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Days Split Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-600" />
            Training Split Days ({days.length})
          </h2>
          <button
            type="button"
            onClick={handleAddDay}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Training Day
          </button>
        </div>

        {(loading && !isNew ? [] : days).map((day, didx) => {
          const exList = day.exercises || [];
          return (
          <div
            key={didx}
            className="p-6 surface space-y-4"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <input
                type="text"
                value={day.name || ''}
                onChange={(e) => handleDayNameChange(didx, e.target.value)}
                className="font-bold text-base text-red-500 bg-transparent border-b border-dashed border-red-500/40 focus:border-red-500 focus:outline-none pb-0.5 max-w-md w-full"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerDayIndex(didx)}
                  className="px-3 py-1.5 rounded-xl bg-red-600/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 font-bold text-xs hover:bg-red-500 hover:text-white transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Exercise
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveDay(didx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                  title="Remove Day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exercises List for Day */}
            {exList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                No exercises added to this day yet. Click "+ Add Exercise" above.
              </div>
            ) : (
              <div className="space-y-3">
                {exList.map((ex, eidx) => (
                  <div
                    key={eidx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {eidx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">{ex.name}</span>
                        <span className="text-[10px] text-slate-400">{ex.muscleGroup}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sets</span>
                        <input
                          type="text"
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(didx, eidx, 'sets', e.target.value)}
                          placeholder="3"
                          className="w-16 px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Reps</span>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(didx, eidx, 'reps', e.target.value)}
                          placeholder="10-12"
                          className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Weight</span>
                        <input
                          type="text"
                          value={ex.weight}
                          onChange={(e) => handleExerciseChange(didx, eidx, 'weight', e.target.value)}
                          placeholder="kg/lbs"
                          className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(didx, eidx, -1)}
                        disabled={eidx === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(didx, eidx, 1)}
                        disabled={eidx === exList.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(didx, eidx)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Exercise Picker Modal Drawer */}
      {pickerDayIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Add Exercise to {days[pickerDayIndex]?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Select movement from exercise database</p>
              </div>
              <button onClick={() => setPickerDayIndex(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                placeholder="Search by movement or muscle..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredLib.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToDay(ex)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500/30 border border-transparent cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{ex.name}</span>
                    <span className="text-[10px] text-slate-400">{ex.muscleGroup} • {ex.defaultSets} sets • {ex.defaultReps} reps</span>
                  </div>
                  <Plus className="w-4 h-4 text-red-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
