import React, { useState } from 'react';
import { Zone, Coupon, Slider, ServiceCategory } from '../types';
import { Plus, Trash2, Map, Percent, Sliders as SlidersIcon, ToggleLeft, ToggleRight, AlertCircle, Edit2 } from 'lucide-react';

interface ZonesCouponsSlidersProps {
  viewType: 'zones' | 'coupons' | 'sliders';
  zones: Zone[];
  coupons: Coupon[];
  sliders: Slider[];
  categories: ServiceCategory[];
  onUpdateZones: (zones: Zone[]) => void;
  onUpdateCoupons: (coupons: Coupon[]) => void;
  onUpdateSliders: (sliders: Slider[]) => void;
}

export default function ZonesCouponsSliders({
  viewType,
  zones,
  coupons,
  sliders,
  categories,
  onUpdateZones,
  onUpdateCoupons,
  onUpdateSliders
}: ZonesCouponsSlidersProps) {

  const [showAdd, setShowAdd] = useState(false);

  // Zone State
  const [zoneName, setZoneName] = useState('');
  const [zoneCoord, setZoneCoord] = useState('');

  // Coupon State
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState<'percentage' | 'fixed'>('fixed');
  const [coupVal, setCoupVal] = useState<number>(100);
  const [coupMin, setCoupMin] = useState<number>(500);
  const [coupMax, setCoupMax] = useState<number>(100);
  const [coupExpiry, setCoupExpiry] = useState('2026-12-31');

  // Slider State
  const [slidTitle, setSlidTitle] = useState('');
  const [slidSubtitle, setSlidSubtitle] = useState('');
  const [slidImage, setSlidImage] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80');
  const [slidLinkType, setSlidLinkType] = useState<'category' | 'service' | 'external'>('category');
  const [slidLinkVal, setSlidLinkVal] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  // Submit functions
  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName) return;

    if (editingId) {
      onUpdateZones(zones.map(z => z.id === editingId ? { ...z, name: zoneName, coordinates: zoneCoord } : z));
    } else {
      const newZ: Zone = {
        id: 'zone-' + Date.now(),
        name: zoneName,
        coordinates: zoneCoord || 'N/A',
        status: 'active',
        providersCount: 0
      };
      onUpdateZones([...zones, newZ]);
    }
    resetForm();
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode || !coupVal) return;

    if (editingId) {
      onUpdateCoupons(coupons.map(c => 
        c.id === editingId 
          ? { 
              ...c, 
              code: coupCode.toUpperCase(), 
              discountType: coupType, 
              discountValue: Number(coupVal),
              minPurchase: Number(coupMin),
              maxDiscount: Number(coupMax),
              expiryDate: coupExpiry 
            } 
          : c
      ));
    } else {
      const newC: Coupon = {
        id: 'coup-' + Date.now(),
        code: coupCode.toUpperCase().trim(),
        discountType: coupType,
        discountValue: Number(coupVal),
        minPurchase: Number(coupMin),
        maxDiscount: Number(coupMax),
        expiryDate: coupExpiry,
        status: 'active'
      };
      onUpdateCoupons([...coupons, newC]);
    }
    resetForm();
  };

  const handleSaveSlider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slidTitle) return;

    if (editingId) {
      onUpdateSliders(sliders.map(s => 
        s.id === editingId 
          ? { 
              ...s, 
              title: slidTitle, 
              subtitle: slidSubtitle, 
              image: slidImage, 
              linkType: slidLinkType, 
              linkValue: slidLinkVal 
            } 
          : s
      ));
    } else {
      const newS: Slider = {
        id: 'slid-' + Date.now(),
        title: slidTitle,
        subtitle: slidSubtitle,
        image: slidImage,
        linkType: slidLinkType,
        linkValue: slidLinkVal,
        status: 'active'
      };
      onUpdateSliders([...sliders, newS]);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setShowAdd(false);
    setZoneName('');
    setZoneCoord('');
    setCoupCode('');
    setCoupVal(100);
    setCoupMin(500);
    setCoupMax(100);
    setSlidTitle('');
    setSlidSubtitle('');
    setSlidLinkVal('');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setShowAdd(true);
    if (viewType === 'zones') {
      setZoneName(item.name);
      setZoneCoord(item.coordinates);
    } else if (viewType === 'coupons') {
      setCoupCode(item.code);
      setCoupType(item.discountType);
      setCoupVal(item.discountValue);
      setCoupMin(item.minPurchase);
      setCoupMax(item.maxDiscount);
      setCoupExpiry(item.expiryDate);
    } else if (viewType === 'sliders') {
      setSlidTitle(item.title);
      setSlidSubtitle(item.subtitle);
      setSlidImage(item.image);
      setSlidLinkType(item.linkType);
      setSlidLinkVal(item.linkValue);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    if (viewType === 'zones') {
      onUpdateZones(zones.filter(z => z.id !== id));
    } else if (viewType === 'coupons') {
      onUpdateCoupons(coupons.filter(c => c.id !== id));
    } else if (viewType === 'sliders') {
      onUpdateSliders(sliders.filter(s => s.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    if (viewType === 'zones') {
      onUpdateZones(zones.map(z => z.id === id ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' } : z));
    } else if (viewType === 'coupons') {
      onUpdateCoupons(coupons.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
    } else if (viewType === 'sliders') {
      onUpdateSliders(sliders.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    }
  };

  const renderIcon = () => {
    switch (viewType) {
      case 'zones': return <Map className="w-5 h-5 text-indigo-400" />;
      case 'coupons': return <Percent className="w-5 h-5 text-amber-400" />;
      case 'sliders': return <SlidersIcon className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6 select-none" id="zones-coupons-sliders-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 capitalize">{viewType} Configuration</h2>
          <p className="text-slate-500 text-xs mt-1">
            {viewType === 'zones' && 'Manage operational zones across Durgapur districts for customer service address coverage.'}
            {viewType === 'coupons' && 'Declare discount promotional codes with minimum purchase limits to drive orders.'}
            {viewType === 'sliders' && 'Control carousel banner slide announcements visible in user application hubs.'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAdd(!showAdd);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto transition-colors"
          id="add-zcs-btn"
        >
          <Plus className="w-4 h-4" />
          <span>{editingId ? 'Edit Item' : `Add New ${viewType.slice(0, -1)}`}</span>
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-md max-w-xl" id="zcs-form">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            {renderIcon()}
            <span>{editingId ? 'Edit Existing' : 'Create New'} {viewType.slice(0, -1)} Record</span>
          </h3>

          {viewType === 'zones' && (
            <form onSubmit={handleSaveZone} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. City Centre, Bidhannagar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Coordinates / Region Pin (Optional)</label>
                <input
                  type="text"
                  value={zoneCoord}
                  onChange={(e) => setZoneCoord(e.target.value)}
                  placeholder="e.g. 23.5303° N, 87.2917° E"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl text-xs cursor-pointer transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition">Save Zone</button>
              </div>
            </form>
          )}

          {viewType === 'coupons' && (
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Promo Code</label>
                  <input
                    type="text"
                    value={coupCode}
                    onChange={(e) => setCoupCode(e.target.value)}
                    placeholder="e.g. DURGAPUR50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 uppercase focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Discount Type</label>
                  <select
                    value={coupType}
                    onChange={(e) => setCoupType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="fixed">Fixed Rupees (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Discount Value</label>
                  <input
                    type="number"
                    value={coupVal}
                    onChange={(e) => setCoupVal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Min Basket (₹)</label>
                  <input
                    type="number"
                    value={coupMin}
                    onChange={(e) => setCoupMin(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={coupMax}
                    onChange={(e) => setCoupMax(Number(e.target.value))}
                    disabled={coupType === 'fixed'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-55"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={coupExpiry}
                  onChange={(e) => setCoupExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl text-xs cursor-pointer transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition">Save Coupon</button>
              </div>
            </form>
          )}

          {viewType === 'sliders' && (
            <form onSubmit={handleSaveSlider} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Promo Slide Title</label>
                <input
                  type="text"
                  value={slidTitle}
                  onChange={(e) => setSlidTitle(e.target.value)}
                  placeholder="e.g. Beat the Summer Heat"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Subtitle / Description</label>
                <input
                  type="text"
                  value={slidSubtitle}
                  onChange={(e) => setSlidSubtitle(e.target.value)}
                  placeholder="e.g. Get 20% Off on AC Repairs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Promo Banner Image URL</label>
                <input
                  type="url"
                  value={slidImage}
                  onChange={(e) => setSlidImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono text-[10px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Action Target Type</label>
                  <select
                    value={slidLinkType}
                    onChange={(e) => setSlidLinkType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="category">Redirect to Category</option>
                    <option value="service">Redirect to Service ID</option>
                    <option value="external">External Redirect URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Target Value / ID</label>
                  {slidLinkType === 'category' ? (
                    <select
                      value={slidLinkVal}
                      onChange={(e) => setSlidLinkVal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      required
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={slidLinkVal}
                      onChange={(e) => setSlidLinkVal(e.target.value)}
                      placeholder={slidLinkType === 'service' ? 'srv-101' : 'https://...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl text-xs cursor-pointer transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition">Save Slide</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Lists display depending on viewType */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {viewType === 'zones' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Zone Name</th>
                  <th className="py-3 px-4 font-bold">GPS Coordinates</th>
                  <th className="py-3 px-4 text-center font-bold">Coverage Status</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-800 text-sm">{z.name}</td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-[11px] font-medium">{z.coordinates}</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => toggleStatus(z.id)} className="cursor-pointer transition hover:opacity-80">
                        {z.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1">
                      <button onClick={() => handleEdit(z)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs" title="Edit Zone"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(z.id)} className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs" title="Delete Zone"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewType === 'coupons' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Coupon Code</th>
                  <th className="py-3 px-4 font-bold">Benefits</th>
                  <th className="py-3 px-4 font-bold">Min Spend</th>
                  <th className="py-3 px-4 font-bold">Expiry</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-amber-700 bg-amber-50/40 border-r border-slate-100 tracking-wider text-sm select-all">{c.code}</td>
                    <td className="py-4 px-4">
                      {c.discountType === 'percentage' ? (
                        <span className="font-extrabold text-slate-800 text-sm">{c.discountValue}% Off <span className="text-slate-500 font-normal text-xs">(Up to ₹{c.maxDiscount})</span></span>
                      ) : (
                        <span className="font-extrabold text-slate-800 text-sm">Flat ₹{c.discountValue} Off</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-bold">₹{c.minPurchase}</td>
                    <td className="py-4 px-4 text-slate-500 text-[11px] font-mono font-medium">{c.expiryDate}</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => toggleStatus(c.id)} className="cursor-pointer transition hover:opacity-80">
                        {c.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1">
                      <button onClick={() => handleEdit(c)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs" title="Edit Coupon"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs" title="Delete Coupon"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewType === 'sliders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6 bg-slate-50/20" id="sliders-grid">
            {sliders.map((s) => (
              <div key={s.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col justify-between shadow-xs hover:shadow-md">
                <div className="h-40 overflow-hidden relative border-b border-slate-100">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover opacity-85 hover:scale-103 transition duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-600 border border-slate-200 shadow-xs">
                    Target: {s.linkType} ({s.linkValue})
                  </div>
                  <div className="absolute top-3 right-3">
                    <button onClick={() => toggleStatus(s.id)} className="cursor-pointer transition hover:scale-105">
                      {s.status === 'active' ? (
                        <span className="bg-emerald-600/90 backdrop-blur text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">ACTIVE</span>
                      ) : (
                        <span className="bg-slate-500/90 backdrop-blur text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">INACTIVE</span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{s.subtitle}</p>
                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                    <button onClick={() => handleEdit(s)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs" title="Edit Slider"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs" title="Delete Slider"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            {sliders.length === 0 && (
              <div className="col-span-2 text-center py-8 text-slate-400 font-semibold">No sliders declared in setup. Add promotional carousel banner sliders above.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
