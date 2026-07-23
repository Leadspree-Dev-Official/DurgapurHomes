import React, { useState } from 'react';
import { Order, ServiceProvider } from '../types';
import { 
  Briefcase, CheckCircle2, XCircle, Hourglass, ArrowUpRight, 
  MapPin, Phone, Mail, User, AlertTriangle, RefreshCw, Send, Check
} from 'lucide-react';

interface OrdersViewProps {
  activeView: string; // 'orders-all' | 'orders-pending' | 'orders-confirmed' | 'orders-initiated' | 'orders-canceled'
  orders: Order[];
  providers: ServiceProvider[];
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateProviders: (provs: ServiceProvider[]) => void;
}

export default function OrdersView({
  activeView,
  orders,
  providers,
  onUpdateOrders,
  onUpdateProviders
}: OrdersViewProps) {

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProvId, setSelectedProvId] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  // Filtering orders based on sidebar sub-menu triggers
  const getFilteredOrders = () => {
    switch (activeView) {
      case 'orders-pending': return orders.filter(o => o.status === 'pending');
      case 'orders-confirmed': return orders.filter(o => o.status === 'confirmed');
      case 'orders-initiated': return orders.filter(o => o.status === 'initiated');
      case 'orders-canceled': return orders.filter(o => o.status === 'canceled');
      default: return orders;
    }
  };

  // Filter providers that are eligible for the selected order's category and are active
  const getEligibleProviders = (order: Order) => {
    // We map orders to category strings approximately
    const categoryMap: Record<string, string> = {
      'srv-1': 'AC Mechanic',
      'srv-2': 'Plumbing',
      'srv-3': 'Beautician',
      'srv-4': 'Electrician',
      'srv-5': 'Chefs & Cooks',
      'srv-6': 'Home Cleaning'
    };
    const orderCat = categoryMap[order.serviceId] || '';
    return providers.filter(p => p.category === orderCat && p.status === 'active');
  };

  // Allocation function
  const handleAllocate = () => {
    if (!selectedOrder || !selectedProvId) return;

    const provider = providers.find(p => p.id === selectedProvId);
    if (!provider) return;

    const updatedOrders = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          providerId: provider.id,
          providerName: provider.name,
          status: 'confirmed' as const, // Automatically confirmed on allocate
          paymentStatus: o.paymentStatus === 'pending' ? 'initiated' : o.paymentStatus
        };
      }
      return o;
    });

    onUpdateOrders(updatedOrders);
    
    // Also notify provider with a simulated alert
    setAlertMsg(`Job successfully allocated to Partner ${provider.name}!`);
    setTimeout(() => setAlertMsg(''), 4000);

    // Refresh selected order view details
    const refreshed = updatedOrders.find(o => o.id === selectedOrder.id) || null;
    setSelectedOrder(refreshed);
    setSelectedProvId('');
  };

  // Add/Raise Complaint
  const handleRaiseComplaint = () => {
    if (!selectedOrder || !complaintText.trim()) return;

    const updated = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          complaint: complaintText.trim()
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    setComplaintText('');
    setSelectedOrder(updated.find(o => o.id === selectedOrder.id) || null);
  };

  // Reassign or clear complaint
  const handleResolveComplaint = () => {
    if (!selectedOrder) return;

    const updated = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          complaint: undefined
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    setSelectedOrder(updated.find(o => o.id === selectedOrder.id) || null);
    setAlertMsg('Complaint resolved successfully!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleStatusChange = (status: any) => {
    if (!selectedOrder) return;

    const updated = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: status
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    setSelectedOrder(updated.find(o => o.id === selectedOrder.id) || null);
  };

  return (
    <div className="space-y-6 select-none" id="orders-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          {activeView.replace('orders-', ' ')} Orders Management
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Monitor service orders, assign verified local technicians, communicate with clients, and resolve complaints.
        </p>
      </div>

      {alertMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs" id="orders-success-alert">
          <Check className="w-4 h-4" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Main Grid: Left table of orders, Right interactive allocation panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table representation */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-fit">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Client Detail</th>
                  <th className="py-3 px-4 font-bold">Service Required</th>
                  <th className="py-3 px-4 font-bold">Assigned Partner</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Operational Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredOrders().map((order) => {
                  const getBadge = (s: string) => {
                    switch (s) {
                      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
                      case 'confirmed': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
                      case 'initiated': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                      case 'ongoing': return 'bg-blue-50 text-blue-700 border-blue-200';
                      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      case 'canceled': return 'bg-red-50 text-red-700 border-red-200';
                      default: return 'bg-slate-50 text-slate-600 border-slate-200';
                    }
                  };
                  return (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-slate-50/60 transition cursor-pointer ${selectedOrder?.id === order.id ? 'bg-emerald-50/40 border-l-2 border-emerald-500' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{order.id}</span>
                          {order.complaint && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Active Complaint Raised!" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{order.customerName}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-medium">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-850 max-w-[150px] truncate" title={order.serviceName}>
                            {order.serviceName}
                          </p>
                          <p className="text-[10px] text-blue-600 font-bold">{order.zone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {order.providerName ? (
                          <span className="text-emerald-750 font-extrabold text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {order.providerName}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold text-xs italic">Unallocated</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="py-1.5 px-3 text-[10px] bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-650 rounded-lg cursor-pointer transition shadow-xs inline-flex items-center gap-1 font-bold"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {getFilteredOrders().length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">No orders currently logged in this submenu group.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel for selected order */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit space-y-5" id="allocation-control-panel">
          {selectedOrder ? (
            <>
              {/* Order Identity info */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-emerald-700">ORDER {selectedOrder.id}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">Date: {selectedOrder.date}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{selectedOrder.serviceName}</h3>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{selectedOrder.address}</span>
                </p>
              </div>

              {/* Client Contacts */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Contact Sheet</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-750 font-bold">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-750 font-bold">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{selectedOrder.customerPhone}</span>
                    <a 
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="text-[10px] bg-white hover:bg-slate-100 text-blue-600 px-2.5 py-1 rounded-lg font-bold ml-auto border border-slate-200 shadow-xs transition"
                    >
                      Call
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-750 font-bold">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[170px] font-medium text-slate-600">{selectedOrder.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Active Complaint Box */}
              {selectedOrder.complaint ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">CUSTOMER COMPLAINT FILED</span>
                  </div>
                  <p className="text-[11px] leading-relaxed italic font-medium">"{selectedOrder.complaint}"</p>
                  <div className="pt-2 border-t border-red-100 flex items-center justify-between gap-2">
                    <button 
                      onClick={handleResolveComplaint}
                      className="w-full text-center py-2 bg-red-600 hover:bg-red-700 rounded-lg text-[10px] font-bold cursor-pointer text-white shadow-xs transition"
                    >
                      Mark Complaint as Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Register simulated complaint</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="e.g. Provider did not arrive..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button 
                      onClick={handleRaiseComplaint}
                      className="px-3 bg-slate-100 border border-slate-200 hover:border-red-400 text-red-600 rounded-xl text-xs font-bold cursor-pointer transition hover:bg-red-50"
                    >
                      Raise
                    </button>
                  </div>
                </div>
              )}

              {/* Provider Assignment Allocation Box */}
              <div className="space-y-3.5 pt-3 border-t border-slate-100">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {selectedOrder.providerId ? 'Re-allocate Provider' : 'Allocate Provider'}
                  </h4>
                  {selectedOrder.providerName ? (
                    <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5 font-semibold">
                      <span>Currently assigned:</span>
                      <strong className="text-emerald-700 font-extrabold">{selectedOrder.providerName}</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 italic mb-3 font-semibold">No service professional assigned yet. Allocation pending.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Select eligible service partner</label>
                  <select
                    value={selectedProvId}
                    onChange={(e) => setSelectedProvId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-850 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="">-- Choose verified partner --</option>
                    {getEligibleProviders(selectedOrder).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category} | Bal: ₹{p.balance})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAllocate}
                  disabled={!selectedProvId}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-750 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
                >
                  Confirm Assignment Allocation
                </button>
              </div>

              {/* Order Status Controller (For Executive/Admin forced overriding) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Override Order Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['pending', 'initiated', 'ongoing', 'completed', 'canceled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold capitalize border cursor-pointer transition ${
                        selectedOrder.status === st 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2 font-semibold">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Select an order from the list to view client specifications, register complaints, or allocate service partners.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
