import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flag
} from 'lucide-react';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

export const Timer = () => {
  const { theme } = useAuth();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState('tabata');

  // Tabata / interval
  const [prepare, setPrepare] = useState(10);
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [phase, setPhase] = useState('idle'); // idle | prepare | work | rest | done
  const [round, setRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Stopwatch
  const [swMs, setSwMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  // Countdown
  const [cdMinutes, setCdMinutes] = useState(1);
  const [cdLeft, setCdLeft] = useState(60);
  const [cdRunning, setCdRunning] = useState(false);

  const intervalRef = useRef(null);
  const swRef = useRef(null);

  const cleanIntervals = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (swRef.current) { clearInterval(swRef.current); swRef.current = null; }
  };

  useEffect(() => () => cleanIntervals(), []);

  const startTabata = () => {
    cleanIntervals();
    setRound(1);
    setPhase('prepare');
    setSecondsLeft(prepare);
    sound.start();
  };

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    if (secondsLeft > 0) return;
    // advance when secondsLeft hits 0
    if (phase === 'prepare') { setPhase('work'); setSecondsLeft(work); sound.go(); }
    else if (phase === 'work') { setPhase('rest'); setSecondsLeft(rest); sound.phase(); }
    else if (phase === 'rest') {
      if (round >= rounds) { setPhase('done'); setSecondsLeft(0); sound.finish(); }
      else { setRound((r) => r + 1); setPhase('work'); setSecondsLeft(work); sound.go(); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : s)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const stopTabata = () => {
    cleanIntervals();
    setPhase('idle');
    setRound(1);
    setSecondsLeft(0);
  };

  // Stopwatch
  const startSw = () => {
    if (swRunning) return;
    setSwRunning(true);
    swRef.current = setInterval(() => setSwMs((m) => m + 10), 10);
    sound.start();
  };
  const pauseSw = () => { setSwRunning(false); clearInterval(swRef.current); swRef.current = null; sound.phase(); };
  const resetSw = () => { setSwRunning(false); clearInterval(swRef.current); swRef.current = null; setSwMs(0); setLaps([]); sound.phase(); };
  const lapSw = () => { if (swRunning) { setLaps((l) => [swMs, ...l]); sound.tick(); } };

  // Countdown
  const startCd = () => { setCdLeft(cdMinutes * 60); setCdRunning(true); sound.start(); };
  useEffect(() => {
    if (!cdRunning) return;
    const t = setInterval(() => {
      setCdLeft((prev) => {
        // beep on the last 3 seconds
        if (prev > 1 && prev <= 3) sound.tick();
        if (prev <= 1) { setCdRunning(false); clearInterval(t); sound.finish(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cdRunning]);

  const k = isDark ? { text: 'text-zinc-100', sub: 'text-zinc-400', btn: 'bg-zinc-900 border-zinc-800 text-zinc-300' } : { text: 'text-slate-900', sub: 'text-slate-500', btn: 'bg-white border-slate-200 text-slate-600' };

  const modeBtn = (m, label, Icon) => (
    <button
      onClick={() => { setMode(m); cleanIntervals(); setPhase('idle'); setCdRunning(false); setSwRunning(false); }}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[0.8125rem] font-semibold transition border ${
        mode === m ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20' : isDark ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  const field = `w-20 px-2.5 py-2 text-center text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${k.btn.replace('bg-white', 'bg-zinc-50 dark:bg-zinc-900').replace('text-slate-600', 'text-slate-900 dark:text-white')}`;
  const fieldCls = `px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`;

  const phaseLabel = phase === 'prepare' ? 'Get Ready' : phase === 'work' ? 'GO!' : phase === 'rest' ? 'Rest' : phase === 'done' ? 'Complete' : 'Ready';
  const phaseColor = phase === 'work' ? 'text-red-500' : phase === 'rest' ? 'text-emerald-500' : phase === 'prepare' ? 'text-amber-500' : 'text-slate-500';
  const big = phase === 'work' ? 'text-7xl' : 'text-7xl';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="display-1 sm:text-4xl text-slate-900 dark:text-white">Workout Timer</h1>
          <p className={`body-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Free Tabata / HIIT interval timer, stopwatch & countdown — no account needed.
          </p>
        </div>

        {/* Modes */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-6">
          {modeBtn('tabata', 'Interval', Zap)}
          {modeBtn('stopwatch', 'Stopwatch', Flag)}
          {modeBtn('countdown', 'Countdown', TimerIcon)}
        </div>

        {mode === 'tabata' && (
          <div className={`rounded-2xl border p-6 sm:p-8 ${isDark ? 'bg-[#17171c] border-zinc-800/80' : 'bg-white border-slate-200'}`}>
            {phase === 'idle' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[{ l: 'Prepare', icon: Zap }, { l: 'Work', icon: Play }, { l: 'Rest', icon: Pause }, { l: 'Rounds', icon: RotateCcw }].map((it) => {
                    const cfg = { Prepare: prepare, Work: work, Rest: rest, Rounds: rounds }[it.l];
                    const set = { Prepare: setPrepare, Work: setWork, Rest: setRest, Rounds: setRounds }[it.l];
                    const Icon = it.icon;
                    return (
                      <div key={it.l} className={`rounded-xl border p-3.5 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.09em] mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          <Icon className="w-3.5 h-3.5 text-red-500" /> {it.l}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={cfg}
                            min={it.l === 'Rounds' ? 1 : 0}
                            onChange={(e) => set(Number(e.target.value))}
                            className={`w-full text-center ${fieldCls} !py-2 tabular-nums`}
                          />
                          {it.l !== 'Rounds' && <span className={`text-[0.8125rem] font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>s</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={startTabata} className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-base shadow-lg shadow-red-600/25 transition inline-flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" /> Start Workout
                </button>
              </>
            ) : (
              <div className="text-center py-2">
                <div className={`overline ${isDark ? 'text-zinc-500' : 'text-slate-400'} mb-2`}>Round {round} / {rounds}</div>
                <div className={`${big} font-black tabular-nums ${phaseColor}`}>{fmt(secondsLeft)}</div>
                <div className={`text-lg font-bold mt-1 ${phaseColor}`}>{phaseLabel}</div>
                <div className="mt-8 flex items-center justify-center gap-3">
                  {phase !== 'done' ? (
                    <button onClick={stopTabata} className={`h-12 px-6 inline-flex items-center gap-2 rounded-xl border text-sm font-semibold ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'}`}>
                      <Pause className="w-4 h-4" /> Stop
                    </button>
                  ) : (
                    <button onClick={stopTabata} className="h-12 px-6 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold">
                      <RotateCcw className="w-4 h-4" /> Restart
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'stopwatch' && (
          <div className={`rounded-2xl border p-6 sm:p-8 ${isDark ? 'bg-[#17171c] border-zinc-800/80' : 'bg-white border-slate-200'}`}>
            <div className="text-center py-2">
              <div className="text-7xl font-black tabular-nums text-slate-900 dark:text-white">
                {pad(Math.floor((swMs / 1000) / 60))}:{pad(Math.floor((swMs / 1000) % 60))}.<span className="text-4xl">{String(Math.floor((swMs % 1000) / 10)).padStart(2, '0')}</span>
              </div>
              <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                {!swRunning ? (
                  <button onClick={startSw} className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-600/25 transition"><Play className="w-4 h-4" /> Start</button>
                ) : (
                  <button onClick={pauseSw} className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-600/25 transition"><Pause className="w-4 h-4" /> Pause</button>
                )}
                <button onClick={lapSw} disabled={!swRunning} className={`h-12 px-6 inline-flex items-center gap-2 rounded-xl border text-sm font-semibold disabled:opacity-40 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'}`}><Flag className="w-4 h-4" /> Lap</button>
                <button onClick={resetSw} className={`h-12 px-6 inline-flex items-center gap-2 rounded-xl border text-sm font-semibold ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'}`}><RotateCcw className="w-4 h-4" /> Reset</button>
              </div>
              {laps.length > 0 && (
                <div className="mt-6 max-h-48 overflow-y-auto space-y-1.5 text-left">
                  {laps.map((l, i) => (
                    <div key={i} className={`flex justify-between px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
                      <span className="text-slate-500 dark:text-zinc-400">Lap {laps.length - i}</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{fmt(l / 1000)}.{String(Math.floor((l % 1000) / 10)).padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'countdown' && (
          <div className={`rounded-2xl border p-6 sm:p-8 ${isDark ? 'bg-[#17171c] border-zinc-800/80' : 'bg-white border-slate-200'}`}>
            {cdLeft === 0 && !cdRunning ? (
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-2 mb-5">
                  <span className="overline text-slate-500 dark:text-zinc-500 mt-2 mr-1">Minutes</span>
                  <input type="number" value={cdMinutes} onChange={(e) => setCdMinutes(Number(e.target.value))} className={`w-20 ${fieldCls} text-center`} />
                </div>
                <button onClick={startCd} className="w-40 h-14 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-600/25 transition inline-flex items-center justify-center gap-2"><Play className="w-5 h-5" /> Start</button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className={`text-7xl font-black tabular-nums ${cdLeft <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{fmt(cdLeft)}</div>
                {cdLeft <= 10 && cdRunning && <div className="text-sm font-semibold text-red-500 mt-2">Almost done!</div>}
                <div className="mt-8 flex items-center justify-center gap-3">
                  {cdRunning ? (
                    <button onClick={() => setCdRunning(false)} className="h-12 px-6 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold"><Pause className="w-4 h-4" /> Stop</button>
                  ) : (
                    <button onClick={() => setCdRunning(true)} className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold"><Play className="w-4 h-4" /> Resume</button>
                  )}
                  <button onClick={() => { setCdRunning(false); setCdLeft(0); }} className={`h-12 px-6 inline-flex items-center gap-2 rounded-xl border text-sm font-semibold ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'}`}><RotateCcw className="w-4 h-4" /> Reset</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
