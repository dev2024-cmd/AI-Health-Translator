import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  MessageSquare,
  Eye,
  Brain,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ArrowLeft,
  QrCode,
  Building2,
  Lock,
  Receipt,
  Download,
  CheckCircle2,
  Smartphone,
  Loader2
} from 'lucide-react';

export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'family' | 'pro';
  onUpgradePlan: (plan: 'free' | 'family' | 'pro') => void;
  reportsCount: number;
  maxFreeReports?: number;
  storageUsedMB?: number;
  maxFreeStorageMB?: number;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'free',
  onUpgradePlan,
  reportsCount = 0,
  maxFreeReports = 5,
  storageUsedMB = 4.2,
  maxFreeStorageMB = 25,
  userName = 'Parvathi Rao',
  userPhone = '+91 98765 43210',
  userEmail = 'parvathi.rao@gmail.com',
}) => {
  // Modal flow steps: 'plans' -> 'checkout' -> 'processing' -> 'receipt'
  const [modalStep, setModalStep] = useState<'plans' | 'checkout' | 'processing' | 'receipt'>('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [targetPlan, setTargetPlan] = useState<'family' | 'pro'>('family');

  // Billing form state
  const [billingName, setBillingName] = useState<string>(userName || 'Parvathi Rao');
  const [billingPhone, setBillingPhone] = useState<string>(userPhone || '+91 98765 43210');
  const [billingEmail, setBillingEmail] = useState<string>(userEmail || 'parvathi.rao@gmail.com');
  const [billingCity, setBillingCity] = useState<string>('Hyderabad, Telangana');
  const [billingPincode, setBillingPincode] = useState<string>('500001');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState<string>('parvathi@okhdfcbank');
  const [showUpiQr, setShowUpiQr] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 1024');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('•••');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');

  // Payment processing & receipt simulation
  const [processingStage, setProcessingStage] = useState<string>('Connecting to Payment Gateway...');
  const [transactionDetails, setTransactionDetails] = useState<{
    txnId: string;
    invoiceNo: string;
    amount: string;
    date: string;
  }>({
    txnId: '',
    invoiceNo: '',
    amount: '',
    date: '',
  });

  if (!isOpen) return null;

  const isQuotaExhausted = currentPlan === 'free' && reportsCount >= maxFreeReports;
  const isStorageExhausted = currentPlan === 'free' && storageUsedMB >= maxFreeStorageMB;

  // Price calculations
  const getPricing = (plan: 'family' | 'pro', cycle: 'monthly' | 'annual') => {
    if (plan === 'family') {
      return cycle === 'monthly'
        ? { base: 168.64, gst: 30.36, total: 199, label: '₹199 / month' }
        : { base: 1609.32, gst: 289.68, total: 1899, label: '₹1,899 / year' };
    } else {
      return cycle === 'monthly'
        ? { base: 422.88, gst: 76.12, total: 499, label: '₹499 / month' }
        : { base: 4066.95, gst: 732.05, total: 4799, label: '₹4,799 / year' };
    }
  };

  const pricing = getPricing(targetPlan, billingCycle);

  // 1. User clicks Upgrade Plan on the pricing screen -> Transitions to Billing & Payment Checkout
  const handleInitiateUpgrade = (plan: 'family' | 'pro') => {
    setTargetPlan(plan);
    setModalStep('checkout');
  };

  // 2. User downgrades to Free
  const handleDowngradeToFree = () => {
    if (window.confirm('Are you sure you want to switch to the Ayush Free Tier? Your upload quota will be limited to 5 reports.')) {
      onUpgradePlan('free');
      onClose();
    }
  };

  // 3. User submits Billing & Payment Information -> Simulates Gateway Authorization & Generates Invoice
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName.trim() || !billingPhone.trim() || !billingEmail.trim()) {
      alert('Please fill in your billing details (Name, Phone, and Email for Tax Invoice).');
      return;
    }

    if (paymentMethod === 'upi' && !showUpiQr && !upiId.includes('@')) {
      alert('Please enter a valid UPI VPA (e.g., yourname@okhdfcbank).');
      return;
    }

    setModalStep('processing');
    setProcessingStage('Connecting to RBI-authorized Payment Gateway...');

    setTimeout(() => {
      setProcessingStage('Authenticating billing information with bank...');
    }, 600);

    setTimeout(() => {
      setProcessingStage(`Authorizing payment of ₹${pricing.total}.00 via ${paymentMethod.toUpperCase()}...`);
    }, 1200);

    setTimeout(() => {
      setProcessingStage('Generating digital GST Tax Invoice & upgrading Health Vault...');
    }, 1800);

    setTimeout(() => {
      const now = new Date();
      const generatedTxn = {
        txnId: `BHARAT-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceNo: `GST-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: `₹${pricing.total}.00`,
        date: now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setTransactionDetails(generatedTxn);
      setModalStep('receipt');
    }, 2400);
  };

  // 4. User completes receipt review -> Upgrades account state
  const handleCompleteUpgrade = () => {
    onUpgradePlan(targetPlan);
    setModalStep('plans');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Bharat Swasth Subscriptions & Transparent Pricing
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                DPDP 2023 Compliant Health Vault
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {modalStep === 'plans' && 'Choose the Right Plan for Your Family’s Health'}
              {modalStep === 'checkout' && 'Billing Details & Secure Payment'}
              {modalStep === 'processing' && 'Processing Secure Payment...'}
              {modalStep === 'receipt' && 'Subscription Active & Payment Verified'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {modalStep === 'plans' && 'Transparent, subsidized healthcare communication pricing with zero hidden surcharges.'}
              {modalStep === 'checkout' && 'Provide your billing information to complete payment and upgrade your account.'}
              {modalStep === 'processing' && 'Please wait while we authorize payment with your bank under RBI guidelines.'}
              {modalStep === 'receipt' && 'Your transaction is approved. Download your digital tax invoice below.'}
            </p>
          </div>

          <button
            onClick={() => {
              setModalStep('plans');
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STEP 1: PLANS SELECTION VIEW ================= */}
        {modalStep === 'plans' && (
          <>
            {/* Quota Alert Banner if Exceeded */}
            {(isQuotaExhausted || isStorageExhausted) && (
              <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/60 p-3 sm:p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                  <strong className="font-bold">Free Quota Limit Reached ({reportsCount}/{maxFreeReports} Reports Used): </strong>
                  To process additional medical documents and unlock unlimited high-speed Neural Vision OCR with spoken IVR calls, select a subscription plan below to proceed to billing.
                </div>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* 1. Transparent Cost Breakdown of Real-Time Infrastructure */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-brand-600" />
                      Direct Infrastructure Unit Costs (Billed at Direct Cost)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Every rupee goes directly toward low-latency telecom and AI inference infrastructure:
                    </p>
                  </div>

                  {/* Monthly vs Annual Toggle */}
                  <div className="flex items-center bg-slate-200 dark:bg-slate-700/80 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                        billingCycle === 'annual'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>Annual</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1 rounded font-bold">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4 Unit Cost Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                      <span>SMS Cost</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹0.25 <span className="text-[10px] font-normal text-slate-400">/ 160-char SMS</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">22 Indian Vernaculars</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2G IVR Call Cost</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹0.75 <span className="text-[10px] font-normal text-slate-400">/ minute</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Voice delivery to elders</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Vision OCR Cost</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹0.50 <span className="text-[10px] font-normal text-slate-400">/ scan page</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Handwritten & printed</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
                      <Brain className="w-3.5 h-3.5 text-purple-600" />
                      <span>Clinical LLM Cost</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹0.60 <span className="text-[10px] font-normal text-slate-400">/ report</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Grade 5 simplification</p>
                  </div>
                </div>
              </div>

              {/* 2. Three Tier Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Plan 1: Ayush Free Tier */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                    currentPlan === 'free'
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Ayush Starter
                      </span>
                      {currentPlan === 'free' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹0 <span className="text-xs font-normal text-slate-400">/ forever</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Essential healthcare simplification for individuals.
                      </p>
                    </div>

                    {/* Quota Progress */}
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600 dark:text-slate-300">Report Quota</span>
                        <span className={isQuotaExhausted ? 'text-rose-600 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                          {reportsCount} / {maxFreeReports} Reports
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isQuotaExhausted ? 'bg-rose-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${Math.min(100, (reportsCount / maxFreeReports) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                        <span>Storage limit:</span>
                        <span>{storageUsedMB.toFixed(1)}MB / {maxFreeStorageMB}MB</span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>Up to 5 medical report uploads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>5 Free SMS vernacular dispatches</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>2 Free 2G IVR spoken report calls</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>Grade 5 simplification & audio</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>DPDP Act 2023 Consent Shield</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    disabled={currentPlan === 'free'}
                    onClick={handleDowngradeToFree}
                    className="w-full py-2 px-3 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    {currentPlan === 'free' ? 'Active Plan' : 'Downgrade to Free'}
                  </button>
                </div>

                {/* Plan 2: Swasthya Parivar (Family Plus) - Most Popular */}
                <div
                  className={`rounded-xl border-2 p-5 flex flex-col justify-between relative transition-all ${
                    currentPlan === 'family'
                      ? 'border-brand-600 bg-brand-50/30 dark:bg-brand-950/30 shadow-md'
                      : 'border-brand-500 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-xs">
                    Most Popular for Families
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 mt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                        Swasthya Parivar
                      </span>
                      {currentPlan === 'family' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {billingCycle === 'monthly' ? '₹199' : '₹1,899'}
                        <span className="text-xs font-normal text-slate-400">
                          {billingCycle === 'monthly' ? ' / month' : ' / year'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Covers parents, elderly relatives, and dependents.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span><strong>50 Reports / month</strong> (250MB storage)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span><strong>100 SMS Alerts</strong> (₹0.25 direct overage)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span><strong>30 IVR Calls</strong> to 2G feature phones</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>Neural Vision OCR (Printed & Handwriting)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>Up to 6 family dependent profiles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>Drug-Drug Interaction alerts</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleInitiateUpgrade('family')}
                    className={`w-full py-2.5 px-3 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                      currentPlan === 'family'
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20 active:scale-98'
                    }`}
                  >
                    <span>{currentPlan === 'family' ? 'Current Active Plan' : 'Proceed to Payment →'}</span>
                    {currentPlan !== 'family' && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Plan 3: Swasthya Pro (Caregiver & Clinic) */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                    currentPlan === 'pro'
                      ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Swasthya Pro
                      </span>
                      {currentPlan === 'pro' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {billingCycle === 'monthly' ? '₹499' : '₹4,799'}
                        <span className="text-xs font-normal text-slate-400">
                          {billingCycle === 'monthly' ? ' / month' : ' / year'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        For active caregivers, ASHA workers & community clinics.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>Unlimited Medical Reports</strong> (5GB storage)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>Unlimited SMS & WhatsApp</strong> dispatches</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>Unlimited 2G IVR Calls</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Direct Community Health Worker escalation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Priority GPU Neural OCR inference</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Full Medical Glossary pgvector search</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleInitiateUpgrade('pro')}
                    className={`w-full py-2.5 px-3 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                      currentPlan === 'pro'
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-98'
                    }`}
                  >
                    <span>{currentPlan === 'pro' ? 'Current Active Plan' : 'Proceed to Payment →'}</span>
                    {currentPlan !== 'pro' && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted payment powered by UPI, Rupay, NetBanking & Cards under RBI guidelines.</span>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* ================= STEP 2: BILLING INFORMATION & PAYMENT CHECKOUT ================= */}
        {modalStep === 'checkout' && (
          <form onSubmit={handleProcessPayment} className="flex-1 flex flex-col overflow-hidden">
            <div className="overflow-y-auto p-5 sm:p-6 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Billing Information & Payment Methods (7 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Back to Plans Button */}
                  <button
                    type="button"
                    onClick={() => setModalStep('plans')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Plan</span>
                  </button>

                  {/* Section A: Customer Billing Information */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-brand-600" />
                      1. Billing Information (Tax Invoice & Receipts)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Full Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={billingName}
                          onChange={(e) => setBillingName(e.target.value)}
                          placeholder="e.g. Parvathi Rao"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={billingPhone}
                          onChange={(e) => setBillingPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Billing Email (For Instant GST Invoice) *
                        </label>
                        <input
                          type="email"
                          required
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          placeholder="patient.family@gmail.com"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          City & State
                        </label>
                        <input
                          type="text"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                          placeholder="Hyderabad, Telangana"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Postal PIN Code
                        </label>
                        <input
                          type="text"
                          value={billingPincode}
                          onChange={(e) => setBillingPincode(e.target.value)}
                          placeholder="500001"
                          maxLength={6}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Payment Method Selection */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-brand-600" />
                        2. Select Payment Method
                      </h4>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        RBI 3D Secure
                      </span>
                    </div>

                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'upi'
                            ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-700 dark:text-brand-300 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>UPI / QR</span>
                        <span className="text-[9px] font-normal text-emerald-600">Zero Fee</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-700 dark:text-brand-300 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Card (Debit/Credit)</span>
                        <span className="text-[9px] font-normal text-slate-400">RuPay, Visa, MC</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'netbanking'
                            ? 'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-700 dark:text-brand-300 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>NetBanking</span>
                        <span className="text-[9px] font-normal text-slate-400">50+ Indian Banks</span>
                      </button>
                    </div>

                    {/* Method Detail View: UPI */}
                    {paymentMethod === 'upi' && (
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Enter UPI ID / VPA
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowUpiQr(!showUpiQr)}
                            className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{showUpiQr ? 'Use UPI ID instead' : 'Scan BharatQR Code'}</span>
                          </button>
                        </div>

                        {!showUpiQr ? (
                          <div>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. yourname@okhdfcbank"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                            />
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-semibold">
                              <span>Supports: Google Pay</span>
                              <span>•</span>
                              <span>PhonePe</span>
                              <span>•</span>
                              <span>Paytm</span>
                              <span>•</span>
                              <span>BHIM UPI</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center">
                              {/* QR Code graphic */}
                              <div className="w-full h-full border-4 border-slate-900 flex flex-col justify-between p-1">
                                <div className="flex justify-between">
                                  <div className="w-6 h-6 bg-slate-900"></div>
                                  <div className="w-6 h-6 bg-slate-900"></div>
                                </div>
                                <div className="text-[9px] font-mono font-black text-center text-slate-800">
                                  BHARAT QR
                                </div>
                                <div className="flex justify-between">
                                  <div className="w-6 h-6 bg-slate-900"></div>
                                  <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-[7px] text-white font-bold">₹</div>
                                </div>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                              Scan with any UPI app to pay ₹{pricing.total}.00
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Instant verification via NPCI BharatQR
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Method Detail View: Card */}
                    {paymentMethod === 'card' && (
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4242 4242 4242 4242"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Expiry Date (MM/YY)
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Method Detail View: NetBanking */}
                    {paymentMethod === 'netbanking' && (
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Select Bank
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Order Summary & Itemized Breakdown (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                      <span>Order Summary</span>
                      <span className="text-[10px] bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded font-bold">
                        {billingCycle === 'monthly' ? 'Monthly Billing' : 'Annual (20% Off)'}
                      </span>
                    </h4>

                    {/* Plan Summary Box */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {targetPlan === 'family' ? 'Swasthya Parivar' : 'Swasthya Pro'}
                        </span>
                        <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                          {pricing.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {targetPlan === 'family'
                          ? '50 reports/mo, 100 SMS, 30 IVR calls, up to 6 family profiles'
                          : 'Unlimited reports, unlimited SMS/WhatsApp, unlimited IVR calls'}
                      </p>
                    </div>

                    {/* Itemized Price Breakdown */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
                      <div className="flex justify-between">
                        <span>Base Subscription Fee</span>
                        <span className="font-mono">₹{pricing.base.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST @ 18% (Healthcare Software)</span>
                        <span className="font-mono">₹{pricing.gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Gateway Processing Fee</span>
                        <span>₹0.00 (Waived)</span>
                      </div>
                    </div>

                    {/* Total Amount Due */}
                    <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white mb-4">
                      <span>Total Amount Payable</span>
                      <span className="text-lg font-black text-brand-600 dark:text-brand-400 font-mono">
                        ₹{pricing.total}.00
                      </span>
                    </div>

                    {/* Direct Telecom & Infrastructure Cost Recap */}
                    <div className="bg-slate-100/80 dark:bg-slate-900/60 p-2.5 rounded-lg text-[10px] text-slate-500 space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        Included Subsidized Allowances:
                      </div>
                      <div className="flex justify-between">
                        <span>Vernacular SMS (Direct Cost: ₹0.25):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {targetPlan === 'family' ? '100 Included' : 'Unlimited'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>2G IVR Spoken Calls (Direct Cost: ₹0.75/m):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {targetPlan === 'family' ? '30 Included' : 'Unlimited'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Neural Vision OCR (Direct Cost: ₹0.50):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {targetPlan === 'family' ? '50 Scans/mo' : 'Unlimited'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{pricing.total}.00 & Upgrade Health Vault</span>
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    By clicking pay, you authorize billing in compliance with RBI e-mandate guidelines. Cancel anytime from your profile settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setModalStep('plans')}
                className="font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                ← Back to Plans
              </button>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted Healthcare Checkout</span>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 3: PAYMENT PROCESSING SIMULATION ================= */}
        {modalStep === 'processing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center my-auto space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center relative">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Securing Payment Authorization
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              {processingStage}
            </p>
            <div className="w-48 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-600 h-1.5 rounded-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: TAX INVOICE & PAYMENT RECEIPT CONFIRMATION ================= */}
        {modalStep === 'receipt' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 animate-in fade-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment Approved & Plan Upgraded!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your Health Vault has been upgraded to{' '}
                <strong className="text-brand-700 dark:text-brand-300">
                  {targetPlan === 'family' ? 'Swasthya Parivar' : 'Swasthya Pro'}
                </strong>.
              </p>
            </div>

            {/* Official Digital Tax Invoice Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800 max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Bharat Swasth Healthcare Monorepo
                  </div>
                  <div className="text-[10px] text-slate-400">
                    GSTIN: 36AAACB1234F1Z5 • Health IT Services
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                  PAID IN FULL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {transactionDetails.txnId}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Invoice Number</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {transactionDetails.invoiceNo}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Billed To</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {billingName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Payment Mode</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                    {paymentMethod === 'upi' ? `UPI (${upiId})` : paymentMethod === 'card' ? 'RuPay / Card' : selectedBank}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Date & Time</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {transactionDetails.date}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Paid</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {transactionDetails.amount}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tax Invoice sent to: <strong>{billingEmail}</strong></span>
                <span className="font-mono font-bold text-brand-600">80D Eligible</span>
              </div>
            </div>

            {/* Complete Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCompleteUpgrade}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Complete & Return to Health Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
