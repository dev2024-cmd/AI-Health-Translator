import React, { useState } from 'react';
import { X, FileText, Stethoscope, Share2, Printer, Check, UserCheck, ShieldAlert } from 'lucide-react';
import { WebReport } from '../types/api.js';
import { AudioPlayer } from './AudioPlayer.js';
import { ValueBadge } from './ValueBadge.js';
import { DisclaimerBanner } from './DisclaimerBanner.js';

interface ReportDetailModalProps {
  report: WebReport | null;
  selectedLanguage: string;
  onClose: () => void;
  onEscalate: (report: WebReport) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  selectedLanguage,
  onClose,
  onEscalate,
}) => {
  const [escalated, setEscalated] = useState<boolean>(false);

  if (!report) return null;

  const currentExplanation =
    report.plain_explanation[selectedLanguage] ||
    report.plain_explanation['en'] ||
    'Explanation being processed...';

  const handleEscalateClick = () => {
    setEscalated(true);
    onEscalate(report);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{report.test_title}</h2>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{report.patient_name}</strong> • Date: {report.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
              aria-label="Close report viewer modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split-screen desktop */}
        <div className="overflow-y-auto flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Original Scanned Report Document Preview (4 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Original Scanned Document
              </span>
              <span className="text-xs text-slate-400 font-mono">{report.file_name}</span>
            </div>

            {/* Simulated Clinical Paper Report */}
            <div className="bg-amber-50/40 border-2 border-slate-200 rounded-2xl p-5 font-mono text-xs text-slate-700 shadow-inner flex-1 flex flex-col justify-between overflow-x-auto min-h-[360px]">
              <div>
                <div className="border-b border-slate-300 pb-2 mb-3">
                  <div className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                    APEX DIAGNOSTIC LABORATORIES
                  </div>
                  <div className="text-[10px] text-slate-500">ISO 15189 Certified Clinical Lab</div>
                  <div className="mt-2 text-[11px]">
                    <div>Name: {report.patient_name}</div>
                    <div>Age/Sex: {report.patient_age}Y / {report.patient_gender}</div>
                    <div>Sample ID: {report.id}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex justify-between">
                    <span>TEST PARAMETER</span>
                    <span>RESULT</span>
                  </div>
                  {report.extracted_values.map((val) => (
                    <div key={val.id} className="flex justify-between items-center py-0.5 border-b border-dashed border-slate-200">
                      <span className="text-slate-800 font-medium">{val.test_name}</span>
                      <span className="font-bold">
                        {val.value} {val.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center">
                <span>Verified by Chief Pathologist</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans font-bold">
                  OCR Verified
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Audio, Plain Language & Test Badges (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Audio Voice Player */}
            <AudioPlayer
              textToSpeak={currentExplanation}
              languageCode={selectedLanguage}
              autoPlay={false}
            />

            {/* Plain Language Explanation Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  Plain-Language Summary (Grade 5 Reading Level)
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Language: {selectedLanguage.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal">
                {currentExplanation}
              </p>
            </div>

            {/* Extracted Values Table with accessible badges */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Structured Test Findings
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {report.extracted_values.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{v.test_name}</div>
                      <div className="text-xs text-slate-500">
                        Reference Range: {v.ref_low ?? '—'} - {v.ref_high ?? '—'} {v.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          {v.value}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">{v.unit}</span>
                      </div>
                      <ValueBadge flag={v.flag} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Persistent Translated Medical Disclaimer */}
            <DisclaimerBanner languageCode={selectedLanguage} />

            {/* Triage Escalation Button */}
            <div className="pt-2">
              <button
                id="modal-escalate-button"
                onClick={handleEscalateClick}
                disabled={escalated}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                  escalated
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-98'
                }`}
              >
                {escalated ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-700" />
                    Escalation Ticket Sent to Primary Health Worker Queue
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-5 h-5" />
                    Talk to a Primary Health Worker (Consultation)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
