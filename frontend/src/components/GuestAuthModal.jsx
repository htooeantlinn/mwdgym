import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, Lock, UserPlus, LogIn, X, Coins, ShieldCheck, Dumbbell } from 'lucide-react';

export const GuestAuthModal = ({ isOpen, onClose, actionTitle, cartTotal, coinPrice }) => {
  const { theme } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition ${
            isDark ? 'border-zinc-800 hover:bg-zinc-900 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4 pt-2">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-3xl bg-red-600/10 text-red-600 flex items-center justify-center font-black">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black tracking-tight">
            {actionTitle || t('guest_auth_title', 'Sign In or Join to Continue')}
          </h3>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('guest_auth_desc', 'You are currently viewing as a guest visitor. Please log in or create an account to complete your order, earn coin rewards, and access your member portal.')}
          </p>

          {/* Item details if available */}
          {(cartTotal > 0 || coinPrice > 0) && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="opacity-70">{t('guest_auth_cart_total', 'Selected Items Total:')}</span>
                <span className="text-red-600 text-sm font-black flex items-center gap-1">
                  {cartTotal > 0 && `${cartTotal.toLocaleString()} MMK`}
                  {coinPrice > 0 && <><Coins className="w-3.5 h-3.5 inline" /> {coinPrice.toLocaleString()} Coins</>}
                </span>
              </div>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Items saved in your cart automatically!
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2.5 pt-2">
            <Link
              to="/signup"
              onClick={onClose}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> {t('nav_join', 'JOIN MWD GYM')}
            </Link>

            <Link
              to="/login"
              onClick={onClose}
              className={`w-full py-3.5 border font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 ${
                isDark ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" /> {t('nav_login', 'Sign In to Existing Account')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
