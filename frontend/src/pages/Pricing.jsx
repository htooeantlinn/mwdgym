import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';
import {
  Check, Flame, Coins, Shield, Crown, Sparkles, HelpCircle, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';

export const Pricing = () => {
  const { theme } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const [plans, setPlans] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.get('/home').then(r => {
      if (r.data?.plans) setPlans(r.data.plans);
    }).catch(() => {});
  }, []);

  const defaultPlans = [
    {
      id: 1,
      name: 'Basic Access',
      price: '15,000',
      durationDays: 30,
      description: 'Full gym floor & cardio access for self-guided training.',
      bonusCoins: 50,
      popular: false,
      features: [
        'Gym floor & cardio zone access',
        'Locker room & shower access',
        'Earn +50 bonus coins monthly',
        'Free mobile app tracking'
      ]
    },
    {
      id: 2,
      name: 'Pro Strength',
      price: '35,000',
      durationDays: 30,
      description: 'Best seller! Includes trainer consultation & marketplace workouts.',
      bonusCoins: 150,
      popular: true,
      features: [
        'All Basic Access perks',
        '1-on-1 trainer orientation set',
        'Full workout marketplace access',
        'Earn +150 bonus coins monthly',
        'Free protein shake on sign-up'
      ]
    },
    {
      id: 3,
      name: 'VIP Elite Trainer',
      price: '75,000',
      durationDays: 30,
      description: 'Dedicated personal trainer, custom meal plan & unlimited sauna.',
      bonusCoins: 400,
      popular: false,
      features: [
        'All Pro Strength perks',
        'Dedicated Personal Trainer (4x/mo)',
        'Custom macro & meal plan',
        'Earn +400 bonus coins monthly',
        'Sauna & recovery lounge VIP access',
        'Priority messenger coach chat'
      ]
    }
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  const faqs = [
    {
      q: t('pricing_faq1_q', 'Can I cancel my membership anytime?'),
      a: t('pricing_faq1_a', 'Yes, all memberships can be cancelled or paused at any time without extra fees.')
    },
    {
      q: t('pricing_faq2_q', 'How do coin rewards work?'),
      a: t('pricing_faq2_a', 'You earn coins whenever you log workouts, check into the gym, or complete trainer challenges. Coins can be spent in the Coin Shop for gear and supplements.')
    },
    {
      q: t('pricing_faq3_q', 'Is trainer support included?'),
      a: t('pricing_faq3_a', 'Pro and Elite plans include 1-on-1 trainer consultation and customized workout plans.')
    }
  ];

  return (
    <div className={`py-10 sm:py-16 ${isDark ? 'bg-[#08080a] text-white' : 'bg-[#fcfcfd] text-slate-900'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Crown className="w-4 h-4" /> {t('pricing_title', 'Membership Plans')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight">
            {t('pricing_subtitle', 'Simple, transparent pricing with no hidden contracts')}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Every plan includes coin rewards to exchange for supplements & gym gear in our Coin Shop!
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {displayPlans.map((plan, idx) => {
            const isPopular = plan.popular || idx === 1;
            return (
              <div
                key={plan.id || idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between border transition duration-200 ${
                  isPopular
                    ? 'border-red-600 shadow-2xl ring-2 ring-red-600/30 dark:bg-zinc-900/90 bg-white scale-105 z-10'
                    : isDark
                    ? 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[11px] font-black uppercase px-4 py-1 rounded-full tracking-wider shadow-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" /> {t('pricing_badge_popular', 'MOST POPULAR')}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xl font-black">{plan.name || plan.planName}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {plan.description || plan.desc || 'Complete fitness & coaching membership'}
                  </p>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-red-600">
                      {typeof plan.price === 'number' ? plan.price.toLocaleString() : plan.price}
                    </span>
                    <span className="text-xs font-bold opacity-70">MMK {t('pricing_per_month', '/ month')}</span>
                  </div>

                  {/* Bonus coins badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-500 text-xs font-black">
                    <Coins className="w-4 h-4 shrink-0" />
                    <span>+{plan.bonusCoins || 100} {t('pricing_coin_bonus', 'Bonus Coins Included')}</span>
                  </div>

                  <hr className={`my-4 ${isDark ? 'border-zinc-800' : 'border-slate-100'}`} />

                  {/* Feature Checklist */}
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">{t('pricing_includes', 'Plan Features Includes:')}</p>
                  <ul className="space-y-2.5 text-xs font-medium">
                    {(plan.features || [
                      'Gym floor & cardio zone access',
                      'Locker room & shower access',
                      'Earn bonus coins monthly',
                      'Free mobile app tracking'
                    ]).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/signup"
                    className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition ${
                      isPopular
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                        : isDark
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {t('pricing_btn_select', 'Get Started Now')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-red-500" /> {t('pricing_faq_title', 'Frequently Asked Questions')}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-black text-sm flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-red-500" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                  </button>
                  {isOpen && (
                    <div className={`px-5 pb-5 text-xs leading-relaxed border-t pt-3 ${
                      isDark ? 'border-zinc-800 text-slate-300' : 'border-slate-100 text-slate-600'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
