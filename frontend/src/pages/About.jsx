import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Dumbbell, Shield, Trophy, Users, Award, Target, Flame, Sparkles,
  CheckCircle2, ArrowRight, Activity, Zap, Heart, Clock, MapPin
} from 'lucide-react';

export const About = () => {
  const { theme } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/home/settings').then((res) => setSettings(res.data || {})).catch(() => {});
  }, []);

  const gymAddress = settings.gym_address || settings.address || 'Myawaddy, Myanmar';

  const features = [
    {
      icon: Dumbbell,
      title: t('about_feature1_title', 'World Class Rig'),
      desc: t('about_feature1_desc', 'Eleiko bars, Rogue power racks, and precision dumbbell sets up to 60kg.')
    },
    {
      icon: Activity,
      title: t('about_feature2_title', 'Cardio & Endurance'),
      desc: t('about_feature2_desc', 'Commercial treadmills, assault bikes, rowing machines with live telemetry.')
    },
    {
      icon: Zap,
      title: t('about_feature3_title', 'Recovery Lounge'),
      desc: t('about_feature3_desc', 'Infrared sauna, massage guns, and protein shake bar.')
    },
    {
      icon: Sparkles,
      title: t('about_feature4_title', 'Digital Gym Portal'),
      desc: t('about_feature4_desc', 'Track workouts, order supplements, and chat directly with your trainer online.')
    }
  ];

  return (
    <div className={`py-10 sm:py-16 ${isDark ? 'bg-[#08080a] text-white' : 'bg-[#fcfcfd] text-slate-900'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-16">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Trophy className="w-4 h-4" /> {t('about_title', 'About MWD Gym')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight">
            {t('about_subtitle', 'Our Fitness & Performance Destination')}
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('about_story_desc', 'MWD GYM started with a single vision: combining world-class equipment with real coaching accountability and an interactive coin rewards system.')}
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-slate-200'} shadow-xl space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black">{t('about_mission_title', 'Our Mission')}</h2>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('about_mission_desc', 'We exist to empower people of all fitness levels in Myanmar to build strength, discipline, and healthy habits that last a lifetime.')}
            </p>
            <div className="pt-4 flex items-center gap-6 border-t border-slate-200 dark:border-zinc-800">
              <div>
                <p className="text-2xl font-black text-red-600">500+</p>
                <p className="text-xs font-bold opacity-60">Active Members</p>
              </div>
              <div>
                <p className="text-2xl font-black text-red-600">12+</p>
                <p className="text-xs font-bold opacity-60">Certified Coaches</p>
              </div>
              <div>
                <p className="text-2xl font-black text-red-600">4.9★</p>
                <p className="text-xs font-bold opacity-60">Rating</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[320px] sm:h-[380px]">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&q=80"
              alt="Gym Interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Main Facility</p>
                <p className="text-lg font-black">{gymAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Facility Features */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black">{t('why_card3_title', 'Equipment & Facilities')}</h2>
            <p className={`text-xs sm:text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Everything you need for serious strength training, muscle hypertrophy, and athletic conditioning.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800 hover:border-red-500/40' : 'bg-white border-slate-200 hover:border-red-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base mb-2">{feat.title}</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gym House Rules */}
        <div className={`p-8 rounded-3xl border ${isDark ? 'bg-gradient-to-br from-zinc-900 to-black border-white/10' : 'bg-slate-900 text-white border-slate-800'} space-y-6`}>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" /> {t('about_rules_title', 'Gym House Rules')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-sm font-medium">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('about_rule1', 'Re-rack your weights after every set.')}</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('about_rule2', 'Wipe down equipment after use.')}</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('about_rule3', 'Respect fellow members and maintain a clean environment.')}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-full shadow-xl shadow-red-600/30 transition hover:scale-105"
          >
            {t('hero_btn_start', 'START FOR FREE')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
