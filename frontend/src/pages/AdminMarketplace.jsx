import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Store,
  FileText,
  Eye,
  Archive,
  DollarSign,
  Users,
  Star,
  X,
  AlertTriangle,
  Clock,
  Filter,
  RotateCcw,
  Coins,
  CreditCard,
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Pending Review' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'ARCHIVED', label: 'Archived' },
];

const statusBadge = (status) => {
  const map = {
    DRAFT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    ARCHIVED: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return map[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
};

const statusIcon = (status) => {
  const map = {
    DRAFT: <Clock className="w-3 h-3" />,
    PUBLISHED: <CheckCircle2 className="w-3 h-3" />,
    ARCHIVED: <Archive className="w-3 h-3" />,
  };
  return map[status] || null;
};

export const AdminMarketplace = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const [mainTab, setMainTab] = useState('plans');
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [subStatusFilter, setSubStatusFilter] = useState('ALL');
  const [subSearch, setSubSearch] = useState('');
  const [refundConfirm, setRefundConfirm] = useState(null);
  const [refundAction, setRefundAction] = useState('approve');
  const [refundAdminNotes, setRefundAdminNotes] = useState('');
  const [refundRejectReason, setRefundRejectReason] = useState('');
  const [refundingId, setRefundingId] = useState(null);

  const [topupUserId, setTopupUserId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketplace/admin/plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load admin plans', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filtered = plans.filter((p) => {
    if (activeTab !== 'ALL' && p.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.trainerName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: plans.length,
    draft: plans.filter((p) => p.status === 'DRAFT').length,
    published: plans.filter((p) => p.status === 'PUBLISHED').length,
    archived: plans.filter((p) => p.status === 'ARCHIVED').length,
  };

  const totalRevenue = plans.reduce(
    (sum, p) => sum + (Number(p.priceMmk || 0) * Number(p.totalPurchases || 0)),
    0
  );

  const totalActiveSubscribers = plans.reduce(
    (sum, p) => sum + Number(p.activeSubscribers || 0),
    0
  );

  const handleApprove = async (planId) => {
    setProcessingId(planId);
    try {
      await api.post(`/marketplace/admin/plans/${planId}/approve`);
      await fetchPlans();
    } catch (err) {
      console.error('Approve failed', err);
    } finally {
      setProcessingId(null);
      setConfirmAction(null);
    }
  };

  const handleReject = async (planId) => {
    setProcessingId(planId);
    try {
      await api.post(`/marketplace/admin/plans/${planId}/reject`);
      await fetchPlans();
    } catch (err) {
      console.error('Reject failed', err);
    } finally {
      setProcessingId(null);
      setConfirmAction(null);
    }
  };

  const fetchSubscriptions = useCallback(async () => {
    setSubscriptionsLoading(true);
    try {
      const res = await api.get('/marketplace/admin/subscriptions');
      setSubscriptions(res.data || []);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
    } finally {
      setSubscriptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === 'subscriptions') {
      fetchSubscriptions();
    }
  }, [mainTab, fetchSubscriptions]);

  const handleRefund = async (subscriptionId) => {
    setRefundingId(subscriptionId);
    try {
      await api.post(`/marketplace/admin/subscriptions/${subscriptionId}/refund`, {
        action: refundAction,
        adminNotes: refundAdminNotes.trim(),
        rejectReason: refundRejectReason.trim(),
      });
      await fetchSubscriptions();
    } catch (err) {
      console.error('Refund action failed', err);
    } finally {
      setRefundingId(null);
      setRefundConfirm(null);
      setRefundAction('approve');
      setRefundAdminNotes('');
      setRefundRejectReason('');
    }
  };

  const handleTopup = async () => {
    if (!topupUserId.trim() || !topupAmount || Number(topupAmount) <= 0) return;
    setTopupLoading(true);
    setTopupSuccess('');
    try {
      const res = await api.post('/marketplace/admin/coins/topup', {
        userId: topupUserId.trim(),
        amount: Number(topupAmount),
      });
      setTopupSuccess(
        `Successfully topped up ${Number(topupAmount).toLocaleString()} coins. New balance: ${Number(res.data?.newBalance || 0).toLocaleString()} coins.`
      );
      setTopupUserId('');
      setTopupAmount('');
    } catch (err) {
      console.error('Top-up failed', err);
    } finally {
      setTopupLoading(false);
    }
  };

  const renderConfirmDialog = () => {
    if (!confirmAction) return null;
    const isApprove = confirmAction.type === 'approve';
    const plan = plans.find((p) => p.id === confirmAction.planId);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isApprove
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isApprove ? 'Approve Plan' : 'Reject Plan'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Cannot be undone
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-300">
            {isApprove
              ? `Publish "${plan?.title}" to marketplace? It will be visible to all members.`
              : `Archive "${plan?.title}"? It will be removed from marketplace.`}
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                isApprove
                  ? handleApprove(confirmAction.planId)
                  : handleReject(confirmAction.planId)
              }
              disabled={processingId === confirmAction.planId}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {processingId === confirmAction.planId ? (
                <span className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isApprove ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRefundDialog = () => {
    if (!refundConfirm) return null;
    const sub = subscriptions.find((s) => s.id === refundConfirm.id);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Review Refund</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Verify proof before approving</p>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">User</span><span className="font-medium text-slate-900 dark:text-white truncate ml-2">{sub?.userName || `User #${sub?.userId}`}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Plan</span><span className="font-medium text-slate-900 dark:text-white truncate ml-2">{sub?.planTitle || `Plan #${sub?.planId}`}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Amount</span><span className="font-bold text-red-500">{Number(sub?.pricePaidMmk || 0).toLocaleString()} coins</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Reason</span><span className="text-slate-700 dark:text-zinc-300 truncate ml-2">{sub?.cancellationReason || 'No reason'}</span></div>
          </div>

          {/* Payment Proof */}
          {(sub?.refundPaymentMethod || sub?.refundTransferId || sub?.refundScreenshotUrl) && (
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 space-y-1.5 text-xs">
              <p className="font-bold text-blue-700 dark:text-blue-400 text-[11px] uppercase">Payment Proof</p>
              {sub?.refundPaymentMethod && <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Method</span><span className="font-medium text-slate-900 dark:text-white">{sub.refundPaymentMethod}</span></div>}
              {sub?.refundTransferId && <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Transfer ID</span><span className="font-medium text-slate-900 dark:text-white font-mono truncate ml-2">{sub.refundTransferId}</span></div>}
              {sub?.refundScreenshotUrl && (
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Screenshot:</span>
                  <a href={sub.refundScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block mt-1">
                    <img src={sub.refundScreenshotUrl} alt="Transfer proof" className="w-full max-h-48 object-contain rounded-xl border border-slate-200 dark:border-zinc-700" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Decision */}
          <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Decision</p>
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <button onClick={() => setRefundAction('approve')} className={`p-2.5 rounded-xl border text-left transition ${refundAction === 'approve' ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500" : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"}`}>
              <p className={`text-xs font-bold ${refundAction === 'approve' ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-zinc-300"}`}>✓ Approve</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Return {Number(sub?.pricePaidMmk || 0).toLocaleString()} coins</p>
            </button>
            <button onClick={() => setRefundAction('reject')} className={`p-2.5 rounded-xl border text-left transition ${refundAction === 'reject' ? "bg-red-50 dark:bg-red-950/30 border-red-500 ring-1 ring-red-500" : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"}`}>
              <p className={`text-xs font-bold ${refundAction === 'reject' ? "text-red-700 dark:text-red-400" : "text-slate-700 dark:text-zinc-300"}`}>✕ Reject</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Keep subscription</p>
            </button>
          </div>

          {refundAction === 'approve' ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">Note to client (optional)</label>
              <input type="text" value={refundAdminNotes} onChange={e => setRefundAdminNotes(e.target.value)} placeholder="Coins returned to balance" className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Client will see: Refunded — coins returned</p>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-red-600 dark:text-red-400 mb-1">Reason for rejection *</label>
              <textarea value={refundRejectReason} onChange={e => setRefundRejectReason(e.target.value)} rows={2} placeholder="Explain why — client will see this" className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              <p className="text-[10px] text-red-500 mt-1">Client will see this in My Purchases</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={() => { setRefundConfirm(null); setRefundAction('approve'); setRefundAdminNotes(''); setRefundRejectReason(''); }} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition">Cancel</button>
            <button onClick={() => handleRefund(refundConfirm.id)} disabled={refundingId === refundConfirm.id || (refundAction === 'reject' && !refundRejectReason.trim())} className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 ${refundAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>
              {refundingId === refundConfirm.id ? <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</span> : refundAction === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-400">
            Loading plans...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {renderConfirmDialog()}

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white">
            Marketplace Admin
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
            Review and manage workout plans.
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl w-fit">
        {[
          { key: 'plans', label: 'Plans', icon: Store },
          { key: 'subscriptions', label: 'Subs', icon: CreditCard },
          { key: 'coins', label: 'Coins', icon: Coins },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition ${
                mainTab === tab.key
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <div className="surface p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 truncate">
              Total
            </span>
            <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-500">
              <Store className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </span>
        </div>

        <div className="surface p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 truncate">
              Pending
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          <span className="text-xl font-black text-amber-500">{stats.draft}</span>
        </div>

        <div className="surface p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
              Published
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          <span className="text-xl font-black text-emerald-500">{stats.published}</span>
        </div>

        <div className="surface p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
              Archived
            </span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <Archive className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          <span className="text-xl font-black text-red-500">{stats.archived}</span>
        </div>

        <div className="surface p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 truncate">
              Active Subs
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <CreditCard className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          <span className="text-xl font-black text-blue-500">
            {subscriptions.filter((s) => s.status === 'ACTIVE').length}
          </span>
        </div>

        <div className="surface p-3 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 truncate">
              Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Coins className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          <span className="text-xl font-black text-emerald-500 truncate">
            {subscriptions
              .reduce((sum, s) => sum + Number(s.planPriceMmk || 0), 0)
              .toLocaleString()}
          </span>
        </div>
      </div>

      {/* Plans Tab Content */}
      {mainTab === 'plans' && (
      <>
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or trainer..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label === 'Pending Review' ? 'Pending' : tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Table - Desktop */}
      <div className="hidden md:block surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800/60">
                <th className="text-left px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Title
                </th>
                <th className="text-left px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Trainer
                </th>
                <th className="text-left px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Category
                </th>
                <th className="text-right px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Price
                </th>
                <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Status
                </th>
                <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Purchases
                </th>
                <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Rating
                </th>
                <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center">
                    <Store className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      No plans found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {search
                        ? 'Try adjusting your search.'
                        : 'No plans match the filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition"
                  >
                    <td className="px-3 py-2.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {plan.title}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[180px]">
                        {plan.description?.slice(0, 50)}
                        {plan.description?.length > 50 ? '...' : ''}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-400 font-medium text-xs truncate max-w-[120px]">
                      {plan.trainerName}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                        {plan.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-black text-red-500">
                        {Number(plan.priceMmk || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-0.5">
                        Coins
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(
                          plan.status
                        )}`}
                      >
                        {statusIcon(plan.status)}
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      {plan.totalPurchases || 0}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-500 font-semibold text-xs">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {plan.rating?.toFixed(1) || '0.0'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {(plan.status === 'DRAFT' || plan.status === 'ARCHIVED') && (
                          <>
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: 'approve',
                                  planId: plan.id,
                                })
                              }
                              disabled={processingId === plan.id}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: 'reject',
                                  planId: plan.id,
                                })
                              }
                              disabled={processingId === plan.id}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <Link
                          to={`/marketplace/${plan.id}`}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                          title="View"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans Card List - Mobile */}
      <div className="md:hidden space-y-2.5">
        {filtered.length === 0 ? (
          <div className="surface p-8 text-center">
            <Store className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              No plans found
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {search
                ? 'Try adjusting search.'
                : 'No plans match the filter.'}
            </p>
          </div>
        ) : (
          filtered.map((plan) => (
            <div
              key={plan.id}
              className="surface p-3 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {plan.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                    by {plan.trainerName}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(
                    plan.status
                  )}`}
                >
                  {statusIcon(plan.status)}
                  {plan.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-2 border border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Category
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    {plan.category}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Purchases
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    {plan.totalPurchases || 0}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Rating
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {plan.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-black text-red-500">
                  {Number(plan.priceMmk || 0).toLocaleString()}
                  <span className="text-[10px] text-slate-400 ml-0.5">
                    Coins
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  {(plan.status === 'DRAFT' || plan.status === 'ARCHIVED') && (
                    <>
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'approve',
                            planId: plan.id,
                          })
                        }
                        disabled={processingId === plan.id}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'reject',
                            planId: plan.id,
                          })
                        }
                        disabled={processingId === plan.id}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <Link
                    to={`/marketplace/${plan.id}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bulk Summary */}
      <div className="surface p-3.5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                Revenue
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {totalRevenue.toLocaleString()}
                <span className="text-[10px] font-semibold text-slate-400 ml-1">
                  Coins
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                Active Subs
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {totalActiveSubscribers.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                Awaiting Review
              </p>
              <p className="text-sm font-black text-amber-500">
                {stats.draft}
              </p>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Subscriptions Tab Content */}
      {mainTab === 'subscriptions' && (
        <div className="space-y-3">
          {renderRefundDialog()}

          {/* Subscriptions Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Search user or plan..."
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition"
              />
              {subSearch && (
                <button
                  onClick={() => setSubSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl">
              {['ALL', 'ACTIVE', 'CANCELLED', 'EXPIRED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSubStatusFilter(status)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition ${
                    subStatusFilter === status
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Subscriptions Table - Desktop */}
          <div className="hidden md:block surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/60">
                    <th className="text-left px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                      User
                    </th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                      Plan
                    </th>
                    <th className="text-right px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                      Price
                    </th>
                    <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                      Type
                    </th>
                    <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                      Status
                    </th>
                    <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                      Purchased
                    </th>
                    <th className="text-center px-3 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {subscriptionsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-12 text-center">
                        <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-slate-400 mt-2">Loading...</p>
                      </td>
                    </tr>
                  ) : (() => {
                    const filteredSubs = subscriptions.filter((s) => {
                      if (subStatusFilter !== 'ALL' && s.status !== subStatusFilter) return false;
                      if (subSearch.trim()) {
                        const q = subSearch.toLowerCase();
                        return (
                          s.userName?.toLowerCase().includes(q) ||
                          s.planTitle?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    });
                    return filteredSubs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-12 text-center">
                          <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                            No subs found
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {subSearch
                              ? 'Try adjusting search.'
                              : 'No subs match the filter.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredSubs.map((sub) => {
                        const subBadge = {
                          ACTIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                          CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
                          EXPIRED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                        };
                        return (
                          <tr
                            key={sub.id}
                            className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition"
                          >
                            <td className="px-3 py-2.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                                {sub.userName}
                              </p>
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 dark:text-zinc-400 font-medium text-xs truncate max-w-[160px]">
                              {sub.planTitle}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-xs font-black text-red-500">
                                {Number(sub.planPriceMmk || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-0.5">
                                coins
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                              {sub.subscriptionType || 'N/A'}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  subBadge[sub.status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center text-[11px] text-slate-500 dark:text-zinc-400">
                              {sub.purchaseDate
                                ? new Date(sub.purchaseDate).toLocaleDateString()
                                : 'N/A'}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {(sub.status === 'ACTIVE' || sub.refundStatus === 'REQUESTED') && (
                                <button
                                  onClick={() => { setRefundConfirm({ id: sub.id }); setRefundAction('approve'); setRefundAdminNotes(''); setRefundRejectReason(''); }}
                                  disabled={refundingId === sub.id}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition disabled:opacity-50 ${
                                    sub.refundStatus === 'REQUESTED'
                                      ? 'bg-amber-500 hover:bg-amber-400 text-white'
                                      : 'bg-red-600 hover:bg-red-500 text-white'
                                  }`}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  {sub.refundStatus === 'REQUESTED' ? 'Review' : 'Refund'}
                                </button>
                              )}
                              {sub.refundStatus === 'APPROVED' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  Approved
                                </span>
                              )}
                              {sub.refundStatus === 'REJECTED' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  Rejected
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subscriptions Card List - Mobile */}
          <div className="md:hidden space-y-2.5">
            {subscriptionsLoading ? (
              <div className="surface p-8 text-center">
                <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading...</p>
              </div>
            ) : (() => {
              const filteredSubs = subscriptions.filter((s) => {
                if (subStatusFilter !== 'ALL' && s.status !== subStatusFilter) return false;
                if (subSearch.trim()) {
                  const q = subSearch.toLowerCase();
                  return (
                    s.userName?.toLowerCase().includes(q) ||
                    s.planTitle?.toLowerCase().includes(q)
                  );
                }
                return true;
              });
              return filteredSubs.length === 0 ? (
                <div className="surface p-8 text-center">
                  <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    No subs found
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {subSearch
                      ? 'Try adjusting search.'
                      : 'No subs match the filter.'}
                  </p>
                </div>
              ) : (
                filteredSubs.map((sub) => {
                  const subBadge = {
                    ACTIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
                    EXPIRED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                  };
                  return (
                    <div
                      key={sub.id}
                      className="surface p-3 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {sub.userName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                            {sub.planTitle}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            subBadge[sub.status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-2 border border-slate-100 dark:border-zinc-800">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400">
                            Price
                          </span>
                          <span className="font-bold text-red-500">
                            {Number(sub.planPriceMmk || 0).toLocaleString()}
                            <span className="text-[10px] text-slate-400 ml-0.5">coins</span>
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400">
                            Type
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">
                            {sub.subscriptionType || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400">
                            Purchased
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">
                            {sub.purchaseDate
                              ? new Date(sub.purchaseDate).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {(sub.status === 'ACTIVE' || sub.refundStatus === 'REQUESTED') && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => { setRefundConfirm({ id: sub.id }); setRefundAction('approve'); setRefundAdminNotes(''); setRefundRejectReason(''); }}
                            disabled={refundingId === sub.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-50 ${
                              sub.refundStatus === 'REQUESTED'
                                ? 'bg-amber-500 hover:bg-amber-400 text-white'
                                : 'bg-red-600 hover:bg-red-500 text-white'
                            }`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            {sub.refundStatus === 'REQUESTED' ? 'Review' : 'Refund'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              );
            })()}
          </div>
        </div>
      )}

      {/* Coin Management Tab Content */}
      {mainTab === 'coins' && (
        <div className="space-y-3">
          <div className="surface p-4 max-w-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Coin Top-Up
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Add coins to user balance
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  User ID or Username
                </label>
                <input
                  type="text"
                  value={topupUserId}
                  onChange={(e) => setTopupUserId(e.target.value)}
                  placeholder="User ID or username..."
                  className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  Amount (coins)
                </label>
                <input
                  type="number"
                  min="1"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Amount..."
                  className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition"
                />
              </div>
              <button
                onClick={handleTopup}
                disabled={topupLoading || !topupUserId.trim() || !topupAmount || Number(topupAmount) <= 0}
                className="w-full h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {topupLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="w-3.5 h-3.5" />
                    Top Up
                  </>
                )}
              </button>
            </div>

            {topupSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {topupSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
