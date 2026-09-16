import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';
import {
  Users, Award, Star, Dumbbell, Flame, CheckCircle, ArrowRight, ShieldCheck, Trophy
} from 'lucide-react';

export const Coaches = () => {
  const { theme } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const [trainers, setTrainers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    api.get('/home').then(r => {
      if (r.data?.trainers) setTrainers(r.data.trainers);
    }).catch(() => {});
  }, []);

  const defaultCoaches = [
    {
      id: 1,
      name: 'Coach Aung Thu',
      specialty: 'Bodybuilding & Hypertrophy',
      category: 'HYPERTROPHY',
      experience: 8,
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80',
      bio: 'IFBB certified bodybuilding coach specializing in muscle hypertrophy and contest prep.'
    },
    {
      id: 2,
      name: 'Coach Lin Htet',
      specialty: 'Powerlifting & Strength',
      category: 'STRENGTH',
      experience: 6,
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      bio: 'National powerlifting champion. Focused on heavy compound movements, squat & deadlift technique.'
    },
    {
      id: 3,
      name: 'Coach May Phyo',
      specialty: 'Fat Loss & HIIT Conditioning',
      category: 'FATLOSS',
      experience: 5,
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=80',
      bio: 'Specialist in metabolic conditioning, calorie burn routines, and sustainable nutrition habits.'
    },
    {
      id: 4,
      name: 'Coach Kyaw Zaya',
      specialty: 'Functional Fitness & Endurance',
      category: 'HIIT',
      experience: 7,
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
      bio: 'Crossfit Level 2 trainer specializing in stamina, agility, mobility, and injury prevention.'
    }
  ];

  const displayCoaches = trainers.length > 0 ? trainers : defaultCoaches;

  const filteredCoaches = displayCoaches.filter(coach => {
    if (selectedFilter === 'ALL') return true;
    return coach.category === selectedFilter || coach.specialty?.toUpperCase().includes(selectedFilter);
  });

  const filterTabs = [
    { id: 'ALL', label: t('coaches_filter_all', 'All Specialties') },
    { id: 'HYPERTROPHY', label: t('coaches_filter_hypertrophy', 'Bodybuilding') },
    { id: 'FATLOSS', label: t('coaches_filter_fatloss', 'Fat Loss') },
    { id: 'STRENGTH', label: t('coaches_filter_strength', 'Powerlifting') },
    { id: 'HIIT', label: t('coaches_filter_hiit', 'HIIT & Cardio') }
  ];

  return (
    <div className={`py-10 sm:py-16 ${isDark ? 'bg-[#08080a] text-white' : 'bg-[#fcfcfd] text-slate-900'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4" /> {t('coaches_title', 'Meet Our Pro Coaches')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight">
            {t('coaches_subtitle', 'Certified fitness leaders dedicated to your transformation')}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Our coaches create custom workout plans available in our workout marketplace!
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                selectedFilter === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                  : isDark
                  ? 'bg-zinc-900 border border-zinc-800 text-slate-300 hover:bg-zinc-800'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Coach Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCoaches.map((coach, idx) => (
            <div
              key={coach.id || idx}
              className={`group rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 hover:border-red-500/40'
                  : 'bg-white border-slate-200 hover:border-red-300'
              }`}
            >
              <div className="space-y-4">
                <div className="relative h-64 overflow-hidden bg-slate-900">
                  <img
                    src={coach.image || coach.profileImage || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80'}
                    alt={coach.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute top-3 right-3 bg-amber-400 text-black px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {coach.rating || '4.9'}
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">{coach.name}</h3>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{coach.specialty}</p>
                  <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {coach.bio || coach.description || 'Certified coach dedicated to helping members achieve peak performance.'}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs font-bold opacity-75">
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-500" /> {coach.experience || 5}+ {t('coaches_exp', 'Years Experience')}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to="/marketplace"
                  className="w-full py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-2 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-600 hover:text-white transition"
                >
                  {t('coaches_btn_view', 'View Workout Plans')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
