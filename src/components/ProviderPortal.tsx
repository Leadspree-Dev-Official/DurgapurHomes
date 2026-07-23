import React, { useState, useEffect } from 'react';
import { ServiceProvider, Order, OrderExpense } from '../types';
import { 
  Briefcase, Star, Wallet, FileText, CheckCircle2, XCircle, Hourglass, 
  UserCheck, Plus, Trash2, ArrowUpRight, DollarSign, Clock, Settings, UploadCloud,
  ShieldCheck, ShieldAlert, FileCheck
} from 'lucide-react';

interface ProviderPortalProps {
  activeView?: string;
  provider: ServiceProvider;
  orders: Order[];
  onUpdateProvider: (prov: ServiceProvider) => void;
  onUpdateOrders: (orders: Order[]) => void;
}

export default function ProviderPortal({
  activeView,
  provider,
  orders,
  onUpdateProvider,
  onUpdateOrders
}: ProviderPortalProps) {

  // Selected active tab: 'jobs' | 'kyc'
  const [portalTab, setPortalTab] = useState<'jobs' | 'kyc'>(
    activeView === 'partner-kyc' ? 'kyc' : 'jobs'
  );

  useEffect(() => {
    if (activeView === 'partner-kyc') {
      setPortalTab('kyc');
    } else if (activeView === 'partner-jobs') {
      setPortalTab('jobs');
    }
  }, [activeView]);

  // Selected active order
  const [activeJob, setActiveJob] = useState<Order | null>(null);

  // KYC submission form states
  const [docType, setDocType] = useState(provider.kycDocType || 'Aadhaar Card');
  const [docNum, setDocNum] = useState(provider.kycDocNumber || '');
  const [kycSuccess, setKycSuccess] = useState(false);

  // Completed job billing items
  const [billingCost, setBillingCost] = useState<number>(provider.category === 'AC Mechanic' ? 499 : 249);
  const [itemsList, setItemsList] = useState<OrderExpense[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState<number>(0);

  const isApproved = provider.status === 'active';

  // Filter jobs assigned to this provider
  const myJobs = orders.filter(o => o.providerId === provider.id);

  // Submit KYC application
  const handleSubmitKYC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNum) return;

    onUpdateProvider({
      ...provider,
      status: 'kyc_pending',
      kycDocType: docType,
      kycDocNumber: docNum
    });
    setKycSuccess(true);
    setTimeout(() => setKycSuccess(false), 4000);
  };

  // Job Actions
  const handleAcceptJob = (jobId: string) => {
    const updated = orders.map(o => {
      if (o.id === jobId) {
        return { ...o, status: 'ongoing' as const };
      }
      return o;
    });
    onUpdateOrders(updated);
    // Sync active view
    setActiveJob(updated.find(o => o.id === jobId) || null);
  };

  const handleRejectJob = (jobId: string) => {
    const updated = orders.map(o => {
      if (o.id === jobId) {
        return { 
          ...o, 
          status: 'pending' as const, // Put back to allocation pool
          providerId: undefined,
          providerName: undefined
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    setActiveJob(null);
  };

  // Billing Expenses Builder
  const handleAddItem = () => {
    if (!itemName || itemCost <= 0) return;
    setItemsList([...itemsList, { item: itemName, cost: Number(itemCost) }]);
    setItemName('');
    setItemCost(0);
  };

  const handleRemoveItem = (idx: number) => {
    setItemsList(itemsList.filter((_, i) => i !== idx));
  };

  // Complete Job & Update final amount
  const handleCompleteJob = (jobId: string) => {
    const totalExpenses = itemsList.reduce((sum, item) => sum + item.cost, 0);
    const finalBillingSum = Number(billingCost);

    const updatedOrders = orders.map(o => {
      if (o.id === jobId) {
        return {
          ...o,
          status: 'completed' as const,
          amount: finalBillingSum,
          expenses: itemsList,
          paymentStatus: 'successful' as const,
          providerFeedback: 'Job completed by partner. Financial ledger verified.'
        };
      }
      return o;
    });

    onUpdateOrders(updatedOrders);

    // Update provider wallet balance & jobs count
    // Deducting 15% platform commission as set in settings
    const commissionDeduction = finalBillingSum * 0.15;
    const providerEarning = finalBillingSum - commissionDeduction;

    onUpdateProvider({
      ...provider,
      balance: provider.balance + providerEarning,
      jobsCompleted: provider.jobsCompleted + 1
    });

    // Reset list & modal
    setItemsList([]);
    setActiveJob(null);
  };

  return (
    <div className="space-y-6 select-none" id="provider-portal-root">
      
      {/* HEADER BAR & PARTNER NAVIGATION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            {provider.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-800">Partner Portal: {provider.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isApproved ? 'Verified Partner' : 'Verification Pending'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">{provider.category} Specialty Partner</p>
          </div>
        </div>

        {/* Navigation Tabs for Partner */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setPortalTab('jobs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              portalTab === 'jobs' 
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Allocations</span>
            {myJobs.filter(j => j.status === 'confirmed' || j.status === 'ongoing' || j.status === 'initiated').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setPortalTab('kyc')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              portalTab === 'kyc' 
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KYC Verification</span>
            {!isApproved && (
              <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                !
              </span>
            )}
          </button>
        </div>

        {isApproved && (
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="space-y-0.5 text-right border-r border-slate-200 pr-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Ratings</p>
              <p className="text-xs font-extrabold text-amber-600 flex items-center justify-end gap-1">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{provider.rating} / 5</span>
              </p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Wallet Balance</p>
              <p className="text-xs font-extrabold text-emerald-700 font-mono">₹{provider.balance.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED PARTNER KYC VERIFICATION TAB */}
      {portalTab === 'kyc' && (
        <div className="space-y-6" id="partner-kyc-tab-view">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Partner KYC & Identity Verification</span>
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Compliance and identity credentials verification portal for Durgapur Fix service partners.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isApproved ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Partner Credential
                  </span>
                ) : provider.status === 'kyc_pending' ? (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <Hourglass className="w-4 h-4 animate-spin text-amber-600" />
                    Document Review Pending
                  </span>
                ) : (
                  <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <ShieldAlert className="w-4 h-4 text-cyan-600" />
                    KYC Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Success Alert Banner */}
            {kycSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>KYC identity documents submitted successfully! Your credentials are now queued for operations audit.</span>
              </div>
            )}

            {/* Active Credentials Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Registered Partner Credentials</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Partner ID:</span>
                    <span className="font-bold font-mono text-slate-800">{provider.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Full Name:</span>
                    <span className="font-bold text-slate-800">{provider.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Specialty Trade:</span>
                    <span className="font-bold text-slate-800">{provider.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Registered Phone:</span>
                    <span className="font-bold text-slate-800">{provider.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Document Type:</span>
                    <span className="font-bold text-slate-800">{provider.kycDocType || docType}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-medium">Document Number:</span>
                    <span className="font-bold font-mono text-slate-800">{provider.kycDocNumber || docNum || 'Not Provided'}</span>
                  </div>
                </div>
              </div>

              {/* Upload or Update Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>{isApproved ? 'Update Government Identity Records' : 'Upload Identity Credentials'}</span>
                </h4>

                <form onSubmit={handleSubmitKYC} className="space-y-4">
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">Select Government ID Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (12-Digit UIDAI)</option>
                      <option value="PAN Card">PAN Card (Permanent Account Number)</option>
                      <option value="Driving License">Driving License (Transport Dept)</option>
                      <option value="Voter Identity Card">Voter Identity Card (EPIC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">Government ID Number</label>
                    <input
                      type="text"
                      value={docNum}
                      onChange={(e) => setDocNum(e.target.value)}
                      placeholder="e.g. 4832 9904 1234 or ABCDE1234F"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                    🔒 Documents are encrypted and processed securely according to Durgapur Fix partner compliance guidelines.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isApproved ? 'Re-Submit Updated Documents' : 'Submit Identity Documents for Audit'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JOBS TAB CONTENT */}
      {portalTab === 'jobs' && (
        !isApproved ? (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl space-y-6" id="application-wait-screen">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Partner Application review stage</span>
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                Before you can receive live home service orders and start earning, Durgapur Fix requires verifying your identity credentials to maintain safety and compliance.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <p className="font-extrabold text-slate-700">Status Check:</p>
              {provider.status === 'kyc_pending' ? (
                <div className="space-y-1 text-amber-700 font-bold">
                  <p className="font-extrabold uppercase flex items-center gap-1">
                    <Hourglass className="w-4 h-4 animate-spin text-amber-600" />
                    Awaiting Administrative Review
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Your uploaded document ({provider.kycDocType || docType}: {provider.kycDocNumber || docNum}) is currently being reviewed by the operations team.</p>
                </div>
              ) : provider.status === 'banned' ? (
                <div className="text-red-700 space-y-1 font-bold">
                  <p className="font-extrabold uppercase flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Access Revoked / Banned
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Your platform credentials have been restricted due to failure to meet quality safety standards.</p>
                </div>
              ) : (
                <div className="text-blue-700 space-y-1 font-bold">
                  <p className="font-extrabold uppercase flex items-center gap-1">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    Documentation Verification Pending
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Please navigate to the <strong>KYC Verification tab</strong> above or use the form below to upload Aadhaar or PAN details.</p>
                </div>
              )}
            </div>

            {/* Quick instructions cheat sheet */}
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1.5">💡 Operations Tip:</p>
              <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                You can log out, sign in with the <strong>Admin demo account</strong>, navigate to "Manage Provider" in the sidebar, locate your partner name, and click <strong>"Verify & Approve"</strong>. Once approved, log back in here to see the active job assignment dashboard!
              </p>
            </div>
          </div>
        ) : (
          /* APPROVED PORTAL ACTIVE DASHBOARD */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT: Jobs allocated list */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Your Job Allocations ({myJobs.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="provider-jobs-grid">
              {myJobs.map((job) => {
                const isPendingAccept = job.status === 'confirmed'; // Confirmed by staff, waiting for provider acceptance
                return (
                  <div 
                    key={job.id}
                    onClick={() => setActiveJob(job)}
                    className={`p-4 rounded-xl border bg-white hover:border-slate-300 transition cursor-pointer flex flex-col justify-between space-y-3.5 shadow-xs ${
                      activeJob?.id === job.id ? 'border-emerald-500 bg-emerald-50/10 shadow-md' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-emerald-700">{job.id}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{job.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-850 truncate">{job.serviceName}</h4>
                      <p className="text-[10px] text-blue-600 font-bold">{job.zone} District</p>
                      <p className="text-[11px] text-slate-500 font-semibold">Time Slot: {job.date} | {job.timeSlot}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="font-extrabold text-slate-800 text-xs font-mono">Est: ₹{job.amount}</span>
                      
                      {isPendingAccept ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptJob(job.id);
                            }}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-xs transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectJob(job.id);
                            }}
                            className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 cursor-pointer transition shadow-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveJob(job);
                          }}
                          className="py-1.5 px-3 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-650 text-[10px] font-bold rounded-lg cursor-pointer transition shadow-xs"
                        >
                          View Controls
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {myJobs.length === 0 && (
                <div className="col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 font-semibold text-xs">
                  No active home service orders assigned to your account. Payout allocations are dispatched by executive staff.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Active selected job controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit space-y-4" id="provider-job-controls">
            {activeJob ? (
              <>
                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-700">{activeJob.id} Details</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-extrabold uppercase">{activeJob.status}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{activeJob.serviceName}</h3>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-750">
                    <p className="font-bold">Client Address details:</p>
                    <p className="text-slate-500 font-medium">{activeJob.address}</p>
                    <p className="text-slate-500 font-medium">Client contact: <span className="font-bold text-slate-800">{activeJob.customerName}</span> ({activeJob.customerPhone})</p>
                  </div>
                </div>

                {activeJob.status === 'ongoing' && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                      <span>Active Ongoing Commission</span>
                    </p>

                    {/* Billing Updates Area */}
                    <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Update Billing details</p>
                      
                      <div className="space-y-1.5">
                        <label className="block text-slate-600 text-[10px] font-bold">Total Service Charge Received (₹)</label>
                        <input
                          type="number"
                          value={billingCost}
                          onChange={(e) => setBillingCost(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>

                      {/* Expense Itemizer */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block text-slate-500 text-[10px] uppercase font-bold">Add Itemized Expenses (Parts, Materials)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="e.g. Teflon Tape, Filter nozzle"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800"
                          />
                          <input
                            type="number"
                            value={itemCost}
                            onChange={(e) => setItemCost(Number(e.target.value))}
                            placeholder="Cost"
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 text-center font-mono font-semibold"
                          />
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer inline-flex transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* List of expenses itemized */}
                        {itemsList.length > 0 && (
                          <div className="space-y-1 pt-1 max-h-24 overflow-y-auto">
                            {itemsList.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] bg-white border border-slate-100 px-2 py-1 rounded">
                                <span className="text-slate-700 font-bold truncate max-w-[130px]">{item.item}</span>
                                <span className="text-slate-500 font-mono font-semibold">₹{item.cost}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-red-600 hover:text-red-700 ml-1.5 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCompleteJob(activeJob.id)}
                        className="py-2.5 bg-emerald-650 hover:bg-emerald-750 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs hover:shadow-md transition"
                      >
                        Complete Job
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Cancel this service order allocation?')) {
                            const updated = orders.map(o => o.id === activeJob.id ? { ...o, status: 'canceled' as const } : o);
                            onUpdateOrders(updated);
                            setActiveJob(null);
                          }
                        }}
                        className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
                      >
                        Cancel Job
                      </button>
                    </div>
                  </div>
                )}

                {activeJob.status === 'completed' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl space-y-1 shadow-xs">
                    <p className="font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                      Job Completed Successfully
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Payout ledger updated. Platform commission has been credited to aggregations account.</p>
                  </div>
                )}

                {activeJob.status === 'canceled' && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl space-y-1 shadow-xs">
                    <p className="font-bold uppercase flex items-center gap-1">
                      <XCircle className="w-4.5 h-4.5 text-red-500" />
                      Service Order Canceled
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed">No funds settled. Customer re-allocation has been initialized.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2 font-semibold">
                <Briefcase className="w-9 h-9 mx-auto text-slate-350" />
                <p className="text-xs">Select any job assignment from your queue list to view customer contact info, coordinate billing, or file completed report cards.</p>
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
