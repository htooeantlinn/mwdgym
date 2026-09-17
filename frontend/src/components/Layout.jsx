import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Dumbbell,
  BookOpen,
  MessageSquare,
  FileText,
  UserCheck,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  Layers,
  House,
  Calculator as CalcIcon,
  Timer as TimerIcon,
  ScrollText,
  Store,
  ShoppingBag,
  RotateCcw,
  Coins,
  Globe,
  UtensilsCrossed,
  Apple
} from 'lucide-react';

export const Layout = () => {
  const { user, logout, theme, toggleTheme, hasRole, hasPerm } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();


  // Poll unread messages
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/messenger/unread');
        setUnreadCount(res.data?.total || 0);
      } catch {
        // silently ignore poll error
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = hasRole('ADMIN');

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { label: 'Home', to: '/', icon: House, show: true },
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, show: user?.role !== 'CLIENT' },
        { label: 'Profile', to: '/profile', icon: User, show: true },
      ],
    },
    {
      label: 'Manage',
      items: [
        { label: 'Members', to: '/members', icon: Users, show: isAdmin || hasPerm('MEMBERS') },
        { label: 'Payments', to: '/payments', icon: CreditCard, show: isAdmin || hasPerm('PAYMENTS') },
        { label: 'Inventory', to: '/inventory', icon: Package, show: isAdmin || hasPerm('INVENTORY') },
        { label: 'Staff', to: '/staff', icon: UserCheck, show: isAdmin },
      ],
    },
    {
      label: 'Training',
      items: [
        { label: 'Workouts Plans', to: '/workout-plans', icon: Dumbbell, show: hasRole('ADMIN', 'TRAINER') },
        { label: 'Diet Plans', to: '/diet-plans', icon: UtensilsCrossed, show: hasRole('ADMIN', 'TRAINER') },
        { label: 'Exercises', to: '/exercises', icon: BookOpen, show: hasRole('ADMIN', 'TRAINER') },
        { label: 'Foods', to: '/foods', icon: Apple, show: hasRole('ADMIN', 'TRAINER') },
        { label: 'Plans', to: '/plans', icon: Layers, show: isAdmin },
      ],
    },
    {
      label: 'Shop',
      items: [
        { label: 'Marketplace', to: '/marketplace', icon: Store, show: true },
        { label: 'Store', to: '/shop', icon: ShoppingBag, show: true },
        { label: 'Coins', to: '/coin-shop', icon: Coins, show: true },
      ],
    },
    {
      items: [
        { label: 'My Plans', to: '/trainer-plans', icon: Dumbbell, show: hasRole('TRAINER', 'ADMIN') },
        { label: 'Purchases', to: '/my-purchases', icon: ShoppingBag, show: true },
        { label: 'Refunds', to: '/trainer-refunds', icon: RotateCcw, show: hasRole('TRAINER', 'ADMIN') },
        { label: 'Manage', to: '/admin/marketplace', icon: Store, show: isAdmin },
        { label: 'Reports', to: '/report', icon: FileText, show: user?.role !== 'CLIENT' },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Messages', to: '/messenger', icon: MessageSquare, show: true, badge: unreadCount },
        { label: 'Logs', to: '/logs', icon: ScrollText, show: isAdmin },
        { label: 'Settings', to: '/settings', icon: Settings, show: isAdmin },
      ],
    },
    {
      label: 'Tools',
      items: [
        { label: 'Calc', to: '/calculator', icon: CalcIcon, show: true },
        { label: 'Timer', to: '/timer', icon: TimerIcon, show: true },
      ],
    },
  ];

  const flatNavForMobile = navGroups.flatMap(g => g.items);

  const currentPageTitle = navGroups
    .flatMap(g => g.items)
    .find(i => i.show && (location.pathname === i.to || (i.to !== '/' && location.pathname.startsWith(i.to))))
    ?.label;
  const pageTitle = currentPageTitle || (user?.role === 'CLIENT' ? 'Member Portal' : 'Dashboard');

  return (
    <div className={`h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-[14rem] h-full flex-col bg-white dark:bg-[#131317] border-r border-slate-200 dark:border-zinc-800/80 shrink-0 z-30 select-none">
        {/* Brand Header */}
        <div className="h-12 flex items-center px-4 border-b border-slate-200 dark:border-zinc-800/80 shrink-0">
          <NavLink to="/" className="flex items-center gap-2.5 group" title="Go to Home">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-500/25 group-hover:scale-105 transition">
              M
            </div>
            <div className="leading-tight">
              <span className="font-extrabold tracking-tight text-[0.95rem] text-slate-900 dark:text-white">MWD <span className="text-red-600">GYM</span></span>
              <span className="block text-[0.625rem] overline text-slate-400 dark:text-zinc-500">
                {user?.role === 'CLIENT' ? 'Member Portal' : 'Admin Console'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navGroups.map((group) => {
            const vis = group.items.filter(item => item.show);
            if (vis.length === 0) return null;
            return (
              <div key={group.label || group.items[0]?.to}>
                {group.label && <div className="overline px-2 mb-1.5 text-slate-400 dark:text-zinc-600">{group.label}</div>}
                <div className="space-y-0.5">
                  {vis.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          `nav-item ${isActive ? 'nav-item-active' : ''}`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.9} />
                        <span className="flex-1 truncate text-[0.75rem]">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="min-w-[1.25rem] h-5 px-1.5 inline-flex items-center justify-center text-[0.625rem] font-bold rounded-full bg-red-500 text-white animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Card & Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 shrink-0">
          <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 group hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition">
            <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-red-600/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 font-bold flex items-center justify-center shrink-0 text-xs">
                {user?.profileImage ? <img src={user.profileImage} alt="me" className="w-full h-full object-cover" /> : ((user?.displayName || user?.username || 'U').charAt(0).toUpperCase())}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[0.75rem] font-semibold text-slate-800 dark:text-zinc-200 truncate">
                  {user?.displayName || user?.username || 'User'}
                </p>
                <span className="text-[0.625rem] overline text-slate-400 dark:text-zinc-500">{user?.role || 'MEMBER'}</span>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </aside>


      {/* Mobile Topbar */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#121215] border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <NavLink to="/dashboard" className="font-extrabold text-base tracking-tight">
            MWD <span className="text-red-600">GYM</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <NavLink
            to="/messenger"
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </NavLink>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-[#121215] h-full shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-zinc-800">
              <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {navGroups.map((group) => {
                const vis = group.items.filter(item => item.show);
                if (vis.length === 0) return null;
                return (
                  <div key={group.label}>
                    <div className="overline px-2 mb-1.5 text-slate-400 dark:text-zinc-600">{group.label}</div>
                    <div className="space-y-0.5">
                      {vis.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                              `nav-item ${isActive ? 'nav-item-active' : ''}`
                            }
                          >
                            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.9} />
                            <span className="flex-1 truncate text-[0.75rem]">{item.label}</span>
                            {item.badge > 0 && (
                              <span className="min-w-[1.1rem] h-4 px-1 inline-flex items-center justify-center text-[0.6rem] font-bold rounded-full bg-red-500 text-white">
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Appearance</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-12 bg-white/80 dark:bg-[#131317]/80 backdrop-blur border-b border-slate-200 dark:border-zinc-800/80 px-6 items-center justify-between sticky top-0 z-20 shrink-0">

          <div className="flex items-center gap-3 min-w-0">
            <span className="title-md text-slate-500 dark:text-zinc-400 truncate">
              <span className="text-slate-400 dark:text-zinc-600">MWD Gym</span>
              <span className="mx-1.5 text-slate-300 dark:text-zinc-700">/</span>
              <span className="text-slate-900 dark:text-white font-semibold">{pageTitle}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 flex items-center gap-1 rounded-lg text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-red-500" />
              <span className={language === 'en' ? 'text-red-600 font-black' : 'opacity-60'}>EN</span>
              <span className="opacity-30">|</span>
              <span className={language === 'mm' ? 'text-red-600 font-black' : 'opacity-60'}>MM</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" strokeWidth={1.8} /> : <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} />}
            </button>

            <NavLink
              to="/messenger"
              className="relative w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              title="Messenger"
            >
              <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[1rem] h-4 px-1 inline-flex items-center justify-center text-[0.625rem] font-bold rounded-full bg-red-600 text-white ring-2 ring-white dark:ring-[#131317]">
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-red-600/10 flex items-center justify-center font-bold text-red-600 ring-2 ring-slate-200 dark:ring-zinc-700 hover:ring-red-500/40 transition ml-1" title="My Profile">
              {user?.profileImage ? <img src={user.profileImage} alt="me" className="w-full h-full object-cover" /> : (user?.displayName?.charAt(0) || 'U')}
            </NavLink>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main
          className={`flex-1 min-w-0 ${
            location.pathname.startsWith('/messenger')
              ? 'flex flex-col p-0 max-w-none'
              : 'px-3 sm:px-5 md:px-6 py-4 md:py-5 max-w-7xl w-full mx-auto'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
