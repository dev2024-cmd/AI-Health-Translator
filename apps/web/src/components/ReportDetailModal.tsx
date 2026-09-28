import React, { useState } from 'react';
import { X, FileText, Stethoscope, Share2, Printer, Check, UserCheck, ShieldAlert, Image as ImageIcon, Eye } from 'lucide-react';
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

  const isPrescription =
    report.document_type === 'prescription' ||
    report.test_title.toLowerCase().includes('prescription') ||
    report.test_title.toLowerCase().includes('rx');

  const [leftViewMode, setLeftViewMode] = useState<'image' | 'transcription'>(
    report.image_url ? 'image' : 'transcription'
  );

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
          {/* Left Column: Original Scanned Report Document Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isPrescription ? 'Original Prescription Document' : 'Original Scanned Document'}
              </span>
              <span className="text-xs text-slate-400 font-mono truncate max-w-[160px]">{report.file_name}</span>
            </div>

            {report.image_url && (
              <div className="flex items-center gap-1.5 mb-2.5 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setLeftViewMode('image')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    leftViewMode === 'image'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Scanned Document
                </button>
                <button
                  type="button"
                  onClick={() => setLeftViewMode('transcription')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    leftViewMode === 'transcription'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Clinical Data
                </button>
              </div>
            )}

            {leftViewMode === 'image' && report.image_url ? (
              <div className="border-2 border-slate-200 rounded-2xl p-2 bg-slate-900/5 shadow-inner flex-1 flex flex-col justify-center items-center overflow-hidden min-h-[360px]">
                <img
                  src={report.image_url}
                  alt={report.file_name || 'Scanned Medical Document'}
                  className="w-full h-auto max-h-[460px] object-contain rounded-xl shadow-sm bg-white"
                />
              </div>
            ) : isPrescription ? (
              <div className="bg-sky-50/40 border-2 border-sky-200 rounded-2xl p-5 font-mono text-xs text-slate-700 shadow-inner flex-1 flex flex-col justify-between overflow-x-auto min-h-[360px]">
                <div>
                  <div className="border-b border-sky-300 pb-2 mb-3">
                    <div className="font-bold text-sky-950 text-sm tracking-tight font-sans">
                      {report.doctor_name || 'Dr. Anna Ludwig, MD'}
                    </div>
                    <div className="text-[10px] text-sky-800">
                      {report.doctor_clinic || 'St Charles, Oak Street, CA'} {report.doctor_license ? `• Lic: ${report.doctor_license}` : ''}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-700">
                      <div>Patient: <strong>{report.patient_name}</strong></div>
                      <div>DOB / Age: {report.patient_age}Y / {report.patient_gender}</div>
                      <div>Date: {report.date}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex justify-between font-sans">
                      <span>PRESCRIBED MEDICATION</span>
                      <span>INSTRUCTIONS</span>
                    </div>
                    {report.extracted_values.map((val) => (
                      <div key={val.id} className="flex justify-between items-start py-1 border-b border-dashed border-sky-200 gap-2">
                        <span className="text-slate-800 font-semibold">{val.test_name}</span>
                        <span className="font-medium text-right text-slate-600">
                          {val.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sky-300 text-[10px] text-sky-900 flex justify-between items-center font-sans">
                  <span>Licensed Medical Practitioner</span>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-900 rounded font-bold">
                    Doctor Rx Verified
                  </span>
                </div>
              </div>
            ) : (
              /* Simulated Clinical Paper Report */
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
            )}
          </div>

          {/* Right Column: Audio, Plain Language & Test Badges (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Audio Voice Player */}
            <AudioPlayer
              textToSpeak={currentExplanation}
              languageCode={selectedLanguage}
              autoPlay={false}
            />

            {/* Doctor Prescription Prominent Safety Banner */}
            {(isPrescription ||
              currentExplanation.includes('Take this medicine only as prescribed') ||
              currentExplanation.includes('ముఖ్య గమనిక') ||
              currentExplanation.includes('दवा का सेवन')) && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-500 text-amber-950 flex items-start gap-3 shadow-md animate-fade-in">
                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Clinical Safety & Doctor Prescription Guidance
                  </h4>
                  <p className="text-xs sm:text-sm font-extrabold mt-1 leading-relaxed text-amber-950">
                    Take this medicine ONLY as prescribed by your treating doctor. Plain-language schedules are for informational support — never alter, reduce, or stop your medication dose on your own.
                  </p>
                </div>
              </div>
            )}

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
              <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line">
                {currentExplanation}
              </div>
            </div>

            {/* Extracted Values Table with accessible badges */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {isPrescription ? 'Prescribed Medication Protocols & Safety Flags' : 'Structured Test Findings'}
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
                        {isPrescription
                          ? `Protocol: ${v.unit}`
                          : `Reference Range: ${v.ref_low ?? '—'} - ${v.ref_high ?? '—'} ${v.unit}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isPrescription && (
                        <div className="text-right">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900">
                            {v.value}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">{v.unit}</span>
                        </div>
                      )}
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
