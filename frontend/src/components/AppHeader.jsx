import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, LayoutDashboard, LogOut, ArrowRight, Globe } from 'lucide-react';

export const AppHeader = ({ announcement }) => {
  const { theme, toggleTheme, user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const homeTarget = user?.role === 'CLIENT' ? '/profile' : '/dashboard';

  return (
    <nav className={`fixed inset-x-0 z-50 backdrop-blur-md border-b transition-colors ${announcement ? 'top-10' : 'top-0'} ${isDark ? 'bg-slate-950/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className={`font-black text-xl sm:text-2xl tracking-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
            MWD <span className="text-red-500">GYM</span>
          </span>
        </Link>

        <div className={`hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          <Link to="/" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition`}>{t('nav_home', 'Home')}</Link>
          <Link to="/about" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition`}>{t('nav_about', 'About')}</Link>
          <Link to="/pricing" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition`}>{t('nav_pricing', 'Pricing')}</Link>
          <Link to="/coaches" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition`}>{t('nav_coaches', 'Coaches')}</Link>
          <Link to="/contact" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition`}>{t('nav_contact', 'Contact')}</Link>
          <Link to="/calculator" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition`}>{t('nav_calc', 'Calculator')}</Link>
          <Link to="/timer" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition`}>{t('nav_timer', 'Timer')}</Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher [ EN | MM ] */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-extrabold transition ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'
            }`}
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-red-500" />
            <span className={language === 'en' ? 'text-red-600 font-black' : 'opacity-60'}>EN</span>
            <span className="opacity-30">|</span>
            <span className={language === 'mm' ? 'text-red-600 font-black' : 'opacity-60'}>MM</span>
          </button>

          {/* Dark/Light Toggle */}
          <button onClick={toggleTheme} className={`p-2 rounded-lg border transition ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`} title="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              <Link
                to={homeTarget}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${isDark ? 'text-zinc-200 hover:text-white hover:bg-zinc-800/70' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">{user.role === 'CLIENT' ? t('nav_profile', 'My Profile') : t('nav_dashboard', 'Dashboard')}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition"
              >
                <LogOut className="w-4 h-4" /> {t('nav_logout', 'Logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                {t('nav_login', 'Sign In')}
              </Link>
              <Link
                to="/signup"
                className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition flex items-center gap-1.5"
              >
                <span>{t('nav_join', 'JOIN NOW')}</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

