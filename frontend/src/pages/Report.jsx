import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  FileText,
  TrendingUp,
  Download,
  Printer,
  Users,
  CreditCard,
  Layers,
  Award,
  Calendar
} from 'lucide-react';

export const Report = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/overview');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const exportCSV = async (type) => {
    setExporting(true);
    try {
      const res = await api.get(`/reports/${type}`);
      const items = res.data || [];
      if (items.length === 0) {
        alert('No data to export');
        return;
      }
      const headers = Object.keys(items[0]).join(',');
      const rows = items.map(obj =>
        Object.values(obj).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `mwdgym_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};

  // Safely parse revenue trend
  const trendList = Array.isArray(data?.revenueTrend)
    ? data.revenueTrend
    : data?.revenueTrend?.labels?.map((label, i) => ({
        label: label.split(' ')[0],
        revenue: Number(data.revenueTrend.values?.[i] || 0),
      })) || [];

  const maxRevenue = Math.max(...trendList.map(t => Number(t.revenue || 0)), 100000);

  // Safely parse plan distribution
  const planDistList = Array.isArray(data?.planDistribution)
    ? data.planDistribution
    : data?.planDistribution && typeof data.planDistribution === 'object'
    ? Object.entries(data.planDistribution).map(([name, count]) => ({ name, count: Number(count) }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </span>
            Financial & Member Reports
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Comprehensive gym analytics, membership churn, income projections, and CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => exportCSV('members')}
            disabled={exporting}
            className="h-9 px-3 sm:px-3.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 label-md hover:bg-slate-50 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export Members CSV</span><span className="sm:hidden">Members CSV</span>
          </button>
          <button
            onClick={() => exportCSV('payments')}
            disabled={exporting}
            className="h-9 px-3 sm:px-3.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 label-md hover:bg-slate-50 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export Payments CSV</span><span className="sm:hidden">Payments CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="h-9 px-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white label-md shadow-md shadow-red-600/20 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface p-5">
          <span className="overline text-slate-500 dark:text-zinc-500">Total Registered</span>
          <p className="display-1 text-slate-900 dark:text-white mt-2">{stats.memberCount ?? 0}</p>
        </div>

        <div className="surface p-5">
          <span className="overline text-slate-500 dark:text-zinc-500">Active Retained</span>
          <p className="display-1 text-emerald-500 mt-2">{stats.activeCount ?? 0}</p>
        </div>

        <div className="surface p-5">
          <span className="overline text-slate-500 dark:text-zinc-500">Expired Members</span>
          <p className="display-1 text-rose-500 mt-2">{stats.expiredCount ?? 0}</p>
        </div>

        <div className="surface p-5">
          <span className="overline text-slate-500 dark:text-zinc-500">Monthly Revenue</span>
          <p className="display-1 text-slate-900 dark:text-white mt-2">
            {stats.revenueMmk ? Number(stats.revenueMmk).toLocaleString() : '0'} <span className="overline text-slate-400">MMK</span>
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 12-Month Revenue History */}
        <div className="surface p-6 overflow-hidden">
          <h2 className="title-md text-slate-900 dark:text-white mb-1">12-Month Revenue History</h2>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mb-6">Financial performance trajectory</p>

          <div className="h-64 flex items-end gap-1 sm:gap-2 pt-6 pb-2 px-1 overflow-x-auto scrollbar-thin">
            {trendList.length > 0 ? (
              trendList.map((item, idx) => {
                const rev = Number(item.revenue || 0);
                const heightPercent = Math.max(Math.round((rev / maxRevenue) * 100), 8);
                return (
                  <div key={idx} className="flex-1 min-w-[26px] sm:min-w-0 flex flex-col items-center h-full justify-end group">
                    <div className="axis-tick text-slate-400 opacity-0 group-hover:opacity-100 transition mb-1 whitespace-nowrap">
                      {(rev / 1000).toFixed(0)}k
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-red-600 to-rose-500 rounded-t-lg group-hover:brightness-110 transition shadow-sm"
                    ></div>
                    <span className="axis-tick text-slate-400 mt-2 truncate w-full text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center body-sm text-slate-400">
                No revenue records recorded.
              </div>
            )}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="surface p-6">
          <h2 className="title-md text-slate-900 dark:text-white mb-1">Plan Distribution Breakdown</h2>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mb-6">Enrolled packages proportion</p>

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
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
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
      </div>
    </div>
  );
};
