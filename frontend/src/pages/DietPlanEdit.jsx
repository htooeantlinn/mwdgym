import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { Plus, Trash2, ArrowLeft, Search, X, MoveUp, MoveDown } from 'lucide-react';

const DEFAULT_MEALS = () => [
  { name: 'Breakfast', startTime: '07:00', endTime: '08:00', items: [] },
  { name: 'Lunch', startTime: '12:00', endTime: '13:00', items: [] },
  { name: 'Dinner', startTime: '18:00', endTime: '19:00', items: [] },
  { name: 'Snacks', startTime: '15:00', endTime: '15:30', items: [] },
];

const normalizeOption = (o) => ({
  food: o?.food || '',
  quantity: o?.quantity || '',
  calories: o?.calories || '',
  protein: o?.protein || '',
  carbs: o?.carbs || '',
  fat: o?.fat || '',
  notes: o?.notes || '',
  kind: 'single',
  options: '',
  optionItems: [],
});

const normalizeItem = (f) => {
  let optionItems = Array.isArray(f?.optionItems) ? f.optionItems.map(normalizeOption) : [];
  let options = f?.options || '';
  // Convert legacy one-line options text into real sub-rows (split on / + or new lines)
  if (optionItems.length === 0 && options.trim() !== '') {
    optionItems = options
      .split(/[\/\+\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ ...normalizeOption({}), food: s }));
    options = '';
  }
  return {
    food: f?.food || '',
    quantity: f?.quantity || '',
    calories: f?.calories || '',
    protein: f?.protein || '',
    carbs: f?.carbs || '',
    fat: f?.fat || '',
    notes: f?.notes || '',
    kind: ['single', 'choice', 'mix'].includes(f?.kind) ? f.kind : 'single',
    options,
    optionItems,
  };
};

const normalizeMeal = (m) => ({
  name: m?.name || '',
  startTime: m?.startTime || '',
  endTime: m?.endTime || '',
  items: Array.isArray(m?.items) ? m.items.map(normalizeItem) : [],
});

const parseContent = (contentJson) => {
  try {
    const c = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson;
    if (Array.isArray(c?.meals)) return c.meals.map(normalizeMeal);
  } catch {
    // fall through
  }
  return DEFAULT_MEALS();
};

