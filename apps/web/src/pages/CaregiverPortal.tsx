import React, { useState } from 'react';
import { Users, Phone, Smartphone, FileText, ChevronRight, AlertCircle, CheckCircle2, Volume2, Plus } from 'lucide-react';
import { WebReport } from '../types/api.js';
import { ReportUploader } from '../components/ReportUploader.js';
import { ValueBadge } from '../components/ValueBadge.js';
import { PhoneSimulatorModal } from '../components/PhoneSimulatorModal.js';

interface CaregiverPortalProps {
  reports: WebReport[];
  selectedLanguage: string;
  onOpenReport: (report: WebReport) => void;
  onUploadSuccess: (newReport: WebReport) => void;
}

export const CaregiverPortal: React.FC<CaregiverPortalProps> = ({
  reports,
  selectedLanguage,
  onOpenReport,
  onUploadSuccess,
}) => {
  const [selectedPatientIndex, setSelectedPatientIndex] = useState<number>(0);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const parents = [
    {
      id: 'pat-1',
      name: 'Sita Ramulu (Father)',
      age: 64,
      lang: 'Telugu (తెలుగు)',
      phone: '+91 96666 66666',
      phoneType: 'Feature Phone (Button Phone)',
      ivrEnabled: true,
    },
    {
      id: 'pat-2',
      name: 'Ramesh Patel (Grandfather)',
      age: 68,
      lang: 'Gujarati (ગુજરાતી)',
      phone: '+91 98765 00000',
      phoneType: 'Smartphone',
      ivrEnabled: false,
    },
  ];

  const currentParent = parents[selectedPatientIndex];

  // Filter reports for selected parent
  const patientReports = reports.filter((r) => r.patient_name === currentParent.name);

  // Compute stats
  const totalReports = patientReports.length;
  const abnormalCount = patientReports.reduce((acc, r) => {
    return acc + r.extracted_values.filter((v) => v.flag !== 'normal').length;
  }, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner: Parent / Beneficiary Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Caregiver Mode
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Managing Health Reports for Family
              </h1>
            </div>
          </div>

          {/* Switch Parent Buttons */}
          <div className="flex items-center gap-2">
            {parents.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedPatientIndex === idx
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Parent Info Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs text-slate-500 block mb-1">Selected Patient</span>
            <div className="font-extrabold text-slate-900 text-base">{currentParent.name}</div>
            <span className="text-xs text-brand-700 font-medium">{currentParent.age} Years • {currentParent.lang}</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs text-slate-500 block mb-1">Phone & Device Type</span>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              {currentParent.phone}
            </div>
            <span className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              {currentParent.phoneType}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
            <span className="text-xs text-slate-500 block">IVR Voice Delivery Channel</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Exotel / Twilio Active
              </span>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="mt-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" /> Launch 2G Phone Simulator
            </button>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <ReportUploader
        onUploadSuccess={onUploadSuccess}
        selectedPatientId={currentParent.id}
        patientName={currentParent.name}
      />

      {/* Reports History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Report History for {currentParent.name.split(' ')[0]}
            </h3>
            <p className="text-xs text-slate-500">
              {totalReports} reports analyzed • {abnormalCount} abnormal values flagged
            </p>
          </div>
        </div>

        {patientReports.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No reports uploaded for this patient yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onOpenReport(report)}
                className="group border border-slate-200 hover:border-brand-500 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br from-white to-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {report.date}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                        {report.test_title}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                      Ready
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {report.plain_explanation[selectedLanguage] || report.plain_explanation['en']}
                  </p>

                  {/* Badges preview */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {report.extracted_values.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700"
                      >
                        <span>{v.test_name}:</span>
                        <span className="font-bold">{v.value}</span>
                        <ValueBadge flag={v.flag} showIconOnly={true} />
                      </div>
                    ))}
                    {report.extracted_values.length > 3 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{report.extracted_values.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-600" /> Listen & View Full Analysis
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Retro Feature Phone IVR Simulator Modal */}
      <PhoneSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        reportId={patientReports[0]?.id || 'mock-rep-1'}
        patientName={currentParent.name.split(' ')[0]}
        patientPhone={currentParent.phone}
        language={selectedLanguage}
      />
    </div>
  );
};
