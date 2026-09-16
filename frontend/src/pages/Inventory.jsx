import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Package,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  Boxes,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const Inventory = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [inStock, setInStock] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(["Equipment","Supplement","Merchandise","Consumable"]);
  const [newCat, setNewCat] = useState('');

  // Modals & Form
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Equipment',
    stockQuantity: 0,
    unit: 'pcs',
    unitCost: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const imageRef = React.useRef(null);

  const [message, setMessage] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setInStock(res.data.inStock || 0);
      setOutOfStock(res.data.outOfStock || 0);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try { const res = await api.get('/shop/categories'); if (Array.isArray(res.data) && res.data.length) setCategories(res.data); } catch {}
  };
  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    if (categories.includes(name)) { setMessage({type:"error",text:"Category exists"}); return; }
    const next = [...categories, name];
    try { await api.put('/shop/admin/categories', { categories: next }); setCategories(next); setNewCat(""); setMessage({type:"success",text:`Category "${name}" added`}); } catch(e){ setMessage({type:"error",text:e.message}); }
  };
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat}"? Items keep category but new items can't use it.`)) return;
    const next = categories.filter(c=>c!==cat);
    if (next.length===0) { setMessage({type:"error",text:"At least one category required"}); return; }
    try { await api.put('/shop/admin/categories', { categories: next }); setCategories(next); setMessage({type:"success",text:`Category "${cat}" removed`}); } catch(e){ setMessage({type:"error",text:e.message}); }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid = files.filter(f=> f.size <= 5*1024*1024);
    if (valid.length !== files.length) setMessage({type:"error",text:"Some images >5MB skipped"});
    if (valid.length + imagePreviews.length + existingImages.length > 6) { setMessage({type:"error",text:"Max 6 images"}); return; }
    const newFiles = [...imageFiles, ...valid];
    setImageFiles(newFiles);
    const readers = valid.map(f=> new Promise(res=>{
      const r=new FileReader();
      r.onload=ev=> res(ev.target.result);
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(urls=> setImagePreviews(prev=> [...prev, ...urls]));
    if (imageRef.current) imageRef.current.value='';
  };
  const removeNewImage = (idx) => {
    setImageFiles(prev=> prev.filter((_,i)=> i!==idx));
    setImagePreviews(prev=> prev.filter((_,i)=> i!==idx));
  };
  const removeExistingImage = async (url) => {
    if (!editItem) { setExistingImages(prev=> prev.filter(u=> u!==url)); return; }
    try { await api.delete(`/shop/products/${editItem.id}/image`, { params: { url } }); setExistingImages(prev=> prev.filter(u=> u!==url)); } catch(e){ setMessage({type:"error",text:e.message}); }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      // ensure numeric fields
      const payload = { ...formData, stockQuantity: parseInt(formData.stockQuantity)||0, unitCost: formData.unitCost ? Number(formData.unitCost) : 0 };
      if (!payload.category) payload.category = categories[0] || "Equipment";
      let saved;
      if (editItem) {
        const res = await api.put(`/inventory/${editItem.id}`, payload);
        saved = res.data;
        setMessage({ type: 'success', text: 'Item updated successfully' });
      } else {
        const res = await api.post('/inventory', payload);
        saved = res.data;
        setMessage({ type: 'success', text: 'New item added to inventory' });
      }
      const targetId = saved?.id || editItem?.id;
      // upload new images if any
      if (imageFiles.length && targetId) {
        for (const f of imageFiles) {
          try {
            const fd = new FormData();
            fd.append('file', f);
            await api.post(`/shop/products/${targetId}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          } catch (imgErr) { console.error('Image upload failed', imgErr); }
        }
      }
      setModalOpen(false);
      setEditItem(null);
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      if (imageRef.current) imageRef.current.value='';
      fetchInventory();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save item' });
    }
  };

  const handleAdjustStock = async (id, change) => {
    try {
      await api.post(`/inventory/${id}/adjust`, { change });
      fetchInventory();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to adjust quantity' });
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/inventory/${id}`);
      setMessage({ type: 'success', text: 'Item deleted from inventory' });
      fetchInventory();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete item' });
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || categories[0] || 'Equipment',
      stockQuantity: item.stockQuantity || 0,
      unit: item.unit || 'pcs',
      unitCost: item.unitCost || '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    const imgs = item.images || (item.imageUrl ? [item.imageUrl] : []);
    setExistingImages(imgs);
    if (imageRef.current) imageRef.current.value='';
    setModalOpen(true);
  };

  const filteredItems = items.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-2 text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-white" />
            </span>
            Inventory & Equipment Stock
          </h1>
          <p className="body-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage gym supplements, merchandise, equipment, and consumable supplies.
          </p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setFormData({
              name: '',
              category: categories[0] || 'Equipment',
              stockQuantity: 0,
              unit: 'pcs',
              unitCost: '',
            });
            setImageFiles([]);
            setImagePreviews([]);
            setExistingImages([]);
            if (imageRef.current) imageRef.current.value='';
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Inventory Item
        </button>
      </div>

      {/* Toast Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
              : 'bg-red-500/10 border border-red-500/20 text-red-500'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 surface flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Items</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{total}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 surface flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">In Stock</span>
            <p className="text-2xl font-black text-emerald-500 mt-1">{inStock}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 surface flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Out of Stock</span>
            <p className="text-2xl font-black text-rose-500 mt-1">{outOfStock}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Categories — customizable */}
      <div className="p-4 surface">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300">Categories</h3>
          <span className="text-[11px] text-slate-400">{categories.length} total</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categories.map(cat=> (
            <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {cat}
              <button onClick={()=>handleDeleteCategory(cat)} className="ml-1 p-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=> e.key==="Enter" && (e.preventDefault(), handleAddCategory())} placeholder="New category e.g. Apparel, Drinks" className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
          <button onClick={handleAddCategory} className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-black text-white text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Shop and inventory filters use these categories. Changes apply instantly.</p>
      </div>

      {/* Search Input */}
      <div className="p-4 surface">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or category..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Unit Cost</th>
                <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                    No inventory records match.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-slate-400" />}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${item.stockQuantity > 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                          {item.stockQuantity}
                        </span>
                        <span className="text-xs text-slate-400">{item.unit || 'pcs'}</span>
                        {item.stockQuantity === 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-500 text-xs">
                      {item.unitCost ? Number(item.unitCost).toLocaleString() : '0'} Coins
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          disabled={item.stockQuantity <= 0}
                          onClick={() => handleAdjustStock(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-red-500 hover:text-white disabled:opacity-40 flex items-center justify-center transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Whey Protein / Gym Towel"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                  Product Images ({existingImages.length + imagePreviews.length}/6)
                </label>
                <input ref={imageRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                {(existingImages.length > 0 || imagePreviews.length > 0) ? (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {existingImages.map((url,i)=> (
                      <div key={`ex-${i}`} className="relative group">
                        <img src={url} alt={`img-${i}`} className="w-full h-20 object-cover rounded-xl border border-slate-200 dark:border-zinc-700" />
                        <button type="button" onClick={()=> removeExistingImage(url)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {imagePreviews.map((url,i)=> (
                      <div key={`new-${i}`} className="relative group">
                        <img src={url} alt={`new-${i}`} className="w-full h-20 object-cover rounded-xl border border-amber-300" />
                        <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[8px] px-1 rounded">NEW</span>
                        <button type="button" onClick={()=> removeNewImage(i)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-lg"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                ) : null}
                {(existingImages.length + imagePreviews.length) < 6 && (
                  <button type="button" onClick={()=> imageRef.current?.click()} className="w-full h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-slate-400 hover:border-red-300 hover:text-red-500 transition">
                    <Upload className="w-4 h-4" /><span className="text-xs font-bold">Add images</span><span className="text-[10px]">up to 6</span>
                  </button>
                )}
                <p className="text-[11px] text-slate-400 mt-1">First image is cover. Click × to remove.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    {categories.map(c=> <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs / bottle / kg"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                    Unit Cost (Coins)
                  </label>
                  <input
                    type="number"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
