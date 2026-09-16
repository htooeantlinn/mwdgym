import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin, Phone, Clock, Mail, Send, CheckCircle2, ShieldCheck, Dumbbell
} from 'lucide-react';

export const Contact = () => {
  const { theme } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/home/settings').then((res) => setSettings(res.data || {})).catch(() => {});
  }, []);

  const gymAddress = settings.gym_address || settings.address || 'Myawaddy, Myanmar';
  const gymPhone = settings.gym_phone || settings.phone || '';
  const gymHours = settings.gym_hours || t('contact_hours_val', 'Mon - Sun: 6:00 AM - 10:00 PM');

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className={`py-10 sm:py-16 ${isDark ? 'bg-[#08080a] text-white' : 'bg-[#fcfcfd] text-slate-900'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Mail className="w-4 h-4" /> {t('contact_title', 'Contact Us')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight">
            {t('contact_subtitle', "We'd love to welcome you at MWD GYM. Reach out or visit us!")}
          </h1>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Details */}
          <div className="md:col-span-5 space-y-6">
            <div className={`p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'} shadow-xl space-y-6`}>
              <h2 className="text-xl font-black">{t('contact_info_title', 'Gym Location & Details')}</h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold opacity-60 uppercase text-[10px]">{t('contact_address_label', 'Address')}</p>
                    <p className="font-black text-sm">{gymAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold opacity-60 uppercase text-[10px]">{t('contact_phone_label', 'Phone')}</p>
                    <p className="font-black text-sm">{gymPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold opacity-60 uppercase text-[10px]">{t('contact_hours_label', 'Opening Hours')}</p>
                    <p className="font-black text-sm">{gymHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder Card */}
            <div className={`rounded-3xl overflow-hidden border p-6 text-center space-y-3 ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-black text-sm">Walk-ins Always Welcome!</p>
              <p className="text-xs opacity-70">No appointment needed for initial facility tour.</p>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="md:col-span-7">
            <div className={`p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'} shadow-xl space-y-6`}>
              <h2 className="text-xl font-black">{t('contact_form_title', 'Send Us a Message')}</h2>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>{t('contact_sent_success', 'Thank you! We received your message and will contact you shortly.')}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="font-bold opacity-80">{t('contact_name_label', 'Your Full Name')}</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mg Mg"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold opacity-80">{t('contact_email_label', 'Contact Email / Phone')}</label>
                    <input
                      type="text"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. 09123456789 or name@gmail.com"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold opacity-80">{t('contact_msg_label', 'Your Message')}</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> {t('contact_btn_send', 'Send Message')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
