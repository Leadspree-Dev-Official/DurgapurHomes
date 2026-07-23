import React, { useState } from 'react';
import { CustomerUser, UserNotification } from '../types';
import { ShieldAlert, ShieldCheck, Search, Bell, Send, Check } from 'lucide-react';

interface UsersViewProps {
  activeView: string; // 'users-active' | 'users-banned' | 'users-all' | 'users-notify'
  users: CustomerUser[];
  notifications: UserNotification[];
  onUpdateUsers: (users: CustomerUser[]) => void;
  onUpdateNotifications: (notifs: UserNotification[]) => void;
}

export default function UsersView({
  activeView,
  users,
  notifications,
  onUpdateUsers,
  onUpdateNotifications
}: UsersViewProps) {

  const isNotificationMode = activeView === 'users-notify';
  const [searchTerm, setSearchTerm] = useState('');

  // Notification form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all_users' | 'all_providers'>('all_users');
  const [successAlert, setSuccessAlert] = useState(false);

  // Filter users based on submenu Selection
  const getFilteredUsers = () => {
    let filtered = [...users];

    if (activeView === 'users-active') {
      filtered = filtered.filter(u => u.status === 'active');
    } else if (activeView === 'users-banned') {
      filtered = filtered.filter(u => u.status === 'banned');
    }

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm)
      );
    }

    return filtered;
  };

  const toggleBanStatus = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === 'active' ? 'banned' as const : 'active' as const
        };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;

    const newNotif: UserNotification = {
      id: 'not-' + Date.now(),
      targetType: notifTarget,
      title: notifTitle,
      message: notifMsg,
      sender: 'Operations Command Office',
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateNotifications([...notifications, newNotif]);
    setNotifTitle('');
    setNotifMsg('');
    setSuccessAlert(true);
    setTimeout(() => setSuccessAlert(false), 4000);
  };

  return (
    <div className="space-y-6 select-none" id="users-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          {isNotificationMode ? 'Broadcasting System Notifications' : 'Registered Customers Directory'}
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          {isNotificationMode 
            ? 'Broadcast push announcements, vouchers, or server maintenance alerts to clients and partners.'
            : 'Access user contact records, verify historic orders, or regulate access credentials.'}
        </p>
      </div>

      {successAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs" id="notif-success-alert">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>System announcement dispatched to {notifTarget.replace('_', ' ')} successfully!</span>
        </div>
      )}

      {isNotificationMode ? (
        /* Create & Dispatch System push notification */
        <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="notif-form-panel">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>Draft Dispatch Notification</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Target Recipient Audience</label>
              <select
                value={notifTarget}
                onChange={(e) => setNotifTarget(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="all_users">All Registered Customers (Users)</option>
                <option value="all_providers">All Service Providers (Partners)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Notification Header Title</label>
              <input
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Server Maintenance Notice"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Detailed Message Content</label>
              <textarea
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                placeholder="Write detailed messaging here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-28 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch System Broadcaster</span>
            </button>
          </form>
        </div>
      ) : (
        /* Regular User Listing Directory */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm" id="user-search-wrapper">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4 text-center">Platform Status</th>
                    <th className="py-3 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getFilteredUsers().map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-extrabold text-slate-800">{u.name}</td>
                      <td className="py-4 px-4 text-slate-550 font-mono text-xs font-semibold">{u.email}</td>
                      <td className="py-4 px-4 text-slate-600 font-mono text-xs font-bold">{u.phone}</td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px] font-semibold">{u.joinDate}</td>
                      <td className="py-4 px-4 text-center">
                        {u.status === 'active' ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                            Banned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {u.status === 'active' ? (
                          <button
                            onClick={() => toggleBanStatus(u.id)}
                            className="py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-150 text-red-600 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 ml-auto shadow-xs"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Ban Account</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleBanStatus(u.id)}
                            className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-750 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 ml-auto shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Restore Access</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {getFilteredUsers().length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">No matching customer logs found.</td>
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
