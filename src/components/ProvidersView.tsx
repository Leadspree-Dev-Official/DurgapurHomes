import React, { useState } from 'react';
import { ServiceProvider, UserNotification } from '../types';
import { Search, ShieldAlert, ShieldCheck, Check, Bell, Send, Landmark, FileText, AlertTriangle } from 'lucide-react';

interface ProvidersViewProps {
  activeView: string; // 'providers-active' | 'providers-banned' | 'providers-email-unverified' | ...
  providers: ServiceProvider[];
  notifications: UserNotification[];
  onUpdateProviders: (provs: ServiceProvider[]) => void;
  onUpdateNotifications: (notifs: UserNotification[]) => void;
}

export default function ProvidersView({
  activeView,
  providers,
  notifications,
  onUpdateProviders,
  onUpdateNotifications
}: ProvidersViewProps) {

  const isNotificationMode = activeView === 'providers-notify';
  const isKYCVerificationMode = activeView === 'providers-kyc-verification';
  const [searchTerm, setSearchTerm] = useState('');

  // Notification form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [successAlert, setSuccessAlert] = useState(false);

  // Filter providers based on selection
  const getFilteredProviders = () => {
    let filtered = [...providers];

    switch (activeView) {
      case 'providers-active':
        filtered = filtered.filter(p => p.status === 'active');
        break;
      case 'providers-banned':
        filtered = filtered.filter(p => p.status === 'banned');
        break;
      case 'providers-email-unverified':
        filtered = filtered.filter(p => p.status === 'email_unverified');
        break;
      case 'providers-mobile-unverified':
        filtered = filtered.filter(p => p.status === 'mobile_unverified');
        break;
      case 'providers-kyc-unverified':
        filtered = filtered.filter(p => p.status === 'kyc_unverified');
        break;
      case 'providers-kyc-pending':
        filtered = filtered.filter(p => p.status === 'kyc_pending');
        break;
      case 'providers-kyc-verification':
        filtered = filtered.filter(p => p.status === 'kyc_pending' || p.status === 'kyc_unverified' || p.status === 'active');
        break;
      case 'providers-with-balance':
        filtered = filtered.filter(p => p.balance > 0);
        break;
      default:
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleUpdateStatus = (id: string, status: ServiceProvider['status']) => {
    onUpdateProviders(providers.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;

    const newNotif: UserNotification = {
      id: 'not-' + Date.now(),
      targetType: 'all_providers',
      title: notifTitle,
      message: notifMsg,
      sender: 'Platform Quality Assurance Team',
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateNotifications([...notifications, newNotif]);
    setNotifTitle('');
    setNotifMsg('');
    setSuccessAlert(true);
    setTimeout(() => setSuccessAlert(false), 4000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'banned': return 'bg-red-50 text-red-700 border-red-200';
      case 'kyc_pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'kyc_unverified': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'email_unverified': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'mobile_unverified': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 select-none" id="providers-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          {isNotificationMode 
            ? 'Dispatch Providers Broadcaster' 
            : isKYCVerificationMode 
            ? 'Partner KYC Verification Audit' 
            : 'Service Partners Registry'}
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          {isNotificationMode
            ? 'Broadcast operations announcements, policy mandates, safety procedures, or commission updates to partners.'
            : isKYCVerificationMode
            ? 'Review uploaded Aadhaar/PAN identity documents, verify background compliance, and approve partner credentials.'
            : 'Access registered plumbers, AC mechanics, chefs, beauticians, examine KYC documents, or verify payouts.'}
        </p>
      </div>

      {isKYCVerificationMode && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="kyc-metrics-grid">
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase">Pending KYC Reviews</p>
              <p className="text-2xl font-black text-amber-900 mt-1 font-mono">
                {providers.filter(p => p.status === 'kyc_pending').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300/50 flex items-center justify-center text-amber-700 font-bold">
              ⏳
            </div>
          </div>

          <div className="bg-cyan-50/70 border border-cyan-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-cyan-700 uppercase">Unverified Partners</p>
              <p className="text-2xl font-black text-cyan-900 mt-1 font-mono">
                {providers.filter(p => p.status === 'kyc_unverified').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-300/50 flex items-center justify-center text-cyan-700 font-bold">
              📄
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase">Verified Active Partners</p>
              <p className="text-2xl font-black text-emerald-900 mt-1 font-mono">
                {providers.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300/50 flex items-center justify-center text-emerald-700 font-bold">
              ✅
            </div>
          </div>
        </div>
      )}

      {successAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs" id="notif-success-alert">
          <Check className="w-4 h-4" />
          <span>Operations memo dispatched to all registered Service Providers successfully!</span>
        </div>
      )}

      {isNotificationMode ? (
        /* Create & Dispatch System push notification */
        <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="notif-form-panel">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-emerald-650" />
            <span>Draft Dispatch Provider Memo</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Recipient Audience</label>
              <input
                type="text"
                value="All Verified & Active Service Partners"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed font-semibold"
                disabled
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Memo Heading / Topic</label>
              <input
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Compulsory Identity Auditing"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Memo Detailed Directions</label>
              <textarea
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                placeholder="Draft comprehensive directions here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-28 resize-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Ops Memo</span>
            </button>
          </form>
        </div>
      ) : (
        /* Regular Provider Listings with KYC Actions */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm" id="provider-search-wrapper">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, category, phone..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Provider Detail</th>
                    <th className="py-3 px-4 font-bold">Specialty Category</th>
                    <th className="py-3 px-4 font-bold">KYC Credentials</th>
                    <th className="py-3 px-4 font-bold">Wallet Balance</th>
                    <th className="py-3 px-4 text-center font-bold">Verification Status</th>
                    <th className="py-3 px-4 text-right font-bold">Operations Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getFilteredProviders().map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-800 text-sm">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-semibold">{p.email} | {p.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-blue-700 text-xs bg-blue-50 py-1.5 px-3 border border-blue-200 rounded-xl shadow-xs">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {p.kycDocType ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="text-[11px]">
                              <p className="text-slate-800 font-extrabold">{p.kycDocType}</p>
                              <p className="text-slate-500 font-mono text-[9px] font-semibold">{p.kycDocNumber}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-600 font-bold text-[10px] uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>No Docs Attached</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-800 font-mono text-sm">
                        ₹{p.balance}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize tracking-wider ${getStatusBadge(p.status)}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* Verify button if pending */}
                        {(p.status === 'kyc_pending' || p.status === 'kyc_unverified') && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'active')}
                            className="py-1.5 px-3 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 cursor-pointer transition inline-flex shadow-xs"
                          >
                            Verify & Approve
                          </button>
                        )}
                        {p.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'banned')}
                            className="py-1.5 px-3 text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 cursor-pointer transition inline-flex shadow-xs"
                          >
                            Ban Partner
                          </button>
                        ) : p.status === 'banned' ? (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'active')}
                            className="py-1.5 px-3 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 cursor-pointer transition inline-flex shadow-xs"
                          >
                            Unban Partner
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {getFilteredProviders().length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">No partner registrations matching this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
