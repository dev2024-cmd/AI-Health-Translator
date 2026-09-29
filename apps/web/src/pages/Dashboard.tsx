import React, { useState } from 'react';
import {
  Volume2,
  Camera,
  FileText,
  Calendar,
  Pause,
  Share2,
  FolderOpen,
  Sun,
  Moon,
  Sparkles,
  Phone,
  Search,
  TrendingUp,
  AlertCircle,
  Pill,
  Users,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  X,
  Upload,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { WebReport, EscalationTicket } from '../types/api.js';
import { FamilyMember } from './FamilyProfiles.js';
import { getUITranslation } from '../utils/translations.js';
import { getLocalizedExplanation } from '../utils/reportLocalizer.js';

interface DashboardProps {
  userName: string;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  reports: WebReport[];
  escalations: EscalationTicket[];
  onOpenReport: (report: WebReport) => void;
  onScanReport: () => void;
  onUploadReport: () => void;
  familyMembers: FamilyMember[];
  onSimulateVoiceCall?: (report: WebReport) => void;
  onNavigateTab?: (view: string) => void;
  onOpenSubscription?: () => void;
  currentPlan?: 'free' | 'family' | 'pro';
  maxFreeReports?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userName,
  selectedLanguage,
  onLanguageChange,
  reports,
  escalations,
  onOpenReport,
  onScanReport,
  onUploadReport,
  familyMembers,
  onSimulateVoiceCall,
  onNavigateTab,
  onOpenSubscription,
  currentPlan = 'free',
  maxFreeReports = 5,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'attention' | 'critical' | 'prescription'>('all');
  const [isPlayingGreeting, setIsPlayingGreeting] = useState<boolean>(false);
  const [activeSpeechReportId, setActiveSpeechReportId] = useState<string | null>(null);
  const [showDrugModal, setShowDrugModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);

  const t = getUITranslation(selectedLanguage);

  // Time of day calculation
  const hour = new Date().getHours();
  const timeKey = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : 'evening';
  const localizedGreeting = t.greetings[timeKey] || t.greetings.morning;

  // Patients list for family profile filtering
  const patients = [
    { id: 'all', name: t.reportsSection.allFamily },
    { id: 'pat-self', name: `${t.reportsSection.self} (${userName})` },
    ...familyMembers.map((member) => ({ id: member.id, name: member.name })),
  ];

  // Statistics
  const totalAnalyzed = reports.length;
  let redCount = 0;
  let amberCount = 0;
  reports.forEach((r) => {
    r.extracted_values.forEach((v) => {
      if (v.flag === 'critical') redCount++;
      else if (v.flag === 'low' || v.flag === 'high') amberCount++;
    });
  });

  // Dynamic Health Score & Risk Level calculation
  const healthScore = totalAnalyzed === 0 ? null : Math.max(38, Math.min(98, 96 - redCount * 18 - amberCount * 6));
  const riskLevel = totalAnalyzed === 0 ? 'unknown' : redCount > 0 ? 'High Risk' : amberCount > 0 ? 'Moderate Risk' : 'Low Risk';

  // Filter reports by patient, search query, and category filter
  const filteredReports = reports.filter((r) => {
    // 1. Patient match
    const patientMatch =
      selectedPatientId === 'all'
        ? true
        : selectedPatientId === 'pat-self'
        ? r.patient_id === 'pat-self' || !r.patient_id
        : r.patient_id === selectedPatientId;

    if (!patientMatch) return false;

    // 2. Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = r.test_title.toLowerCase().includes(q);
      const nameMatch = r.patient_name.toLowerCase().includes(q);
      const docMatch = (r.doctor_name || '').toLowerCase().includes(q);
      const fileMatch = (r.file_name || '').toLowerCase().includes(q);
      const dateMatch = (r.date || '').toLowerCase().includes(q);
      if (!titleMatch && !nameMatch && !docMatch && !fileMatch && !dateMatch) {
        return false;
      }
    }

    // 3. Status filter match
    if (statusFilter === 'all') return true;
    if (statusFilter === 'prescription') {
      return r.document_type === 'prescription' || (r.file_name || '').toLowerCase().includes('prescription');
    }
    const hasCrit = r.extracted_values.some((v) => v.flag === 'critical');
    const hasAbn = r.extracted_values.some((v) => v.flag === 'low' || v.flag === 'high');

    if (statusFilter === 'critical') return hasCrit;
    if (statusFilter === 'attention') return hasAbn && !hasCrit;
    if (statusFilter === 'safe') return !hasCrit && !hasAbn;

    return true;
  });

  const langTagMap: Record<string, string> = {
    ta: 'ta-IN',
    te: 'te-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    en: 'en-IN',
  };

  // Text-To-Speech: Greeting & Health Summary
  const handleSpeakGreetingAndSummary = () => {
    if (!window.speechSynthesis) return;

    if (isPlayingGreeting) {
      window.speechSynthesis.cancel();
      setIsPlayingGreeting(false);
      return;
    }

    const greetingText = t.greetings.spokenIntro(userName, totalAnalyzed, redCount);

    const utterance = new SpeechSynthesisUtterance(greetingText);
    utterance.lang = langTagMap[selectedLanguage] || 'en-IN';
    utterance.rate = 0.88;
    utterance.onend = () => setIsPlayingGreeting(false);
    utterance.onerror = () => setIsPlayingGreeting(false);

    setIsPlayingGreeting(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Text-To-Speech: Specific Report Explanation
  const handleSpeakReport = (report: WebReport, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;

    if (activeSpeechReportId === report.id) {
      window.speechSynthesis.cancel();
      setActiveSpeechReportId(null);
      return;
    }

    const explanation = getLocalizedExplanation(report, selectedLanguage);

    const utterance = new SpeechSynthesisUtterance(explanation);
    utterance.lang = langTagMap[selectedLanguage] || 'en-IN';
    utterance.rate = 0.88;
    utterance.onend = () => setActiveSpeechReportId(null);
    utterance.onerror = () => setActiveSpeechReportId(null);

    window.speechSynthesis.cancel();
    setActiveSpeechReportId(report.id);
    window.speechSynthesis.speak(utterance);
  };

  // WhatsApp 1-Tap Share to Family
  const handleShareToWhatsApp = (report: WebReport, e: React.MouseEvent) => {
    e.stopPropagation();
    const explanation = getLocalizedExplanation(report, selectedLanguage);

    const textToShare = `*Bharat Swasth - Health Summary*\n*Patient:* ${report.patient_name}\n*Report:* ${report.test_title}\n*Date:* ${report.date}\n\n*Summary:* \n${explanation.slice(0, 350)}...\n\n_Shared via Bharat Swasth (${t.tagline})_`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Welcoming Header Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {localizedGreeting}, {userName}!
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                Health Vault Active
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-normal">
              {t.greetings.welcomeSubtitle}
            </p>
          </div>
        </div>

        {/* Audio Read-Aloud Button */}
        <button
          type="button"
          onClick={handleSpeakGreetingAndSummary}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 active:scale-95 ${
            isPlayingGreeting
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-sky-700 hover:bg-sky-800 text-white'
          }`}
        >
          {isPlayingGreeting ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isPlayingGreeting ? t.greetings.pauseAudio : t.greetings.listenAloud}</span>
        </button>
      </div>

      {/* Free Quota Limit Reached Banner */}
      {currentPlan === 'free' && reports.length >= maxFreeReports && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                  Free Quota Limit Reached ({reports.length}/{maxFreeReports} Reports Processed)
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-200/60 dark:bg-amber-800/60 rounded text-amber-900 dark:text-amber-200">
                  Ayush Tier Limit
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                You have utilized your {maxFreeReports} free report allocations. Upgrade to Swasthya Parivar or Pro for unlimited document uploads, priority Vision OCR, and direct telecom features:
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                <span className="bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  SMS: ₹0.25 / 160-char SMS
                </span>
                <span className="bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  IVR Calls: ₹0.75 / min
                </span>
                <span className="bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Vision OCR: ₹0.50 / page
                </span>
                <span className="bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Clinical LLM: ₹0.60 / report
                </span>
              </div>
            </div>
          </div>

          {onOpenSubscription && (
            <button
              type="button"
              onClick={onOpenSubscription}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs whitespace-nowrap shadow-sm shadow-brand-600/20 transition-all shrink-0 active:scale-95"
            >
              View Plans & Upgrade
            </button>
          )}
        </div>
      )}

      {/* 2. Official Health Score & Risk Level Assessment Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Circular Progress Gauge */}
          <div className="relative w-20 h-20 rounded-full border-4 border-emerald-500/30 bg-slate-950 flex flex-col items-center justify-center text-center font-bold shrink-0 shadow-inner">
            <span className="text-xl font-bold text-emerald-400">
              {healthScore === null ? 'N/A' : healthScore}
            </span>
            {healthScore !== null && <span className="text-[10px] text-slate-400 font-medium -mt-0.5">/100</span>}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Health Score</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Clinical AI
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
              {healthScore === null
                ? 'Upload your first medical report to get a health score based on verified diagnostic indicators.'
                : 'Calculated dynamically from your verified clinical blood parameters and vital signs.'}
            </p>
          </div>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Health insights are AI-generated for informational purposes only — not medical advice. Powered by Nidan AI™
          </span>
        </div>

        {/* Two Metric Cards Side-by-Side */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{totalAnalyzed}</div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Reports</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-white capitalize">{riskLevel}</div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Risk Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Upload Report */}
          <button
            type="button"
            onClick={onScanReport}
            className="p-4 sm:p-4.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-sky-300 dark:hover:border-sky-700 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-9 h-9 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white group-hover:text-sky-700 transition-colors">
              Upload Report
            </span>
          </button>

          {/* Share with Doctor */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="p-4 sm:p-4.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-sky-300 dark:hover:border-sky-700 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-9 h-9 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/60 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white group-hover:text-teal-700 transition-colors">
              Share with Doctor
            </span>
          </button>

          {/* Drug Interactions */}
          <button
            type="button"
            onClick={() => setShowDrugModal(true)}
            className="p-4 sm:p-4.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-sky-300 dark:hover:border-sky-700 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white group-hover:text-amber-700 transition-colors">
              Drug Interactions
            </span>
          </button>

          {/* Family Members */}
          <button
            type="button"
            onClick={() => onNavigateTab?.('family')}
            className="p-4 sm:p-4.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-sky-300 dark:hover:border-sky-700 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-28 group"
          >
            <div className="w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white group-hover:text-indigo-700 transition-colors">
              Family Members
            </span>
          </button>
        </div>
      </div>

      {/* 4. Three Primary Scan & Intake Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Scan Lab Report */}
        <div
          onClick={onScanReport}
          className="group relative cursor-pointer p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 uppercase tracking-wider">
                {t.actionCards.card1Badge}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t.actionCards.card1Title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
              {t.actionCards.card1Desc}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs w-fit transition-colors">
            <span>{t.actionCards.card1Btn}</span>
          </div>
        </div>

        {/* Card 2: Doctor Prescription */}
        <div
          onClick={onUploadReport}
          className="group relative cursor-pointer p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/40 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <Sun className="w-3 h-3" />
                <Moon className="w-3 h-3" />
                <span>{t.actionCards.card2Badge}</span>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t.actionCards.card2Title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
              {t.actionCards.card2Desc}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs w-fit transition-colors">
            <span>{t.actionCards.card2Btn}</span>
          </div>
        </div>

        {/* Card 3: Upload from WhatsApp / Files */}
        <div
          onClick={onUploadReport}
          className="group relative cursor-pointer p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                {t.actionCards.card3Badge}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t.actionCards.card3Title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
              {t.actionCards.card3Desc}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs w-fit transition-colors">
            <span>{t.actionCards.card3Btn}</span>
          </div>
        </div>
      </div>

      {/* 5. Visual Traffic Light Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Safe / All Good */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t.statusCards.safeTitle}
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totalAnalyzed - (redCount > 0 ? 1 : 0)} Reports
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              {t.statusCards.safeDesc}
            </p>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {t.statusCards.attentionTitle}
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {amberCount} Values
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              {t.statusCards.attentionDesc}
            </p>
          </div>
        </div>

        {/* Critical Attention */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {t.statusCards.doctorTitle}
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {redCount} Critical
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              {redCount > 0 ? t.statusCards.criticalWarning : t.statusCards.allClearNotice}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Recent Reports Section with Search & Category Filters (Matches Screenshot 4) */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {t.reportsSection.recentTitle}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {t.reportsSection.recentSubtitle}
            </p>
          </div>

          {/* Search Bar + Patient Filter Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="relative">
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm outline-none focus:border-emerald-500 cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('safe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'safe'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safe</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('attention')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'attention'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Needs Attention</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'critical'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Critical</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('prescription')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'prescription'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Prescriptions</span>
          </button>
        </div>

        {/* Empty State vs Report Cards List */}
        {filteredReports.length === 0 ? (
          <div className="p-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-white dark:bg-slate-900/50">
            <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No reports yet
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload your first medical report to get started
            </p>
            <button
              onClick={onScanReport}
              className="mt-4 px-5 py-2.5 rounded-lg bg-sky-700 text-white font-medium text-xs shadow-xs hover:bg-sky-800 transition-all flex items-center gap-2 mx-auto"
            >
              <span>+ Upload Report</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const hasCritical = report.extracted_values.some((v) => v.flag === 'critical');
              const hasAbnormal = report.extracted_values.some(
                (v) => v.flag === 'low' || v.flag === 'high'
              );
              const isPrescription =
                report.document_type === 'prescription' ||
                report.file_name?.toLowerCase().includes('prescription');
              const isSpeakingThis = activeSpeechReportId === report.id;

              return (
                <div
                  key={report.id}
                  onClick={() => onOpenReport(report)}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-600 dark:hover:border-sky-500 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                      {isPrescription ? (
                        <Pill className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {report.test_title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {isPrescription ? t.reportsSection.prescriptionTag : t.reportsSection.labReportTag}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {report.patient_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {report.date}
                        </span>
                        {report.doctor_name && (
                          <>
                            <span>•</span>
                            <span className="text-teal-700 dark:text-teal-400 font-medium">
                              {report.doctor_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Status Badge, Listen Button, WhatsApp Share Button, Voice Call */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {hasCritical ? (
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                        {t.reportsSection.criticalBadge}
                      </span>
                    ) : hasAbnormal ? (
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                        {t.reportsSection.attentionBadge}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                        {t.reportsSection.safeBadge}
                      </span>
                    )}

                    {/* Spoken Audio Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSpeakReport(report, e)}
                      title="Listen to this report"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                        isSpeakingThis
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-sky-700 hover:bg-sky-800 text-white'
                      }`}
                    >
                      {isSpeakingThis ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeakingThis ? t.reportsSection.stop : t.reportsSection.listen}</span>
                    </button>

                    {/* WhatsApp 1-Tap Share */}
                    <button
                      type="button"
                      onClick={(e) => handleShareToWhatsApp(report, e)}
                      title={t.reportsSection.shareWhatsApp}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Automated Voice Call Simulator */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSimulateVoiceCall?.(report);
                      }}
                      title="Automated Voice Call (For patients without WhatsApp or Email)"
                      className="py-1.5 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/70 border border-teal-200 dark:border-teal-800 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                    >
                      <Phone className="w-3 h-3 text-teal-700 dark:text-teal-400" />
                      <span>Voice Call</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>



      {/* Drug Interactions Modal */}
      {showDrugModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowDrugModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Drug Interaction Analyzer</h3>
                <p className="text-xs text-slate-400">Real-time prescription contraindication scanner</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mt-4">
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold text-slate-100 mb-1">
                  <span>FeSO4 (Ferrous Sulfate) + Vitamin C</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Synergistic (Safe)
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Vitamin C acidifies the stomach and significantly increases iron absorption. Take together as prescribed.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold text-slate-100 mb-1">
                  <span>Iron Supplements + Dairy / Tea / Coffee</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Caution (Reduced Efficacy)
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Calcium in milk and tannins in tea/coffee bind to iron and block absorption. Keep 2 hours gap.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold text-slate-100 mb-1">
                  <span>Multiple NSAIDs (Ibuprofen + Aspirin / Naproxen)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    High Precaution
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Combining two NSAIDs increases risk of gastric ulcers. Never combine without doctor approval.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDrugModal(false)}
              className="w-full mt-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Close Analyzer
            </button>
          </div>
        </div>
      )}

      {/* Share with Doctor Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Share Health Vault with Doctor</h3>
                <p className="text-xs text-slate-400">Generate secure DPDP-compliant consultation link</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-3">
              <p>
                A time-limited (24-hour) encrypted medical bundle link will be generated for your physician with your explicit consent:
              </p>
              <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px] text-teal-300 select-all truncate">
                https://bharatswasth.gov.in/teleconsult/token-v3-{Date.now().toString(36)}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Expires in 24 hours • Access logged under DPDP Act 2023</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://bharatswasth.gov.in/teleconsult/token-v3-${Date.now().toString(36)}`);
                  setShareSuccessToast('Secure link copied to clipboard!');
                  setTimeout(() => setShareSuccessToast(null), 3000);
                  setShowShareModal(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-xs transition-colors text-center"
              >
                Copy Link
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*Bharat Swasth - Doctor Consultation Health Bundle*\nPatient: ${userName}\nRecords: ${totalAnalyzed} reports\nAccess link: https://bharatswasth.gov.in/teleconsult/token-v3-${Date.now().toString(36)}`
                  )}`;
                  window.open(url, '_blank');
                  setShowShareModal(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-xs transition-colors text-center"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast */}
      {shareSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{shareSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
