import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  Dumbbell,
  Layers,
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revRange, setRevRange] = useState(6);
  const [wheelTab, setWheelTab] = useState('expiring');
  const [wheelMembers, setWheelMembers] = useState([]);
  const [wheelLoading, setWheelLoading] = useState(false);

  const fetchOverview = async (range = revRange) => {
    try {
      const res = await api.get(`/dashboard?range=${range}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(revRange);
  }, [revRange]);

  useEffect(() => {
    const fetchWheel = async () => {
      setWheelLoading(true);
      try {
        const params = new URLSearchParams({ page: '0', size: '20' });
        if (wheelTab === 'active') params.append('status', 'Active');
        else if (wheelTab === 'expired') params.append('status', 'Expired');
        else if (wheelTab === 'expiring') params.append('status', 'Active');
        const res = await api.get(`/members?${params.toString()}`);
        let list = res.data.members || res.data || [];
        if (wheelTab === 'expiring') {
          const now = new Date(); now.setHours(0,0,0,0);
          const in7 = new Date(now); in7.setDate(now.getDate() + 7);
          list = list.filter(m => {
            if (!m.endDate) return false;
            const e = new Date(m.endDate);
            return e >= now && e <= in7;
          });
          if (list.length === 0) {
            // fallback: show active members sorted by endDate ascending (nearest expiry first)
            list = (res.data.members || []).slice().sort((a,b) => new Date(a.endDate) - new Date(b.endDate)).slice(0,8);
          }
        }
        setWheelMembers(list);
      } catch (e) { setWheelMembers([]); }
      finally { setWheelLoading(false); }
    };
    fetchWheel();
  }, [wheelTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Loading Dashboard Metrics...</span>
        </div>
      </div>
    );
  }

  const stats = data || {};

  // Safely parse revenue trend (handle both {labels, values} and [{label, revenue}])
  const trendList = Array.isArray(stats.revenueTrend)
    ? stats.revenueTrend
    : stats.revenueTrend?.labels?.map((label, i) => ({
        label: label.split(' ')[0], // e.g. "Aug"
        revenue: Number(stats.revenueTrend.values?.[i] || 0),
      })) || [];

  const maxRevenue = Math.max(...trendList.map(t => Number(t.revenue || 0)), 100000);

  // Safely parse plan distribution
  const planDistList = Array.isArray(stats.planDist)
    ? stats.planDist
    : stats.planDist && typeof stats.planDist === 'object'
    ? Object.entries(stats.planDist).map(([name, count]) => ({ name, count: Number(count) }))
    : [];

  // Safely parse trainer workload
  const trainerLoadList = Array.isArray(stats.trainerLoad)
    ? stats.trainerLoad
    : stats.trainerLoad && typeof stats.trainerLoad === 'object'
    ? Object.entries(stats.trainerLoad).map(([name, assigned]) => ({ name, assigned: Number(assigned) }))
    : [];

  // Safely parse top plans
  const topPlansList = Array.isArray(stats.topPlans) ? stats.topPlans : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="display-2 text-slate-900 dark:text-white">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Coach'}
            </h1>
            <p className="body-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Here's your gym's performance summary and active operations today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/members"
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold label-md shadow-md shadow-red-600/20 transition"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} /> Add Member
          </Link>
          <Link
            to="/payments"
            className="h-9 px-3.5 inline-flex items-center rounded-lg bg-white dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 label-md border border-slate-200 dark:border-zinc-700 transition"
          >
            Payments
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="surface p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="overline text-slate-500 dark:text-zinc-500">Total Members</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="display-1 text-slate-900 dark:text-white">{stats.memberCount ?? 0}</span>
            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-emerald-500">
              <CheckCircle2 className="w-3 h-3" /> {stats.activeCount ?? 0} active
            </span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="surface p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="overline text-slate-500 dark:text-zinc-500">This Month Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="display-1 text-slate-900 dark:text-white">
                {stats.revenueMmk ? Number(stats.revenueMmk).toLocaleString() : '0'}
              </span>
              <span className="text-[0.6875rem] overline text-slate-400">MMK</span>
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="surface p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="overline text-slate-500 dark:text-zinc-500">Pending Invoices</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <CreditCard className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="display-1 text-amber-500">{stats.unpaidCount ?? 0}</span>
            {stats.overdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-rose-500">
                <AlertTriangle className="w-3 h-3" /> {stats.overdueCount} overdue
              </span>
            ) : (
              <span className="text-[0.6875rem] text-slate-400">all settled</span>
            )}
          </div>
        </div>

        {/* Expiring Subscriptions */}
        <div className="surface p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="overline text-slate-500 dark:text-zinc-500">Expiring in 7 Days</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <Clock className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="display-1 text-red-500">{stats.expiringSoonCount ?? 0}</span>
            <span className="text-[0.6875rem] text-slate-400">members</span>
          </div>
        </div>
      </div>

      {/* Scroll Wheel View — Coming Soon / Expired / Active Members */}
      <div className="surface overflow-hidden">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/60">
          <div>
            <h2 className="title-md text-slate-900 dark:text-white">Membership Timeline</h2>
            <p className="body-sm text-slate-500 dark:text-zinc-400 mt-0.5">Coming Soon (expiring in 7 days) · Expired · Active</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl self-start sm:self-auto">
            {[
              { key: 'expiring', label: `Coming Soon (${stats.expiringSoonCount ?? 0})` },
              { key: 'expired', label: `Expired (${stats.expiredCount ?? 0})` },
              { key: 'active', label: `Active (${stats.activeCount ?? 0})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setWheelTab(t.key)}
                className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition ${wheelTab === t.key ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {wheelLoading ? (
            <div className="py-10 flex justify-center"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : wheelMembers.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">No members in this category.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {wheelMembers.map(m => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 hover:border-red-500/30 dark:hover:border-red-500/30 transition group">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">{m.name?.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{m.cardCode || '—'} • {m.planType || 'No plan'}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : m.status === 'Expired' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>{m.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-800/50 rounded-xl p-2.5 border border-slate-100 dark:border-zinc-800">
                    <div><span className="block text-[10px] uppercase font-bold text-slate-400">Validity</span><span className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">{m.startDate || '-'} → {m.endDate || '-'}</span></div>
                    <div><span className="block text-[10px] uppercase font-bold text-slate-400">Payment</span><span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${m.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{m.paymentStatus || 'Not Paid'}</span></div>
                    <div><span className="block text-[10px] uppercase font-bold text-slate-400">Trainer</span><span className="font-medium text-slate-600 dark:text-zinc-400 text-xs truncate block">{m.trainer?.displayName || 'Unassigned'}</span></div>
                    <div><span className="block text-[10px] uppercase font-bold text-slate-400">Fee</span><span className="text-xs font-bold text-red-500">{m.amount ? Number(m.amount).toLocaleString() : '0'} MMK</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 surface p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="title-md text-slate-900 dark:text-white">Revenue Trajectory</h2>
              <p className="body-sm text-slate-500 dark:text-zinc-400 mt-0.5">Historical revenue comparison — graph lines</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-lg">
              {[6, 12].map(r => (
                <button
                  key={r}
                  onClick={() => setRevRange(r)}
                  className={`px-3 py-1 label-md rounded-md transition ${
                    revRange === r
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}M
                </button>
              ))}
            </div>
          </div>

          {/* Line Graph Visualization */}
          <div className="h-64 relative pt-2 pb-2">
            {trendList.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 relative">
                  <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                    {/* grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                      <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="currentColor" className="gridline dark:text-zinc-700 text-slate-200" strokeWidth="1" strokeDasharray="1 6" />
                    ))}
                    {/* area fill - gradient */}
                    <defs>
                      <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#revArea)"
                      points={`0,100 ${trendList.map((it, idx) => {
                        const x = (idx / Math.max(trendList.length - 1, 1)) * 300;
                        const y = 100 - (Number(it.revenue || 0) / maxRevenue) * 90 - 5;
                        return `${x},${y}`;
                      }).join(' ')} 300,100`}
                    />
                    {/* line */}
                    <polyline
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={trendList.map((it, idx) => {
                        const x = (idx / Math.max(trendList.length - 1, 1)) * 300;
                        const y = 100 - (Number(it.revenue || 0) / maxRevenue) * 90 - 5;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    {/* data points */}
                    {trendList.map((it, idx) => {
                      const x = (idx / Math.max(trendList.length - 1, 1)) * 300;
                      const y = 100 - (Number(it.revenue || 0) / maxRevenue) * 90 - 5;
                      return <circle key={idx} cx={x} cy={y} r="3" fill="#dc2626" stroke="white" strokeWidth="1.5" className="drop-shadow-sm" />;
                    })}
                  </svg>
                  {/* value labels on points */}
                  <div className="absolute inset-0 flex justify-between items-end px-1 pb-6 pointer-events-none">
                    {trendList.map((it, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <span className="axis-tick text-slate-500 dark:text-zinc-400">
                          {(Number(it.revenue || 0) / 1000).toFixed(0)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between px-1 pt-2">
                  {trendList.map((it, idx) => (
                    <span key={idx} className="axis-tick text-slate-400 flex-1 text-center truncate">{it.label}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center body-sm text-slate-400">
                No revenue trend data recorded.
              </div>
            )}
          </div>
        </div>

        {/* Membership Distribution & Quick Summary */}
        <div className="surface p-6 flex flex-col justify-between">
          <div>
            <h2 className="title-md text-slate-900 dark:text-white mb-1">Plan Distribution</h2>
            <p className="body-sm text-slate-500 dark:text-zinc-400 mb-6">Athletes enrolled by package</p>

            <div className="space-y-4">
              {planDistList.length > 0 ? (
                planDistList.map((planItem, idx) => {
                  const total = stats.memberCount || 1;
                  const count = Number(planItem.count || 0);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between label-md">
                        <span className="text-slate-700 dark:text-zinc-300">{planItem.name}</span>
                        <span className="text-slate-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 body-sm text-slate-400">No plan data available</div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <Link
              to="/report"
              className="label-md font-semibold text-red-500 hover:text-red-400 flex items-center gap-1"
            >
              View Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Trainer Workload & Top Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Trainer Workload */}
        <div className="surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="title-md text-slate-900 dark:text-white">Coach Workload</h2>
            <Link to="/staff" className="label-md font-semibold text-red-500 hover:underline">Manage</Link>
          </div>
          <div className="space-y-2.5">
            {trainerLoadList.length > 0 ? (
              trainerLoadList.map((tItem, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 font-bold flex items-center justify-center label-md">
                      {tItem.name?.charAt(0) || 'T'}
                    </div>
                    <span className="label-lg text-slate-800 dark:text-zinc-200">{tItem.name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-zinc-800 label-md text-slate-700 dark:text-zinc-300">
                    {tItem.assigned ?? 0} Athletes
                  </span>
                </div>
              ))
            ) : (
              <p className="body-sm text-slate-400 py-4 text-center">No assigned trainers recorded.</p>
            )}
          </div>
        </div>

        {/* Top Plans by Revenue */}
        <div className="surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="title-md text-slate-900 dark:text-white">Top Revenue Tiers</h2>
            <Link to="/plans" className="label-md font-semibold text-red-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-2.5">
            {topPlansList.length > 0 ? (
              topPlansList.map((plan, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 font-bold label-md flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="label-lg text-slate-800 dark:text-zinc-200">{plan.name || plan.planName}</span>
                  </div>
                  <span className="label-md font-semibold text-emerald-500">
                    {plan.revenue ? Number(plan.revenue).toLocaleString() : '0'} MMK
                  </span>
                </div>
              ))
            ) : (
              <p className="body-sm text-slate-400 py-4 text-center">No plan revenue metrics recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
