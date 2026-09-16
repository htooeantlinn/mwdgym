import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, Package, Coins, ShoppingCart, CheckCircle2, AlertTriangle, Star,
  MapPin, Truck, Shield, Minus, Plus, Heart
} from "lucide-react";

export default function ShopProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/shop/products/${id}`);
        setProduct(res.data);
        setActiveIdx(0);
        const all = await api.get("/shop/products");
        setRelated((all.data||[]).filter(p=> p.id != id).slice(0,4));
      } catch (e) { setMessage({type:"error",text:"Product not found"}); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAdd = () => {
    const existing = JSON.parse(localStorage.getItem("shop-cart") || "[]");
    const found = existing.find(c=> c.id == product.id);
    if (found) {
      const n = found.qty + qty;
      if (n > product.stockQuantity) { setMessage({type:"error",text:`Only ${product.stockQuantity} in stock`}); return; }
      found.qty = n;
    } else {
      if (qty > product.stockQuantity) { setMessage({type:"error",text:`Only ${product.stockQuantity} in stock`}); return; }
      existing.push({ id: product.id, name: product.name, price: product.priceMmk, imageUrl: product.imageUrl, stock: product.stockQuantity, qty });
    }
    localStorage.setItem("shop-cart", JSON.stringify(existing));
    setMessage({type:"success",text:`Added ${qty} × ${product.name} to cart`});
    setTimeout(()=> navigate("/shop"), 800);
  };

  const handleBuyNow = async () => {
    // add to cart then go to shop checkout
    handleAdd();
  };

  if (loading) return <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (!product) return <div className="p-8 text-center text-slate-500">Product not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-16 sm:pb-24">
      <button onClick={()=> navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="w-3.5 h-3.5" /> Back to Shop</button>

      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 text-xs ${message.type==="success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border border-red-500/20 text-red-600"}`}>
          {message.type==="success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="surface p-3">
          {(() => {
            const imgs = product.images && product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
            const main = imgs[activeIdx] || imgs[0];
            return (
              <>
                <div className="aspect-square rounded-xl bg-slate-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                  {main ? <img src={main} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-slate-300" />}
                </div>
                {imgs.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {imgs.map((url,i)=> (
                      <button key={i} onClick={()=> setActiveIdx(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${i===activeIdx ? "border-red-500" : "border-transparent"}`}>
                        <img src={url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">{product.category}</span>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${product.stockQuantity>0 ? "bg-slate-100 dark:bg-zinc-800 text-slate-600" : "bg-red-500/10 text-red-600"}`}>{product.stockQuantity>0 ? `${product.stockQuantity} in stock` : "Out of stock"}</span>
                  <span className="text-[11px] font-bold text-slate-400">{product.unit}</span>
                  {imgs.length>0 && <span className="text-[11px] font-bold text-slate-400">{imgs.length} photo{imgs.length>1?'s':''}</span>}
                </div>
              </>
            );
          })()}
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{product.name}</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">{product.description || "No description — premium quality product from MWD GYM Store."}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 flex items-center gap-1.5"><Coins className="w-6 h-6" /> {Number(product.priceMmk).toLocaleString()}</span>
            <span className="text-sm font-bold text-slate-400">Coins</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${product.stockQuantity>0 ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-600"}`}>
            <Shield className="w-4 h-4" /> {product.stockQuantity>0 ? `In stock — ready to ship. Delivery to your profile address.` : `Out of stock — restocking soon`}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button onClick={()=> setQty(q=> Math.max(1, q-1))} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-black">{qty}</span>
              <button onClick={()=> setQty(q=> Math.min(product.stockQuantity, q+1))} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200"><Plus className="w-4 h-4" /></button>
            </div>
            <span className="text-xs text-slate-500">Total: <span className="font-black text-slate-900 dark:text-white">{Number(product.priceMmk*qty).toLocaleString()} Coins</span></span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button disabled={product.stockQuantity<=0} onClick={handleAdd} className="py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-black text-white font-black text-sm disabled:opacity-40 flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4" /> Add to Cart</button>
            <button disabled={product.stockQuantity<=0} onClick={handleBuyNow} className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm disabled:opacity-40 flex items-center justify-center gap-2"><Truck className="w-4 h-4" /> Buy Now</button>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800"><Truck className="w-3 h-3" /> Delivery to profile address</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Coin payment</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800"><Star className="w-3 h-3 text-amber-500" /> Bill voucher print</span>
          </div>

          <Link to="/shop" className="inline-flex text-xs font-bold text-red-600 hover:underline">← Continue shopping</Link>
        </div>
      </div>

      {related.length>0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-zinc-800">
          <h3 className="font-black text-sm mb-3">You may also like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {related.map(p=> (
              <Link key={p.id} to={`/shop/${p.id}`} className="surface p-3 hover:shadow-md transition">
                <div className="h-20 rounded-xl bg-slate-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center mb-2">{p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-300" />}</div>
                <p className="text-xs font-bold truncate">{p.name}</p>
                <p className="text-xs font-black text-amber-600 flex items-center gap-1"><Coins className="w-3 h-3" /> {Number(p.priceMmk).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
