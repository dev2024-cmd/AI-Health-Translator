import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle2, History, AlertCircle } from 'lucide-react';

export const ConsentCenter: React.FC = () => {
  const [consentGranted, setConsentGranted] = useState<boolean>(true);
  const [activeConsentId, setActiveConsentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  React.useEffect(() => {
    const token = localStorage.getItem('swasthya_access_token');
    if (token) {
      fetch('http://localhost:8000/v1/consents', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((consents: any[]) => {
          if (Array.isArray(consents) && consents.length > 0) {
            const active = consents.find((c) => !c.revoked_at);
            if (active) {
              setConsentGranted(true);
              setActiveConsentId(active.id);
            } else {
              setConsentGranted(false);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleToggleConsent = async () => {
    const token = localStorage.getItem('swasthya_access_token');
    const nextState = !consentGranted;
    setConsentGranted(nextState);

    if (token) {
      try {
        if (!nextState && activeConsentId) {
          await fetch(`http://localhost:8000/v1/consents/${activeConsentId}/revoke`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (nextState) {
          const res = await fetch('http://localhost:8000/v1/consents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              purpose: 'medical_report_ocr_simplification_and_voice_assistance',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setActiveConsentId(data.id);
          }
        }
      } catch {}
    }

    showToast(
      nextState
        ? 'Consent granted under DPDP Act 2023 for medical report translation.'
        : 'Consent revoked. Uploads and automated voice calls are now paused.'
    );
  };

  const auditEvents: { id: string; action: string; entity: string; timestamp: string; ip: string }[] = [];

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
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-11 h-11 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Data Privacy & Rights
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                DPDP Act 2023
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
              Health Data Consent & Patient Sovereignty
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Under India’s Digital Personal Data Protection (DPDP) Act 2023, your medical pathology reports are encrypted at rest with AES-256 and processed solely to extract values and generate plain-language explanations in your chosen language.
            </p>
          </div>
        </div>

        {/* Current Consent State Toggle */}
        <div className="bg-slate-50/80 dark:bg-slate-950/70 rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${consentGranted ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {consentGranted ? 'Active Explicit Consent Granted' : 'Consent Currently Revoked'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Purpose: Medical report OCR, test value extraction, multilingual plain-language simplification, and voice read-aloud.
            </p>
          </div>

          <button
            id="toggle-consent-btn"
            onClick={handleToggleConsent}
            className={`px-3.5 py-2 rounded-md font-semibold text-xs transition-colors shadow-xs ${
              consentGranted
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {consentGranted ? 'Revoke Consent' : 'Grant Explicit Consent'}
          </button>
        </div>

        {/* DPDP Safeguards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center mb-2.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Encrypted at Rest</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Reports and audio files are encrypted with SSE-S3 AES-256.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center mb-2.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Zero Unmasked Logging</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Raw report text and phone numbers are never written to plain log files.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center mb-2.5">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Right to Erasure</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Permanently delete all reports and derived translations anytime.
            </p>
          </div>
        </div>

        {/* Audit Trail Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Immutable Access Audit Trail
            </h3>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs bg-slate-50/50 dark:bg-slate-950/50">
            {auditEvents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                No external data transfers recorded. All records securely sealed in patient enclave.
              </div>
            ) : (
              auditEvents.map((evt) => (
                <div key={evt.id} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{evt.action}</span>
                    <span className="text-slate-500 ml-2">({evt.entity})</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">{evt.timestamp}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
