import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { GuestAuthModal } from "../components/GuestAuthModal";
import {
  ShoppingCart, Package, Search, Plus, Minus, Trash2, X, MapPin, Phone, Home,
  CheckCircle2, Clock, Truck, AlertTriangle, ShoppingBag, Filter, Star, Zap, Gift, Coins, Printer, FileText, Sparkles, ShieldCheck
} from "lucide-react";

export default function Shop() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("shop");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [guestAuthOpen, setGuestAuthOpen] = useState(false);
  const [delivery, setDelivery] = useState({ name:"", phone:"", address:"", city:"", township:"", note:"" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);
  const [gymAddress, setGymAddress] = useState("Myawaddy, Myanmar");
  const [coinBalance, setCoinBalance] = useState(user?.coinBalance || 0);
  const isAdmin = user?.role === "ADMIN";

  const [cats, setCats] = useState(["ALL","Equipment","Supplement","Merchandise","Consumable"]);
  useEffect(()=>{ api.get("/shop/categories").then(r=> { if(Array.isArray(r.data) && r.data.length) setCats(["ALL", ...r.data]); }).catch(()=>{}); },[]);
  useEffect(()=>{ api.get("/home/settings").then(r=> setGymAddress(r.data?.gym_address || r.data?.address || "Myawaddy, Myanmar")).catch(()=>{}); },[]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "ALL") params.category = category;
      if (search.trim()) params.keyword = search.trim();
      const res = await api.get("/shop/products", { params });
      setProducts(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [category, search]);

  const fetchOrders = async () => {
    try { const res = await api.get("/shop/orders/my"); setOrders(res.data||[]); } catch {}
  };
  const fetchAdminOrders = async () => {
    try { const res = await api.get("/shop/admin/orders"); setAdminOrders(res.data||[]); } catch {}
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setDelivery({
        name: res.data?.defaultDeliveryName || res.data?.displayName || "",
        phone: res.data?.defaultDeliveryPhone || "",
        address: res.data?.defaultDeliveryAddress || res.data?.member?.address || "",
        city: res.data?.defaultDeliveryCity || "",
        township: res.data?.defaultDeliveryTownship || "",
        note: res.data?.defaultDeliveryNote || "",
      });
    } catch {}
  };

  useEffect(()=>{ fetchProducts(); },[fetchProducts]);
  useEffect(()=>{ if(tab==="orders") fetchOrders(); if(tab==="admin" && isAdmin) fetchAdminOrders(); },[tab, isAdmin]);
  useEffect(()=>{ fetchProfile(); api.get("/marketplace/coins/balance").then(r=> setCoinBalance(r.data.coinBalance||0)).catch(()=>{}); },[]);
  useEffect(()=>{ if(user?.coinBalance!=null) setCoinBalance(user.coinBalance); },[user?.coinBalance]);
  useEffect(()=>{ try{ const s=JSON.parse(localStorage.getItem("shop-cart")||"[]"); if(Array.isArray(s) && s.length) setCart(s); }catch{} },[]);
  useEffect(()=>{ localStorage.setItem("shop-cart", JSON.stringify(cart)); },[cart]);

  const addToCart = (p) => {
    setCart(prev => {
      const found = prev.find(c=>c.id===p.id);
      if (found) {
        if (found.qty >= p.stockQuantity) { setMessage({type:"error",text:"Only "+p.stockQuantity+" in stock"}); return prev; }
        return prev.map(c=> c.id===p.id ? {...c, qty:c.qty+1}:c);
      }
      return [...prev, { id:p.id, name:p.name||p.itemName, price:p.priceMmk||p.unitCost, imageUrl:p.imageUrl, stock:p.stockQuantity, qty:1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c=>{
      if(c.id!==id) return c;
      const n = c.qty + delta;
      if (n <=0) return null;
      if (n > c.stock) { setMessage({type:"error",text:"Only "+c.stock+" in stock"}); return c; }
      return {...c, qty:n};
    }).filter(Boolean));
  };

  const removeFromCart = (id) => setCart(prev=> prev.filter(c=>c.id!==id));
  const total = cart.reduce((s,c)=> s + c.price*c.qty, 0);
  const totalQty = cart.reduce((s,c)=> s+c.qty,0);

  const handleCheckout = async () => {
    if (cart.length===0) return;
    if (!user) {
      setGuestAuthOpen(true);
      return;
    }
    if (!delivery.address.trim()) { setMessage({type:"error",text:"Delivery address required — set in Profile or here"}); return; }
    if (coinBalance < total) { setMessage({type:"error",text:`Insufficient coins — need ${total} but you have ${coinBalance}`}); return; }
    setSaving(true);

    try {
      const res = await api.post("/shop/orders", {
        items: cart.map(c=> ({ itemId:c.id, quantity:c.qty })),
        deliveryName: delivery.name,
        deliveryPhone: delivery.phone,
        deliveryAddress: delivery.address,
        deliveryCity: delivery.city,
        deliveryTownship: delivery.township,
        deliveryNote: delivery.note,
      });
      if (res.data?.newCoinBalance!=null) setCoinBalance(res.data.newCoinBalance);
      if (refreshUser) refreshUser();
      setMessage({type:"success",text:`Order placed — ${total} coins deducted`});
      setCart([]); setCheckoutOpen(false); setCartOpen(false);
      fetchProducts(); fetchOrders(); setTab("orders");
    } catch(e){ setMessage({type:"error",text:e.message||"Order failed"}); }
    finally{ setSaving(false); }
  };

  const printVoucher = async (orderId) => {
    try {
      const res = await api.get(`/shop/orders/${orderId}/voucher`);
      const v = res.data;
      const w = window.open("", "_blank");
      if (!w) { window.print(); return; }
      w.document.write(`
        <html><head><title>Voucher ${v.voucherNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          *{font-family:Inter, sans-serif; box-sizing:border-box}
          body{margin:0; padding:24px; color:#0f172a; background:white}
          .header{ display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #dc2626; padding-bottom:16px; margin-bottom:16px}
          .logo{ width:48px; height:48px; background:#dc2626; color:white; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:20px; border-radius:12px}
          .badge{ background:#fef2f2; color:#dc2626; border:1px solid #fee2e2; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:800}
          table{ width:100%; border-collapse:collapse; margin-top:12px}
          th{ text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; border-bottom:1px solid #e2e8f0; padding:8px}
          td{ padding:10px 8px; font-size:13px; border-bottom:1px solid #f1f5f9}
          .total{ text-align:right; font-weight:900; font-size:16px; margin-top:12px}
          .footer{ margin-top:24px; padding-top:12px; border-top:1px dashed #cbd5e1; text-align:center; font-size:11px; color:#64748b}
          @media print { body{ padding:12px} .no-print{ display:none} }
        </style></head><body>
          <div class="header">
            <div style="display:flex; gap:12px; align-items:center">
              <div class="logo">M</div>
              <div><h2 style="margin:0; font-weight:900">MWD GYM</h2><p style="margin:0; font-size:11px; color:#64748b">OFFICIAL STORE VOUCHER</p></div>
            </div>
            <div style="text-align:right">
              <span class="badge">PAID IN COINS</span>
              <p style="margin:4px 0 0 0; font-size:12px; font-weight:800">${v.voucherNo}</p>
              <p style="margin:0; font-size:11px; color:#64748b">${new Date(v.issuedAt).toLocaleString()}</p>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; font-size:12px">
            <div><strong style="text-transform:uppercase; font-size:10px; color:#64748b">Customer Details</strong><br/>${v.customerName}<br/>${v.customerPhone}</div>
            <div><strong style="text-transform:uppercase; font-size:10px; color:#64748b">Delivery Address</strong><br/>${v.deliveryAddress}<br/>${v.deliveryCity||""} ${v.deliveryTownship||""}</div>
          </div>
          <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit (Coins)</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>
            ${(v.items||[]).map(i=> `<tr><td><strong>${i.name}</strong></td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${Number(i.unitPrice).toLocaleString()}</td><td style="text-align:right">${Number(i.subtotal).toLocaleString()}</td></tr>`).join("")}
          </tbody></table>
          <div class="total">Total Coins Deducted: ${Number(v.totalCoins).toLocaleString()} Coins</div>
          <div class="footer"><p>Thank you for shopping at MWD GYM Store!</p></div>
          <div class="no-print" style="margin-top:20px; text-align:center"><button onclick="window.print()" style="padding:10px 20px; background:#dc2626; color:white; border:none; border-radius:8px; font-weight:800; cursor:pointer">Print Voucher</button></div>
        </body></html>
      `);
      w.document.close();
    } catch(e) { setMessage({type:"error",text:"Voucher print failed"}); }
  };

  const statusStyle = {
    PENDING:"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    CONFIRMED:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    SHIPPED:"bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    DELIVERED:"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED:"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="py-6 space-y-8 max-w-[1280px] mx-auto px-4 sm:px-6 animate-fadeIn">
      {/* PREMIUM HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-zinc-900 text-white p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-300 border border-white/10">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> Official Supplements & Gym Gear
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none">
            FITNESS & GEAR <span className="text-emerald-300">STORE</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed max-w-xl">
            Order premium whey protein, shaker bottles, straps & gym merchandise using your earned coins with fast home delivery in {gymAddress}!
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur"><Truck className="w-4 h-4 text-emerald-300" /> Doorstep Delivery</span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur"><Coins className="w-4 h-4 text-amber-400" /> Coin Checkout</span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur"><FileText className="w-4 h-4 text-white" /> Printed Voucher</span>
          </div>
        </div>
      </div>

      {/* HEADER NAVIGATION & ACTION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl">
          {[
            {k:"shop",l: t('nav_store', 'Store')},
            {k:"orders",l:"My Orders", badge: orders.filter(o=>o.status==="PENDING").length},
            ...(isAdmin ? [{k:"admin",l:"All Orders", badge: adminOrders.filter(o=>o.status==="PENDING").length}] : []),
          ].map(t=> (
            <button key={t.k} onClick={()=>setTab(t.k)} className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${tab===t.k ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"}`}>
              {t.l} {t.badge ? <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 rounded-2xl px-4 py-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">{Number(coinBalance).toLocaleString()} <span className="opacity-70">Coins</span></span>
            </div>
          )}
          <button onClick={()=>setCartOpen(true)} className="relative px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 transition">
            <ShoppingCart className="w-4 h-4" /> Cart
            {totalQty>0 && <span className="bg-amber-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{totalQty}</span>}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${message.type==="success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border border-red-500/20 text-red-600"}`}>
          <span>{message.text}</span><button onClick={()=>setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {tab==="shop" ? (
        <>
          {/* SEARCH & CATEGORIES */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=> e.key==="Enter" && fetchProducts()} placeholder="Search supplements, shaker bottle, straps, gear..." className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {cats.map(c=> (
                <button key={c} onClick={()=>setCategory(c)} className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition ${category===c ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105" : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"}`}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : products.length===0 ? (
            <div className="p-12 text-center rounded-3xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 space-y-2">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-black">No Products Found</p><p className="text-xs text-slate-400">Admin can manage products via Inventory</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p=> (
                <div key={p.id} onClick={()=> navigate(`/shop/${p.id}`)} className="group rounded-3xl p-5 border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-red-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-44 rounded-2xl bg-slate-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center relative">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : <Package className="w-10 h-10 text-slate-400" />}
                      <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white uppercase">{p.category}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white truncate group-hover:text-red-500 transition">{p.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{p.description || p.unit}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${p.stockQuantity>0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600"}`}>
                        {p.stockQuantity>0 ? `${p.stockQuantity} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-base font-black text-red-600 flex items-center gap-1"><Coins className="w-4 h-4" /> {Number(p.priceMmk).toLocaleString()}</span>
                    <button disabled={p.stockQuantity<=0} onClick={(e)=>{ e.stopPropagation(); addToCart(p); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black disabled:opacity-40 shadow-md transition flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" /> Add</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : tab==="orders" ? (
        <div className="space-y-4">
          {orders.length===0 ? (
            <div className="p-12 text-center rounded-3xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Truck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-black">No orders placed yet</p><p className="text-xs text-slate-400">Your store purchases will appear here</p>
            </div>
          ) : orders.map(o=> (
            <div key={o.id} className="p-6 rounded-3xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-black">Order #{o.id} • {new Date(o.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${statusStyle[o.status]}`}>{o.status}</span>
                  <button onClick={()=>printVoucher(o.id)} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 text-xs font-black shadow" title="Print bill voucher"><Printer className="w-3.5 h-3.5" /> Print Bill</button>
                </div>
              </div>
              <div className="space-y-2">
                {o.items?.map(it=> (
                  <div key={it.id} className="flex items-center gap-3 text-xs font-bold">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0">{it.imageUrl ? <img src={it.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-slate-400" />}</div>
                    <span className="flex-1 truncate">{it.itemName} × {it.quantity}</span>
                    <span className="font-black text-red-600">{Number(it.unitPriceMmk*it.quantity).toLocaleString()} Coins</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> {o.deliveryAddress} {o.deliveryCity ? `• ${o.deliveryCity}` : ""}</span>
                <span className="font-black text-base text-red-600">{Number(o.totalMmk).toLocaleString()} Coins</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">All Shop Orders (Admin)</h3>
            <button onClick={fetchAdminOrders} className="text-xs font-black text-red-600 hover:underline">Refresh List</button>
          </div>
          {adminOrders.length===0 ? (
            <div className="p-12 text-center rounded-3xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400">No orders placed</div>
          ) : adminOrders.map(o=> (
            <div key={o.id} className="p-6 rounded-3xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-base font-black">Order #{o.id} • {o.userName} ({o.username})</p>
                  <p className="text-xs text-slate-400 font-bold">{new Date(o.createdAt).toLocaleString()} • {o.deliveryName} {o.deliveryPhone ? `• ${o.deliveryPhone}` : ""}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> {o.deliveryAddress} {o.deliveryCity ? `• ${o.deliveryCity}` : ""} {o.deliveryTownship ? `• ${o.deliveryTownship}` : ""}</p>
                  <div className="pt-2 space-y-1">
                    {o.items?.map(it=> <div key={it.id} className="text-xs flex gap-2 font-bold"><span className="flex-1 truncate">{it.itemName} ×{it.quantity}</span><span className="font-black text-red-600">{Number(it.unitPriceMmk*it.quantity).toLocaleString()} Coins</span></div>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-black self-start ${statusStyle[o.status]}`}>{o.status}</span>
                  <span className="text-base font-black text-red-600 flex items-center gap-1"><Coins className="w-4 h-4" /> {Number(o.totalMmk).toLocaleString()}</span>
                  <button onClick={()=>printVoucher(o.id)} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 shadow"><Printer className="w-3.5 h-3.5" /> Print Bill</button>
                  <select value={o.status} onChange={async e=>{
                    const ns=e.target.value;
                    await api.put(`/shop/admin/orders/${o.id}/status`, {status:ns});
                    fetchAdminOrders();
                  }} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold">
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-zinc-800">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-black text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-red-600" /> Shopping Cart</h3>
              <button onClick={()=>setCartOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length===0 ? (
                <div className="py-20 text-center space-y-2">
                  <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
                  <p className="font-black text-base">Your Cart is Empty</p>
                  <p className="text-xs text-slate-400">Add supplements or equipment to proceed.</p>
                </div>
              ) : (
                cart.map(c=> (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                      {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{c.name}</p>
                      <p className="text-xs font-bold text-red-600">{Number(c.price*c.qty).toLocaleString()} Coins</p>
                    </div>
                    <div className="flex items-center gap-1 border border-slate-200 dark:border-zinc-800 rounded-xl p-1">
                      <button onClick={()=>updateQty(c.id, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-xs font-black px-2">{c.qty}</span>
                      <button onClick={()=>updateQty(c.id, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={()=>removeFromCart(c.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-200 dark:border-zinc-800 space-y-4 bg-slate-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between font-black text-lg">
                  <span>Total</span>
                  <span className="text-red-600 flex items-center gap-1"><Coins className="w-5 h-5" /> {Number(total).toLocaleString()} Coins</span>
                </div>
                <button onClick={()=>{ setCheckoutOpen(true); setCartOpen(false); }} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2">
                  Proceed to Checkout <Truck className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>!saving && setCheckoutOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-red-600" /> Delivery Details</h3>
              <button onClick={()=>setCheckoutOpen(false)} disabled={saving}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400">Please verify your delivery contact information</p>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="font-bold uppercase text-[10px]">Name</label><input value={delivery.name} onChange={e=>setDelivery({...delivery, name:e.target.value})} className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm" /></div>
                <div><label className="font-bold uppercase text-[10px]">Phone</label><input value={delivery.phone} onChange={e=>setDelivery({...delivery, phone:e.target.value})} className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm" /></div>
              </div>
              <div><label className="font-bold uppercase text-[10px]">Street Address *</label><textarea value={delivery.address} onChange={e=>setDelivery({...delivery, address:e.target.value})} rows={2} className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm" placeholder="House, street, quarter" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="font-bold uppercase text-[10px]">City</label><input value={delivery.city} onChange={e=>setDelivery({...delivery, city:e.target.value})} className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm" /></div>
                <div><label className="font-bold uppercase text-[10px]">Township</label><input value={delivery.township} onChange={e=>setDelivery({...delivery, township:e.target.value})} className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm" /></div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
                {cart.map(c=> <div key={c.id} className="flex justify-between font-bold"><span>{c.name} ×{c.qty}</span><span className="text-red-600 font-black">{Number(c.price*c.qty).toLocaleString()} Coins</span></div>)}
                <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 dark:border-zinc-800"><span>Total</span><span className="text-red-600">{Number(total).toLocaleString()} Coins</span></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setCheckoutOpen(false)} disabled={saving} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-black">Cancel</button>
                <button onClick={handleCheckout} disabled={saving} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Place Order</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Auth Modal */}
      <GuestAuthModal
        isOpen={guestAuthOpen}
        onClose={() => setGuestAuthOpen(false)}
        cartTotal={total}
        actionTitle="Sign In or Join to Place Your Order"
      />
    </div>
  );
}
