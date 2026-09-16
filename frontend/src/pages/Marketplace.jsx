import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Store, Search, Star, TrendingUp, Clock, Users, Dumbbell, Flame,
  Leaf, Apple, Trophy, Zap, Filter, ShoppingCart, BarChart3, X, Coins,
  Sparkles, Crown, ArrowRight, ShieldCheck, CheckCircle
} from 'lucide-react';

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <div key={i} className="relative w-3.5 h-3.5">
          <Star className="absolute inset-0 w-3.5 h-3.5 text-slate-300 dark:text-zinc-700" />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-700" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export const Marketplace = () => {
  const { theme, user } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeDifficulty, setActiveDifficulty] = useState('ALL');

  const categories = [
    { value: 'ALL', label: t('coaches_filter_all', 'All Plans'), icon: Store },
    { value: 'STRENGTH', label: 'Strength', icon: Dumbbell },
    { value: 'CARDIO', label: 'Cardio & HIIT', icon: Flame },
    { value: 'FLEXIBILITY', label: 'Flexibility & Yoga', icon: Leaf },
    { value: 'NUTRITION', label: 'Nutrition & Diet', icon: Apple },
    { value: 'SPORT', label: 'Sports Training', icon: Trophy },
  ];

  const difficulties = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 30 };
      if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
      if (activeCategory !== 'ALL') params.category = activeCategory;
      if (activeDifficulty !== 'ALL') params.difficulty = activeDifficulty;
      const res = await api.get('/marketplace/plans', { params });
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load marketplace plans', err);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, activeCategory, activeDifficulty]);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/trending');
      setTrending(res.data || []);
    } catch (err) {
      console.error('Failed to load trending plans', err);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const clearFilters = () => {
    setSearchKeyword('');
    setActiveCategory('ALL');
    setActiveDifficulty('ALL');
  };

  const hasActiveFilters = activeCategory !== 'ALL' || activeDifficulty !== 'ALL' || searchKeyword.trim();

  return (
    <div className={`min-h-screen py-6 space-y-8 ${isDark ? 'bg-[#08080a] text-white' : 'bg-[#fcfcfd] text-slate-900'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
        
        {/* PREMIUM HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-zinc-900 text-white p-8 sm:p-10 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-300 border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Certified Workout Programs
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none">
              WORKOUT <span className="text-amber-400">MARKETPLACE</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed max-w-xl">
              Unlock progressive workout routines created by certified pro trainers. Pay with earned coins or top up directly!
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Certified Trainers</span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur"><Coins className="w-4 h-4 text-amber-400" /> Instant Coin Access</span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur"><Trophy className="w-4 h-4 text-amber-300" /> Progression Tracked</span>
            </div>
          </div>
        </div>

        {/* SEARCH & CATEGORY SELECTOR */}
        <div className="space-y-4">
          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search workout plans by title, trainer name, or goals..."
                className={`w-full h-12 pl-11 pr-10 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
              {searchKeyword && (
                <button onClick={() => setSearchKeyword('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Difficulty Selector Dropdown Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {difficulties.map(diff => (
                <button
                  key={diff.value}
                  onClick={() => setActiveDifficulty(diff.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                    activeDifficulty === diff.value
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : isDark
                      ? 'bg-zinc-900 border border-zinc-800 text-slate-400 hover:bg-zinc-800'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                      : isDark
                      ? 'bg-zinc-900/80 border border-zinc-800 text-slate-300 hover:bg-zinc-800'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-red-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="font-bold opacity-60">Showing filtered results</span>
              <button onClick={clearFilters} className="text-red-500 font-black flex items-center gap-1 hover:underline">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* TRENDING FEATURED SECTION */}
        {!loading && trending.length > 0 && !hasActiveFilters && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" /> Trending Trainer Plans
              </h2>
              <span className="text-xs font-bold text-red-500">Highest rated by members</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => navigate(`/marketplace/${plan.id}`)}
                  className={`group rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800 hover:border-red-500/50 shadow-xl'
                      : 'bg-white border-slate-200 hover:border-red-400 shadow-md hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Thumbnail Frame */}
                    <div className="relative w-full h-40 rounded-2xl bg-zinc-900 overflow-hidden">
                      <img
                        src={plan.thumbnailUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'}
                        alt={plan.planName || plan.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {plan.category || 'STRENGTH'}
                      </div>
                      <div className="absolute top-3 right-3 bg-amber-400 text-black px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> {plan.rating?.toFixed(1) || '4.9'}
                      </div>
                    </div>

                    {/* Plan Info */}
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-red-500 transition line-clamp-1">
                        {plan.planName || plan.title}
                      </h3>
                      <p className="text-xs font-bold text-red-500">by {plan.trainerName || 'Coach Aung Thu'}</p>
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {plan.description || 'Comprehensive progressive training routine for muscle building & fat burn.'}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-500" /> {plan.durationWeeks || plan.durationDays || 30} days</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-500" /> {plan.totalPurchases || 45} enrolled</span>
                    </div>
                  </div>

                  {/* Pricing Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-red-600 font-black text-base">
                      <Coins className="w-4 h-4" />
                      <span>{Number(plan.priceMmk || plan.price || 0).toLocaleString()}</span>
                      <span className="text-xs font-bold opacity-70">Coins</span>
                    </div>
                    <span className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition group-hover:scale-105">
                      Unlock Plan →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALL WORKOUT PLANS GRID */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {hasActiveFilters ? 'Search Results' : 'All Marketplace Plans'}
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {plans.length} plans available
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black text-slate-400">Loading Marketplace...</span>
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
              <Dumbbell className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-black text-base">No Plans Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Try clearing your search query or selecting a different category filter.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-5 py-2.5 bg-red-600 text-white font-black text-xs rounded-xl shadow-md">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => navigate(`/marketplace/${plan.id}`)}
                  className={`group rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-zinc-900/70 border-zinc-800 hover:border-red-500/50 shadow-lg'
                      : 'bg-white border-slate-200 hover:border-red-300 shadow-sm hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Thumbnail Frame */}
                    <div className="relative w-full h-36 rounded-2xl bg-zinc-900 overflow-hidden">
                      <img
                        src={plan.thumbnailUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'}
                        alt={plan.planName || plan.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {plan.category || 'STRENGTH'}
                      </div>
                    </div>

                    {/* Plan Info */}
                    <div>
                      <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-red-500 transition line-clamp-1">
                        {plan.planName || plan.title}
                      </h3>
                      <p className="text-xs font-bold text-red-500">by {plan.trainerName || 'Pro Coach'}</p>
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {plan.description || 'Full progressive workout routine designed for maximum muscle hypertrophy.'}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400 pt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-500" /> {plan.durationWeeks || plan.durationDays || 30} days</span>
                      <StarRating rating={plan.rating || 4.8} />
                    </div>
                  </div>

                  {/* Pricing Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-red-600 font-black text-base">
                      <Coins className="w-4 h-4" />
                      <span>{Number(plan.priceMmk || plan.price || 0).toLocaleString()}</span>
                      <span className="text-xs font-bold opacity-70">Coins</span>
                    </div>
                    <span className="px-4 py-2 border border-red-500/40 text-red-600 dark:text-red-400 font-black text-xs rounded-xl hover:bg-red-600 hover:text-white transition">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
