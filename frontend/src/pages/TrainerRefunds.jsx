import { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  X,
  Loader2,
  Coins,
  User,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import api from "../api/client";

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "REQUESTED", label: "Refund Requested" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const refundBadge = {
  NONE: "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400",
  REQUESTED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function TrainerRefunds() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewAction, setReviewAction] = useState("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [screenshotModal, setScreenshotModal] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/marketplace/trainer/subscriptions");
      setSubscriptions(res.data || []);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filtered = subscriptions.filter((s) => {
    if (activeTab !== "ALL" && s.refundStatus !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.userName?.toLowerCase().includes(q) ||
        s.planTitle?.toLowerCase().includes(q) ||
        s.refundTransferId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    ALL: subscriptions.length,
    REQUESTED: subscriptions.filter((s) => s.refundStatus === "REQUESTED").length,
    APPROVED: subscriptions.filter((s) => s.refundStatus === "APPROVED").length,
    REJECTED: subscriptions.filter((s) => s.refundStatus === "REJECTED").length,
  };

  const handleRefundAction = async () => {
    if (!reviewModal) return;
    if (reviewAction === "reject" && !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await api.post(`/marketplace/trainer/subscriptions/${reviewModal.id}/refund`, {
        action: reviewAction,
        adminNotes: adminNotes.trim(),
        rejectReason: rejectReason.trim(),
      });
      await fetchSubscriptions();
      setReviewModal(null);
      setReviewAction("approve");
      setAdminNotes("");
      setRejectReason("");
    } catch (err) {
      console.error("Refund action failed", err);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-400">Loading refund requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25">
          <RotateCcw className="w-3.5 h-3.5" />
        </div>
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white">Refund Management</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">Review and process refund requests</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                activeTab === tab.key
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="ml-1 text-[10px] bg-slate-200 dark:bg-zinc-700 px-1 py-0.5 rounded-full">
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, plan, ID..."
            className="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: counts.ALL, color: "text-slate-900 dark:text-white" },
          { label: "Pending", value: counts.REQUESTED, color: "text-amber-600 dark:text-amber-400" },
          { label: "Approved", value: counts.APPROVED, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Rejected", value: counts.REJECTED, color: "text-red-600 dark:text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="surface p-2.5 text-center">
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Subscriptions List */}
      {filtered.length === 0 ? (
        <div className="surface p-8 text-center">
          <RotateCcw className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">No refund requests found</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
            {search ? "Try adjusting your search." : "No subscriptions match the filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((sub) => (
            <div key={sub.id} className="surface p-3 sm:p-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate">{sub.planTitle || `Plan #${sub.planId}`}</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${refundBadge[sub.refundStatus] || refundBadge.NONE}`}>
                      {sub.refundStatus || "NONE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1 truncate"><User className="w-3 h-3" /> {sub.userName || `User #${sub.userId}`}</span>
                    <span className="flex items-center gap-1"><Coins className="w-3 h-3" /> {Number(sub.pricePaidMmk || 0).toLocaleString()} coins</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(sub.purchaseDate)}</span>
                  </div>
                  {sub.cancellationReason && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      <span className="font-medium">Reason:</span> {sub.cancellationReason}
                    </p>
                  )}

                  {/* Payment Proof Preview */}
                  {sub.refundStatus === "REQUESTED" && (sub.refundPaymentMethod || sub.refundTransferId || sub.refundScreenshotUrl) && (
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 text-[11px]">
                      {sub.refundPaymentMethod && <span className="font-bold text-blue-700 dark:text-blue-400">{sub.refundPaymentMethod}</span>}
                      {sub.refundTransferId && <span className="text-slate-600 dark:text-zinc-300 font-mono truncate">{sub.refundTransferId}</span>}
                      {sub.refundScreenshotUrl && (
                        <button onClick={() => setScreenshotModal(sub)} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline shrink-0">
                          <ImageIcon className="w-3 h-3" /> View
                        </button>
                      )}
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {sub.refundStatus === "REJECTED" && sub.refundRejectionReason && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 truncate">
                      <span className="font-medium">Rejection:</span> {sub.refundRejectionReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {sub.refundStatus === "REQUESTED" && (
                    <button
                      onClick={() => { setReviewModal(sub); setReviewAction("approve"); setAdminNotes(""); setRejectReason(""); }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition"
                    >
                      Review
                    </button>
                  )}
                  {sub.refundStatus === "APPROVED" && (
                    <span className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  {sub.refundStatus === "REJECTED" && (
                    <span className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                  {sub.refundStatus === "NONE" && (
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">No refund</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { if (!processing) setReviewModal(null); }} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg p-4 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <button onClick={() => { if (!processing) setReviewModal(null); }} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition">
              <XCircle className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Review Refund Request</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Verify payment proof before processing</p>

            {/* Details */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/60 space-y-1.5 text-xs mb-3">
              <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">User</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.userName || `User #${reviewModal.userId}`}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Plan</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.planTitle}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Amount</span><span className="font-bold text-red-500">{Number(reviewModal.pricePaidMmk || 0).toLocaleString()} coins</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Reason</span><span className="text-slate-700 dark:text-zinc-300">{reviewModal.cancellationReason || "—"}</span></div>
            </div>

            {/* Payment Proof */}
            {(reviewModal.refundPaymentMethod || reviewModal.refundTransferId || reviewModal.refundScreenshotUrl) && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 space-y-1.5 text-xs mb-3">
                <p className="font-bold text-blue-700 dark:text-blue-400 text-[11px] uppercase">Payment Proof</p>
                {reviewModal.refundPaymentMethod && <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-zinc-400">Method</span><span className="font-medium text-slate-900 dark:text-white">{reviewModal.refundPaymentMethod}</span></div>}
                {reviewModal.refundTransferId && <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-zinc-400">Transfer ID</span><span className="font-medium text-slate-900 dark:text-white font-mono truncate ml-2">{reviewModal.refundTransferId}</span></div>}
                {reviewModal.refundScreenshotUrl && (
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Screenshot:</span>
                    <a href={reviewModal.refundScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block mt-1">
                      <img src={reviewModal.refundScreenshotUrl} alt="Transfer proof" className="w-full max-h-48 object-contain rounded-xl border border-slate-200 dark:border-zinc-700" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Decision */}
            <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Decision</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => setReviewAction("approve")}
                className={`p-2.5 rounded-xl border text-left transition ${reviewAction === "approve" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500" : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"}`}>
                <p className={`text-xs font-bold ${reviewAction === "approve" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-zinc-300"}`}>✓ Approve</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Return {Number(reviewModal.pricePaidMmk || 0).toLocaleString()} coins to client</p>
              </button>
              <button onClick={() => setReviewAction("reject")}
                className={`p-2.5 rounded-xl border text-left transition ${reviewAction === "reject" ? "bg-red-50 dark:bg-red-950/30 border-red-500 ring-1 ring-red-500" : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"}`}>
                <p className={`text-xs font-bold ${reviewAction === "reject" ? "text-red-700 dark:text-red-400" : "text-slate-700 dark:text-zinc-300"}`}>✕ Reject</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Keep subscription active</p>
              </button>
            </div>

            {reviewAction === "approve" ? (
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">Note to client (optional)</label>
                <input type="text" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Coins returned to your balance" className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Client will see: Refunded — coins returned</p>
              </div>
            ) : (
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-red-600 dark:text-red-400 mb-1">Reason for rejection *</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2}
                  placeholder="Explain why rejected — client will see this" className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                <p className="text-[10px] text-red-500 mt-1">Client will see this reason in My Purchases</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setReviewModal(null)} disabled={processing} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition">Cancel</button>
              <button onClick={handleRefundAction} disabled={processing || (reviewAction === "reject" && !rejectReason.trim())}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 ${reviewAction === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}>
                {processing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</> : reviewAction === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {screenshotModal && screenshotModal.refundScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setScreenshotModal(null)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full p-3 border border-slate-200 dark:border-zinc-800">
            <button onClick={() => setScreenshotModal(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
              <XCircle className="w-4 h-4" />
            </button>
            <p className="text-xs font-bold text-slate-900 dark:text-white mb-2 truncate">Screenshot — {screenshotModal.userName}</p>
            <img src={screenshotModal.refundScreenshotUrl} alt="Transfer proof" className="w-full rounded-xl border border-slate-200 dark:border-zinc-700" />
          </div>
        </div>
      )}
    </div>
  );
}
