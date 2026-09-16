import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

export const Staff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    role: 'STAFF',
    showOnHome: false,
    permissions: ['MEMBERS', 'PAYMENTS'],
  });

  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load staff users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await api.put(`/staff/${editUser.id}`, formData);
        setMessage({ type: 'success', text: 'Staff account updated' });
      } else {
        await api.post('/staff', formData);
        setMessage({ type: 'success', text: 'Staff account created' });
      }
      setModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save staff user' });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.post(`/staff/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle account' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user account "${name}"?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      setMessage({ type: 'success', text: 'User deleted' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setFormData({
      username: u.username || '',
      displayName: u.displayName || '',
      password: '',
      role: u.role || 'STAFF',
      showOnHome: u.showOnHome ?? false,
      permissions: u.permissions ? Array.from(u.permissions) : [],
    });
    setModalOpen(true);
  };

  const togglePermission = (perm) => {
    setFormData(prev => {
      const perms = prev.permissions || [];
      if (perms.includes(perm)) {
        return { ...prev, permissions: perms.filter(p => p !== perm) };
      } else {
        return { ...prev, permissions: [...perms, perm] };
      }
    });
  };

  const availablePermissions = ['MEMBERS', 'PAYMENTS', 'INVENTORY', 'REPORTS'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-white" />
            </span>
            Staff & Role Management
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage admin, staff, and trainer user accounts and grant module access permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditUser(null);
            setFormData({
              username: '',
              displayName: '',
              password: '',
              role: 'STAFF',
              showOnHome: false,
              permissions: ['MEMBERS', 'PAYMENTS'],
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Staff / Coach
        </button>
      </div>

      {/* Alert */}
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

      {/* Table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Module Permissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                          {u.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{u.displayName}</span>
                          {u.showOnHome && (
                            <span className="text-[10px] text-blue-500 font-semibold">Featured on Home</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{u.username}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            : u.role === 'TRAINER'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : u.role === 'STAFF'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.role === 'ADMIN' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">
                            FULL ACCESS
                          </span>
                        ) : u.permissions && u.permissions.length > 0 ? (
                          u.permissions.map((p, pidx) => (
                            <span
                              key={pidx}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
                          u.active
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}
                      >
                        {u.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.displayName)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {editUser ? 'Edit Staff Account' : 'Add Staff / Coach'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Coach David"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editUser}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="coach_david"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Password {editUser && '(leave blank to keep unchanged)'}
                </label>
                <input
                  type="password"
                  required={!editUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Assigned Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="STAFF">Staff</option>
                  <option value="TRAINER">Trainer / Coach</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="CLIENT">Client</option>
                </select>
              </div>

              {formData.role !== 'ADMIN' && formData.role !== 'CLIENT' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-2">
                    Module Access Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions?.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        {perm}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.role === 'TRAINER' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  Showcase Coach on Public Landing Page
                </label>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
