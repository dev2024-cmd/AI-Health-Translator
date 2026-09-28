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
} from 'lucide-react';
import { WebReport, EscalationTicket } from '../types/api.js';
import { getUITranslation } from '../utils/translations.js';

interface DashboardProps {
  userName: string;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  reports: WebReport[];
  escalations: EscalationTicket[];
  onOpenReport: (report: WebReport) => void;
  onScanReport: () => void;
  onUploadReport: () => void;
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
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [isPlayingGreeting, setIsPlayingGreeting] = useState<boolean>(false);
  const [activeSpeechReportId, setActiveSpeechReportId] = useState<string | null>(null);

  const t = getUITranslation(selectedLanguage);

  // Time of day calculation
  const hour = new Date().getHours();
  const timeKey = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : 'evening';
  const localizedGreeting = t.greetings[timeKey] || t.greetings.morning;

  // Patients list for family profile filtering
  const patients = [
    { id: 'all', name: t.reportsSection.allFamily },
    { id: 'pat-self', name: `${t.reportsSection.self} (${userName})` },
    { id: 'pat-1', name: `Sita Ramulu (${t.reportsSection.father})` },
    { id: 'pat-2', name: `Lakshmi Devi (${t.reportsSection.mother})` },
    { id: 'pat-3', name: `Ramesh Patel (${t.reportsSection.grandfather})` },
  ];

  // Filter reports
  const filteredReports =
    selectedPatientId === 'all'
      ? reports
      : selectedPatientId === 'pat-self'
      ? reports.filter((r) => r.patient_id === 'pat-self' || !r.patient_id)
      : reports.filter((r) => r.patient_id === selectedPatientId);

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

    const explanation =
      report.plain_explanation[selectedLanguage] ||
      report.plain_explanation['en'] ||
      'No explanation available.';

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
    const explanation =
      report.plain_explanation[selectedLanguage] ||
      report.plain_explanation['en'] ||
      '';

