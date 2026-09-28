import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle2, History, AlertCircle } from 'lucide-react';

export const ConsentCenter: React.FC = () => {
  const [consentGranted, setConsentGranted] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleConsent = () => {
    const nextState = !consentGranted;
    setConsentGranted(nextState);
    showToast(
      nextState
        ? 'Consent granted under DPDP Act 2023 for medical report translation.'
        : 'Consent revoked. Uploads and automated voice calls are now paused.'
    );
  };

  const auditEvents = [
    { id: '1', action: 'REPORT_UPLOADED', entity: 'CBC Report (Sita Ramulu)', timestamp: '2026-09-28 09:30 AM', ip: '127.0.0.1' },
    { id: '2', action: 'VOICE_EXPLANATION_PLAYED', entity: 'Telugu Audio Stream', timestamp: '2026-09-28 09:32 AM', ip: '127.0.0.1' },
    { id: '3', action: 'ESCALATION_VIEWED', entity: 'Health Worker Review', timestamp: '2026-09-27 04:31 PM', ip: '192.168.1.10' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Consent Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Data Privacy & Rights
              </span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                DPDP Act 2023
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Health Data Consent & Patient Sovereignty
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Under India’s Digital Personal Data Protection (DPDP) Act 2023, your medical pathology reports are encrypted at rest with AES-256 and processed solely to extract values and generate plain-language explanations in your chosen language.
            </p>
          </div>
        </div>

        {/* Current Consent State Toggle */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${consentGranted ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {consentGranted ? 'Active Explicit Consent Granted' : 'Consent Currently Revoked'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Purpose: Medical report OCR, test value extraction, multilingual plain-language simplification, and voice read-aloud.
            </p>
          </div>

          <button
            id="toggle-consent-btn"
            onClick={handleToggleConsent}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
              consentGranted
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {consentGranted ? 'Revoke Consent' : 'Grant Explicit Consent'}
          </button>
        </div>

        {/* DPDP Safeguards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Lock className="w-5 h-5 text-emerald-600 mb-2" />
            <div className="font-bold text-sm text-slate-900">Encrypted at Rest</div>
            <p className="text-xs text-slate-500 mt-1">
              Reports and audio files are encrypted with SSE-S3 AES-256.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <AlertCircle className="w-5 h-5 text-blue-600 mb-2" />
            <div className="font-bold text-sm text-slate-900">Zero Unmasked Logging</div>
            <p className="text-xs text-slate-500 mt-1">
              Raw report text and phone numbers are never written to plain log files.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Trash2 className="w-5 h-5 text-rose-600 mb-2" />
            <div className="font-bold text-sm text-slate-900">Right to Erasure</div>
            <p className="text-xs text-slate-500 mt-1">
              Permanently delete all reports and derived translations anytime.
            </p>
          </div>
        </div>

        {/* Audit Trail Section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Immutable Access Audit Trail
            </h3>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            {auditEvents.map((evt) => (
              <div key={evt.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{evt.action}</span>
                  <span className="text-slate-500 ml-2">({evt.entity})</span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">{evt.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
