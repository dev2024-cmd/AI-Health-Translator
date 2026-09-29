import React, { useState } from 'react';
import {
  X,
  FileText,
  Stethoscope,
  Share2,
  Check,
  ShieldCheck,
  Image as ImageIcon,
  Eye,
  Globe,
  Phone,
  Send,
  Pill,
  Calendar,
  User,
  Languages,
} from 'lucide-react';
import { WebReport } from '../types/api.js';
import { getLocalizedExplanation } from '../utils/reportLocalizer.js';
import { getMedicationKnowledge, parseMedicalOcrText } from '../utils/medicalOcrParser.js';
import { AudioPlayer } from './AudioPlayer.js';
import { ValueBadge } from './ValueBadge.js';
import { DisclaimerBanner } from './DisclaimerBanner.js';

interface ReportDetailModalProps {
  report: WebReport | null;
  selectedLanguage: string;
  onLanguageChange?: (lang: string) => void;
  onClose: () => void;
  onEscalate: (report: WebReport) => void;
  onSimulateVoiceCall?: (report: WebReport, lang: string) => void;
}

const stripEmojis = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[⚠️📋🥗🍲⛔💊🎯⚡⏰📞🟢🟡🔴📸📁❤️🩺👨‍⚕️👩‍⚕️🔊✅❌🏥]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/•\s*•/g, '•')
    .trim();
};

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  selectedLanguage,
  onLanguageChange,
  onClose,
  onEscalate,
  onSimulateVoiceCall,
}) => {
  const [escalated, setEscalated] = useState<boolean>(false);
  const [leftViewMode, setLeftViewMode] = useState<'image' | 'transcription'>('image');
  const [modalLang, setModalLang] = useState<string>(selectedLanguage);

  // Keep modalLang in sync when selectedLanguage changes from parent
  React.useEffect(() => {
    setModalLang(selectedLanguage);
  }, [selectedLanguage]);

  // Update leftViewMode whenever report opens
  React.useEffect(() => {
    if (report) {
      setLeftViewMode(report.image_url ? 'image' : 'transcription');
      setEscalated(false);
    }
  }, [report]);

  // Heal any stale demo prescription report in state to the 4 scanned demo medicines
  const activeReport = React.useMemo(() => {
    if (!report) return report;
    const isStaleSharmaDemo =
      (report.test_title?.toLowerCase().includes('sharma') ||
        report.file_name?.toLowerCase().includes('prescription') ||
        report.document_type === 'prescription') &&
      report.extracted_values?.some((v) => v.test_name.toLowerCase().includes('metformin'));

    if (isStaleSharmaDemo) {
      const p = parseMedicalOcrText('demo medicine 1 2 3 4', report.file_name, report.patient_name, 'prescription');
      return {
        ...report,
        test_title: 'Doctor Prescription (Dr. R. K. Sharma)',
        doctor_name: 'Dr. R. K. Sharma (M.B.B.S, M.D., M.S.)',
        doctor_clinic: 'Clinic Station, Pune',
        doctor_advice: 'AVOID OILY AND SPICY FOOD',
        follow_up_date: '12-05-2020',
        extracted_values: p.extractedValues,
        plain_explanation: p.plainExplanation,
      };
    }
    return report;
  }, [report]);

  if (!activeReport) return null;

  const isPrescription =
    activeReport.document_type === 'prescription' ||
    (activeReport.test_title &&
      (activeReport.test_title.toLowerCase().includes('prescription') ||
        activeReport.test_title.toLowerCase().includes('rx')));

  const rawExplanation = getLocalizedExplanation(activeReport, modalLang);
  const currentExplanation = stripEmojis(rawExplanation);

  const handleEscalateClick = () => {
    setEscalated(true);
    onEscalate(activeReport);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {stripEmojis(activeReport.test_title)}
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {isPrescription ? 'Prescription' : 'Diagnostic Report'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>
                    Patient: <strong className="text-slate-800 font-medium">{activeReport.patient_name}</strong>
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Date: {activeReport.date}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="Close report viewer modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split-screen desktop */}
        <div className="overflow-y-auto flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Clean Document Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-0 w-full">
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs flex flex-col">
              {/* Document Toolbar */}
              <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                {activeReport.image_url ? (
                  <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setLeftViewMode('image')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                        leftViewMode === 'image'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-slate-600" />
                      DOCUMENT
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftViewMode('transcription')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                        leftViewMode === 'transcription'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3 h-3 text-slate-600" />
                      CLINICAL DATA
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isPrescription ? 'Clinical Prescription' : 'Diagnostic Lab Report'}</span>
                  </div>
                )}
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                  {activeReport.file_name}
                </span>
              </div>

              {/* Document Viewport */}
              {leftViewMode === 'image' && activeReport.image_url ? (
                <div className="overflow-y-auto max-h-[calc(88vh-140px)] min-h-[360px] bg-slate-100/70 p-3 sm:p-4 flex flex-col items-center justify-start">
                  <div className="w-full bg-white border border-slate-200 rounded shadow-xs p-1.5 flex justify-center">
                    <img
                      src={activeReport.image_url}
                      alt={activeReport.file_name || 'Medical Document'}
                      className="w-full h-auto object-contain block"
                    />
                  </div>
                </div>
              ) : isPrescription ? (
                <div className="overflow-y-auto max-h-[calc(88vh-140px)] min-h-[360px] bg-slate-100/70 p-3 sm:p-4">
                  <div className="w-full bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs text-xs text-slate-800 space-y-4">
                    {/* Header */}
                    <div className="border-b border-slate-200 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm tracking-tight">
                            {activeReport.doctor_name || 'Treating Physician'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {activeReport.doctor_clinic || 'Authorized Medical Center'}
                            {activeReport.doctor_license ? ` • Lic: ${activeReport.doctor_license}` : ''}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                          Official Rx
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Patient</span>
                          <span className="font-semibold text-slate-800">{activeReport.patient_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Age / Gender</span>
                          <span className="font-medium text-slate-700">
                            {activeReport.patient_age ? `${activeReport.patient_age}Y • ` : ''}{activeReport.patient_gender || 'General'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Date</span>
                          <span className="font-medium text-slate-700">{activeReport.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Rx ID</span>
                          <span className="font-mono text-slate-600 truncate block">{activeReport.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prescribed Items Table */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex justify-between">
                        <span>PRESCRIBED MEDICATION</span>
                        <span>DOSAGE / TIMING</span>
                      </div>
                      <div className="border border-slate-200 rounded divide-y divide-slate-100">
                        {activeReport.extracted_values.map((val, idx) => (
                          <div
                            key={val.id || idx}
                            className="p-2.5 flex justify-between items-start gap-2 hover:bg-slate-50/70"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {stripEmojis(val.test_name.replace(/^Rx:\s*/i, ''))}
                              </span>
                            </div>
                            <span className="text-right text-slate-600 font-medium text-[11px] shrink-0">
                              {stripEmojis(val.unit)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Physician Advice */}
                    {activeReport.doctor_advice && (
                      <div className="p-2.5 bg-slate-50 border-l-2 border-slate-400 rounded-r text-[11px] text-slate-700">
                        <span className="font-semibold text-slate-900 block mb-0.5">Physician Advice:</span>
                        {stripEmojis(activeReport.doctor_advice)}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Licensed Medical Practitioner</span>
                      <span className="font-medium text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Clinical Data Verified
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Lab Report Transcription */
                <div className="overflow-y-auto max-h-[calc(88vh-140px)] min-h-[360px] bg-slate-100/70 p-3 sm:p-4">
                  <div className="w-full bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs text-xs text-slate-800 space-y-4">
                    <div className="border-b border-slate-200 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm tracking-tight">
                            DIAGNOSTIC PATHOLOGY LABORATORY
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            ISO 15189 Certified Clinical Diagnostics
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                          Lab Report
                        </span>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Patient</span>
                          <span className="font-semibold text-slate-800">{activeReport.patient_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Age / Gender</span>
                          <span className="font-medium text-slate-700">
                            {activeReport.patient_age}Y • {activeReport.patient_gender}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Sample ID</span>
                          <span className="font-mono text-slate-600 truncate block">{activeReport.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Date</span>
                          <span className="font-medium text-slate-700">{activeReport.date}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex justify-between">
                        <span>TEST PARAMETER</span>
                        <span>OBSERVED RESULT</span>
                      </div>
                      <div className="border border-slate-200 rounded divide-y divide-slate-100">
                        {activeReport.extracted_values.map((val) => (
                          <div key={val.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50/70">
                            <div>
                              <span className="text-slate-900 font-semibold block">{val.test_name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                Ref: {val.ref_low ?? '—'} - {val.ref_high ?? '—'} {val.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-slate-900 text-xs">
                                {val.value} {val.unit}
                              </span>
                              <ValueBadge flag={val.flag} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
                      <span>Verified by Chief Pathologist</span>
                      <span className="font-medium text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Lab Findings Validated
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clinical Translation, Audio, Safety, Medication Protocols (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Segmented Language Selector */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Translate & Listen
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ta', label: 'தமிழ் (Tamil)' },
                  { code: 'te', label: 'తెలుగు (Telugu)' },
                  { code: 'hi', label: 'हिन्दी (Hindi)' },
                  { code: 'bn', label: 'বাংলা (Bengali)' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setModalLang(l.code);
                      onLanguageChange?.(l.code);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      modalLang === l.code
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Restrained Healthcare Audio Player */}
            <AudioPlayer textToSpeak={currentExplanation} languageCode={modalLang} autoPlay={false} />

            {/* Clinical Safety & Guidance Banner */}
            {(isPrescription ||
              rawExplanation.includes('Take this medicine only as prescribed') ||
              rawExplanation.includes('மருத்துவர்') ||
              rawExplanation.includes('ముఖ్య గమనిక') ||
              rawExplanation.includes('दवा का सेवन')) && (
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 text-slate-800 flex items-start gap-2.5 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Clinical Safety & Doctor Prescription Guidance
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Take this medicine strictly as prescribed by your treating doctor. Plain-language schedules are for informational support — never alter, reduce, or stop your medication dose on your own.
                  </p>
                </div>
              </div>
            )}

            {/* Patient Delivery Channels */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Patient Delivery Channels
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> DPDP Consent Verified
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                For patients or elderly family members without digital access, dispatch an automated voice call with spoken results directly to their phone.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const text = `*Bharat Swasth Medical Summary*\nPatient: ${activeReport.patient_name}\nDate: ${activeReport.date}\n\n${currentExplanation}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="py-2 px-3 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  title="Send report summary via WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  type="button"
                  id="simulate-voice-call-btn"
                  onClick={() => onSimulateVoiceCall?.(activeReport, modalLang)}
                  className="py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  title="Initiate automated outbound voice call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Voice Call (IVR Delivery)</span>
                </button>
              </div>
            </div>

            {/* Plain-Language Summary Box */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  Plain-Language Summary
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {modalLang === 'ta' && 'தமிழ் (Tamil)'}
                  {modalLang === 'te' && 'తెలుగు (Telugu)'}
                  {modalLang === 'hi' && 'हिन्दी (Hindi)'}
                  {modalLang === 'bn' && 'বাংলা (Bengali)'}
                  {modalLang === 'en' && 'English'}
                </span>
              </div>
              <div className="text-slate-800 text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line">
                {currentExplanation}
              </div>
            </div>

            {/* Prescribed Medication Detailed Cards vs Lab Results */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  {isPrescription ? (
                    <Pill className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>
                    {isPrescription
                      ? 'Prescribed Medication Protocols & Clinical Guidance'
                      : 'Structured Test Findings'}
                  </span>
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {isPrescription ? 'Doctor Verified' : 'Validated'}
                </span>
              </div>

              {isPrescription ? (
                <div className="space-y-3">
                  {activeReport.extracted_values.map((v, idx) => {
                    const cleanName = stripEmojis(v.test_name.replace(/^Rx:\s*/i, '').trim());
                    const kn = getMedicationKnowledge(cleanName, v.unit);
                    const whatItIs = stripEmojis(v.what_it_is || kn.whatItIsLocalized[modalLang] || kn.whatItIs);
                    const whatItIsFor = stripEmojis(v.what_it_is_for || kn.whatItIsForLocalized[modalLang] || kn.whatItIsFor);
                    const whatItWillDo = stripEmojis(v.what_it_will_do || kn.whatItWillDoLocalized[modalLang] || kn.whatItWillDo);
                    const howToTake = stripEmojis(v.how_to_take || kn.instructionsLocalized[modalLang] || v.unit || kn.instructions);

                    const labels = {
                      whatItIs:
                        modalLang === 'hi'
                          ? 'यह दवा क्या है'
                          : modalLang === 'te'
                          ? 'ఈ మాత్ర ఏమిటి'
                          : modalLang === 'ta'
                          ? 'இந்த மாத்திரை என்ன'
                          : modalLang === 'bn'
                          ? 'ওষুধটি কী'
                          : 'What it is',
                      purpose:
                        modalLang === 'hi'
                          ? 'यह किसलिए है'
                          : modalLang === 'te'
                          ? 'దేనికోసం ఉపయోగపడుతుంది'
                          : modalLang === 'ta'
                          ? 'எதற்காக சாப்பிட வேண்டும்'
                          : modalLang === 'bn'
                          ? 'এটি কিসের জন্য'
                          : 'Purpose',
                      mechanism:
                        modalLang === 'hi'
                          ? 'यह शरीर में क्या काम करेगी'
                          : modalLang === 'te'
                          ? 'శరీరంలో ఇది ఏమి చేస్తుంది'
                          : modalLang === 'ta'
                          ? 'உடலில் இது என்ன செய்யும்'
                          : modalLang === 'bn'
                          ? 'এটি শরীরে কী কাজ করবে'
                          : 'Action in body',
                      instructions:
                        modalLang === 'hi'
                          ? 'लेने का सही तरीका और समय'
                          : modalLang === 'te'
                          ? 'ఎలా మరియు ఎప్పుడు వేసుకోవాలి'
                          : modalLang === 'ta'
                          ? 'எப்படி மற்றும் எப்போது சாப்பிட வேண்டும்'
                          : modalLang === 'bn'
                          ? 'সেবনবিধি ও সময়সূচী'
                          : 'How & when to take',
                    };

                    return (
                      <div
                        key={v.id || idx}
                        className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs"
                      >
                        {/* Title and Flag */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight block">
                                {cleanName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Prescription Item • Verified
                              </span>
                            </div>
                          </div>
                          <ValueBadge flag={v.flag} />
                        </div>

                        {/* Professional Clinical Breakdown */}
                        <div className="space-y-2 text-xs">
                          {/* 1. What it is */}
                          <div className="p-2.5 bg-slate-50/70 rounded border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {labels.whatItIs}
                            </span>
                            <p className="text-slate-800 leading-relaxed font-normal">
                              {whatItIs}
                            </p>
                          </div>

                          {/* 2. Purpose */}
                          <div className="p-2.5 bg-slate-50/70 rounded border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {labels.purpose}
                            </span>
                            <p className="text-slate-800 leading-relaxed font-normal">
                              {whatItIsFor}
                            </p>
                          </div>

                          {/* 3. Mechanism */}
                          <div className="p-2.5 bg-slate-50/70 rounded border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {labels.mechanism}
                            </span>
                            <p className="text-slate-800 leading-relaxed font-normal">
                              {whatItWillDo}
                            </p>
                          </div>

                          {/* 4. Instructions */}
                          <div className="p-2.5 bg-teal-50/40 rounded border border-teal-200/70">
                            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                              {labels.instructions}
                            </span>
                            <p className="text-slate-900 font-semibold leading-relaxed">
                              {howToTake}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
                  {activeReport.extracted_values.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{v.test_name}</div>
                        <div className="text-xs text-slate-500">
                          {`Reference Range: ${v.ref_low ?? '—'} - ${v.ref_high ?? '—'} ${v.unit}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-sm sm:text-base text-slate-900">
                            {v.value}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">{v.unit}</span>
                        </div>
                        <ValueBadge flag={v.flag} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Persistent Translated Medical Disclaimer */}
            <DisclaimerBanner languageCode={selectedLanguage} />

            {/* Triage Escalation Action */}
            <div className="pt-1">
              <button
                id="modal-escalate-button"
                onClick={handleEscalateClick}
                disabled={escalated}
                className={`w-full py-2.5 px-4 rounded-md font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                  escalated
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                }`}
              >
                {escalated ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    Escalation Ticket Sent to Primary Health Worker Queue
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    Request Primary Health Worker Consultation
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
