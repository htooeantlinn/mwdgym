import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Settings as SettingsIcon,
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Megaphone,
  CheckCircle2,
  X,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone,
  Images,
  Trash2,
  Upload,
} from 'lucide-react';

const PAYMENT_DEFAULTS = {
  payment_kpay_name: '',
  payment_kpay_number: '',
  payment_wave_name: '',
  payment_wave_number: '',
  payment_bank_name: '',
  payment_bank_account: '',
  payment_bank_holder: '',
  payment_methods_enabled: 'KPAY,WAVE,BANK',
};

export const Settings = () => {
  const [settings, setSettings] = useState({
    gym_name: 'MWD GYM',
    gym_slogan: 'Build Strength, Discipline, & Community',
    gym_phone: '+95 9 123 456 789',
    gym_email: 'info@mwdgym.com',
    gym_address: 'Myawaddy, Myanmar',
    gym_hours: 'Mon - Sun: 6:00 AM - 10:00 PM',
    announcement: '',
    announcement_enabled: 'true',
    announcement_cta: 'Claim Now ->',
    announcement_url: '/signup',
    facebook_url: 'https://facebook.com/mwdgym',
    instagram_url: 'https://instagram.com/mwdgym',
    telegram_url: 'https://t.me/mwdgym',
    signup_bonus_coins: '100',
    daily_checkin_coins: '10',
    currency_name: 'MMK',
    marketplace_video_max_mb: '50',
  });


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(PAYMENT_DEFAULTS);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [heroImages, setHeroImages] = useState([]);
  const [heroInterval, setHeroInterval] = useState("4");
  const [heroUploading, setHeroUploading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data }));
          if (res.data.hero_images) {
            try { const arr = JSON.parse(res.data.hero_images); if (Array.isArray(arr)) setHeroImages(arr); } catch {}
          }
          if (res.data.hero_interval) setHeroInterval(res.data.hero_interval);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchPaymentSettings = async () => {
      try {
        const res = await api.get('/marketplace/payment-settings');
        if (res.data) {
          setPaymentSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to load payment settings', err);
      }
    };
    fetchSettings();
    fetchPaymentSettings();
  }, []);

  const handleHeroUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setHeroUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await api.post('/settings/hero-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url;
      setHeroImages(prev => [...prev, url]);
    } catch (err) { setMessage({ type: 'error', text: err.message || 'Upload failed' }); }
    finally { setHeroUploading(false); e.target.value=''; }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...settings, hero_images: JSON.stringify(heroImages), hero_interval: heroInterval };
      await api.put('/settings', payload);
      setMessage({ type: 'success', text: 'Site settings saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update site settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    setPaymentMessage(null);
    try {
      await api.put('/marketplace/admin/payment-settings', paymentSettings);
      setPaymentMessage({ type: 'success', text: 'Payment accounts saved successfully' });
    } catch (err) {
      setPaymentMessage({ type: 'error', text: err.message || 'Failed to save payment settings' });
    } finally {
      setSavingPayment(false);
    }
  };

  const togglePaymentMethod = (method) => {
    const enabled = (paymentSettings.payment_methods_enabled || '').split(',').filter(Boolean);
    if (enabled.includes(method)) {
      setPaymentSettings({ ...paymentSettings, payment_methods_enabled: enabled.filter(m => m !== method).join(',') });
    } else {
      setPaymentSettings({ ...paymentSettings, payment_methods_enabled: [...enabled, method].join(',') });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <SettingsIcon className="w-4 h-4 text-white" />
            </span>
            Gym Configuration & Branding
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            General gym information, contact details, operating hours, and public announcements.
          </p>
        </div>
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

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 surface space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            General Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Gym Center Name
              </label>
              <input
                type="text"
                value={settings.gym_name}
                onChange={(e) => setSettings({ ...settings, gym_name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Brand Slogan
              </label>
              <input
                type="text"
                value={settings.gym_slogan}
                onChange={(e) => setSettings({ ...settings, gym_slogan: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={settings.gym_phone}
                  onChange={(e) => setSettings({ ...settings, gym_phone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={settings.gym_email}
                  onChange={(e) => setSettings({ ...settings, gym_email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Gym Location / Facility Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={settings.gym_address}
                onChange={(e) => setSettings({ ...settings, gym_address: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Opening Hours
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={settings.gym_hours}
                onChange={(e) => setSettings({ ...settings, gym_hours: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 surface space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-red-600" />
            Announcement Banner
          </h2>

          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={String(settings.announcement_enabled).toLowerCase() === 'true'}
              onChange={(e) => setSettings({ ...settings, announcement_enabled: e.target.checked ? 'true' : 'false' })}
              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Show announcement banner</span>
          </label>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Member Bulletin / Alert Message
            </label>
            <textarea
              rows={3}
              value={settings.announcement || ''}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              placeholder="e.g. Facility maintenance on Sunday 8:00 PM. New cardio gear arrived!"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Button Label
              </label>
              <input
                type="text"
                value={settings.announcement_cta || ''}
                onChange={(e) => setSettings({ ...settings, announcement_cta: e.target.value })}
                placeholder="Claim Now ->"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Button Link
              </label>
              <input
                type="text"
                value={settings.announcement_url || ''}
                onChange={(e) => setSettings({ ...settings, announcement_url: e.target.value })}
                placeholder="/signup"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Hero Slider — Home page */}
        <div className="p-6 sm:p-8 surface space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Images className="w-5 h-5 text-red-600" />
            Home Hero Slider
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Images auto-slide on home page. Upload from here — easy control.</p>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold">Auto-slide interval</label>
            <select value={heroInterval} onChange={e=>setHeroInterval(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">
              <option value="3">3s</option><option value="4">4s</option><option value="5">5s</option><option value="7">7s</option>
            </select>
            <span className="text-xs opacity-60">seconds</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {heroImages.map((url,i)=> (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700">
                <img src={url} alt={`hero-${i}`} className="w-full h-28 object-cover" />
                <button type="button" onClick={()=> setHeroImages(prev=> prev.filter((_,idx)=> idx!==i))} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">#{i+1}</span>
              </div>
            ))}
            <label className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-red-300 ${heroUploading ? 'opacity-50' : ''} border-slate-200 dark:border-zinc-700`}>
              <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" disabled={heroUploading} />
              {heroUploading ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-5 h-5 text-slate-400" /><span className="text-xs font-bold text-slate-500">Add Image</span></>}
            </label>
          </div>
          <p className="text-[11px] text-slate-400">First image shows first. Click Save Configuration to apply.</p>
        </div>

        {/* Social Media & Channels */}
        <div className="p-6 sm:p-8 surface space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-red-600" />
            Social Media & Communication Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={settings.facebook_url || ''}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://facebook.com/mwdgym"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Instagram Profile URL
              </label>
              <input
                type="text"
                value={settings.instagram_url || ''}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://instagram.com/mwdgym"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Telegram Channel URL
              </label>
              <input
                type="text"
                value={settings.telegram_url || ''}
                onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://t.me/mwdgym"
              />
            </div>
          </div>

          <div className="max-w-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
              Marketplace Preview Video Limit (MB)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={settings.marketplace_video_max_mb || '50'}
              onChange={(e) => setSettings({ ...settings, marketplace_video_max_mb: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
              Allowed range: 1 to 500 MB. This applies to new preview video uploads.
            </p>
          </div>
        </div>

        {/* Coin Rewards & Currency Config */}
        <div className="p-6 sm:p-8 surface space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            Coin Rewards & Currency Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Sign-up Bonus Coins
              </label>
              <input
                type="number"
                value={settings.signup_bonus_coins || '100'}
                onChange={(e) => setSettings({ ...settings, signup_bonus_coins: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Workout Check-in Coins
              </label>
              <input
                type="number"
                value={settings.daily_checkin_coins || '10'}
                onChange={(e) => setSettings({ ...settings, daily_checkin_coins: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                Currency Label
              </label>
              <input
                type="text"
                value={settings.currency_name || 'MMK'}
                onChange={(e) => setSettings({ ...settings, currency_name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Accounts */}

        <div className="p-6 sm:p-8 surface space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-red-600" />
            Payment Accounts
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Configure payment accounts for member purchases and refund processing.
          </p>

          {paymentMessage && (
            <div className={`p-3 rounded-xl flex items-center justify-between text-sm ${
              paymentMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
            }`}>
              <span>{paymentMessage.text}</span>
              <button onClick={() => setPaymentMessage(null)} className="p-1 hover:opacity-75"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Enabled Methods */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-2">
              Enabled Payment Methods
            </label>
            <div className="flex gap-2">
              {['KPAY', 'WAVE', 'BANK'].map(m => {
                const enabled = (paymentSettings.payment_methods_enabled || '').includes(m);
                return (
                  <button key={m} type="button" onClick={() => togglePaymentMethod(m)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      enabled
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-red-300'
                    }`}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kpay */}
          {(paymentSettings.payment_methods_enabled || '').includes('KPAY') && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Smartphone className="w-4 h-4" /></div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Kpay Account</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">Account Holder Name</label>
                  <input type="text" value={paymentSettings.payment_kpay_name || ''} onChange={e => setPaymentSettings({...paymentSettings, payment_kpay_name: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Aung Aung" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">Phone Number</label>
                  <input type="text" value={paymentSettings.payment_kpay_number || ''} onChange={e => setPaymentSettings({...paymentSettings, payment_kpay_number: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="09 123 456 789" />
                </div>
              </div>
            </div>
          )}

          {/* Wave */}
          {(paymentSettings.payment_methods_enabled || '').includes('WAVE') && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500"><Smartphone className="w-4 h-4" /></div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Wave Account</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">Account Holder Name</label>
                  <input type="text" value={paymentSettings.payment_wave_name || ''} onChange={e => setPaymentSettings({...paymentSettings, payment_wave_name: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Ma Ma" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">Phone Number</label>
                  <input type="text" value={paymentSettings.payment_wave_number || ''} onChange={e => setPaymentSettings({...paymentSettings, payment_wave_number: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="09 987 654 321" />
                </div>
              </div>
            </div>
          )}

          {/* Bank */}
          {(paymentSettings.payment_methods_enabled || '').includes('BANK') && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Landmark className="w-4 h-4" /></div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Bank Account</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">Bank Name</label>
                  <input type="text" value={paymentSettings.payment_bank_name || ''} onChange={e => setPaymentSettings({...paymentSettings, payment_bank_name: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. KBZ Bank" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">Account Number</label>
                  <input type="text" value={paymentSettings.payment_bank_account || ''} onChange={e => setPaymentSettings({...paymentSettings, payment_bank_account: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="1234 5678 9012" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">Account Holder</label>
                  <input type="text" value={paymentSettings.payment_bank_holder || ''} onChange={e => setPaymentSettings({...paymentSettings, payment_bank_holder: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Full name" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={handleSavePayment} disabled={savingPayment}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 disabled:opacity-50">
              {savingPayment ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><Save className="w-4 h-4" /> Save Payment Accounts</>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
