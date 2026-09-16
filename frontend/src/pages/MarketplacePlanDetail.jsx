import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GuestAuthModal } from '../components/GuestAuthModal';
import {
  ArrowLeft,
  Star,
  Clock,
  Users,
  Dumbbell,
  Target,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Wallet,
  Lock,
  Shield,
  Info,
  Coins,
} from 'lucide-react';


const categoryColors = {
  STRENGTH: 'bg-red-500/10 text-red-500 border-red-500/20',
  CARDIO: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  FLEXIBILITY: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  NUTRITION: 'bg-green-500/10 text-green-500 border-green-500/20',
  SPORT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  MIXED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const difficultyColors = {
  BEGINNER: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  INTERMEDIATE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  ADVANCED: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const dayBorderColors = [
  'border-l-red-500',
  'border-l-blue-500',
  'border-l-emerald-500',
  'border-l-amber-500',
  'border-l-purple-500',
  'border-l-teal-500',
  'border-l-orange-500',
  'border-l-pink-500',
];

const dayHeaderColors = [
  'from-red-500/15 to-red-500/5',
  'from-blue-500/15 to-blue-500/5',
  'from-emerald-500/15 to-emerald-500/5',
  'from-amber-500/15 to-amber-500/5',
  'from-purple-500/15 to-purple-500/5',
  'from-teal-500/15 to-teal-500/5',
  'from-orange-500/15 to-orange-500/5',
  'from-pink-500/15 to-pink-500/5',
];

const dayTextColors = [
  'text-red-600 dark:text-red-400',
  'text-blue-600 dark:text-blue-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-amber-600 dark:text-amber-400',
  'text-purple-600 dark:text-purple-400',
  'text-teal-600 dark:text-teal-400',
  'text-orange-600 dark:text-orange-400',
  'text-pink-600 dark:text-pink-400',
];

const SUBSCRIPTION_TYPES = [
  { value: 'ONE_TIME_ACCESS', label: 'One-Time', desc: 'Single purchase, lifetime access' },
  { value: 'MONTHLY', label: 'Monthly', desc: 'Recurring monthly subscription' },
  { value: 'YEARLY', label: 'Yearly', desc: 'Recurring yearly subscription' },
];

const StarDisplay = ({ rating, size = 'w-4 h-4' }) => {
  const stars = [];
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className={`${size} fill-amber-400 text-amber-400`} />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <div key={i} className="relative" style={{ width: '1em', height: '1em' }}>
          <Star className={`absolute inset-0 ${size} text-zinc-300 dark:text-zinc-600`} />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className={`${size} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star key={i} className={`${size} text-zinc-300 dark:text-zinc-600`} />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const StarSelector = ({ value, onChange, hoverValue, onHover }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        onMouseEnter={() => onHover(star)}
        onMouseLeave={() => onHover(0)}
        className="p-0.5 transition-transform hover:scale-110"
      >
        <Star
          className={`w-6 h-6 transition-colors ${
            star <= (hoverValue || value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-zinc-300 dark:text-zinc-600'
          }`}
        />
      </button>
    ))}
  </div>
);

const formatNumber = (n) => Number(n || 0).toLocaleString();

const parseExercisesJson = (json) => {
  if (!json) return null;
  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    if (parsed && parsed.days && Array.isArray(parsed.days)) return parsed;
    return null;
  } catch {
    return null;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const MarketplacePlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState('ONE_TIME_ACCESS');
  const [buying, setBuying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [guestAuthOpen, setGuestAuthOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const coinBalance = user?.coinBalance || 0;

  const getSelectedPrice = () => {
    if (!plan) return 0;
    if (subscriptionType === 'MONTHLY') return Number(plan.priceMmk || 0);
    if (subscriptionType === 'YEARLY') return Number(plan.priceMmk || 0) * 10;
    return Number(plan.priceMmk || 0);
  };

  const hasEnoughCoins = coinBalance >= getSelectedPrice();

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/marketplace/plans/${id}`);
      setPlan(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load plan details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/marketplace/plans/${id}/reviews`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleBuy = async () => {
    setShowConfirmModal(false);
    if (!user) {
      setGuestAuthOpen(true);
      return;
    }
    setBuying(true);
    try {
      const res = await api.post(`/marketplace/plans/${id}/buy`, { subscriptionType });
      if (res.data?.newCoinBalance !== undefined && refreshUser) {
        refreshUser();
      }
      setPlan((prev) => (prev ? { ...prev, hasActiveSubscription: true } : prev));
      if (refreshUser) refreshUser();
    } catch (err) {
      alert(err.message || 'Purchase failed. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating || !reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await api.post(`/marketplace/plans/${id}/review`, {
        rating: reviewRating,
        reviewText: reviewText.trim(),
      });
      setReviewSubmitted(true);
      setReviewRating(0);
      setReviewText('');
      fetchReviews();
    } catch (err) {
      console.error('Review submit failed:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const starDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (dist[r.rating] !== undefined) dist[r.rating]++;
    });
    return dist;
  };

  const workoutData = plan ? parseExercisesJson(plan.exercisesJson) : null;
  const isSubscribed = plan?.hasActiveSubscription;
  const dist = starDistribution();
  const totalReviews = reviews.length;
  const canReview = isSubscribed && !reviewSubmitted && !reviews.some((r) => r.userId === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading plan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-900 dark:text-white">Something went wrong</p>
          <p className="text-sm text-slate-500 dark:text-zinc-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="space-y-5 animate-fadeIn max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero + Coin Balance Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Hero Section */}
        <div className="flex-1 p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start gap-4">
            {plan.thumbnailUrl && (
              <img
                src={plan.thumbnailUrl}
                alt={`${plan.title} cover`}
                className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl object-cover border border-slate-200 dark:border-zinc-700"
              />
            )}
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {plan.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                by{' '}
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  {plan.trainerName}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  categoryColors[plan.category] ||
                  'bg-slate-500/10 text-slate-500 border-slate-500/20'
                }`}
              >
                {plan.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  difficultyColors[plan.difficultyLevel] ||
                  'bg-slate-500/10 text-slate-500 border-slate-500/20'
                }`}
              >
                {plan.difficultyLevel}
              </span>
              {plan.planType && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {plan.planType}
                </span>
              )}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <StarDisplay rating={plan.rating} />
                  <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    {plan.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
                <span className="text-slate-300 dark:text-zinc-700">·</span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                  <Users className="w-3.5 h-3.5" />
                  {plan.totalPurchases || 0} purchased
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coin Balance Card */}
        <div className="sm:w-56 shrink-0 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/15">
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-bold uppercase text-amber-600/70 dark:text-amber-400/70 tracking-wider">
              Your Balance
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {formatNumber(coinBalance)}
            </span>
          </div>
          <p className="text-[11px] text-amber-600/50 dark:text-amber-400/50 mt-1 font-medium">
            coins available
          </p>
        </div>
      </div>

      {plan.previewVideoUrl && (
        <div className="overflow-hidden rounded-2xl bg-black border border-slate-200 dark:border-zinc-800 shadow-sm">
          <video
            src={plan.previewVideoUrl}
            controls
            preload="metadata"
            className="w-full aspect-video object-contain"
          />
        </div>
      )}

      {/* Price & Buy Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          {/* Price */}
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1">
              Price
            </p>
            <div className="flex items-baseline gap-1.5">
              <Coins className="w-6 h-6 text-amber-500 mt-0.5" />
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {formatNumber(getSelectedPrice())}
              </span>
              <span className="text-sm font-medium text-slate-400 dark:text-zinc-500">coins</span>
            </div>
          </div>

          {/* Subscription Type Selector */}
          <div className="flex-1 max-w-sm">
            <p className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 mb-2">
              Subscription Type
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SUBSCRIPTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSubscriptionType(type.value)}
                  className={`p-2.5 rounded-xl text-center transition border ${
                    subscriptionType === type.value
                      ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400'
                      : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buy / Subscribed */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800/80">
          {isSubscribed ? (
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                You have access to this plan
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {!hasEnoughCoins && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Insufficient coins. You need {formatNumber(getSelectedPrice() - coinBalance)} more coins.
                </p>
              )}
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={buying || !hasEnoughCoins}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2"
              >
                {buying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Buy Now — {formatNumber(getSelectedPrice())} coins
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-[#1a1a1f] border border-slate-200 dark:border-zinc-700 shadow-2xl animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <Coins className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buy this plan?</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  This will deduct{' '}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatNumber(getSelectedPrice())} coins
                  </span>{' '}
                  from your balance. You currently have{' '}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatNumber(coinBalance)} coins
                  </span>
                  .
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuy}
                  disabled={!hasEnoughCoins}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Content */}
      {isSubscribed && workoutData ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Workout Schedule</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
              {workoutData.days.length} day{workoutData.days.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {workoutData.days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 overflow-hidden border-l-4 ${
                  dayBorderColors[dayIdx % dayBorderColors.length]
                }`}
              >
                {/* Day Header */}
                <div
                  className={`px-5 py-3 bg-gradient-to-r ${
                    dayHeaderColors[dayIdx % dayHeaderColors.length]
                  }`}
                >
                  <h3
                    className={`font-extrabold text-sm ${
                      dayTextColors[dayIdx % dayTextColors.length]
                    }`}
                  >
                    {day.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {day.exercises?.length || 0} exercise{(day.exercises?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Exercises */}
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {day.exercises?.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-md bg-red-600/10 text-red-600 font-bold text-[11px] flex items-center justify-center mt-0.5">
                        {exIdx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                          {ex.name}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {ex.sets && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold">
                              {ex.sets} sets
                            </span>
                          )}
                          {ex.reps && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold">
                              {ex.reps} reps
                            </span>
                          )}
                          {ex.weight && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">
                              {ex.weight}
                            </span>
                          )}
                          {ex.duration && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold">
                              {ex.duration}
                            </span>
                          )}
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1.5 italic">
                            {ex.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isSubscribed && !workoutData ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
          <div className="text-center py-4">
            <Dumbbell className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Workout details will be available soon.
            </p>
          </div>
        </div>
      ) : (
        /* Locked content preview */
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
              Plan content locked
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
              Purchase this plan to unlock the full day-by-day workout schedule with exercises,
              sets, reps, and weights.
            </p>
          </div>
        </div>
      )}

      {/* Plan Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Duration', value: `${plan.durationWeeks || 0} weeks`, icon: Clock },
          { label: 'Target', value: plan.targetAudience || 'All levels', icon: Target },
          { label: 'Subscribers', value: plan.activeSubscribers || 0, icon: Users },
          { label: 'Plan Type', value: plan.planType || 'Standard', icon: TrendingUp },
          {
            label: 'Macro Planning',
            value: plan.includeMacroPlanning ? 'Included' : 'Not included',
            icon: TrendingUp,
            active: plan.includeMacroPlanning,
          },
          {
            label: 'Supplement Guide',
            value: plan.includeSupplementGuide ? 'Included' : 'Not included',
            icon: Dumbbell,
            active: plan.includeSupplementGuide,
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    item.active
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                  {item.label}
                </span>
              </div>
              <p
                className={`text-sm font-bold ${
                  item.active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Description */}
      {plan.description && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Description</h2>
            {descriptionExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {descriptionExpanded ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {plan.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500 line-clamp-2">
              {plan.description}
            </p>
          )}
        </div>
      )}

      {/* Reviews Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reviews</h2>
          <span className="text-xs text-slate-400 dark:text-zinc-500">({totalReviews})</span>
        </div>

        {/* Rating Summary */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="text-center sm:text-left shrink-0">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {plan.rating?.toFixed(1) || '0.0'}
            </p>
            <StarDisplay rating={plan.rating} />
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 space-y-1.5 max-w-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 w-3 text-right">
                    {star}
                  </span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 w-6 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Form */}
        {canReview && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800"
          >
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3">
              Write a Review
            </p>
            <div className="flex items-center gap-3 mb-3">
              <StarSelector
                value={reviewRating}
                onChange={setReviewRating}
                hoverValue={reviewHover}
                onHover={setReviewHover}
              />
              {reviewHover > 0 && (
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewHover]}
                </span>
              )}
            </div>
            <div className="relative mb-3">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Share your experience with this plan..."
                className="w-full p-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition"
              />
              <span className="absolute bottom-2 right-3 text-[11px] text-slate-400 dark:text-zinc-500">
                {reviewText.length}/1000
              </span>
            </div>
            <button
              type="submit"
              disabled={!reviewRating || !reviewText.trim() || submittingReview}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
            >
              {submittingReview ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        )}

        {reviewSubmitted && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Your review has been submitted. Thank you!
          </div>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600/10 text-red-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {review.userName?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {review.userName || 'Anonymous'}
                    </span>
                  </div>
                  <StarDisplay rating={review.rating} size="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {review.reviewText}
                </p>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    {formatDate(review.createdAt)}
                  </span>
                  {review.helpfulCount > 0 && (
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {review.helpfulCount} found helpful
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GuestAuthModal
        isOpen={guestAuthOpen}
        onClose={() => setGuestAuthOpen(false)}
        coinPrice={getSelectedPrice()}
        actionTitle="Sign In or Join to Unlock Workout Plan"
      />
    </div>
  );
};

