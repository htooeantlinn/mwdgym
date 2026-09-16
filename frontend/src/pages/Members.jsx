import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CreditCard,
  RefreshCw,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const Members = () => {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Plans and Trainers reference data
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [renewMember, setRenewMember] = useState(null);
  const [cardMember, setCardMember] = useState(null);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    planType: '',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    trainerId: '',
    status: 'Active',
  });

  // Renew Form State
  const [renewData, setRenewData] = useState({
    planType: '',
    amount: '',
    trainerId: '',
    startDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // Sorting
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // asc | desc
  const [showFilters, setShowFilters] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-zinc-600" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-red-500" />
      : <ArrowDown className="w-3 h-3 text-red-500" />;
  };

  const sortedMembers = [...members].sort((a, b) => {
    if (!sortField) return 0;
    let aVal = '', bVal = '';
    switch (sortField) {
      case 'name': aVal = (a.name || '').toLowerCase(); bVal = (b.name || '').toLowerCase(); break;
      case 'cardCode': aVal = (a.cardCode || '').toLowerCase(); bVal = (b.cardCode || '').toLowerCase(); break;
      case 'plan': aVal = (a.planType || '').toLowerCase(); bVal = (b.planType || '').toLowerCase(); break;
      case 'validity': aVal = a.endDate || ''; bVal = b.endDate || ''; break;
      case 'status': aVal = a.status || ''; bVal = b.status || ''; break;
      case 'payment': aVal = a.paymentStatus || ''; bVal = b.paymentStatus || ''; break;
      case 'trainer': aVal = (a.trainer?.displayName || '').toLowerCase(); bVal = (b.trainer?.displayName || '').toLowerCase(); break;
      default: break;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const hasActiveFilters = search || statusFilter || paymentFilter || categoryFilter;
  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setPaymentFilter(''); setCategoryFilter(''); setPage(0);
    setSortField(null); setSortDir('asc');
  };

  // Message / Error
  const [message, setMessage] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (search) params.append('name', search);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('payment', paymentFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await api.get(`/members?${params.toString()}`);
      setMembers(res.data.members || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const [plansRes, trainersRes] = await Promise.all([
        api.get('/plans'),
        api.get('/staff/trainers'),
      ]);
      setPlans(plansRes.data || []);
      setTrainers(trainersRes.data || []);
    } catch (err) {
      console.error('Failed to load plans/trainers', err);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [page, search, statusFilter, paymentFilter, categoryFilter]);

  const handlePlanSelect = (selectedPlanName) => {
    const plan = plans.find(p => p.planName === selectedPlanName);
    if (plan) {
      const start = new Date(formData.startDate || new Date());
      const end = new Date(start);
      end.setDate(end.getDate() + (plan.durationDays || 30));
      setFormData(prev => ({
        ...prev,
        planType: plan.planName,
        amount: plan.price,
        endDate: end.toISOString().split('T')[0],
      }));
    } else {
      setFormData(prev => ({ ...prev, planType: selectedPlanName }));
    }
  };

  const handleRenewPlanSelect = (selectedPlanName) => {
    const plan = plans.find(p => p.planName === selectedPlanName);
    if (plan) {
      setRenewData(prev => ({
        ...prev,
        planType: plan.planName,
        amount: plan.price,
      }));
    } else {
      setRenewData(prev => ({ ...prev, planType: selectedPlanName }));
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (editMember) {
        await api.put(`/members/${editMember.id}`, formData);
        setMessage({ type: 'success', text: 'Member updated successfully' });
      } else {
        await api.post('/members', formData);
        setMessage({ type: 'success', text: 'New member registered successfully' });
      }
      setAddModalOpen(false);
      setEditMember(null);
      fetchMembers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save member' });
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/members/${renewMember.id}/renew`, renewData);
      setMessage({ type: 'success', text: 'Membership renewed successfully' });
      setRenewMember(null);
      fetchMembers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to renew membership' });
    }
  };

  const handleQuickPay = async (id) => {
    try {
      await api.post(`/members/${id}/quick-pay`);
      setMessage({ type: 'success', text: 'Payment marked as Paid' });
      fetchMembers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Quick pay failed' });
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete member ${name}?`)) return;
    try {
      await api.delete(`/members/${id}`);
      setMessage({ type: 'success', text: 'Member deleted successfully' });
      fetchMembers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete member' });
    }
  };

  const openEditModal = (m) => {
    setEditMember(m);
    setFormData({
      name: m.name || '',
      contact: m.contact || '',
      address: m.address || '',
      planType: m.planType || '',
      amount: m.amount || '',
      startDate: m.startDate || '',
      endDate: m.endDate || '',
      trainerId: m.trainer?.id || '',
      status: m.status || 'Active',
    });
    setAddModalOpen(true);
  };

  const openRenewModal = (m) => {
    setRenewMember(m);
    setRenewData({
      planType: m.planType || (plans[0]?.planName || ''),
      amount: m.amount || (plans[0]?.price || ''),
      trainerId: m.trainer?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </span>
            Member Management
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Registered athlete profiles, card IDs, subscriptions, and training status.
          </p>
        </div>

        <button
          onClick={() => {
            setEditMember(null);
            setFormData({
              name: '',
              contact: '',
              address: '',
              planType: plans[0]?.planName || '',
              amount: plans[0]?.price || '',
              startDate: new Date().toISOString().split('T')[0],
              endDate: '',
              trainerId: '',
              status: 'Active',
            });
            setAddModalOpen(true);
          }}
          className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white label-md shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2.2} /> Add New Member
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

      {/* Search & Filter Bar — Professional Data Filter System */}
      <div className="surface overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by name, contact phone, or card ID..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition ${showFilters ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-100'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              {hasActiveFilters && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-red-500 transition">Clear</button>
            )}
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400">
              <Filter className="w-3 h-3" /> {total} total
            </span>
          </div>
        </div>
        {showFilters && (
          <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 dark:border-zinc-800/60 pt-4 bg-slate-50/50 dark:bg-zinc-900/30">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500">
                <option value="">All Statuses</option><option value="Active">Active</option><option value="Expired">Expired</option><option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment</label>
              <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(0); }} className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500">
                <option value="">All Payments</option><option value="Paid">Paid</option><option value="Not Paid">Not Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }} className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500">
                <option value="">All Categories</option><option value="BASIC">Basic</option><option value="PREMIUM">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sort by</label>
              <select value={sortField || ''} onChange={(e) => { if (e.target.value) handleSort(e.target.value); else { setSortField(null); setSortDir('asc'); } }} className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500">
                <option value="">Default</option><option value="name">Member Info</option><option value="cardCode">Card ID</option><option value="plan">Plan</option><option value="validity">Validity</option><option value="status">Status</option><option value="payment">Payment</option><option value="trainer">Trainer</option>
              </select>
            </div>
          </div>
        )}
        {hasActiveFilters && (
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            {search && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">Search: "{search}" <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button></span>}
            {statusFilter && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold">{statusFilter} <button onClick={() => setStatusFilter('')}><X className="w-3 h-3" /></button></span>}
            {paymentFilter && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold">{paymentFilter} <button onClick={() => setPaymentFilter('')}><X className="w-3 h-3" /></button></span>}
            {categoryFilter && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">{categoryFilter} <button onClick={() => setCategoryFilter('')}><X className="w-3 h-3" /></button></span>}
          </div>
        )}
      </div>

      {/* Members Data Table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-3.5 px-4 select-none"><button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition">Member Info {getSortIcon('name')}</button></th>
                <th className="py-3.5 px-4 select-none"><button onClick={() => handleSort('cardCode')} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition">Card ID {getSortIcon('cardCode')}</button></th>
                <th className="py-3.5 px-4 select-none"><button onClick={() => handleSort('plan')} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition">Plan & Fee {getSortIcon('plan')}</button></th>
                <th className="py-3.5 px-4 select-none"><button onClick={() => handleSort('validity')} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition">Validity {getSortIcon('validity')}</button></th>
                <th className="py-3.5 px-4 select-none"><button onClick={() => handleSort('status')} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition">Status {getSortIcon('status')}</button></th>
                <th className="py-3.5 px-4 select-none"><button onClick={() => handleSort('payment')} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition">Payment {getSortIcon('payment')}</button></th>
                <th className="py-3.5 px-4 select-none"><button onClick={() => handleSort('trainer')} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition">Trainer {getSortIcon('trainer')}</button></th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                    No members match the query filters.
                  </td>
                </tr>
              ) : (
                sortedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/30 transition">
                    {/* Member Info */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                        <span className="text-xs text-slate-400">{m.contact || 'No contact'}</span>
                      </div>
                    </td>

                    {/* Card Code */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setCardMember(m)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 hover:bg-red-500/10 hover:text-red-500 transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        {m.cardCode || 'CARD'}
                      </button>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block text-xs">{m.planType}</span>
                      <span className="text-xs font-bold text-emerald-500">
                        {m.amount ? Number(m.amount).toLocaleString() : '0'} MMK
                      </span>
                    </td>

                    {/* Validity */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-600 dark:text-zinc-300">
                        <span>{m.startDate || '-'}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-semibold">{m.endDate || '-'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          m.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : m.status === 'Expired'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {m.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        {m.status}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            m.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {m.paymentStatus || 'Not Paid'}
                        </span>
                        {m.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handleQuickPay(m.id)}
                            title="Mark Paid"
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Trainer */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                        {m.trainer?.displayName || 'Unassigned'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openRenewModal(m)}
                          title="Renew Membership"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit Member"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id, m.name)}
                          title="Delete Member"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>Showing {members.length} of {total} members</span>
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

      {/* Add / Edit Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {editMember ? 'Edit Member Profile' : 'Register New Member'}
              </h2>
              <button onClick={() => setAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Plan Package
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => handlePlanSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Choose Plan --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.planName}>{p.planName} ({p.durationDays}d)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Fee (MMK)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Assigned Trainer
                </label>
                <select
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- No Trainer Assigned --</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.displayName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {renewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Renew Subscription</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Member: {renewMember.name}</p>
              </div>
              <button onClick={() => setRenewMember(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Select Plan
                </label>
                <select
                  value={renewData.planType}
                  onChange={(e) => handleRenewPlanSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.planName}>{p.planName} - {Number(p.price).toLocaleString()} MMK</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Amount (MMK)
                </label>
                <input
                  type="number"
                  value={renewData.amount}
                  onChange={(e) => setRenewData({ ...renewData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={renewData.startDate}
                  onChange={(e) => setRenewData({ ...renewData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRenewMember(null)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Card / QR Code Modal */}
      {cardMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setCardMember(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black">M</div>
                <span className="font-extrabold tracking-tight">MWD GYM PASS</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                {cardMember.status}
              </span>
            </div>

            <div className="text-center py-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 mx-auto flex items-center justify-center text-3xl font-black mb-4 ring-4 ring-red-500/20">
                {cardMember.name.charAt(0)}
              </div>
              <h3 className="text-xl font-black">{cardMember.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{cardMember.planType} Member</p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Card ID</span>
                <span className="font-mono font-bold text-white">{cardMember.cardCode || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Valid Until</span>
                <span className="font-semibold text-white">{cardMember.endDate || '-'}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full mt-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Print Gym Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
