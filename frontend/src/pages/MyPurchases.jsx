import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Coins,
  Calendar,
  Clock,
  XCircle,
  RefreshCw,
  Filter,
  AlertTriangle,
  CheckCircle,
  PackageOpen,
  ChevronRight,
  Send,
  Loader2,
  Upload,
  Smartphone,
  Landmark,
  Image as ImageIcon,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "REFUND_REQUESTED", label: "Refund Requested" },
  { key: "EXPIRED", label: "Expired" },
  { key: "CANCELLED", label: "Cancelled" },
];

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  EXPIRED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const TYPE_LABELS = {
  ONE_TIME_ACCESS: "One-time",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TYPE_STYLES = {
  ONE_TIME_ACCESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MONTHLY: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  YEARLY: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCoins(n) {
  if (n == null) return "0";
  return Number(n).toLocaleString();
}

export default function MyPurchases() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [planCache, setPlanCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundPaymentMethod, setRefundPaymentMethod] = useState("KPAY");
  const [refundTransferId, setRefundTransferId] = useState("");
  const [refundScreenshot, setRefundScreenshot] = useState(null);
  const [refundScreenshotPreview, setRefundScreenshotPreview] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({});
  const screenshotRef = useRef(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/marketplace/my-purchases");
      const data = Array.isArray(res.data) ? res.data : [];
      setPurchases(data);

      const ids = [...new Set(data.map((p) => p.planId).filter(Boolean))];
      const cache = { ...planCache };
      await Promise.all(
        ids.map(async (id) => {
          if (cache[id]) return;
          try {
            const r = await api.get(`/marketplace/plans/${id}`);
            cache[id] = r.data;
          } catch {
            cache[id] = { title: `Plan #${id}` };
          }
        })
      );
      setPlanCache(cache);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
    api.get('/marketplace/payment-settings').then(res => {
      if (res.data) setPaymentSettings(res.data);
    }).catch(() => {});
  }, [fetchPurchases]);

  const filtered =
    activeTab === "ALL"
      ? purchases
      : activeTab === "REFUND_REQUESTED"
        ? purchases.filter((p) => p.refundStatus === "REQUESTED")
        : purchases.filter((p) => p.status === activeTab);

  const counts = {
    ALL: purchases.length,
    ACTIVE: purchases.filter((p) => p.status === "ACTIVE").length,
    REFUND_REQUESTED: purchases.filter((p) => p.refundStatus === "REQUESTED").length,
    EXPIRED: purchases.filter((p) => p.status === "EXPIRED").length,
    CANCELLED: purchases.filter((p) => p.status === "CANCELLED").length,
  };

  const openRefund = (purchase) => {
    setRefundModal(purchase);
    setRefundReason("");
    setRefundPaymentMethod("KPAY");
    setRefundTransferId("");
    setRefundScreenshot(null);
    setRefundScreenshotPreview(null);
    setRefundSuccess(false);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot too large (max 5MB)");
      return;
    }
    setRefundScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setRefundScreenshotPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submitRefund = async () => {
    if (!refundReason.trim() || !refundModal) return;
    try {
      setRefundLoading(true);
      const fd = new FormData();
      fd.append("reason", refundReason.trim());
      fd.append("paymentMethod", refundPaymentMethod);
      fd.append("transferId", refundTransferId.trim());
      if (refundScreenshot) {
        fd.append("screenshot", refundScreenshot);
      }
      await api.post(
        `/marketplace/subscriptions/${refundModal.id}/refund-request`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setRefundSuccess(true);
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === refundModal.id
            ? { ...p, refundStatus: "REQUESTED", cancellationReason: refundReason.trim() }
            : p
        )
      );
    } catch (e) {
      setError(e.message || "Failed to submit refund request.");
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            </button>
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-5 h-5 text-red-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                My Purchases
              </h1>
            </div>
          </div>

          {user?.coinBalance != null && (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-3 py-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {formatCoins(user.coinBalance)} coins
              </span>
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700"
              }`}
            >
              {tab.label}
              <span
                className={`text-[11px] px-1 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-500"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">Loading purchases…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
              <PackageOpen className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              No purchases yet
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              Browse the marketplace to find a plan.
            </p>
            <button
              onClick={() => navigate("/marketplace")}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition shadow-md shadow-red-600/20"
            >
              Browse Marketplace
            </button>
          </div>
        )}

        {/* Purchase Cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((purchase) => {
              const plan = planCache[purchase.planId];
              return (
                <div
                  key={purchase.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition"
                >
                  {/* Top row: plan title + badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-2.5">
                    <button
                      onClick={() =>
                        navigate(`/marketplace/${purchase.planId}`)
                      }
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition text-left truncate line-clamp-1"
                    >
                      {plan?.title || `Plan #${purchase.planId}`}
                      <ChevronRight className="inline w-3.5 h-3.5 ml-1 opacity-50" />
                    </button>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TYPE_STYLES[purchase.subscriptionType] || TYPE_STYLES.ONE_TIME_ACCESS}`}
                      >
                        {TYPE_LABELS[purchase.subscriptionType] || purchase.subscriptionType}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[purchase.status] || ""}`}
                      >
                        {purchase.status}
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-xs">
                    {/* Price paid */}
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCoins(purchase.pricePaidMmk)}
                      </span>
                      <span>coins</span>
                    </div>

                    {/* Purchase date */}
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>Purchased {formatDate(purchase.purchaseDate)}</span>
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>
                        {formatDate(purchase.startDate)} → {formatDate(purchase.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Refund status banner — visible for any refund */}
                  {purchase.refundStatus && purchase.refundStatus !== "NONE" && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                      {purchase.refundStatus === "REQUESTED" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Refund pending</p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-300 truncate">Waiting for admin/trainer review</p>
                          </div>
                        </div>
                      )}
                      {purchase.refundStatus === "APPROVED" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Refunded — {formatCoins(purchase.pricePaidMmk)} coins returned</p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-300 truncate">{purchase.refundAdminNotes ? purchase.refundAdminNotes : "Coins added to your balance"}</p>
                          </div>
                        </div>
                      )}
                      {purchase.refundStatus === "REJECTED" && (
                        <div className="px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <p className="text-xs font-bold text-red-700 dark:text-red-400">Refund rejected</p>
                          </div>
                          <p className="text-[11px] text-red-600 dark:text-red-300 mt-1 line-clamp-2">{purchase.refundRejectionReason || "Please contact support"}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  {purchase.status === "ACTIVE" && purchase.refundStatus !== "REQUESTED" && purchase.refundStatus !== "APPROVED" && (
                    <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                      <button onClick={() => navigate(`/marketplace/${purchase.planId}`)} className="px-3 py-1.5 bg-slate-900 dark:bg-white dark:text-zinc-900 text-white text-xs font-medium rounded-xl transition">View</button>
                      <button onClick={() => openRefund(purchase)} className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium rounded-xl transition flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Refund
                      </button>
                    </div>
                  )}

                  {purchase.status === "EXPIRED" && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                      <p className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Expired</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh button */}
        {!loading && purchases.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={fetchPurchases}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!refundLoading) setRefundModal(null);
            }}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-4 border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => {
                if (!refundLoading) setRefundModal(null);
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition"
            >
              <XCircle className="w-4 h-4" />
            </button>

            {refundSuccess ? (
              <div className="flex flex-col items-center text-center py-3 gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Refund Requested
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Your refund request has been submitted. You will be notified once reviewed.
                </p>
                <button
                  onClick={() => setRefundModal(null)}
                  className="mt-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Request Refund
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
                  Provide payment details and reason.
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">Plan</span>
                    <span className="font-medium text-slate-900 dark:text-white truncate ml-2">
                      {planCache[refundModal.planId]?.title || `Plan #${refundModal.planId}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">Refund Amount</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCoins(refundModal.pricePaidMmk)} coins
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1.5 mb-3">
                  {(paymentSettings.payment_methods_enabled || 'KPAY,WAVE,BANK').split(',').filter(Boolean).map(m => (
                    <button key={m} type="button" onClick={() => setRefundPaymentMethod(m)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                        refundPaymentMethod === m
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-red-300'
                      }`}>
                      {m === 'KPAY' && <Smartphone className="w-3.5 h-3.5" />}
                      {m === 'WAVE' && <Smartphone className="w-3.5 h-3.5" />}
                      {m === 'BANK' && <Landmark className="w-3.5 h-3.5" />}
                      {m}
                    </button>
                  ))}
                </div>

                {/* Transfer ID */}
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Transfer ID
                </label>
                <input
                  type="text"
                  value={refundTransferId}
                  onChange={(e) => setRefundTransferId(e.target.value)}
                  placeholder="e.g. KBZ-20260901-12345"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition mb-3"
                />

                {/* Screenshot Upload */}
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Screenshot
                </label>
                <input ref={screenshotRef} type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                {refundScreenshotPreview ? (
                  <div className="relative mb-3">
                    <img src={refundScreenshotPreview} alt="Screenshot" className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-zinc-700" />
                    <button onClick={() => { setRefundScreenshot(null); setRefundScreenshotPreview(null); if (screenshotRef.current) screenshotRef.current.value = ''; }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-500 transition">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => screenshotRef.current?.click()}
                    className="w-full p-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl flex flex-col items-center gap-1 text-slate-400 dark:text-zinc-500 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 transition mb-3">
                    <Upload className="w-5 h-5" />
                    <span className="text-[11px] font-medium">Upload screenshot</span>
                    <span className="text-[10px]">PNG, JPG up to 5MB</span>
                  </button>
                )}

                {/* Reason */}
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={2}
                  placeholder="Reason for refund…"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition resize-none"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setRefundModal(null)}
                    disabled={refundLoading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRefund}
                    disabled={refundLoading || !refundReason.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition shadow-sm"
                  >
                    {refundLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