export const DietPlanEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [theme, setTheme] = useState('default');
  const [meals, setMeals] = useState(DEFAULT_MEALS());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Food library state for picker — target is { meal, food } where food=null means meal rows
  const [foodLib, setFoodLib] = useState([]);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [libSearch, setLibSearch] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);

  useEffect(() => {
    const fetchLib = async () => {
      try {
        const res = await api.get('/foods');
        setFoodLib(res.data || []);
      } catch (e) {
        console.error('Failed to load foods', e);
      }
    };
    fetchLib();

    if (!id) {
      setMeals(DEFAULT_MEALS());
      return;
    }
    (async () => {
      try {
        const res = await api.get(`/diet-plans/${id}`);
        const plan = res.data || {};
        setName(plan.name || '');
        setNotes(plan.notes || '');
        setActive(plan.active !== false);
        setTheme(plan.theme || 'default');
        setMeals(parseContent(plan.contentJson));
      } catch (e) {
        console.error('Failed to fetch diet plan', e);
        setError('Failed to load diet plan');
      }
    })();
  }, [id]);

  const savePlan = async () => {
    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        notes,
        active,
        theme,
        contentJson: JSON.stringify({ meals }),
      };
      if (id) {
        await api.put(`/diet-plans/${id}`, payload);
      } else {
        await api.post('/diet-plans', payload);
      }
      navigate('/diet-plans');
    } catch (e) {
      console.error('Failed to save diet plan', e);
      setError('Failed to save diet plan');
    } finally {
      setSaving(false);
    }
  };

  const updateMealField = (mIndex, field, value) => {
    setMeals((prev) => prev.map((m, i) => (i === mIndex ? { ...m, [field]: value } : m)));
  };

  const addMeal = () => {
    setMeals((prev) => [...prev, { name: 'New Meal', startTime: '', endTime: '', items: [] }]);
  };

  const removeMeal = (mIndex) => {
    setMeals((prev) => prev.filter((_, i) => i !== mIndex));
  };

  const addFood = (mIndex) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mIndex
          ? { ...m, items: [...(m.items || []), { food: '', quantity: '', calories: '', protein: '', carbs: '', fat: '', notes: '', kind: 'single', options: '' }] }
          : m
      )
    );
  };

  const toggleSelectFood = (id) => {
    setSelectedFoodIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const libToRow = (f) => ({
    food: f.name || '',
    quantity: f.defaultQuantity || '',
    calories: f.defaultCalories || '',
    protein: f.defaultProtein || '',
    carbs: f.defaultCarbs || '',
    fat: f.defaultFat || '',
    notes: f.defaultNote || '',
    kind: 'single',
    options: '',
    optionItems: [],
  });

  const handleAddSelectedFoods = () => {
    if (!pickerTarget || selectedFoodIds.length === 0) return;
    const byId = new Map(foodLib.map((f) => [f.id, f]));
    const toAdd = selectedFoodIds.map((id) => byId.get(id)).filter(Boolean).map(libToRow);
    setMeals((prev) =>
      prev.map((m, i) => {
        if (i !== pickerTarget.meal) return m;
        if (pickerTarget.food === null || pickerTarget.food === undefined) {
          return { ...m, items: [...(m.items || []), ...toAdd] };
        }
        return {
          ...m,
          items: (m.items || []).map((it, j) =>
            j === pickerTarget.food
              ? { ...it, optionItems: [...(it.optionItems || []), ...toAdd] }
              : it
          ),
        };
      })
    );
    setSelectedFoodIds([]);
  };

  const updateOption = (mIndex, fIndex, oIndex, field, value) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mIndex
          ? {
              ...m,
              items: (m.items || []).map((it, j) =>
                j === fIndex
                  ? {
                      ...it,
                      optionItems: (it.optionItems || []).map((o, k) =>
                        k === oIndex ? { ...o, [field]: value } : o
                      ),
                    }
                  : it
              ),
            }
          : m
      )
    );
  };

  const addBlankOption = (mIndex, fIndex) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mIndex
          ? {
              ...m,
              items: (m.items || []).map((it, j) =>
                j === fIndex
                  ? { ...it, optionItems: [...(it.optionItems || []), normalizeOption({})] }
                  : it
              ),
            }
          : m
      )
    );
  };

  const removeOption = (mIndex, fIndex, oIndex) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mIndex
          ? {
              ...m,
              items: (m.items || []).map((it, j) =>
                j === fIndex
                  ? { ...it, optionItems: (it.optionItems || []).filter((_, k) => k !== oIndex) }
                  : it
              ),
            }
          : m
      )
    );
  };

  const openPicker = (meal, food = null) => {
    setLibSearch('');
    setSelectedFoodIds([]);
    setPickerTarget({ meal, food });
  };

  const handleMoveFood = (mIndex, fIndex, dir) => {
    setMeals((prev) => {
      const items = [...(prev[mIndex].items || [])];
      const target = fIndex + dir;
      if (target < 0 || target >= items.length) return prev;
      const tmp = items[fIndex];
      items[fIndex] = items[target];
      items[target] = tmp;
      return prev.map((m, i) => (i === mIndex ? { ...m, items } : m));
    });
  };

  const filteredLib = foodLib.filter(
    (f) =>
      f.name?.toLowerCase().includes(libSearch.toLowerCase()) ||
      f.category?.toLowerCase().includes(libSearch.toLowerCase())
  );

  const removeFood = (mIndex, fIndex) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mIndex ? { ...m, items: (m.items || []).filter((_, j) => j !== fIndex) } : m
      )
    );
  };

  const updateFood = (mIndex, fIndex, field, value) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mIndex
          ? { ...m, items: (m.items || []).map((f, j) => (j === fIndex ? { ...f, [field]: value } : f)) }
          : m
      )
    );
  };

  const inputCls =
    'w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40';

  return (
    <div className="space-y-5 max-w-4xl">
      <button
        onClick={() => navigate('/diet-plans')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Diet Plans
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {id ? 'Edit Diet Plan' : 'Create Diet Plan'}
      </h1>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 text-sm font-semibold">{error}</div>
      )}

      <div className="surface p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-zinc-300">Plan Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Weight Loss Plan A" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-zinc-300">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} />
        </div>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            Theme
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="px-2 py-1 text-sm border rounded-lg bg-white dark:bg-zinc-900">
              <option value="default">Default</option>
              <option value="bw">Black &amp; White</option>
              <option value="red">Red</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meals</h2>
        <button
          onClick={addMeal}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Meal
        </button>
      </div>

      {meals.map((meal, mIndex) => (
        <div key={mIndex} className="surface p-5 space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={meal.name || ''}
                onChange={(e) => updateMealField(mIndex, 'name', e.target.value)}
                className={`${inputCls} font-semibold flex-1`}
                placeholder="Meal name"
              />
              <button
                onClick={() => removeMeal(mIndex)}
                className="h-9 px-3 inline-flex items-center gap-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Eating time</label>
              <input
                type="time"
                value={meal.startTime || ''}
                onChange={(e) => updateMealField(mIndex, 'startTime', e.target.value)}
                className="px-2 py-1.5 text-sm border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="time"
                value={meal.endTime || ''}
                onChange={(e) => updateMealField(mIndex, 'endTime', e.target.value)}
                className="px-2 py-1.5 text-sm border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {(meal.items || []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400">
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">Food</th>
                    <th className="p-2 w-20">Qty</th>
                    <th className="p-2 w-16">Cal</th>
                    <th className="p-2 w-16">Protein</th>
                    <th className="p-2 w-16">Carbs</th>
                    <th className="p-2 w-16">Fat</th>
                    <th className="p-2 w-28">Note</th>
                    <th className="p-2 w-24">Type</th>
                    <th className="p-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {(meal.items || []).map((food, fIndex) => (
                    <React.Fragment key={fIndex}>
                      <tr className="border-t border-slate-100 dark:border-zinc-800">
                        <td className="p-1.5 text-slate-400">{fIndex + 1}</td>
                        <td className="p-1.5">
                          <input type="text" value={food.food || ''} onChange={(e) => updateFood(mIndex, fIndex, 'food', e.target.value)} className={inputCls} />
                        </td>
                        <td className="p-1.5">
                          <input type="text" value={food.quantity || ''} onChange={(e) => updateFood(mIndex, fIndex, 'quantity', e.target.value)} className={inputCls} />
                        </td>
                        <td className="p-1.5">
                          <input type="text" value={food.calories || ''} onChange={(e) => updateFood(mIndex, fIndex, 'calories', e.target.value)} className={inputCls} />
                        </td>
                        <td className="p-1.5">
                          <input type="text" value={food.protein || ''} onChange={(e) => updateFood(mIndex, fIndex, 'protein', e.target.value)} className={inputCls} />
                        </td>
                        <td className="p-1.5">
                          <input type="text" value={food.carbs || ''} onChange={(e) => updateFood(mIndex, fIndex, 'carbs', e.target.value)} className={inputCls} />
                        </td>
                        <td className="p-1.5">
                          <input type="text" value={food.fat || ''} onChange={(e) => updateFood(mIndex, fIndex, 'fat', e.target.value)} className={inputCls} />
                        </td>
                        <td className="p-1.5">
                          <input type="text" value={food.notes || ''} onChange={(e) => updateFood(mIndex, fIndex, 'notes', e.target.value)} className={inputCls} placeholder="note" />
                        </td>
                        <td className="p-1.5">
                          <select
                            value={food.kind || 'single'}
                            onChange={(e) => updateFood(mIndex, fIndex, 'kind', e.target.value)}
                            className="px-1.5 py-1.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none"
                          >
                            <option value="single">Single</option>
                            <option value="choice">Choice</option>
                            <option value="mix">Mix</option>
                          </select>
                        </td>
                        <td className="p-1.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveFood(mIndex, fIndex, -1)}
                              disabled={fIndex === 0}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveFood(mIndex, fIndex, 1)}
                              disabled={fIndex === (meal.items || []).length - 1}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => removeFood(mIndex, fIndex)} className="text-rose-500 hover:text-rose-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {(food.kind === 'choice' || food.kind === 'mix') && (
                        <React.Fragment key={`opts-${fIndex}`}>
                          <tr>
                            <td />
                            <td colSpan={9} className="px-1.5 pt-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                  {food.kind === 'choice'
                                    ? `Choice options — client picks 1 (${(food.optionItems || []).length})`
                                    : `Mix components — combined into 1 (${(food.optionItems || []).length})`}
                                </span>
                                <button
                                  onClick={() => openPicker(mIndex, fIndex)}
                                  className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] hover:bg-emerald-600 hover:text-white transition"
                                >
                                  <Plus className="w-3 h-3" /> Add from Food Library
                                </button>
                                <button
                                  onClick={() => addBlankOption(mIndex, fIndex)}
                                  className="text-[11px] font-semibold text-slate-500 hover:underline"
                                >
                                  + Blank row
                                </button>
                              </div>
                            </td>
                          </tr>
                          {(food.optionItems || []).length === 0 && (
                            <tr>
                              <td />
                              <td colSpan={9} className="px-1.5 pb-1 text-xs text-slate-400">
                                No options yet — add from the library or a blank row.
                              </td>
                            </tr>
                          )}
                          {(food.optionItems || []).map((opt, oIndex) => (
                            <tr key={`opt-${oIndex}`} className="bg-emerald-500/[0.05] dark:bg-emerald-500/5">
                              <td className="p-1.5 text-slate-400 text-xs whitespace-nowrap">
                                {fIndex + 1}.{oIndex + 1}
                              </td>
                              <td className="p-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-500 font-bold shrink-0">↳</span>
                                  <input
                                    type="text"
                                    value={opt.food || ''}
                                    onChange={(e) => updateOption(mIndex, fIndex, oIndex, 'food', e.target.value)}
                                    placeholder="Food"
                                    className={inputCls}
                                  />
                                </div>
                              </td>
                              <td className="p-1.5">
                                <input type="text" value={opt.quantity || ''} onChange={(e) => updateOption(mIndex, fIndex, oIndex, 'quantity', e.target.value)} placeholder="Qty" className={inputCls} />
                              </td>
                              <td className="p-1.5">
                                <input type="text" value={opt.calories || ''} onChange={(e) => updateOption(mIndex, fIndex, oIndex, 'calories', e.target.value)} placeholder="Cal" className={inputCls} />
                              </td>
                              <td className="p-1.5">
                                <input type="text" value={opt.protein || ''} onChange={(e) => updateOption(mIndex, fIndex, oIndex, 'protein', e.target.value)} placeholder="Protein" className={inputCls} />
                              </td>
                              <td className="p-1.5">
                                <input type="text" value={opt.carbs || ''} onChange={(e) => updateOption(mIndex, fIndex, oIndex, 'carbs', e.target.value)} placeholder="Carbs" className={inputCls} />
                              </td>
                              <td className="p-1.5">
                                <input type="text" value={opt.fat || ''} onChange={(e) => updateOption(mIndex, fIndex, oIndex, 'fat', e.target.value)} placeholder="Fat" className={inputCls} />
                              </td>
                              <td className="p-1.5">
                                <input type="text" value={opt.notes || ''} onChange={(e) => updateOption(mIndex, fIndex, oIndex, 'notes', e.target.value)} placeholder="Note" className={inputCls} />
                              </td>
                              <td className="p-1.5 text-center text-slate-300 dark:text-zinc-600 text-xs">—</td>
                              <td className="p-1.5">
                                <button onClick={() => removeOption(mIndex, fIndex, oIndex)} className="text-rose-500 hover:text-rose-400">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No foods added yet.</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => openPicker(mIndex)}
              className="h-8 px-3 inline-flex items-center gap-1 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-600 hover:text-white transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add from Food Library
            </button>
            <button onClick={() => addFood(mIndex)} className="text-xs font-semibold text-slate-500 hover:underline">
              + Blank row
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 pb-8">
        <button
          onClick={savePlan}
          disabled={saving}
          className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : id ? 'Update Plan' : 'Create Plan'}
        </button>
        <button onClick={() => navigate('/diet-plans')} className="h-10 px-5 rounded-lg border text-sm font-semibold">
          Cancel
        </button>
      </div>

      {/* Food Picker Modal */}
      {pickerTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {pickerTarget.food === null || pickerTarget.food === undefined
                    ? `Add Food to ${meals[pickerTarget.meal]?.name}`
                    : `Add option to ${meals[pickerTarget.meal]?.items?.[pickerTarget.food]?.food || 'row'}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Select food from library — defaults fill in, edit after</p>
              </div>
              <button onClick={() => setPickerTarget(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                placeholder="Search by food or category..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredLib.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No foods found. Add them in the Food Library first.</p>
              )}
              {filteredLib.map((f) => {
                const checked = selectedFoodIds.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleSelectFood(f.id)}
                    className={`p-3 rounded-xl cursor-pointer transition flex items-center gap-3 text-xs border ${
                      checked
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-transparent hover:border-emerald-500/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelectFood(f.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 w-4 h-4 accent-emerald-600"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 dark:text-white block">{f.name}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {f.category} • {f.defaultQuantity} • {f.defaultCalories} cal • P:{f.defaultProtein} C:{f.defaultCarbs} F:{f.defaultFat}
                      </span>
                      {f.defaultNote && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 italic block truncate">
                          Note: {f.defaultNote}
                        </span>
                      )}
                    </div>
                    <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleAddSelectedFoods}
                disabled={selectedFoodIds.length === 0}
                className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-40"
              >
                Add selected ({selectedFoodIds.length})
              </button>
              <button
                onClick={() => setPickerTarget(null)}
                className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
