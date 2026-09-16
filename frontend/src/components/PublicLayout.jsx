import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';
import {
  Flame, Sun, Moon, Globe, Users, ArrowRight, Menu, X, Dumbbell, MapPin, Phone, Clock, ShieldCheck, Heart
} from 'lucide-react';

export const PublicLayout = () => {
  const { theme, toggleTheme, user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === 'dark';
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [siteSettings, setSiteSettings] = useState({});

  useEffect(() => {
    let active = true;
    api.get('/home/settings')
      .then((res) => {
        if (!active) return;
        const data = res.data || {};
        setSiteSettings(data);
        const enabled = String(data.announcement_enabled).toLowerCase() === 'true';
        const message = String(data.announcement || '').trim();
        const dismissed = sessionStorage.getItem('mwdgym-announcement-dismissed') === 'true';
        setAnnouncement(data);
        setAnnouncementVisible(enabled && Boolean(message) && !dismissed);
      })
      .catch(() => {
        if (active) setAnnouncementVisible(false);
      });
    return () => { active = false; };
  }, []);

  const gymName = siteSettings.gym_name || 'MWD GYM';
  const gymAddress = siteSettings.gym_address || siteSettings.address || 'Myawaddy, Myanmar';
  const gymPhone = siteSettings.gym_phone || siteSettings.phone || '';
  const gymHours = siteSettings.gym_hours || 'Mon - Sun: 6:00 AM - 10:00 PM';

  const dismissAnnouncement = () => {
    sessionStorage.setItem('mwdgym-announcement-dismissed', 'true');
    setAnnouncementVisible(false);
  };

  const publicNavItems = [
    { label: t('nav_home', 'Home'), to: '/' },
    { label: t('nav_about', 'About'), to: '/about' },
    { label: t('nav_pricing', 'Pricing'), to: '/pricing' },
    { label: t('nav_coaches', 'Coaches'), to: '/coaches' },
    { label: t('nav_contact', 'Contact'), to: '/contact' },
    { label: t('nav_market', 'Marketplace'), to: '/marketplace' },
    { label: t('nav_store', 'Store'), to: '/shop' },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'bg-[#08080a] text-slate-100' : 'bg-[#fcfcfd] text-slate-900'} selection:bg-red-600 selection:text-white`}>
      {/* Admin-controlled marketing top strip */}
      {announcementVisible && announcement && (
        <div className="relative bg-red-600 text-white text-[11px] font-black tracking-wider uppercase py-2 px-10 flex items-center justify-center gap-3 shrink-0 z-50">
          <span className="inline-flex items-center gap-1.5 text-center">
            <Flame className="w-3.5 h-3.5 animate-pulse text-amber-300 shrink-0" />
            {announcement.announcement}
          </span>
          {announcement.announcement_url && announcement.announcement_cta && (
            <Link to={announcement.announcement_url} className="hidden sm:inline-block bg-white hover:bg-slate-100 text-red-600 px-3 py-0.5 rounded-full text-[11px] font-extrabold transition whitespace-nowrap">
              {announcement.announcement_cta}
            </Link>
          )}
          <button
            type="button"
            onClick={dismissAnnouncement}
            aria-label="Dismiss announcement"
            title="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/80 hover:text-white hover:bg-red-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Fixed Public Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 ${isDark ? 'bg-black/85 border-white/10' : 'bg-white/90 border-slate-200/80'}`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-red-600 to-rose-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-600/30 group-hover:scale-105 transition">
              M
            </div>
            <div className="leading-none">
              <p className="font-black tracking-tighter text-[19px] text-slate-900 dark:text-white">
                MWD<span className="text-red-600">GYM</span>
              </p>
              <p className="text-[9px] tracking-[0.2em] font-black opacity-50 -mt-0.5 uppercase">
                {t('nav_tagline', 'MYAWADDY • EST 2020')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {publicNavItems.map(item => {
              const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive: linkActive }) =>
                    `px-3.5 py-2 rounded-xl text-xs font-bold transition-colors duration-150 ${
                      linkActive || isActive
                        ? 'text-red-600 bg-red-500/10 dark:bg-red-500/15'
                        : isDark
                        ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Action Tools: Language, Theme, Auth CTAs */}
          <div className="flex items-center gap-2">
            {/* Language Switcher [ EN | MM ] */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all duration-150 ${
                isDark
                  ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:border-red-500/50'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-red-400'
              }`}
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-red-500" />
              <span className={language === 'en' ? 'text-red-600 font-black' : 'opacity-60'}>EN</span>
              <span className="opacity-30">|</span>
              <span className={language === 'mm' ? 'text-red-600 font-black' : 'opacity-60'}>MM</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-150 ${
                isDark
                  ? 'bg-zinc-900/80 border-zinc-800 text-amber-400 hover:bg-zinc-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to={user.role === 'CLIENT' ? '/profile' : '/dashboard'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/20 transition"
                >
                  {t('nav_dashboard', 'Dashboard')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/profile"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs overflow-hidden ${
                    isDark ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-slate-200 bg-slate-100 text-slate-900'
                  }`}
                  title={user.displayName || user.username}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.displayName?.[0] || user.username?.[0] || 'U').toUpperCase()
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <Link
                  to="/login"
                  className={`hidden sm:inline-flex px-3.5 py-2 text-xs font-black transition ${
                    isDark ? 'text-zinc-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {t('nav_login', 'Sign In')}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-md shadow-red-600/25 transition"
                >
                  {t('nav_join', 'JOIN NOW')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className={`lg:hidden p-2 rounded-xl border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-b py-4 px-4 space-y-2 backdrop-blur-2xl ${
            isDark ? 'bg-zinc-950/95 border-zinc-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
          }`}>
            {publicNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                    isActive ? 'bg-red-600 text-white' : isDark ? 'hover:bg-zinc-900' : 'hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {!user && (
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl border ${
                    isDark ? 'border-zinc-800 text-white hover:bg-zinc-900' : 'border-slate-200 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('nav_login', 'Sign In')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-500"
                >
                  {t('nav_join', 'JOIN NOW')}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Public Body Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Shared Public Footer */}
      <footer className={`border-t py-12 ${isDark ? 'bg-[#050507] border-white/10 text-slate-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center font-black rounded-lg">M</div>
                <span className="font-black text-xl text-white tracking-tighter">MWD<span className="text-red-500">GYM</span></span>
              </div>
              <p className="text-xs leading-relaxed opacity-75">
                {t('footer_tagline', 'Where Discipline Becomes Strength')}. {gymName}'s workout facility, coin reward store, and professional trainer marketplace.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-black text-sm text-white mb-3 tracking-wide">{t('footer_quick_links', 'Quick Navigation')}</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li><Link to="/" className="hover:text-red-500 transition">{t('nav_home', 'Home')}</Link></li>
                <li><Link to="/about" className="hover:text-red-500 transition">{t('nav_about', 'About Us')}</Link></li>
                <li><Link to="/pricing" className="hover:text-red-500 transition">{t('nav_pricing', 'Pricing & Plans')}</Link></li>
                <li><Link to="/coaches" className="hover:text-red-500 transition">{t('nav_coaches', 'Pro Coaches')}</Link></li>
                <li><Link to="/contact" className="hover:text-red-500 transition">{t('nav_contact', 'Contact Us')}</Link></li>
              </ul>
            </div>

            {/* Column 3: Hours & Location */}
            <div>
              <h4 className="font-black text-sm text-white mb-3 tracking-wide">{t('footer_hours_title', 'Operating Hours')}</h4>
              <div className="space-y-2 text-xs opacity-80 font-medium">
                <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-red-500" /> {t('footer_hours_days', 'Monday - Sunday')}</p>
                <p className="text-white font-bold pl-5.5">{t('footer_hours_time', '6:00 AM - 10:00 PM')}</p>
                <p className="flex items-center gap-2 pt-2"><MapPin className="w-3.5 h-3.5 text-red-500" /> {gymAddress}</p>
              </div>
            </div>

            {/* Column 4: Contact & Social */}
            <div>
              <h4 className="font-black text-sm text-white mb-3 tracking-wide">{t('contact_title', 'Contact Us')}</h4>
              <div className="space-y-2 text-xs opacity-80 font-medium">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-red-500" /> {gymPhone}</p>
                <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-red-500" /> {gymHours}</p>
                <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Certified Fitness Center</p>
                <div className="pt-2 flex items-center gap-2">
                  <Link to="/signup" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black transition">
                    {t('nav_join', 'JOIN NOW')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs opacity-60">
            <p>© {new Date().getFullYear()} {t('footer_rights', 'All rights reserved. MWD GYM.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
