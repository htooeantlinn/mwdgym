import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Scale,
  Percent,
  Dumbbell,
  Flame,
  Utensils
} from 'lucide-react';

const TABS = [
  { key: 'bmi', label: 'BMI', icon: Scale },
  { key: 'bodyfat', label: 'Body Fat', icon: Percent },
  { key: 'onerm', label: '1 Rep Max', icon: Dumbbell },
  { key: 'calories', label: 'Calories', icon: Flame },
  { key: 'macros', label: 'Macros', icon: Utensils },
];

export const Calculator = () => {
  const { theme } = useAuth();
  const isDark = theme === 'dark';

  const [tab, setTab] = useState('bmi');

  // BMI state
  const [bmiUnit, setBmiUnit] = useState('metric');
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(8);
  const [weightKg, setWeightKg] = useState(70);
  const [weightLb, setWeightLb] = useState(154);

  // Body fat (US Navy)
  const [bfSex, setBfSex] = useState('male');
  const [bfHeight, setBfHeight] = useState(170);
  const [bfNeck, setBfNeck] = useState(38);
  const [bfWaist, setBfWaist] = useState(85);
  const [bfHip, setBfHip] = useState(95);

  // One rep max
  const [maxWeight, setMaxWeight] = useState(80);
  const [reps, setReps] = useState(5);

  // Calories
  const [calSex, setCalSex] = useState('male');
  const [calAge, setCalAge] = useState(25);
  const [calHeight, setCalHeight] = useState(170);
  const [calWeight, setCalWeight] = useState(70);
  const [activity, setActivity] = useState(1.375);

  // Macros
  const [targetCal, setTargetCal] = useState(2500);
  const [proteinPerKg, setProteinPerKg] = useState(1.8);
  const [fatPct, setFatPct] = useState(25);

  const k = isDark ? { text: 'text-zinc-100', sub: 'text-zinc-400', card: 'bg-[#17171c]', border: 'border-zinc-800/80', input: 'bg-zinc-900 border-zinc-800 text-white' } : { text: 'text-slate-900', sub: 'text-slate-500', card: 'bg-white', border: 'border-slate-200', input: 'bg-slate-50 border-slate-200 text-slate-900' };

  // BMI calc
  const bmiBmi = bmiUnit === 'metric'
    ? weightKg / Math.pow(heightCm / 100, 2)
    : (weightLb * 703) / Math.pow(heightFt * 12 + heightIn, 2);
  const bmiCat = bmiBmi < 18.5 ? 'Underweight' : bmiBmi < 25 ? 'Normal weight' : bmiBmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmiBmi < 18.5 ? 'text-sky-500' : bmiBmi < 25 ? 'text-emerald-500' : bmiBmi < 30 ? 'text-amber-500' : 'text-red-500';
  const bmiPct = Math.min(Math.max(((bmiBmi - 14) / (40 - 14)) * 100, 0), 100);

  // Body fat (US Navy)
  const bm = bfHeight / 100;
  const bfBodyFat = bfSex === 'male'
    ? 495 / (1.0324 - 0.19077 * Math.log10(bfWaist - bfNeck) + 0.15456 * Math.log10(bm * 100)) - 450
    : 495 / (1.29579 - 0.35004 * Math.log10(bfWaist + bfHip - bfNeck) + 0.22100 * Math.log10(bm * 100)) - 450;

  // One rep max (Epley)
  const oneRm = maxWeight * (1 + reps / 30);

  // Calories (Mifflin-St Jeor)
  const bmr = calSex === 'male'
    ? 10 * calWeight + 6.25 * calHeight - 5 * calAge + 5
    : 10 * calWeight + 6.25 * calHeight - 5 * calAge - 161;
  const tdee = bmr * activity;

  // Macros
  const proteinG = (targetCal * proteinPerKg / 2200 * 4) || 0;
  const fatG = (targetCal * (fatPct / 100)) / 9;
  const carbCalRemain = Math.max(targetCal - targetCal * (fatPct / 100) - (proteinPerKg * 4 * Math.min(calWeight || 70, 100)), 0);
  const carbsG = carbCalRemain / 4;

  const num = (v) => isFinite(v) && isFinite(Number(v)) ? Number(v) : 0;

  const fieldCls = `w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${k.input}`;
  const labelCls = `block text-[0.6875rem] overline text-slate-500 dark:text-zinc-500 mb-1.5`;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="max-w-5xl mx-auto w-full">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="display-1 sm:text-4xl text-slate-900 dark:text-white">Fitness Calculators</h1>
          <p className={`body-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Free, accurate tools to track your body metrics, strength, and nutrition goals — no account needed.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[0.8125rem] font-semibold transition border ${
                  tab === t.key
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                    : isDark ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <div className={`lg:col-span-2 p-6 rounded-2xl border ${k.card} ${k.border}`}>
            {tab === 'bmi' && (
              <div>
                <h2 className="title-md text-slate-900 dark:text-white flex items-center gap-2 mb-4"><Scale className="w-4 h-4 text-red-500" /> Body Mass Index</h2>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg mb-5 w-fit">
                  {['metric', 'imperial'].map(u => (
                    <button key={u} onClick={() => setBmiUnit(u)} className={`px-3 py-1 text-[0.8125rem] font-semibold rounded-md capitalize ${bmiUnit === u ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}>{u}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bmiUnit === 'metric' ? (
                    <>
                      <div><label className={labelCls}>Height (cm)</label><input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={fieldCls} /></div>
                      <div><label className={labelCls}>Weight (kg)</label><input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} className={fieldCls} /></div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3"><div><label className={labelCls}>Height (ft)</label><input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} className={fieldCls} /></div><div><label className={labelCls}>Inches</label><input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} className={fieldCls} /></div></div>
                      <div><label className={labelCls}>Weight (lb)</label><input type="number" value={weightLb} onChange={e => setWeightLb(e.target.value)} className={fieldCls} /></div>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab === 'bodyfat' && (
              <div>
                <h2 className="title-md text-slate-900 dark:text-white flex items-center gap-2 mb-1"><Percent className="w-4 h-4 text-red-500" /> Body Fat % (US Navy)</h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Estimate using circumference measurements, all in cm.</p>
                <div className="mb-4 flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
                  {['male', 'female'].map(s => (
                    <button key={s} onClick={() => setBfSex(s)} className={`px-3 py-1 text-[0.8125rem] font-semibold rounded-md capitalize ${bfSex === s ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}>{s}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Height (cm)</label><input type="number" value={bfHeight} onChange={e => setBfHeight(e.target.value)} className={fieldCls} /></div>
                  <div><label className={labelCls}>Neck (cm)</label><input type="number" value={bfNeck} onChange={e => setBfNeck(e.target.value)} className={fieldCls} /></div>
                  <div><label className={labelCls}>Waist (cm)</label><input type="number" value={bfWaist} onChange={e => setBfWaist(e.target.value)} className={fieldCls} /></div>
                  {bfSex === 'female' && <div><label className={labelCls}>Hip (cm)</label><input type="number" value={bfHip} onChange={e => setBfHip(e.target.value)} className={fieldCls} /></div>}
                </div>
              </div>
            )}

            {tab === 'onerm' && (
              <div>
                <h2 className="title-md text-slate-900 dark:text-white flex items-center gap-2 mb-1"><Dumbbell className="w-4 h-4 text-red-500" /> One-Rep Max (Epley)</h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Estimate your max lift from a lighter set.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Weight lifted (kg)</label><input type="number" value={maxWeight} onChange={e => setMaxWeight(e.target.value)} className={fieldCls} /></div>
                  <div><label className={labelCls}>Reps performed</label><input type="number" value={reps} onChange={e => setReps(e.target.value)} className={fieldCls} /></div>
                </div>
              </div>
            )}

            {tab === 'calories' && (
              <div>
                <h2 className="title-md text-slate-900 dark:text-white flex items-center gap-2 mb-1"><Flame className="w-4 h-4 text-red-500" /> Daily Calories (TDEE)</h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Mifflin-St Jeor formula, adjusted for activity.</p>
                <div className="mb-4 flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
                  {['male', 'female'].map(s => (
                    <button key={s} onClick={() => setCalSex(s)} className={`px-3 py-1 text-[0.8125rem] font-semibold rounded-md capitalize ${calSex === s ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}>{s}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div><label className={labelCls}>Age</label><input type="number" value={calAge} onChange={e => setCalAge(e.target.value)} className={fieldCls} /></div>
                  <div><label className={labelCls}>Height (cm)</label><input type="number" value={calHeight} onChange={e => setCalHeight(e.target.value)} className={fieldCls} /></div>
                  <div><label className={labelCls}>Weight (kg)</label><input type="number" value={calWeight} onChange={e => setCalWeight(e.target.value)} className={fieldCls} /></div>
                  <div className="col-span-2 sm:col-span-3">
                    <label className={labelCls}>Activity Level</label>
                    <select value={activity} onChange={e => setActivity(Number(e.target.value))} className={fieldCls}>
                      <option value={1.2}>Sedentary (little/no exercise)</option>
                      <option value={1.375}>Light (1-3 days/week)</option>
                      <option value={1.55}>Moderate (3-5 days/week)</option>
                      <option value={1.725}>Very active (6-7 days/week)</option>
                      <option value={1.9}>Athlete (physical job / 2x daily)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {tab === 'macros' && (
              <div>
                <h2 className="title-md text-slate-900 dark:text-white flex items-center gap-2 mb-1"><Utensils className="w-4 h-4 text-red-500" /> Macro Split</h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Distribute your calorie target into protein, carbs & fat.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className={labelCls}>Target calories</label><input type="number" value={targetCal} onChange={e => setTargetCal(e.target.value)} className={fieldCls} /></div>
                  <div><label className={labelCls}>Protein (g/kg)</label><input type="number" step="0.1" value={proteinPerKg} onChange={e => setProteinPerKg(e.target.value)} className={fieldCls} /></div>
                  <div><label className={labelCls}>Fat (% of cal)</label><input type="number" value={fatPct} onChange={e => setFatPct(e.target.value)} className={fieldCls} /></div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className={`p-6 rounded-2xl border flex flex-col gap-6 ${isDark ? 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800' : 'bg-gradient-to-br from-red-600/5 to-transparent border-slate-200'}`}>
            <div>
              <div className="overline text-slate-500 dark:text-zinc-500 mb-1">
                {tab === 'bmi' ? 'Your BMI' : tab === 'bodyfat' ? 'Est. Body Fat' : tab === 'onerm' ? 'Estimated 1RM' : tab === 'calories' ? 'Maintenance Calories' : 'Daily Target'}
              </div>
              {tab === 'bmi' ? (
                <>
                  <div className={`text-5xl font-black ${k.text}`}>{num(bmiBmi).toFixed(1)}</div>
                  <div className={`text-lg font-bold mt-2 ${bmiColor}`}>{bmiCat}</div>
                  <div className="mt-5 h-2.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 via-40% via-amber-500 via-70% to-red-500 rounded-full" style={{ width: `${bmiPct}%` }}></div>
                  </div>
                </>
              ) : tab === 'bodyfat' ? (
                <>
                  <div className={`text-5xl font-black ${k.text}`}>{num(bfBodyFat).toFixed(1)}<span className="text-2xl">%</span></div>
                  <div className={`text-lg font-bold mt-2 ${bfBodyFat < 12 ? 'text-emerald-500' : bfBodyFat < 20 ? 'text-emerald-500' : bfBodyFat < 25 ? 'text-amber-500' : 'text-red-500'}`}>
                    {bfBodyFat < 12 ? 'Essential/Lean' : bfBodyFat < 20 ? 'Athletic' : bfBodyFat < 25 ? 'Average' : 'Higher'}
                  </div>
                </>
              ) : tab === 'onerm' ? (
                <div className={`text-5xl font-black ${k.text}`}>{num(oneRm).toFixed(0)}<span className="text-2xl"> kg</span></div>
              ) : tab === 'calories' ? (
                <>
                  <div className={`text-5xl font-black ${k.text}`}>{num(tdee).toFixed(0)}<span className="text-2xl"> kcal</span></div>
                  <div className={`text-xs mt-3 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>BMR {num(bmr).toFixed(0)} kcal</div>
                </>
              ) : (
                <>
                  <div className={`text-5xl font-black ${k.text}`}>{num(targetCal).toFixed(0)}<span className="text-2xl"> kcal</span></div>
                  <div className="mt-4 space-y-2.5 text-sm">
                    <div className={`flex justify-between p-3 rounded-lg ${isDark ? 'bg-zinc-900' : 'bg-white'} border ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}><span className="text-slate-500 dark:text-zinc-400">Protein</span><span className="font-bold text-slate-900 dark:text-white">{num(proteinG).toFixed(0)}g</span></div>
                    <div className={`flex justify-between p-3 rounded-lg ${isDark ? 'bg-zinc-900' : 'bg-white'} border ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}><span className="text-slate-500 dark:text-zinc-400">Carbs</span><span className="font-bold text-slate-900 dark:text-white">{num(carbsG).toFixed(0)}g</span></div>
                    <div className={`flex justify-between p-3 rounded-lg ${isDark ? 'bg-zinc-900' : 'bg-white'} border ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}><span className="text-slate-500 dark:text-zinc-400">Fat</span><span className="font-bold text-slate-900 dark:text-white">{num(fatG).toFixed(0)}g</span></div>
                  </div>
                </>
              )}
            </div>

            <div>
              <div className={`overline ${isDark ? 'text-zinc-500' : 'text-slate-400'} mb-2`}>How to use</div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {tab === 'bmi' && 'BMI is a general health indicator. It does not distinguish muscle from fat.'}
                {tab === 'bodyfat' && 'Measure at the largest point of neck & waist (navel), and hips (widest) for the formula.'}
                {tab === 'onerm' && 'The Epley formula estimates max strength. Use good form; don\'t test 1RM alone.'}
                {tab === 'calories' && 'TDEE is your maintenance. To lose fat, eat ~15-20% below; to bulk, ~10-15% above.'}
                {tab === 'macros' && 'Adjust protein by goal (1.6-2.2 g/kg for muscle, 1.2-1.6 for maintenance).'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