    const textToShare = `*🏥 Bharat Swasth - Health Summary*\n*Patient:* ${report.patient_name}\n*Report:* ${report.test_title}\n*Date:* ${report.date}\n\n*Summary:* \n${explanation.slice(0, 350)}...\n\n_Shared via Bharat Swasth (${t.tagline})_`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Quick Native Language Switcher Bar (Direct 1-tap for elderly/rural users) */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
            {t.languageLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { code: 'te', native: 'తెలుగు (Telugu)' },
            { code: 'hi', native: 'हिन्दी (Hindi)' },
            { code: 'en', native: 'English' },
            { code: 'ta', native: 'தமிழ் (Tamil)' },
            { code: 'bn', native: 'বাংলা (Bengali)' },
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 active:scale-95 ${
                selectedLanguage === lang.code
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {lang.native}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Bharat Swasth Welcoming Banner with Voice Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-100/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src="/logo.png"
            alt="Bharat Swasth Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain shadow-md border-2 border-white dark:border-slate-800 bg-white p-1 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {localizedGreeting}, {userName}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider">
                Bharat Swasth
              </span>
            </div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
              {t.greetings.welcomeSubtitle}
            </p>
          </div>
        </div>

        {/* Big Audio Read-Aloud Button */}
        <button
          type="button"
          onClick={handleSpeakGreetingAndSummary}
          className={`px-6 py-3.5 rounded-2xl border text-sm font-black flex items-center justify-center gap-3 transition-all shadow-md shrink-0 active:scale-95 ${
            isPlayingGreeting
              ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-emerald-600/20'
          }`}
        >
          {isPlayingGreeting ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          <span>
            {isPlayingGreeting ? t.greetings.pauseAudio : t.greetings.listenAloud}
          </span>
        </button>
      </div>

      {/* 3. Three Large Primary Action Cards (Zero-Friction for Daily Life) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Scan Lab Report (Emerald) */}
        <div
          onClick={onScanReport}
          className="group relative cursor-pointer p-6 sm:p-7 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black">
                <Camera className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-[11px] uppercase tracking-wider backdrop-blur-sm">
                {t.actionCards.card1Badge}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {t.actionCards.card1Title}
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
              {t.actionCards.card1Desc}
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md">
            <span>{t.actionCards.card1Btn}</span>
          </div>
        </div>

        {/* Card 2: Doctor Prescription (Purple) with Visual Sun & Moon */}
        <div
          onClick={onUploadReport}
          className="group relative cursor-pointer p-6 sm:p-7 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-600 text-white shadow-xl shadow-purple-600/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black">
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[11px]">
                <Sun className="w-3 h-3" />
                <Moon className="w-3 h-3" />
                <span>{t.actionCards.card2Badge}</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {t.actionCards.card2Title}
            </h3>
            <p className="text-purple-100 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
              {t.actionCards.card2Desc}
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-900 font-extrabold text-xs shadow-md">
            <span>{t.actionCards.card2Btn}</span>
          </div>
        </div>

        {/* Card 3: Upload from WhatsApp / Files (Teal/Blue) */}
        <div
          onClick={onScanReport}
          className="group relative cursor-pointer p-6 sm:p-7 rounded-3xl bg-gradient-to-tr from-teal-600 to-cyan-700 text-white shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black">
                <FolderOpen className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 font-black text-[11px] uppercase tracking-wider">
                {t.actionCards.card3Badge}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {t.actionCards.card3Title}
            </h3>
            <p className="text-teal-100 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
              {t.actionCards.card3Desc}
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 font-extrabold text-xs shadow-md">
            <span>{t.actionCards.card3Btn}</span>
          </div>
        </div>
      </div>

      {/* 4. Visual Traffic Light Health Status Reassurance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Safe / All Good */}
        <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
            🟢
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t.statusCards.safeTitle}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalAnalyzed - (redCount > 0 ? 1 : 0)} Reports
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t.statusCards.safeDesc}
            </p>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl shrink-0">
            🟡
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {t.statusCards.attentionTitle}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {amberCount} Values
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t.statusCards.attentionDesc}
            </p>
          </div>
        </div>

        {/* Critical Attention */}
        <div className="p-5 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xl shrink-0">
            🔴
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {t.statusCards.doctorTitle}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {redCount} Critical
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {redCount > 0 ? t.statusCards.criticalWarning : t.statusCards.allClearNotice}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Recent Reports List (Audio-First + WhatsApp Share) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {t.reportsSection.recentTitle}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {t.reportsSection.recentSubtitle}
            </p>
          </div>

          {/* Patient Filter Pill */}
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

        {filteredReports.length === 0 ? (
          <div className="p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center bg-white dark:bg-slate-900/50">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-black">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              {t.reportsSection.noReports}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {t.reportsSection.noReportsDesc}
            </p>
            <button
              onClick={onScanReport}
              className="mt-4 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
            >
              {t.reportsSection.scanFirstReport}
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredReports.map((report) => {
              const hasCritical = report.extracted_values.some((v) => v.flag === 'critical');
              const hasAbnormal = report.extracted_values.some(
                (v) => v.flag === 'low' || v.flag === 'high'
              );
              const isPrescription = report.file_name?.toLowerCase().includes('prescription');
              const isSpeakingThis = activeSpeechReportId === report.id;

              return (
                <div
                  key={report.id}
                  onClick={() => onOpenReport(report)}
                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-extrabold text-lg shrink-0">
                      {isPrescription ? '📋' : '📄'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {report.test_title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {isPrescription ? t.reportsSection.prescriptionTag : t.reportsSection.labReportTag}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {report.patient_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {report.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Status Badge, Listen Button, WhatsApp Share Button */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
                    {hasCritical ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                        {t.reportsSection.criticalBadge}
                      </span>
                    ) : hasAbnormal ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        {t.reportsSection.attentionBadge}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        {t.reportsSection.safeBadge}
                      </span>
                    )}

                    {/* Big Spoken Audio Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSpeakReport(report, e)}
                      title="Listen to this report"
                      className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                        isSpeakingThis
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {isSpeakingThis ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeakingThis ? t.reportsSection.stop : t.reportsSection.listen}</span>
                    </button>

                    {/* WhatsApp 1-Tap Share to Family */}
                    <button
                      type="button"
                      onClick={(e) => handleShareToWhatsApp(report, e)}
                      title={t.reportsSection.shareWhatsApp}
                      className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-all active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
