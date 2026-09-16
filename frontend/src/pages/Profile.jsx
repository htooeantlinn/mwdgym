import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  CreditCard,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  QrCode,
  Save,
  Dumbbell,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  X,
  Coins,
  ShoppingBag,
  MapPin,
  Phone,
  Home,
  Package
} from 'lucide-react';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit display name
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Change password
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [message, setMessage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef(null);

  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryTownship, setDeliveryTownship] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);

  const handleImageUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'Image too large (max 5MB)' }); return; }
    // accept all image types: png, jpg, jpeg, gif, webp, svg, bmp
    const isImage = f.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|ico|avif)$/i.test(f.name);
    if (!isImage) { setMessage({ type: 'error', text: 'Only images allowed (png, jpg, jpeg, gif, webp, svg)' }); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await api.post('/profile/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfileImage(res.data.profileImage);
      setMessage({ type: 'success', text: 'Profile photo updated — will appear on home page for trainers if enabled' });
      refreshUser();
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload image' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!profileImage) return;
    if (!window.confirm('Remove profile photo?')) return;
    try {
      await api.delete('/profile/image');
      setProfileImage(null);
      setMessage({ type: 'success', text: 'Profile photo removed' });
      refreshUser();
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove photo' });
    }
  };

  const handleDeleteProfile = async () => {
    const confirmText = window.prompt('Type DELETE to confirm deleting your account. This cannot be undone.');
    if (confirmText !== 'DELETE') {
      if (confirmText !== null) setMessage({ type: 'error', text: 'Type DELETE exactly to confirm' });
      return;
    }
    if (!window.confirm('Are you absolutely sure? Your account and member data will be deleted and you will be logged out.')) return;
    try {
      await api.delete('/profile');
      setMessage({ type: 'success', text: 'Profile deleted. Redirecting...' });
      setTimeout(() => { window.location.href = '/login'; }, 800);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete profile' });
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile');
      setProfileData(res.data);
      setDisplayName(res.data?.displayName || '');
      setProfileImage(res.data?.profileImage || null);
      setDeliveryName(res.data?.defaultDeliveryName || res.data?.displayName || '');
      setDeliveryPhone(res.data?.defaultDeliveryPhone || '');
      setDeliveryAddress(res.data?.defaultDeliveryAddress || res.data?.member?.address || '');
      setDeliveryCity(res.data?.defaultDeliveryCity || '');
      setDeliveryTownship(res.data?.defaultDeliveryTownship || '');
      setDeliveryNote(res.data?.defaultDeliveryNote || '');
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await api.put('/profile', { displayName });
      setMessage({ type: 'success', text: 'Profile display name updated' });
      refreshUser();
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveDelivery = async (e) => {
    e.preventDefault();
    setSavingDelivery(true);
    try {
      await api.put('/profile', {
        defaultDeliveryName: deliveryName,
        defaultDeliveryPhone: deliveryPhone,
        defaultDeliveryAddress: deliveryAddress,
        defaultDeliveryCity: deliveryCity,
        defaultDeliveryTownship: deliveryTownship,
        defaultDeliveryNote: deliveryNote,
      });
      setMessage({ type: 'success', text: 'Default delivery address saved — used for shop orders' });
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save address' });
    } finally { setSavingDelivery(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/profile/password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const p = profileData || user;
  const member = profileData?.member;
  const payments = profileData?.payments || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <User className="w-7 h-7 text-red-600" />
          User Profile & Membership Pass
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Account credentials, assigned coach, gym membership validity, and payment records.
        </p>
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

      {/* Profile Overview Card — now for ALL users with photo */}
      <div className="p-6 sm:p-8 surface flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group">
            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-red-600/30">
              {profileImage ? <img src={profileImage} alt="profile" className="w-full h-full object-cover" /> : (p?.displayName?.charAt(0) || 'U')}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-red-500 transition" title="Upload profile photo (shows on home page for trainers)">
              {uploading ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{p?.displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                {p?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1">@{p?.username}</p>
            <p className="text-xs text-slate-400 mt-2">
              Member since {p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : '2026'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setPasswordModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold text-xs transition flex items-center gap-2"
        >
          <Lock className="w-3.5 h-3.5" /> Change Password
        </button>
      </div>

      {/* Coin Balance & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent border border-amber-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Coin Balance</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {Number(user?.coinBalance || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Use coins to purchase workout plans from trainers
          </p>
        </div>
        <a
          href="/marketplace"
          className="p-5 rounded-2xl bg-gradient-to-br from-red-500/15 via-rose-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 transition group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-red-500/10">
              <ShoppingBag className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Marketplace</p>
              <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-red-500 transition">
                Browse Workout Plans
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Shop plans from certified trainers
          </p>
        </a>
      </div>

      {/* Client Specific Membership Details */}
      {member && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-600/15 via-rose-500/5 to-transparent border border-red-500/20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Active Membership Plan
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {member.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Package Tier</span>
                <span className="font-black text-sm text-slate-900 dark:text-white">{member.planType || 'Standard'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Digital Pass ID</span>
                <span className="font-mono font-bold text-sm text-red-500">{member.cardCode || 'N/A'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Coach</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{member.trainer?.displayName || 'Gym Floor'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expiration Date</span>
                <span className="font-bold text-sm text-emerald-500">{member.endDate || 'Active'}</span>
              </div>
            </div>
          </div>

          {/* Payment Invoices for Client */}
          {payments.length > 0 && (
            <div className="p-6 sm:p-8 surface space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Payment Receipts</h3>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {payments.map(py => (
                  <div key={py.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Invoice #{py.id}</span>
                      <span className="text-slate-400">{py.paymentDate || 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-500">
                        {py.amount ? Number(py.amount).toLocaleString() : '0'} MMK
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        py.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {py.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Form */}
      <form onSubmit={handleUpdateName} className="p-6 sm:p-8 surface space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Profile Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              disabled
              value={p?.username || ''}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-500 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {profileImage && (
              <button type="button" onClick={handleDeleteImage} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Remove Photo
              </button>
            )}
            <span className="text-[11px] text-slate-400">Supports png, jpg, jpeg, gif, webp, svg, bmp — max 5MB</span>
          </div>
          <button
            type="submit"
            disabled={savingName}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center gap-2"
          >
            {savingName ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Default Delivery Address — for Shop */}
      <form onSubmit={handleSaveDelivery} className="p-6 sm:p-8 surface space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-red-600" /> Default Delivery Address</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Used automatically for shop orders. You can edit at checkout too.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={deliveryName} onChange={e=>setDeliveryName(e.target.value)} placeholder="Recipient name" className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={deliveryPhone} onChange={e=>setDeliveryPhone(e.target.value)} placeholder="09 xxx xxx xxx" className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">Street Address</label>
          <div className="relative">
            <Home className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <textarea value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} rows={2} placeholder="House, street, quarter..." className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">City</label>
            <input value={deliveryCity} onChange={e=>setDeliveryCity(e.target.value)} placeholder="City or town" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">Township</label>
            <input value={deliveryTownship} onChange={e=>setDeliveryTownship(e.target.value)} placeholder="Tamwe, Myawaddy..." className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">Delivery Note</label>
          <input value={deliveryNote} onChange={e=>setDeliveryNote(e.target.value)} placeholder="Leave at front door, call on arrival..." className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={savingDelivery} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 disabled:opacity-50">
            {savingDelivery ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Package className="w-4 h-4" /> Save Delivery Address</>}
          </button>
        </div>
      </form>

      {/* Danger Zone — delete profile for all users */}
      <div className="p-6 sm:p-8 surface border border-red-200 dark:border-red-900/50 space-y-4">
        <h3 className="text-base font-extrabold text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Delete your account and all associated data. For trainers/clients this also removes home page visibility. This cannot be undone — type DELETE to confirm.</p>
        <div className="flex justify-end">
          <button onClick={handleDeleteProfile} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete My Profile
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Change Password</h2>
              <button onClick={() => setPasswordModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
