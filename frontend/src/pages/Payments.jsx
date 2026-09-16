import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchMember, setSearchMember] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (searchMember) params.append('member', searchMember);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/payments?${params.toString()}`);
      setPayments(res.data.payments || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPaidCount(res.data.paidCount || 0);
      setUnpaidCount(res.data.unpaidCount || 0);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, searchMember, statusFilter]);

  const handleMarkPaid = async (id) => {
    try {
      await api.post(`/payments/${id}/mark-paid`);
      setMessage({ type: 'success', text: 'Invoice marked as Paid' });
      fetchPayments();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update payment' });
    }
  };

  const handleMarkUnpaid = async (id) => {
    try {
      await api.post(`/payments/${id}/mark-unpaid`);
      setMessage({ type: 'success', text: 'Invoice marked as Unpaid' });
      fetchPayments();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update payment' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-white" />
            </span>
            Payment History & Invoices
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Track member transaction records, dues, and payment statuses.
          </p>
        </div>
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

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 surface flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Invoices</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{total}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 surface flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Paid Invoices</span>
            <p className="text-2xl font-black text-emerald-500 mt-1">{paidCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 surface flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Pending Dues</span>
            <p className="text-2xl font-black text-amber-500 mt-1">{unpaidCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="p-4 surface flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchMember}
            onChange={(e) => {
              setSearchMember(e.target.value);
              setPage(0);
            }}
            placeholder="Search payments by member name..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 focus:outline-none w-full md:w-auto"
        >
          <option value="">All Payment Statuses</option>
          <option value="Paid">Paid Only</option>
          <option value="Not Paid">Not Paid Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">#{p.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {p.member?.name || 'Unknown Member'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-zinc-300">
                      {p.member?.planType || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-500">
                      {p.amount ? Number(p.amount).toLocaleString() : '0'} MMK
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-zinc-400">
                      {p.paymentDate || 'Pending'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {p.status === 'Paid' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'Paid' ? (
                        <button
                          onClick={() => handleMarkUnpaid(p.id)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 transition"
                        >
                          Mark Unpaid
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>Showing {payments.length} of {total} records</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page + 1} of {totalPages || 1}</span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
