import React, { useState } from 'react';
import { SystemSettings } from '../types';
import { Settings, Image, ShieldAlert, FileText, Globe, Check } from 'lucide-react';

interface SettingsViewProps {
  activeView: string; // 'settings-general' | 'settings-logo' | 'settings-config' | 'settings-policy' | 'settings-seo'
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
}

export default function SettingsView({
  activeView,
  settings,
  onUpdateSettings
}: SettingsViewProps) {

  const isGeneral = activeView === 'settings-general';
  const isLogo = activeView === 'settings-logo';
  const isConfig = activeView === 'settings-config';
  const isPolicy = activeView === 'settings-policy';
  const isSeo = activeView === 'settings-seo';

  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General state update helpers
  const updateGeneral = (field: keyof SystemSettings['general'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const updateLogo = (field: keyof SystemSettings['logo'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      logo: { ...prev.logo, [field]: value }
    }));
  };

  const updateConfig = (field: keyof SystemSettings['configuration'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      configuration: { ...prev.configuration, [field]: value }
    }));
  };

  const updatePolicy = (field: keyof SystemSettings['policyPages'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      policyPages: { ...prev.policyPages, [field]: value }
    }));
  };

  const updateSeo = (field: keyof SystemSettings['seo'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 select-none" id="settings-view-root">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
            {activeView.replace('settings-', ' ')} Configuration Panel
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Fine-tune aggregator rules, customize site metadata, manage verification workflows, and edit client agreement terms.
          </p>
        </div>
        {saveSuccess && (
          <div className="p-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs" id="settings-success">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">

          {/* GENERAL SETTING */}
          {isGeneral && (
            <div className="space-y-4" id="settings-general-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Settings className="w-4.5 h-4.5 text-emerald-600" />
                <span>General Site & Contact Settings</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Site / Platform Name</label>
                  <input
                    type="text"
                    value={localSettings.general.siteName}
                    onChange={(e) => updateGeneral('siteName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Platform Contact Email</label>
                  <input
                    type="email"
                    value={localSettings.general.contactEmail}
                    onChange={(e) => updateGeneral('contactEmail', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Contact Help Desk Phone</label>
                  <input
                    type="text"
                    value={localSettings.general.contactPhone}
                    onChange={(e) => updateGeneral('contactPhone', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Local Currency Sign</label>
                  <input
                    type="text"
                    value={localSettings.general.currency}
                    onChange={(e) => updateGeneral('currency', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-center font-extrabold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Aggregator Commission Rate (%)</label>
                  <input
                    type="number"
                    value={localSettings.general.commissionRate}
                    onChange={(e) => updateGeneral('commissionRate', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Office Physical Address</label>
                  <input
                    type="text"
                    value={localSettings.general.address}
                    onChange={(e) => updateGeneral('address', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* LOGO & FAVICON */}
          {isLogo && (
            <div className="space-y-4" id="settings-logo-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Image className="w-4.5 h-4.5 text-teal-600" />
                <span>Visual Identity: Branding Assets</span>
              </h3>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Logo Display Name / Brand string</label>
                <input
                  type="text"
                  value={localSettings.logo.primaryLogo}
                  onChange={(e) => updateLogo('primaryLogo', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-extrabold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Favicon / Visual Icon Alias (Emoji)</label>
                <input
                  type="text"
                  value={localSettings.logo.favicon}
                  onChange={(e) => updateLogo('favicon', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-center text-lg"
                  required
                />
              </div>
            </div>
          )}

          {/* SYSTEM CONFIGURATION */}
          {isConfig && (
            <div className="space-y-5" id="settings-config-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4.5 h-4.5 text-amber-600" />
                <span>System operational rule triggers</span>
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">System Maintenance Mode</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Toggle site into offline lock, locking client service booking modules temporarily.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.maintenanceMode}
                    onChange={(e) => updateConfig('maintenanceMode', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Mandatory Email Audit Verification</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Force providers to pass automated email confirmation links during registry.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.emailVerification}
                    onChange={(e) => updateConfig('emailVerification', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Mandatory SMS Verification</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Require 6-digit OTP phone auditing when registering customer users.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.smsVerification}
                    onChange={(e) => updateConfig('smsVerification', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Mandatory Provider KYC Verification</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Block newly registered providers from accepting job allocations until KYC docs are audited.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.kycMandatory}
                    onChange={(e) => updateConfig('kycMandatory', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* POLICY PAGES */}
          {isPolicy && (
            <div className="space-y-4" id="settings-policy-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
                <span>Client & Provider Policy Agreements</span>
              </h3>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">About Us Summary</label>
                <textarea
                  value={localSettings.policyPages.aboutUs}
                  onChange={(e) => updatePolicy('aboutUs', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-24 resize-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Platform Terms & Conditions</label>
                <textarea
                  value={localSettings.policyPages.termsConditions}
                  onChange={(e) => updatePolicy('termsConditions', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-24 resize-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Privacy & Information Policy</label>
                <textarea
                  value={localSettings.policyPages.privacyPolicy}
                  onChange={(e) => updatePolicy('privacyPolicy', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-24 resize-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Disputes & Refund Policy</label>
                <textarea
                  value={localSettings.policyPages.refundPolicy}
                  onChange={(e) => updatePolicy('refundPolicy', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-24 resize-none leading-relaxed"
                  required
                />
              </div>
            </div>
          )}

          {/* SEO CONFIGURATION */}
          {isSeo && (
            <div className="space-y-4" id="settings-seo-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Globe className="w-4.5 h-4.5 text-cyan-600" />
                <span>Search Engine optimization (SEO)</span>
              </h3>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Meta Search Title</label>
                <input
                  type="text"
                  value={localSettings.seo.metaTitle}
                  onChange={(e) => updateSeo('metaTitle', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Meta Description Tag</label>
                <textarea
                  value={localSettings.seo.metaDescription}
                  onChange={(e) => updateSeo('metaDescription', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-20 resize-none leading-relaxed"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Global Search Keywords (comma separated)</label>
                <input
                  type="text"
                  value={localSettings.seo.keywords}
                  onChange={(e) => updateSeo('keywords', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>
          )}

          {/* Save trigger */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Commit & Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
