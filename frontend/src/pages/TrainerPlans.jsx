import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Archive,
  Save,
  Star,
  ShoppingCart,
  Users,
  X,
  AlertTriangle,
  FileText,
  ChevronDown,
  Loader2,
  Layers,
  PlusCircle,
  MinusCircle,
  MoveUp,
  MoveDown,
  Coins,
  BarChart3,
  Image,
  Video,
  Eye,
  Download,
  Printer,
  Search,
  BookOpen,
  UserCheck,
  Shield,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'FLEXIBILITY', label: 'Flexibility' },
  { value: 'NUTRITION', label: 'Nutrition' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'MIXED', label: 'Mixed' },
];

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const PLAN_TYPES = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'PROGRESSIVE', label: 'Progressive' },
  { value: 'PERIODIZED', label: 'Periodized' },
];

const STATUS_STYLES = {
  DRAFT: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  PUBLISHED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  ARCHIVED: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const DAY_COLORS = [
  'from-red-600 to-rose-500',
  'from-blue-600 to-indigo-500',
  'from-emerald-600 to-teal-500',
  'from-amber-600 to-orange-500',
  'from-purple-600 to-violet-500',
  'from-cyan-600 to-sky-500',
  'from-pink-600 to-fuchsia-500',
  'from-lime-600 to-green-500',
];

const emptyDay = (index) => ({
  name: `Day ${index} - Push (Chest & Shoulders)`,
  exercises: [],
});

const emptyExercise = () => ({
  name: '',
  sets: '3',
  reps: '10',
  weight: '',
  notes: '',
});

const emptyForm = {
  title: '',
  description: '',
  category: 'STRENGTH',
  difficultyLevel: 'BEGINNER',
  durationWeeks: 4,
  targetAudience: '',
  priceMmk: 0,
  planType: 'WEEKLY',
  days: [],
  includeMacroPlanning: false,
  includeSupplementGuide: false,
  coverFile: null,
  videoFile: null,
};

export const TrainerPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [videoMaxMb, setVideoMaxMb] = useState(50);
  const [previewPlan, setPreviewPlan] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(null);

  // Exercise library state for picker
  const [exerciseLib, setExerciseLib] = useState([]);
  const [pickerDayIndex, setPickerDayIndex] = useState(null);
  const [libSearch, setLibSearch] = useState('');
  const [libMuscle, setLibMuscle] = useState('ALL');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickEx, setQuickEx] = useState({
    name: '',
    muscleGroup: 'Chest',
    defaultSets: '3',
    defaultReps: '10-12',
    defaultWeight: '',
    defaultNote: '',
  });
  const [quickSaving, setQuickSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/my-plans');
      setPlans(res.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load your plans' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExerciseLib = useCallback(async () => {
    try {
      const res = await api.get('/exercises?mine=true');
      setExerciseLib(res.data || []);
    } catch {
      console.error('Failed to load exercise library');
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);
  useEffect(() => { fetchExerciseLib(); }, [fetchExerciseLib]);

  useEffect(() => {
    api.get('/settings')
      .then((res) => setVideoMaxMb(Number(res.data?.marketplace_video_max_mb) || 50))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleDownloadPdf = async (plan) => {
    setPdfLoading(plan.id);
    try {
      const res = await api.get(`/marketplace/plans/${plan.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(plan.title || 'Workout_Plan').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: `Downloaded "${plan.title}" PDF` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to download plan PDF' });
    } finally {
      setPdfLoading(null);
    }
  };

  const handleAddFromLibToDay = (ex) => {
    if (pickerDayIndex === null) return;
    setFormData((prev) => {
      const updated = [...prev.days];
      updated[pickerDayIndex] = {
        ...updated[pickerDayIndex],
        exercises: [
          ...updated[pickerDayIndex].exercises,
          {
            name: ex.name || '',
            sets: String(ex.defaultSets || '3'),
            reps: String(ex.defaultReps || '10'),
            weight: ex.defaultWeight || '',
            notes: ex.defaultNote || '',
          },
        ],
      };
      return { ...prev, days: updated };
    });
    setPickerDayIndex(null);
    setMessage({ type: 'success', text: `Added "${ex.name}" to training split` });
  };

  const openExercisePicker = (dayIndex) => {
    setLibSearch('');
    setLibMuscle('ALL');
    setPickerDayIndex(dayIndex);
  };

  const handleQuickCreateExercise = async (e) => {
    e.preventDefault();
    if (!quickEx.name.trim()) return;
    setQuickSaving(true);
    try {
      const res = await api.post('/exercises', quickEx);
      const created = res.data;
      setExerciseLib((prev) => [created, ...prev]);
      if (pickerDayIndex !== null) {
        handleAddFromLibToDay(created);
      }
      setQuickEx({
        name: '',
        muscleGroup: 'Chest',
        defaultSets: '3',
        defaultReps: '10-12',
        defaultWeight: '',
        defaultNote: '',
      });
      setShowQuickCreate(false);
      setMessage({ type: 'success', text: `Created and added "${created.name}"` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create exercise' });
    } finally {
      setQuickSaving(false);
    }
  };

  const filtered = activeTab === 'ALL' ? plans : plans.filter((p) => p.status === activeTab);
  const filteredLibrary = exerciseLib.filter((ex) => {
    const query = libSearch.trim().toLowerCase();
    const matchesSearch = !query
      || ex.name?.toLowerCase().includes(query)
      || ex.defaultNote?.toLowerCase().includes(query);
    const matchesMuscle = libMuscle === 'ALL'
      || ex.muscleGroup?.toLowerCase() === libMuscle.toLowerCase();
    return matchesSearch && matchesMuscle;
  });
  const libraryMuscles = [...new Set(exerciseLib.map((ex) => ex.muscleGroup).filter(Boolean))];

  const stats = {
    total: plans.length,
    published: plans.filter((p) => p.status === 'PUBLISHED').length,
    totalPurchases: plans.reduce((s, p) => s + (p.totalPurchases || 0), 0),
    avgRating: plans.length > 0
      ? (plans.reduce((s, p) => s + (p.rating || 0), 0) / plans.length).toFixed(1)
      : '0.0',
  };

  const parseDaysFromPlan = (plan) => {
    if (!plan.exercisesJson) {
      return [{ name: 'Day 1 - Push (Chest & Shoulders)', exercises: [] }];
    }
    try {
      const parsed = typeof plan.exercisesJson === 'string'
        ? JSON.parse(plan.exercisesJson)
        : plan.exercisesJson;
      if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return parsed.days.map((d) => ({
          name: d.name || 'Untitled Day',
          exercises: Array.isArray(d.exercises)
            ? d.exercises.map((ex) => ({
                name: ex.name || '',
                sets: String(ex.sets || '3'),
                reps: String(ex.reps || '10'),
                weight: ex.weight || '',
                notes: ex.notes || '',
              }))
            : [],
        }));
      }
      if (Array.isArray(parsed)) {
        return [{ name: 'Day 1', exercises: parsed }];
      }
    } catch {
      /* ignore */
    }
    return [{ name: 'Day 1 - Push (Chest & Shoulders)', exercises: [] }];
  };

  const openCreate = () => {
    setEditingPlan(null);
    setFormData({ ...emptyForm, days: [emptyDay(1)] });
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title || '',
      description: plan.description || '',
      category: plan.category || 'STRENGTH',
      difficultyLevel: plan.difficultyLevel || 'BEGINNER',
      durationWeeks: plan.durationWeeks || 4,
      targetAudience: plan.targetAudience || '',
      priceMmk: plan.priceMmk || 0,
      planType: plan.planType || 'WEEKLY',
      days: parseDaysFromPlan(plan),
      includeMacroPlanning: plan.includeMacroPlanning || false,
      includeSupplementGuide: plan.includeSupplementGuide || false,
      coverFile: null,
      videoFile: null,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDay = () => {
    setFormData((prev) => ({
      ...prev,
      days: [...prev.days, emptyDay(prev.days.length + 1)],
    }));
  };

  const handleRemoveDay = (dayIndex) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== dayIndex),
    }));
  };

  const handleDayNameChange = (dayIndex, value) => {
    setFormData((prev) => {
      const updated = [...prev.days];
      updated[dayIndex] = { ...updated[dayIndex], name: value };
      return { ...prev, days: updated };
    });
  };

  const handleAddExercise = (dayIndex) => {
    setFormData((prev) => {
      const updated = [...prev.days];
      updated[dayIndex] = {
        ...updated[dayIndex],
        exercises: [...updated[dayIndex].exercises, emptyExercise()],
      };
      return { ...prev, days: updated };
    });
  };

  const handleExerciseChange = (dayIndex, exIndex, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.days];
      const exs = [...updated[dayIndex].exercises];
      exs[exIndex] = { ...exs[exIndex], [field]: value };
      updated[dayIndex] = { ...updated[dayIndex], exercises: exs };
      return { ...prev, days: updated };
    });
  };

  const handleRemoveExercise = (dayIndex, exIndex) => {
    setFormData((prev) => {
      const updated = [...prev.days];
      updated[dayIndex] = {
        ...updated[dayIndex],
        exercises: updated[dayIndex].exercises.filter((_, i) => i !== exIndex),
      };
      return { ...prev, days: updated };
    });
  };

  const handleMoveExercise = (dayIndex, exIndex, dir) => {
    setFormData((prev) => {
      const updated = [...prev.days];
      const exs = [...updated[dayIndex].exercises];
      const target = exIndex + dir;
      if (target < 0 || target >= exs.length) return prev;
      const temp = exs[exIndex];
      exs[exIndex] = exs[target];
      exs[target] = temp;
      updated[dayIndex] = { ...updated[dayIndex], exercises: exs };
      return { ...prev, days: updated };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (formData.videoFile && formData.videoFile.size > videoMaxMb * 1024 * 1024) {
      setMessage({ type: 'error', text: `Preview video must be ${videoMaxMb} MB or smaller` });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficultyLevel: formData.difficultyLevel,
        durationWeeks: Number(formData.durationWeeks),
        targetAudience: formData.targetAudience,
        priceMmk: Number(formData.priceMmk),
        planType: formData.planType,
        includeMacroPlanning: formData.includeMacroPlanning,
        includeSupplementGuide: formData.includeSupplementGuide,
        exercisesJson: JSON.stringify({ days: formData.days }),
      };

      const savedResponse = editingPlan
        ? await api.put(`/marketplace/plans/${editingPlan.id}`, payload)
        : await api.post('/marketplace/plans', payload);
      const savedPlan = savedResponse.data;

      const uploadMedia = async (file, type) => {
        if (!file) return;
        const media = new FormData();
        media.append('type', type);
        media.append('file', file);
        await api.post(`/marketplace/plans/${savedPlan.id}/media`, media, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      };
      await uploadMedia(formData.coverFile, 'cover');
      await uploadMedia(formData.videoFile, 'video');

      if (editingPlan) {
        setMessage({ type: 'success', text: 'Plan updated successfully' });
      } else {
        setMessage({ type: 'success', text: 'Plan created as draft' });
      }
      closeForm();
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save plan' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (plan) => {
    setActionLoading(plan.id);
    try {
      await api.post(`/marketplace/plans/${plan.id}/publish`);
      setMessage({ type: 'success', text: `"${plan.title}" published successfully` });
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to publish plan' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = (plan) => {
    setConfirmDialog({
      type: 'archive',
      plan,
      title: 'Archive Plan',
      message: `Archive "${plan.title}"? It will no longer be visible to members.`,
    });
  };

  const handleDelete = (plan) => {
    setConfirmDialog({
      type: 'delete',
      plan,
      title: 'Delete Plan',
      message: `Permanently delete "${plan.title}"? This cannot be undone.`,
    });
  };

  const executeConfirm = async () => {
    if (!confirmDialog) return;
    const { type, plan } = confirmDialog;
    setActionLoading(plan.id);
    try {
      if (type === 'archive') {
        await api.post(`/marketplace/plans/${plan.id}/archive`);
        setMessage({ type: 'success', text: `"${plan.title}" archived` });
      } else if (type === 'delete') {
        await api.delete(`/marketplace/plans/${plan.id}`);
        setMessage({ type: 'success', text: `"${plan.title}" deleted` });
      }
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Action failed' });
    } finally {
      setActionLoading(null);
      setConfirmDialog(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75 ml-2 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0 shadow-md shadow-red-500/25">
            <Dumbbell className="w-4 h-4 text-white" />
          </span>
          <div>
            <h1 className="display-2 text-slate-900 dark:text-white">My Workout Plans</h1>
            <p className="body-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Create, manage, and publish your marketplace plans.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Plans', value: stats.total, icon: FileText, color: 'text-blue-500' },
          { label: 'Published', value: stats.published, icon: Globe, color: 'text-emerald-500' },
          { label: 'Total Purchases', value: stats.totalPurchases, icon: ShoppingCart, color: 'text-amber-500' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'text-orange-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 flex items-center gap-3"
          >
            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/60 w-fit">
        {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'bg-white dark:bg-[#121215] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            }`}
          >
            {tab}
            {tab !== 'ALL' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {plans.filter((p) => p.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-400">Loading plans...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#121215] rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Dumbbell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="font-bold text-slate-700 dark:text-zinc-300">
            {activeTab === 'ALL' ? 'No plans yet' : `No ${activeTab.toLowerCase()} plans`}
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            {activeTab === 'ALL'
              ? 'Create your first workout plan to sell on the marketplace.'
              : 'Try switching to a different tab.'}
          </p>
          {activeTab === 'ALL' && (
            <button
              onClick={openCreate}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Create Plan
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((plan) => (
            <div
              key={plan.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 hover:border-red-500/30 dark:hover:border-red-500/30 transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                      {plan.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLES[plan.status] || STATUS_STYLES.DRAFT}`}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mb-2">
                    {plan.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-zinc-500 flex-wrap">
                    <span className="font-bold text-red-500">
                      {Number(plan.priceMmk || 0).toLocaleString()} <span className="text-[10px] font-medium">Coins</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {plan.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" /> {plan.totalPurchases || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {plan.activeSubscribers || 0}
                    </span>
                    <span className="text-slate-300 dark:text-zinc-600">|</span>
                    <span>{plan.category}</span>
                    <span>{plan.difficultyLevel}</span>
                    <span>{plan.durationWeeks}w</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDownloadPdf(plan)}
                    disabled={pdfLoading === plan.id}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50"
                    title="Download PDF"
                  >
                    {pdfLoading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(plan)}
                    disabled={actionLoading === plan.id}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {(plan.status === 'DRAFT' || plan.status === 'ARCHIVED') && (
                    <button
                      onClick={() => handlePublish(plan)}
                      disabled={actionLoading === plan.id}
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                      title="Publish"
                    >
                      {actionLoading === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {plan.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleArchive(plan)}
                      disabled={actionLoading === plan.id}
                      className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  {plan.status === 'DRAFT' && (
                    <button
                      onClick={() => handleDelete(plan)}
                      disabled={actionLoading === plan.id}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create / Edit Form Modal ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
          <div className="w-full min-h-full sm:min-h-0 sm:my-6 sm:max-w-4xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 sm:rounded-3xl shadow-2xl">

            {/* Form Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-[#121215] border-b border-slate-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">

              {/* ── Plan Details Section ── */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Plan Details
                </h3>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleField('title', e.target.value)}
                    placeholder="e.g. 12-Week Strength Mastery"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                      Cover Image
                    </label>
                    <label className="flex items-center gap-2 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl text-slate-500 dark:text-zinc-400 cursor-pointer hover:border-red-500 transition">
                      <Image className="w-4 h-4 shrink-0" />
                      <span className="truncate">{formData.coverFile?.name || 'Choose JPG, PNG, or WebP'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleField('coverFile', e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Maximum 8 MB</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                      Preview Video
                    </label>
                    <label className="flex items-center gap-2 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl text-slate-500 dark:text-zinc-400 cursor-pointer hover:border-red-500 transition">
                      <Video className="w-4 h-4 shrink-0" />
                      <span className="truncate">{formData.videoFile?.name || 'Choose MP4, WebM, or MOV'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => handleField('videoFile', e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Maximum {videoMaxMb} MB</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleField('description', e.target.value)}
                    placeholder="Describe what this plan includes and who it's for..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
                  />
                </div>

                {/* Category + Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => handleField('category', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                      Difficulty
                    </label>
                    <div className="relative">
                      <select
                        value={formData.difficultyLevel}
                        onChange={(e) => handleField('difficultyLevel', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                      >
                        {DIFFICULTIES.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Duration + Price + Plan Type */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.durationWeeks}
                      onChange={(e) => handleField('durationWeeks', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                      Price (Coins)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.priceMmk}
                      onChange={(e) => handleField('priceMmk', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                      Plan Type
                    </label>
                    <div className="relative">
                      <select
                        value={formData.planType}
                        onChange={(e) => handleField('planType', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                      >
                        {PLAN_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => handleField('targetAudience', e.target.value)}
                    placeholder="e.g. Intermediate lifters, athletes, beginners"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.includeMacroPlanning}
                      onChange={(e) => handleField('includeMacroPlanning', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
                      Include Macro Planning
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.includeSupplementGuide}
                      onChange={(e) => handleField('includeSupplementGuide', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
                      Include Supplement Guide
                    </span>
                  </label>
                </div>
              </div>

              {/* ── Day-by-Day Exercise Editor ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    Training Split
                    <span className="text-slate-400 dark:text-zinc-600 font-normal normal-case">
                      ({formData.days.length} day{formData.days.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Day
                  </button>
                </div>

                {formData.days.length === 0 && (
                  <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                    <Layers className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                      No training days yet
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-600 mb-4">
                      Add days to build your workout split.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition"
                    >
                      Add First Day
                    </button>
                  </div>
                )}

                {formData.days.map((day, dayIdx) => {
                  const dayColor = DAY_COLORS[dayIdx % DAY_COLORS.length];
                  const exCount = day.exercises.length;

                  return (
                    <div
                      key={dayIdx}
                      className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#121215]"
                    >
                      {/* Day Header */}
                      <div className={`bg-gradient-to-r ${dayColor} px-4 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white font-black text-xs shrink-0">
                            {dayIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={day.name}
                            onChange={(e) => handleDayNameChange(dayIdx, e.target.value)}
                            className="flex-1 bg-transparent text-white font-bold text-sm placeholder:text-white/50 focus:outline-none border-b border-dashed border-white/30 focus:border-white pb-0.5 min-w-0"
                            placeholder="Day name..."
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                            {exCount} exercise{exCount !== 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(dayIdx)}
                            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
                            title="Remove Day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Exercise Table */}
                      <div className="p-4">
                        {exCount === 0 ? (
                          <div className="py-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mb-3">
                              No exercises added yet.
                            </p>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => openExercisePicker(dayIdx)}
                                className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition inline-flex items-center gap-1"
                              >
                                <BookOpen className="w-3.5 h-3.5" /> Use My Library
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddExercise(dayIdx)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-zinc-700 transition inline-flex items-center gap-1"
                              >
                                <PlusCircle className="w-3.5 h-3.5" /> Add Manually
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-slate-100 dark:border-zinc-800">
                                    <th className="py-2 px-2 text-left font-bold text-slate-400 dark:text-zinc-500 uppercase w-10">#</th>
                                    <th className="py-2 px-2 text-left font-bold text-slate-400 dark:text-zinc-500 uppercase">Exercise</th>
                                    <th className="py-2 px-2 text-left font-bold text-slate-400 dark:text-zinc-500 uppercase w-20">Sets</th>
                                    <th className="py-2 px-2 text-left font-bold text-slate-400 dark:text-zinc-500 uppercase w-24">Reps</th>
                                    <th className="py-2 px-2 text-left font-bold text-slate-400 dark:text-zinc-500 uppercase w-24">Weight</th>
                                    <th className="py-2 px-2 text-left font-bold text-slate-400 dark:text-zinc-500 uppercase">Notes</th>
                                    <th className="py-2 px-2 text-right font-bold text-slate-400 dark:text-zinc-500 uppercase w-24">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {day.exercises.map((ex, exIdx) => (
                                    <tr
                                      key={exIdx}
                                      className="border-b border-slate-50 dark:border-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition"
                                    >
                                      <td className="py-2 px-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold text-[10px] flex items-center justify-center">
                                          {exIdx + 1}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2">
                                        <input
                                          type="text"
                                          value={ex.name}
                                          onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'name', e.target.value)}
                                          placeholder="e.g. Bench Press"
                                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <input
                                          type="text"
                                          value={ex.sets}
                                          onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'sets', e.target.value)}
                                          placeholder="4"
                                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <input
                                          type="text"
                                          value={ex.reps}
                                          onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'reps', e.target.value)}
                                          placeholder="8-10"
                                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <input
                                          type="text"
                                          value={ex.weight}
                                          onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'weight', e.target.value)}
                                          placeholder="80kg"
                                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <input
                                          type="text"
                                          value={ex.notes}
                                          onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'notes', e.target.value)}
                                          placeholder="Focus on form"
                                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                                        />
                                      </td>
                                      <td className="py-2 px-2">
                                        <div className="flex items-center justify-end gap-0.5">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveExercise(dayIdx, exIdx, -1)}
                                            disabled={exIdx === 0}
                                            className="p-1 text-slate-300 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition"
                                            title="Move up"
                                          >
                                            <MoveUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleMoveExercise(dayIdx, exIdx, 1)}
                                            disabled={exIdx === exCount - 1}
                                            className="p-1 text-slate-300 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition"
                                            title="Move down"
                                          >
                                            <MoveDown className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveExercise(dayIdx, exIdx)}
                                            className="p-1 text-slate-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition"
                                            title="Remove"
                                          >
                                            <MinusCircle className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Stacked View */}
                            <div className="md:hidden space-y-2">
                              {day.exercises.map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {exIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={ex.name}
                                      onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'name', e.target.value)}
                                      placeholder="Exercise name"
                                      className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveExercise(dayIdx, exIdx)}
                                      className="p-1 text-slate-400 hover:text-red-500 transition shrink-0"
                                    >
                                      <MinusCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 pl-8">
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sets</span>
                                      <input
                                        type="text"
                                        value={ex.sets}
                                        onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'sets', e.target.value)}
                                        placeholder="3"
                                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Reps</span>
                                      <input
                                        type="text"
                                        value={ex.reps}
                                        onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'reps', e.target.value)}
                                        placeholder="10"
                                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Weight</span>
                                      <input
                                        type="text"
                                        value={ex.weight}
                                        onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'weight', e.target.value)}
                                        placeholder="80kg"
                                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-lg text-center font-semibold text-slate-900 dark:text-white focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="pl-8">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Notes</span>
                                    <input
                                      type="text"
                                      value={ex.notes}
                                      onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'notes', e.target.value)}
                                      placeholder="Optional notes"
                                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 pl-8 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveExercise(dayIdx, exIdx, -1)}
                                      disabled={exIdx === 0}
                                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition"
                                    >
                                      <MoveUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveExercise(dayIdx, exIdx, 1)}
                                      disabled={exIdx === exCount - 1}
                                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition"
                                    >
                                      <MoveDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {exCount > 0 && (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openExercisePicker(dayIdx)}
                              className="flex-1 py-2 rounded-xl border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> Use My Library
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddExercise(dayIdx)}
                              className="flex-1 py-2 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-400 dark:text-zinc-500 hover:text-red-500 hover:border-red-500/30 dark:hover:text-red-400 dark:hover:border-red-500/30 transition flex items-center justify-center gap-1.5"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Add Manually
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Form Footer ── */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.title.trim()}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> {editingPlan ? 'Update Plan' : 'Save as Draft'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Library Picker */}
      {pickerDayIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">My Exercise Library</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Only exercises created by your account are shown.</p>
              </div>
              <button
                type="button"
                onClick={() => setPickerDayIndex(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                title="Close library"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={libSearch}
                  onChange={(e) => setLibSearch(e.target.value)}
                  placeholder="Search your exercises..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['ALL', ...libraryMuscles].map((muscle) => (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => setLibMuscle(muscle)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      libMuscle === muscle
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {muscle === 'ALL' ? 'All Groups' : muscle}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1">
              {filteredLibrary.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">No matching exercises</p>
                  <p className="text-xs text-slate-400 mt-1">Add exercises in Exercise Library first.</p>
                </div>
              ) : (
                filteredLibrary.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleAddFromLibToDay(ex)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-red-500/50 hover:bg-red-500/5 text-left transition flex items-center justify-between gap-4"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">{ex.name}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {ex.muscleGroup || 'General'} · {ex.defaultSets || '3'} sets · {ex.defaultReps || '10-12'} reps
                      </span>
                    </span>
                    <Plus className="w-4 h-4 text-red-500 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirm}
                disabled={actionLoading === confirmDialog.plan.id}
                className={`px-5 py-2 text-sm font-bold rounded-xl text-white shadow-lg transition flex items-center gap-2 ${
                  confirmDialog.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-600/25'
                    : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/25'
                }`}
              >
                {actionLoading === confirmDialog.plan.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  confirmDialog.type === 'archive' ? 'Archive' : 'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
