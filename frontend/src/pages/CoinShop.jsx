import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Coins, Star, Zap, Crown, Gift, CheckCircle2, Clock, XCircle,
  X, Upload, Smartphone, Landmark, Image as ImageIcon, History, ShoppingBag,
  TrendingUp, Sparkles, AlertTriangle, Loader2, Wallet,
} from "lucide-react";

export default function CoinShop() {
  const { user, refreshUser } = useAuth();
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("shop");
  const [selected, setSelected] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("KPAY");
  const [transferId, setTransferId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState(0);
  const fileRef = useRef(null);

  // Admin
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminTab, setAdminTab] = useState("orders");
  const [orderFilter, setOrderFilter] = useState("PENDING");
  const isAdmin = user?.role === "ADMIN";

  const fetchAll = useCallback(async () => {
    try {
      const [pkgRes, payRes, balRes] = await Promise.all([
        api.get("/coin-shop/packages"),
        api.get("/marketplace/payment-settings").catch(() => ({ data: {} })),
        api.get("/marketplace/coins/balance").catch(() => ({ data: { coinBalance: 0 } })),
      ]);
      setPackages(pkgRes.data || []);
      setPaymentSettings(payRes.data || {});
      setBalance(balRes.data?.coinBalance || 0);
      const ordRes = await api.get("/coin-shop/orders/my").catch(() => ({ data: [] }));
      setOrders(ordRes.data || []);
      if (isAdmin) {
        const admRes = await api.get("/coin-shop/admin/orders").catch(() => ({ data: [] }));
        setAdminOrders(admRes.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // refresh orders when tab switches
  useEffect(() => {
    if (tab === "orders") api.get("/coin-shop/orders/my").then(r => setOrders(r.data || [])).catch(()=>{});
    if (tab === "admin" && isAdmin) api.get("/coin-shop/admin/orders").then(r => setAdminOrders(r.data || [])).catch(()=>{});
  }, [tab, isAdmin]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return alert("Max 5MB");
    setScreenshot(f);
    const r = new FileReader();
    r.onload = (ev) => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const submitOrder = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("packageId", selected.id);
      fd.append("paymentMethod", paymentMethod);
      if (transferId.trim()) fd.append("transferId", transferId.trim());
      if (screenshot) fd.append("screenshot", screenshot);
      await api.post("/coin-shop/orders", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(true);
      setOrders(await api.get("/coin-shop/orders/my").then(r=>r.data).catch(()=>[]));
      if (isAdmin) setAdminOrders(await api.get("/coin-shop/admin/orders").then(r=>r.data).catch(()=>[]));
      setTimeout(() => { setSuccess(false); setSelected(null); setTransferId(""); setScreenshot(null); setPreview(null); }, 1500);
    } catch (e) { alert(e.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const adminAction = async (id, action, reason) => {
    try {
      if (action === "approve") await api.post(`/coin-shop/admin/orders/${id}/approve`, {});
      else await api.post(`/coin-shop/admin/orders/${id}/reject`, { rejectionReason: reason || "Rejected by admin" });
      const admRes = await api.get("/coin-shop/admin/orders");
      setAdminOrders(admRes.data || []);
      const balRes = await api.get("/marketplace/coins/balance").catch(()=>({data:{coinBalance:balance}}));
      setBalance(balRes.data?.coinBalance || balance);
      if (refreshUser) refreshUser();
    } catch (e) { alert(e.message); }
  };

  const getPaymentInfo = () => {
    if (paymentMethod === "KPAY") return { label: "KPay", name: paymentSettings.payment_kpay_name, number: paymentSettings.payment_kpay_number, color: "bg-blue-600" };
    if (paymentMethod === "WAVE") return { label: "WavePay", name: paymentSettings.payment_wave_name, number: paymentSettings.payment_wave_number, color: "bg-cyan-600" };
    return { label: "Bank", name: paymentSettings.payment_bank_holder, number: paymentSettings.payment_bank_account, sub: paymentSettings.payment_bank_name, color: "bg-emerald-600" };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const payInfo = getPaymentInfo();
  const filteredAdminOrders = orderFilter === "ALL" ? adminOrders : adminOrders.filter(o => o.status === orderFilter);

  return (
    <div className="space-y-4 animate-fadeIn max-w-6xl mx-auto">
      {/* Header — compact */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
        <div className="bg-gradient-to-r from-[#1a1033] via-[#2d1b69] to-[#1a1033] dark:from-[#0f0a1f] dark:via-[#1e0f4a] dark:to-[#0f0a1f] p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-[80px] -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500 rounded-full blur-[60px] translate-y-10 -translate-x-10" />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black text-white flex items-center gap-1.5">
                  Coin Shop <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h1>
                <p className="text-[11px] text-violet-200">Top up • Bonus</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-amber-200">Balance</p>
                <p className="text-base font-black text-white leading-none">{Number(balance).toLocaleString()} <span className="text-amber-300 text-xs">Coins</span></p>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="bg-white dark:bg-[#121215] px-2 sm:px-4 py-2 flex gap-1 overflow-x-auto border-t border-slate-200 dark:border-zinc-800">
          {[
            { k: "shop", label: "Shop", icon: ShoppingBag },
            { k: "orders", label: "My Orders", icon: History, badge: orders.filter(o=>o.status==="PENDING").length },
            ...(isAdmin ? [{ k: "admin", label: "Admin", icon: Crown }] : []),
          ].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${tab===t.k ? "bg-amber-500 text-white shadow" : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {t.badge ? <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{t.badge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* SHOP TAB - ML Package Grid */}
      {tab === "shop" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {packages.map(pkg => {
              const isPopular = pkg.popular;
              const hasBonus = pkg.bonusCoins > 0;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelected(pkg)}
                  className={`relative rounded-xl border-2 p-3 text-left transition-all group overflow-hidden ${
                    selected?.id === pkg.id
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-lg shadow-amber-500/15 scale-[1.02]"
                      : isPopular
                      ? "border-violet-300 dark:border-violet-700 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/40 dark:to-[#1a1033] hover:border-violet-400 shadow-md"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1e] hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md"
                  }`}
                >
                  {/* Badge */}
                  {pkg.badgeText && (
                    <div className={`absolute top-0 right-0 text-[10px] font-black px-2.5 py-1 rounded-bl-xl ${isPopular ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : hasBonus ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-amber-400 text-amber-900"}`}>
                      {pkg.badgeText}
                    </div>
                  )}
                  {hasBonus && !pkg.badgeText && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">+{pkg.bonusCoins}</div>
                  )}

                  {/* Coin Icon */}
                  <div className="flex justify-center mb-2.5 mt-0.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isPopular ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25" : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/20"} group-hover:scale-105 transition-transform`}>
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-center">
                    <p className="font-black text-slate-900 dark:text-white text-[0.95rem] leading-none">
                      {Number(pkg.coins).toLocaleString()}
                      {hasBonus && <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold"> +{Number(pkg.bonusCoins).toLocaleString()}</span>}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5 truncate">
                      {hasBonus ? `${Number(pkg.coins + pkg.bonusCoins).toLocaleString()} Total` : "Coins"}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-center">
                    <p className="text-[13px] font-black text-amber-600 dark:text-amber-400">{Number(pkg.priceMmk).toLocaleString()} MMK</p>
                  </div>

                  {selected?.id === pkg.id && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="sticky bottom-4 z-30">
              <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Selected</p>
                  <p className="font-black text-slate-900 dark:text-white">{selected.name} — {Number(selected.totalCoins || selected.coins).toLocaleString()} Coins</p>
                  <p className="text-sm font-bold text-amber-600">{Number(selected.priceMmk).toLocaleString()} MMK</p>
                </div>
                <button
                  onClick={() => { setPaymentMethod("KPAY"); setTransferId(""); setScreenshot(null); setPreview(null); document.getElementById("checkout-modal")?.showModal(); }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-sm shadow-lg shadow-amber-500/25 transition flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" /> Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Checkout Modal using dialog */}
          <dialog id="checkout-modal" className="p-0 bg-transparent backdrop:bg-black/60 open:flex open:items-center open:justify-center w-full h-full max-w-none max-h-none">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg m-4 p-6 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" /> Checkout
                </h3>
                <button onClick={() => document.getElementById("checkout-modal")?.close()} className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {selected && (
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 p-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">{selected.name}</p>
                      <p className="text-sm font-bold text-amber-600">{Number(selected.totalCoins || selected.coins).toLocaleString()} Coins <span className="font-normal text-slate-500">for</span> {Number(selected.priceMmk).toLocaleString()} MMK</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Choose Payment</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { id: "KPAY", label: "KPay", icon: Smartphone, color: "from-blue-500 to-blue-600" },
                  { id: "WAVE", label: "Wave", icon: Smartphone, color: "from-cyan-500 to-sky-600" },
                  { id: "BANK", label: "Bank", icon: Landmark, color: "from-emerald-500 to-teal-600" },
                ].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition ${paymentMethod === m.id ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-slate-300"}`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                      <m.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Pay to */}
              <div className={`rounded-xl p-3 border mb-4 flex items-center gap-3 ${payInfo.color} bg-opacity-10 border-current/20`}>
                <div className={`w-10 h-10 rounded-xl ${payInfo.color} flex items-center justify-center shrink-0`}>
                  {paymentMethod === "BANK" ? <Landmark className="w-5 h-5 text-white" /> : <Smartphone className="w-5 h-5 text-white" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold opacity-60">Pay to {payInfo.label}</p>
                  <p className="font-black text-slate-900 dark:text-white truncate">{payInfo.name || "—"} </p>
                  <p className="text-sm font-mono font-bold text-slate-700 dark:text-zinc-300">{payInfo.number || "Not configured"} {payInfo.sub ? `• ${payInfo.sub}` : ""}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Transaction ID</label>
                  <input value={transferId} onChange={e=>setTransferId(e.target.value)} placeholder="e.g. 20240612-123456" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Payment Screenshot</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  {preview ? (
                    <div className="relative mt-1">
                      <img src={preview} alt="proof" className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-zinc-700" />
                      <button onClick={()=>{setScreenshot(null); setPreview(null); if(fileRef.current) fileRef.current.value="";}} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={()=>fileRef.current?.click()} className="mt-1 w-full p-4 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:border-amber-300 hover:text-amber-600 transition">
                      <Upload className="w-6 h-6" /><span className="text-xs font-bold">Upload proof</span><span className="text-[10px]">PNG/JPG up to 5MB</span>
                    </button>
                  )}
                </div>
              </div>

              {success ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-black text-slate-900 dark:text-white">Order Submitted!</p>
                  <p className="text-xs text-slate-500">Admin will verify and add coins to your balance.</p>
                </div>
              ) : (
                <button onClick={submitOrder} disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Zap className="w-4 h-4" /> Confirm Order — {selected ? Number(selected.priceMmk).toLocaleString() : 0} MMK</>}
                </button>
              )}
              <p className="text-[11px] text-center text-slate-400 mt-2">After payment, admin approves and coins are added → use coins to buy plans.</p>
            </div>
          </dialog>
        </>
      )}

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="surface p-12 text-center">
              <History className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="font-bold text-slate-600 dark:text-zinc-300">No orders yet</p>
              <p className="text-xs text-slate-400">Your coin top-up history will appear here</p>
            </div>
          ) : orders.map(o => (
            <div key={o.id} className="surface p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${o.status==="APPROVED" ? "bg-emerald-500/15 text-emerald-600" : o.status==="PENDING" ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}`}>
                  {o.status==="APPROVED" ? <CheckCircle2 className="w-5 h-5" /> : o.status==="PENDING" ? <Clock className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{o.packageName} • {Number(o.coinsAmount).toLocaleString()} Coins</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{new Date(o.createdAt).toLocaleString()} • {o.paymentMethod} {o.transferId ? `• ${o.transferId}` : ""}</p>
                  {o.rejectionReason && <p className="text-xs text-red-600">Reason: {o.rejectionReason}</p>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-900 dark:text-white">{Number(o.priceMmk).toLocaleString()} MMK</p>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${o.status==="APPROVED" ? "bg-emerald-500 text-white" : o.status==="PENDING" ? "bg-amber-400 text-amber-900" : "bg-red-500 text-white"}`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN TAB */}
      {tab === "admin" && isAdmin && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["PENDING","APPROVED","REJECTED","ALL"].map(s => (
              <button key={s} onClick={()=>setOrderFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${orderFilter===s ? "bg-amber-500 text-white" : "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"}`}>{s} ({s==="ALL" ? adminOrders.length : adminOrders.filter(o=>o.status===s).length})</button>
            ))}
          </div>
          {filteredAdminOrders.length === 0 ? (
            <div className="surface p-10 text-center text-sm text-slate-400">No orders</div>
          ) : filteredAdminOrders.map(o => (
            <div key={o.id} className="surface p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{o.packageName} — {Number(o.coinsAmount).toLocaleString()} Coins • {Number(o.priceMmk).toLocaleString()} MMK</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">User: {o.userName} ({o.username}) • {o.paymentMethod} {o.transferId ? `• ${o.transferId}` : ""} • {new Date(o.createdAt).toLocaleString()}</p>
                  {o.screenshotUrl && <a href={o.screenshotUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"><ImageIcon className="w-3 h-3" /> View Screenshot</a>}
                  {o.screenshotUrl && <div><img src={o.screenshotUrl} alt="proof" className="mt-2 max-h-40 rounded-xl border border-slate-200 dark:border-zinc-700" /></div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black ${o.status==="PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : o.status==="APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{o.status}</span>
                  {o.status==="PENDING" && (
                    <>
                      <button onClick={()=>adminAction(o.id,"approve")} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Approve</button>
                      <button onClick={()=>{ const r=prompt("Rejection reason:"); if(r) adminAction(o.id,"reject", r); }} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold">Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
            <h3 className="font-black text-slate-900 dark:text-white mb-3">Manage Packages (Admin)</h3>
            <AdminPackages />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPackages() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", coins: "", bonusCoins: "", priceMmk: "", badgeText: "", popular: false, sortOrder: 0 });
  const load = async () => {
    const r = await api.get("/coin-shop/packages/all").catch(()=>({data:[]}));
    setList(r.data || []);
  };
  useEffect(()=>{ load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    await api.post("/coin-shop/admin/packages", { name: form.name, coins: Number(form.coins), bonusCoins: Number(form.bonusCoins||0), priceMmk: Number(form.priceMmk), badgeText: form.badgeText, popular: form.popular, sortOrder: Number(form.sortOrder) });
    setForm({ name: "", coins: "", bonusCoins: "", priceMmk: "", badgeText: "", popular: false, sortOrder: 0 });
    load();
  };
  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800">
        <input placeholder="Name (e.g. 344 Coins)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" required />
        <input placeholder="Coins" type="number" value={form.coins} onChange={e=>setForm({...form, coins:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" required />
        <input placeholder="Bonus" type="number" value={form.bonusCoins} onChange={e=>setForm({...form, bonusCoins:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
        <input placeholder="Price MMK" type="number" value={form.priceMmk} onChange={e=>setForm({...form, priceMmk:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" required />
        <input placeholder="Badge (Popular/Best Value)" value={form.badgeText} onChange={e=>setForm({...form, badgeText:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
        <input placeholder="Sort" type="number" value={form.sortOrder} onChange={e=>setForm({...form, sortOrder:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
        <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.popular} onChange={e=>setForm({...form, popular:e.target.checked})} /> Popular</label>
        <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold">Add Package</button>
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {list.map(p => (
          <div key={p.id} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <p className="text-xs font-black">{p.name} {p.popular ? <Crown className="inline w-3 h-3 text-amber-500" /> : null}</p>
              <p className="text-[11px] text-slate-500">{p.coins}+{p.bonusCoins} = {p.totalCoins} • {Number(p.priceMmk).toLocaleString()} MMK</p>
            </div>
            <button onClick={async()=>{ if(confirm("Delete?")) { await api.delete(`/coin-shop/admin/packages/${p.id}`); load(); } }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
