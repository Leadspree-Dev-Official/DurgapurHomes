import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { 
  UserSession, UserRole, ServiceCategory, ServiceSubCategory, Zone, 
  Coupon, Slider, Review, ServiceItem, Order, CustomerUser, 
  ServiceProvider, PaymentTransaction, WithdrawalRequest, UserNotification, 
  LoginLog, SystemSettings 
} from './types';

// Initial seed datasets
import {
  initialCategories, initialSubCategories, initialZones, initialCoupons,
  initialSliders, initialReviews, initialServices, initialProviders,
  initialOrders, initialUsers, initialPayments, initialWithdrawals,
  initialNotifications, initialLoginLogs, defaultSettings
} from './data';

// Component Views
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import CategoriesView from './components/CategoriesView';
import ZonesCouponsSliders from './components/ZonesCouponsSliders';
import ServicesView from './components/ServicesView';
import OrdersView from './components/OrdersView';
import UsersView from './components/UsersView';
import ProvidersView from './components/ProvidersView';
import PaymentsView from './components/PaymentsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import ProviderPortal from './components/ProviderPortal';

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(null);

  // Database States
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ServiceSubCategory[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Active View selection state
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load from LocalStorage or seed defaults
  useEffect(() => {
    const loadOrSeed = <T,>(key: string, seed: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
      const stored = localStorage.getItem(`durgapur_${key}`);
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch (e) {
          setter(seed);
        }
      } else {
        setter(seed);
        localStorage.setItem(`durgapur_${key}`, JSON.stringify(seed));
      }
    };

    loadOrSeed('categories', initialCategories, setCategories);
    loadOrSeed('subcategories', initialSubCategories, setSubCategories);
    loadOrSeed('zones', initialZones, setZones);
    loadOrSeed('coupons', initialCoupons, setCoupons);
    loadOrSeed('sliders', initialSliders, setSliders);
    loadOrSeed('reviews', initialReviews, setReviews);
    loadOrSeed('services', initialServices, setServices);
    loadOrSeed('orders', initialOrders, setOrders);
    loadOrSeed('users', initialUsers, setUsers);
    loadOrSeed('providers', initialProviders, setProviders);
    loadOrSeed('payments', initialPayments, setPayments);
    loadOrSeed('withdrawals', initialWithdrawals, setWithdrawals);
    loadOrSeed('notifications', initialNotifications, setNotifications);
    loadOrSeed('loginlogs', initialLoginLogs, setLoginLogs);
    loadOrSeed('settings', defaultSettings, setSettings);

    // Retrieve active user session if exists
    const savedSession = localStorage.getItem('durgapur_session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (e) {}
    }
  }, []);

  // Save states to local storage automatically
  const updateAndPersist = <T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
    setter(data);
    localStorage.setItem(`durgapur_${key}`, JSON.stringify(data));
  };

  // Auth triggers
  const handleLoginSuccess = (email: string, role: UserRole, name: string, providerId?: string) => {
    const newSession: UserSession = {
      id: role === 'provider' ? (providerId || 'prov-1') : 'staff-' + Date.now(),
      name,
      email,
      role,
      providerId: role === 'provider' ? (providerId || 'prov-1') : undefined
    };
    setSession(newSession);
    localStorage.setItem('durgapur_session', JSON.stringify(newSession));
    
    // Add simulated login log
    const newLog: LoginLog = {
      id: 'log-' + Date.now(),
      userId: newSession.id,
      userName: name,
      userType: role === 'provider' ? 'provider' : 'staff',
      ipAddress: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      device: navigator.userAgent.includes('Mobi') ? 'Chrome Mobile on Android' : 'Chrome on Windows 11',
      date: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    const updatedLogs = [newLog, ...loginLogs];
    updateAndPersist('loginlogs', updatedLogs, setLoginLogs);

    // Set corresponding default views based on RLS access roles
    if (role === 'provider') {
      setActiveView('provider-portal');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('durgapur_session');
    setActiveView('dashboard');
  };

  // Sub-views dispatcher
  const renderActiveView = () => {
    if (!session) return null;

    // Special Route Guard: Service Provider access is routed directly to the Partner Portal
    if (session.role === 'provider') {
      const activePartnerProfile = providers.find(p => p.id === session.providerId) || {
        id: session.providerId || 'prov-1',
        name: session.name,
        email: session.email,
        phone: '9876543210',
        category: 'AC Mechanic',
        status: 'kyc_unverified' as const,
        rating: 0,
        balance: 0,
        joinDate: '2026-07-21',
        jobsCompleted: 0
      };

      return (
        <ProviderPortal 
          activeView={activeView}
          provider={activePartnerProfile}
          orders={orders}
          onUpdateProvider={(updatedProf) => {
            // Find in list & replace, then save
            const updatedList = providers.map(p => p.id === updatedProf.id ? updatedProf : p);
            // If newly registered (not yet in providers), append it
            if (!providers.some(p => p.id === updatedProf.id)) {
              updatedList.push(updatedProf);
            }
            updateAndPersist('providers', updatedList, setProviders);
          }}
          onUpdateOrders={(updatedOrders) => updateAndPersist('orders', updatedOrders, setOrders)}
        />
      );
    }

    // Admin & Executive staff routes
    if (activeView === 'dashboard') {
      return (
        <DashboardStats 
          users={users}
          providers={providers}
          services={services}
          orders={orders}
          payments={payments}
          onNavigateToView={(view) => setActiveView(view)}
        />
      );
    }

    if (activeView === 'category' || activeView === 'subcategory') {
      return (
        <CategoriesView 
          viewType={activeView}
          categories={categories}
          subCategories={subCategories}
          onUpdateCategories={(updatedCats) => updateAndPersist('categories', updatedCats, setCategories)}
          onUpdateSubCategories={(updatedSubs) => updateAndPersist('subcategories', updatedSubs, setSubCategories)}
        />
      );
    }

    if (activeView === 'zones' || activeView === 'coupons' || activeView === 'sliders') {
      return (
        <ZonesCouponsSliders 
          viewType={activeView}
          zones={zones}
          coupons={coupons}
          sliders={sliders}
          categories={categories}
          onUpdateZones={(updatedZones) => updateAndPersist('zones', updatedZones, setZones)}
          onUpdateCoupons={(updatedCoupons) => updateAndPersist('coupons', updatedCoupons, setCoupons)}
          onUpdateSliders={(updatedSliders) => updateAndPersist('sliders', updatedSliders, setSliders)}
        />
      );
    }

    if (activeView === 'reviews' || activeView.startsWith('services-')) {
      return (
        <ServicesView 
          activeView={activeView}
          services={services}
          reviews={reviews}
          categories={categories}
          subCategories={subCategories}
          onUpdateServices={(updatedServices) => updateAndPersist('services', updatedServices, setServices)}
          onUpdateReviews={(updatedReviews) => updateAndPersist('reviews', updatedReviews, setReviews)}
        />
      );
    }

    if (activeView.startsWith('orders-')) {
      return (
        <OrdersView 
          activeView={activeView}
          orders={orders}
          providers={providers}
          onUpdateOrders={(updatedOrders) => updateAndPersist('orders', updatedOrders, setOrders)}
          onUpdateProviders={(updatedProviders) => updateAndPersist('providers', updatedProviders, setProviders)}
        />
      );
    }

    if (activeView.startsWith('users-')) {
      return (
        <UsersView 
          activeView={activeView}
          users={users}
          notifications={notifications}
          onUpdateUsers={(updatedUsers) => updateAndPersist('users', updatedUsers, setUsers)}
          onUpdateNotifications={(updatedNotifs) => updateAndPersist('notifications', updatedNotifs, setNotifications)}
        />
      );
    }

    if (activeView.startsWith('providers-')) {
      return (
        <ProvidersView 
          activeView={activeView}
          providers={providers}
          notifications={notifications}
          onUpdateProviders={(updatedProviders) => updateAndPersist('providers', updatedProviders, setProviders)}
          onUpdateNotifications={(updatedNotifs) => updateAndPersist('notifications', updatedNotifs, setNotifications)}
        />
      );
    }

    if (activeView.startsWith('payments-') || activeView === 'withdrawals') {
      return (
        <PaymentsView 
          activeView={activeView}
          payments={payments}
          withdrawals={withdrawals}
          onUpdatePayments={(updatedPayments) => updateAndPersist('payments', updatedPayments, setPayments)}
          onUpdateWithdrawals={(updatedWithdrawals) => updateAndPersist('withdrawals', updatedWithdrawals, setWithdrawals)}
        />
      );
    }

    if (activeView.startsWith('reports-')) {
      return (
        <ReportsView 
          activeView={activeView}
          payments={payments}
          loginLogs={loginLogs}
          notifications={notifications}
        />
      );
    }

    if (activeView.startsWith('settings-')) {
      return (
        <SettingsView 
          activeView={activeView}
          settings={settings}
          onUpdateSettings={(updatedSettings) => updateAndPersist('settings', updatedSettings, setSettings)}
        />
      );
    }

    // Fallback default
    return <div className="text-slate-450 p-8">Section is initialized under sandbox rules.</div>;
  };

  // If session is empty, present full page screen auth
  if (!session) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex font-sans" id="app-layout-frame">
      {/* Interactive Collapsible Sidebar */}
      <Sidebar 
        currentRole={session.role}
        userName={session.name}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Panel Area */}
      <main className={`flex-1 min-w-0 transition-all duration-300 flex flex-col ${
        isSidebarOpen ? 'md:pl-64' : 'md:pl-20'
      }`}>
        {/* Sticky Top Header Bar modeled after the reference image */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Collapse Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer mr-1"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-slate-600 font-semibold text-sm hidden md:inline-block">
              Durgapur Fix Backend Operations
            </span>
            <span className="text-slate-300 hidden md:inline">|</span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="hover:text-blue-600 cursor-pointer">Admin</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold capitalize">
                {activeView.replace('services-', ' ').replace('orders-', ' ').replace('users-', ' ').replace('providers-', ' ').replace('payments-', ' ').replace('reports-', ' ').replace('settings-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Broom & Sparkles indicator representing premium home services */}
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
              <span>🧹</span>
              <span className="hidden sm:inline">Spotless Services Portal</span>
              <span>✨</span>
            </div>

            {/* User Session Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{session.role}</span>
            </div>

            {/* Profile Avatar modeled after reference image */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-amber-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                <img 
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Durgapur" 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{session.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{session.role} Staff</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Box Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1" id="main-content-panel">
          {/* Active component view content */}
          <div className="animate-fade-in" id="rendered-view-box">
            {renderActiveView()}
          </div>
        </div>
      </main>
    </div>
  );
}
