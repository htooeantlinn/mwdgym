import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Dumbbell, Zap, Trophy, Users, Star, Flame, ArrowRight, ArrowUpRight,
  Check, Play, Shield, Clock, MapPin, Phone, Coins, ShoppingBag, Award,
  ChevronRight, Quote, Timer, Target, TrendingUp, Sparkles, Crown, Gift, Heart, Package, Truck, FileText, Store as StoreIcon
} from 'lucide-react';

export const Landing = () => {
  const { theme, user } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const [data, setData] = useState({ plans: [], trainers: [], settings: {}, memberCount: 0, activeCount: 0 });
  const [coinPkgs, setCoinPkgs] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroAuto, setHeroAuto] = useState(true);

  useEffect(() => {
    api.get('/home').then(r => setData(r.data)).catch(()=>{});
    api.get('/coin-shop/packages').then(r=> setCoinPkgs((r.data||[]).slice(0,3))).catch(()=>{});
    api.get('/shop/products').then(r=> setStoreProducts((r.data||[]).slice(0,4))).catch(()=>{});
  }, []);

  const heroImagesRaw = data.settings?.hero_images;
  const heroImages = useMemo(() => {
    let arr = [];
    try {
      if (heroImagesRaw) {
        const parsed = JSON.parse(heroImagesRaw);
        if (Array.isArray(parsed)) arr = parsed.filter(Boolean);
        else if (typeof heroImagesRaw === 'string' && heroImagesRaw.includes(',')) arr = heroImagesRaw.split(',').map(s=>s.trim()).filter(Boolean);
      }
    } catch { arr = []; }
    if (arr.length === 0) {
      arr = [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
      ];
    }
    return arr;
  }, [heroImagesRaw]);
  const heroInterval = useMemo(() => parseInt(data.settings?.hero_interval || "4", 10) || 4, [data.settings?.hero_interval]);

  useEffect(() => {
    if (!heroAuto || heroImages.length <= 1) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), heroInterval * 1000);
    return () => clearInterval(t);
  }, [heroAuto, heroImages.length, heroInterval]);

  const gymName = data.settings?.gym_name || 'MWD GYM';
  const slogan = data.settings?.gym_slogan || t('hero_desc', 'Where Discipline Becomes Strength');
  const phone = data.settings?.gym_phone || data.settings?.phone || '+95 9 123 456 789';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#08080a] text-white' : 'bg-[#fcfcfd] text-slate-900'}`}>
      {/* HERO SECTION */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left headline & CTA */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-black px-4 py-1.5 rounded-full text-xs font-black tracking-wide shadow-md">
              <Crown className="w-4 h-4" /> {t('hero_badge', '#1 GYM — 4.9★ (2,300+ reviews)')}
            </div>

            <h1 className="font-black leading-[0.9] tracking-tighter">
              <span className="block text-[44px] sm:text-[68px] lg:text-[80px]">{t('hero_title_1', 'NO EXCUSES.')}</span>
              <span className="block text-[44px] sm:text-[68px] lg:text-[80px] text-transparent" style={{ WebkitTextStroke: isDark ? '1.5px white' : '1.5px black' }}>
                {t('hero_title_2', 'JUST RESULTS.')}
              </span>
              <span className="block text-[20px] sm:text-[28px] mt-2 font-black text-red-600">
                {t('hero_subtitle', 'Build muscle • Burn fat • Earn coins')}
              </span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {slogan}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/signup" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-7 py-3.5 rounded-full font-black text-sm shadow-xl shadow-red-600/30 transition hover:scale-105">
                {t('hero_btn_start', 'START FOR FREE')} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-black text-sm border transition ${isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-900 hover:bg-slate-900 hover:text-white'}`}>
                <Play className="w-4 h-4" /> {t('hero_btn_tour', 'Watch Tour')}
              </Link>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                <Shield className="w-4 h-4 text-emerald-500" /> {t('hero_nocard', 'No credit card required')}
              </span>
            </div>

            {/* Trust row */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold opacity-80">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> {t('hero_trust_coaches', 'Certified Coaches')}</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> {t('hero_trust_market', 'Workout Marketplace')}</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> {t('hero_trust_store', 'Store & Delivery')}</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> {t('hero_trust_coins', 'Coin Rewards')}</span>
            </div>
          </div>

          {/* Right hero image slider */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-zinc-900 to-black p-1.5 shadow-2xl">
              <div className={`rounded-[22px] overflow-hidden relative h-[380px] sm:h-[460px] ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent z-10" />
                {heroImages.map((src, i) => (
                  <img key={i} src={src} alt={`slide-${i}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i===heroIdx ? 'opacity-100' : 'opacity-0'}`} />
                ))}
                {/* Carousel Navigation Controls */}
                <button onClick={()=> setHeroIdx(i=> (i-1+heroImages.length)%heroImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur">‹</button>
                <button onClick={()=> setHeroIdx(i=> (i+1)%heroImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur">›</button>

                {/* Floating stat badges */}
                <div className="absolute top-4 left-4 z-20 bg-white text-black rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><TrendingUp className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-black">{t('hero_stat_strength', '+12% Strength')}</p>
                    <p className="text-[10px] font-bold text-slate-600">{t('hero_stat_time', 'avg. in 4 weeks')}</p>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-3">
                  <div className="flex-1 bg-white rounded-2xl p-3 flex items-center gap-2.5 shadow-xl">
                    <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shrink-0">₵</div>
                    <div>
                      <p className="text-xs font-black text-black">{t('hero_stat_earn', 'Earn Coins')}</p>
                      <p className="text-[10px] font-bold text-slate-600">{t('hero_stat_earn_desc', 'Every workout = rewards')}</p>
                    </div>
                  </div>
                  <div className="bg-amber-400 text-black rounded-2xl px-4 py-2.5 text-center shadow-xl">
                    <p className="text-[9px] font-black tracking-widest uppercase">{t('hero_stat_price_from', 'FROM')}</p>
                    <p className="text-base font-black leading-none">{t('hero_stat_price_val', '5,000')}</p>
                    <p className="text-[9px] font-black">{t('hero_stat_price_unit', 'MMK/mo')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Social Proof Strip */}
        <div className={`mt-10 grid grid-cols-3 lg:grid-cols-6 gap-4 text-center border-y py-5 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {[
            { k: '500+', l: t('stat_members', 'Members') },
            { k: '4.9★', l: t('stat_rating', 'Rating') },
            { k: '12', l: t('stat_trainers', 'Pro Trainers') },
            { k: '50+', l: t('stat_plans', 'Workout Plans') },
            { k: '24/7', l: t('stat_shop', 'Coin Shop') },
            { k: '7 days', l: t('stat_access', 'Days Access') },
          ].map(s => (
            <div key={s.l}>
              <p className="font-black text-xl sm:text-2xl leading-none text-red-600">{s.k}</p>
              <p className="text-[10px] font-black tracking-widest uppercase opacity-60 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY MWD GYM HITS DIFFERENT */}
      <section className={`${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-900 text-white'} py-12 sm:py-16`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <h2 className="font-black tracking-tighter leading-tight text-[28px] sm:text-[42px]">
              {t('why_title_1', 'WHY MWD')} <span className="text-red-600">{t('why_title_2', 'HITS DIFFERENT')}</span>
            </h2>
            <p className="text-sm font-medium text-slate-300 max-w-md">
              {t('why_desc', 'Not just a generic gym. Certified coaching + workout marketplace + earnable coin rewards keep you consistent.')}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Award, title: t('why_card1_title', 'Certified Pro Coaches'), desc: t('why_card1_desc', 'Get routine plans designed by top fitness pros.'), color: 'bg-red-600' },
              { icon: Coins, title: t('why_card2_title', 'Earn Workout Coins'), desc: t('why_card2_desc', 'Complete exercises & check-ins to earn coins for gear.'), color: 'bg-amber-400 text-black' },
              { icon: Dumbbell, title: t('why_card3_title', 'Equipment & Facilities'), desc: t('why_card3_desc', 'Heavy lifting rigs, cardio zone & recovery lounge.'), color: 'bg-emerald-500' },
              { icon: ShoppingBag, title: t('why_card4_title', 'Workout Marketplace'), desc: t('why_card4_desc', 'Browse trainer plans and unlock workouts with coins.'), color: 'bg-indigo-600' },
            ].map(c => (
              <div key={c.title} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
                <div className={`w-11 h-11 rounded-2xl ${c.color} flex items-center justify-center mb-4 text-white font-black`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <p className="font-black text-lg text-white mb-1">{c.title}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKOUT MARKETPLACE PREVIEW */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-black tracking-tighter text-[24px] sm:text-[32px] flex items-center gap-2">
              <StoreIcon className="w-7 h-7 text-red-600" /> WORKOUT MARKETPLACE
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Browse trainer plans & unlock workouts with your earned coins.
            </p>
          </div>
          <Link to="/marketplace" className="text-xs font-black inline-flex items-center gap-1 text-red-600 hover:underline">
            Browse All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data.plans||[]).slice(0,3).map((p,i)=> (
            <Link key={p.id||i} to={`/marketplace/${p.id}`} className={`group rounded-3xl border p-6 hover:shadow-xl transition duration-200 ${isDark ? 'bg-zinc-900/60 border-zinc-800 hover:border-red-500/40' : 'bg-white border-slate-200 hover:border-red-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-600 text-white uppercase">{p.category || 'HYPERTROPHY'}</span>
                <span className="text-xs font-bold opacity-60">{p.durationDays || 30} days</span>
              </div>
              <p className="font-black text-lg leading-snug line-clamp-1">{p.planName || 'Pro Strength Program'}</p>
              <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{p.description || 'Full progressive routine with exercise demos'}</p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="font-black text-red-600 text-base flex items-center gap-1"><Coins className="w-4 h-4" /> {Number(p.price||0).toLocaleString()} <span className="text-xs font-normal">Coins</span></span>
                <span className="text-xs font-black bg-red-600 text-white px-4 py-2 rounded-full group-hover:bg-red-500 transition">View Plan →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* QUICK LINKS BANNER TO ALL PAGES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className={`rounded-3xl p-8 border ${isDark ? 'bg-gradient-to-r from-zinc-900 to-black border-zinc-800' : 'bg-red-600 text-white border-red-500'} flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl`}>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">{t('contact_subtitle', "We'd love to welcome you at MWD GYM")}</h3>
            <p className="text-xs sm:text-sm opacity-90">Explore our facilities, membership pricing, certified coaches, or get in touch with us today!</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/about" className="px-5 py-3 rounded-full bg-white text-black font-black text-xs hover:bg-slate-100 transition">
              {t('nav_about', 'About Us')}
            </Link>
            <Link to="/pricing" className="px-5 py-3 rounded-full bg-amber-400 text-black font-black text-xs hover:bg-amber-300 transition">
              {t('nav_pricing', 'Pricing')}
            </Link>
            <Link to="/coaches" className="px-5 py-3 rounded-full bg-black text-white font-black text-xs hover:bg-zinc-800 transition">
              {t('nav_coaches', 'Coaches')}
            </Link>
            <Link to="/contact" className="px-5 py-3 rounded-full border border-white text-white font-black text-xs hover:bg-white/10 transition">
              {t('nav_contact', 'Contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
