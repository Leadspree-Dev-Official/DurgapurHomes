import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Briefcase, UserCheck, Key, Home, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  onLoginSuccess: (email: string, role: UserRole, name: string, providerId?: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [providerCategory, setProviderCategory] = useState('AC Mechanic');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // Auto fill demo details
  const handleQuickLogin = (selectedRole: UserRole) => {
    if (selectedRole === 'admin') {
      onLoginSuccess('admin@durgapurfix.com', 'admin', 'Durgapur Fix Owner (Admin)');
    } else if (selectedRole === 'executive') {
      onLoginSuccess('executive@durgapurfix.com', 'executive', 'Executive Team (Joydev)');
    } else if (selectedRole === 'provider') {
      onLoginSuccess('provider@durgapurfix.com', 'provider', 'Subir Dey (AC Mechanic)', 'prov-1');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    if (isSignUp && !name) {
      setError('Name is required for registration.');
      return;
    }

    // Handle authentication action
    if (isSignUp) {
      // Create account
      const mockProviderId = role === 'provider' ? 'prov-new-' + Date.now() : undefined;
      onLoginSuccess(email, role, name, mockProviderId);
    } else {
      // Sign In logic matching
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'admin@durgapurfix.com' || cleanEmail === 'admin@durgapurhomes.com') {
        onLoginSuccess('admin@durgapurfix.com', 'admin', 'Durgapur Fix Owner (Admin)');
      } else if (cleanEmail === 'executive@durgapurfix.com' || cleanEmail === 'executive@durgapurhomes.com') {
        onLoginSuccess('executive@durgapurfix.com', 'executive', 'Executive Team (Joydev)');
      } else if (cleanEmail === 'provider@durgapurfix.com' || cleanEmail === 'provider@durgapurhomes.com') {
        onLoginSuccess('provider@durgapurfix.com', 'provider', 'Subir Dey (AC Mechanic)', 'prov-1');
      } else {
        // Fallback or custom logged-in user
        const displayRole = role;
        onLoginSuccess(email, displayRole, name || email.split('@')[0], displayRole === 'provider' ? 'prov-new' : undefined);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden" id="auth-container">
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10"
        id="auth-card"
      >
        <div className="p-8 text-center border-b border-slate-100 bg-white">
          <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 p-3.5 rounded-full mb-3 border border-emerald-200 shadow-xs">
            <Home className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Durgapur Fix</h1>
          <p className="text-slate-500 text-xs font-bold mt-1">Unified Multi-Role Backend Operations Portal</p>
        </div>

        {/* Demo Accounts Quick-Select */}
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3.5 text-center">
            ⚡ Quick-Select Demo Accounts (Row-Level Security)
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col items-center p-3 rounded-xl bg-indigo-50/50 border border-indigo-150 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer group"
              title="Full control and configuration permission"
              id="demo-admin-btn"
            >
              <Shield className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition" />
              <span className="text-indigo-900 text-xs font-extrabold">Admin</span>
              <span className="text-[10px] text-indigo-600 font-bold">Owner role</span>
            </button>

            <button
              onClick={() => handleQuickLogin('executive')}
              className="flex flex-col items-center p-3 rounded-xl bg-amber-50/50 border border-amber-150 hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer group"
              title="Ops management, dispatcher, complaint resolver"
              id="demo-executive-btn"
            >
              <Briefcase className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition" />
              <span className="text-amber-900 text-xs font-extrabold">Executive</span>
              <span className="text-[10px] text-amber-600 font-bold">Ops Staff</span>
            </button>

            <button
              onClick={() => handleQuickLogin('provider')}
              className="flex flex-col items-center p-3 rounded-xl bg-emerald-50/50 border border-emerald-150 hover:bg-emerald-50 hover:border-emerald-300 transition cursor-pointer group"
              title="Job receiver, details updater, status manager"
              id="demo-provider-btn"
            >
              <UserCheck className="w-5 h-5 text-emerald-650 mb-1 group-hover:scale-110 transition" />
              <span className="text-emerald-900 text-xs font-extrabold">Provider</span>
              <span className="text-[10px] text-emerald-600 font-bold">AC / Plumber</span>
            </button>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 shadow-xs" id="auth-error">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-650" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Joydev Sen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. staff@durgapurhomes.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                required
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Access Role Type</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['admin', 'executive', 'provider'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-3 rounded-xl border text-xs capitalize cursor-pointer text-center font-bold transition shadow-xs ${
                          role === r
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'provider' && (
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">Service Specialty Category</label>
                    <select
                      value={providerCategory}
                      onChange={(e) => setProviderCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    >
                      <option value="AC Mechanic">AC Mechanic</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Beautician">Beautician</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Chefs & Cooks">Chefs & Cooks</option>
                      <option value="Home Cleaning">Home Cleaning</option>
                    </select>
                    <p className="text-[10px] text-amber-700 font-bold mt-2 flex items-center gap-1.5 bg-amber-50 p-2.5 rounded-lg border border-amber-200 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span>Providers will require profile review & approval by Admin to receive live assignments.</span>
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow-md cursor-pointer transition mt-6"
              id="submit-auth-btn"
            >
              {isSignUp ? 'Register & Access Portal' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-emerald-700 hover:text-emerald-800 text-xs font-bold cursor-pointer"
              id="toggle-auth-mode"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an executive or provider account? Sign Up'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
