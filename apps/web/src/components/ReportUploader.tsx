import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { WebReport } from '../types/api.js';
import { hydrateReportTranslations } from '../utils/reportLocalizer.js';
import { runBrowserOcr, parseMedicalOcrText } from '../utils/medicalOcrParser.js';

interface ReportUploaderProps {
  onUploadSuccess: (newReport: WebReport) => void;
  selectedPatientId: string;
  patientName: string;
  onOpenSubscription?: () => void;
  currentPlan?: 'free' | 'family' | 'pro';
  reportsCount?: number;
  maxFreeReports?: number;
}

export const ReportUploader: React.FC<ReportUploaderProps> = ({
  onUploadSuccess,
  selectedPatientId,
  patientName,
  onOpenSubscription,
  currentPlan = 'free',
  reportsCount = 0,
  maxFreeReports = 5,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isQuotaExhausted = currentPlan === 'free' && reportsCount >= maxFreeReports;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isQuotaExhausted && onOpenSubscription) {
      onOpenSubscription();
      return;
    }
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isQuotaExhausted && onOpenSubscription) {
      onOpenSubscription();
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isQuotaExhausted && onOpenSubscription) {
      onOpenSubscription();
      return;
    }
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (isQuotaExhausted && onOpenSubscription) {
      onOpenSubscription();
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid JPEG, PNG, or PDF medical report document.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds the 25MB maximum limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleStartUpload = () => {
    if (isQuotaExhausted) {
      if (onOpenSubscription) onOpenSubscription();
      return;
    }
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressStage('Uploading and scanning report with AI Vision OCR...');
    setUploadProgress(25);

    const reader = new FileReader();
    reader.onload = async (fileEvt) => {
      const fileDataUrl = fileEvt.target?.result as string;

      let ocrText = '';
      try {
        ocrText = await runBrowserOcr(selectedFile, (p, stage) => {
          setUploadProgress(Math.min(p, 75));
          setProgressStage(stage);
        });
      } catch (err) {
        console.warn('OCR error in uploader:', err);
      }

      setProgressStage('Extracting clinical test findings & medication instructions...');
      setUploadProgress(85);

      // Parse the OCR text using the medical parser
      const parsed = parseMedicalOcrText(
        ocrText,
        selectedFile.name,
        patientName
      );

      // Sync with backend API if authenticated
      let backendReportId: string | null = null;
      try {
        const token = localStorage.getItem('swasthya_access_token');
        if (token) {
          const formData = new FormData();
          formData.append('files', selectedFile);
          formData.append('patient_id', selectedPatientId || 'pat-self');
          formData.append('source', 'web');
          formData.append('original_language', 'en');

          const uploadRes = await fetch('http://localhost:8000/v1/reports', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            backendReportId = data.report_id;
          }
        }
      } catch (err) {
        console.warn('Backend sync error:', err);
      }

      setUploadProgress(100);
      setProgressStage('Finalizing medical report translation and audio...');

      const generatedReport: WebReport = {
        id: backendReportId || 'rep-' + Date.now(),
        patient_name: parsed.patientName || patientName || 'Patient',
        patient_id: selectedPatientId,
        patient_age: parsed.patientAge || 50,
        patient_gender: parsed.patientGender || 'Unknown',
        test_title: parsed.title,
        date: parsed.date,
        source: 'web',
        status: 'ready',
        original_language: 'en',
        audio_available: true,
        document_type: parsed.documentType,
        doctor_name: parsed.doctorName,
        doctor_clinic: parsed.clinicOrHospital,
        doctor_license: parsed.doctorLicense,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        image_url: fileDataUrl,
        extracted_values: parsed.extractedValues,
        plain_explanation: parsed.plainExplanation,
        doctor_advice: (parsed as any).doctorAdvice,
        follow_up_date: (parsed as any).followUpDate,
      };

      setTimeout(() => {
        setIsProcessing(false);
        setSelectedFile(null);
        onUploadSuccess(hydrateReportTranslations(generatedReport));
      }, 400);
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Upload New Medical Report</h3>
          <p className="text-xs text-slate-500">
            For Patient: <strong className="text-brand-700">{patientName}</strong> (Encrypted at rest under DPDP Act 2023)
          </p>
        </div>
      </div>

      {/* Free Quota Exhausted Alert Banner */}
      {isQuotaExhausted && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-100">
                Free Quota Limit Reached ({reportsCount}/{maxFreeReports} Reports Used)
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                Your Ayush Free Tier allows up to {maxFreeReports} reports. Upgrade to unlock unlimited Neural Vision OCR, 2G IVR spoken calls, and SMS dispatches.
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                <span>Direct Unit Costs: SMS ₹0.25</span>
                <span>•</span>
                <span>IVR ₹0.75/min</span>
                <span>•</span>
                <span>OCR ₹0.50/page</span>
                <span>•</span>
                <span>Clinical LLM ₹0.60/report</span>
              </div>
            </div>
          </div>
          {onOpenSubscription && (
            <button
              type="button"
              onClick={onOpenSubscription}
              className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs whitespace-nowrap shadow-xs transition-colors shrink-0"
            >
              Upgrade Subscription
            </button>
          )}
        </div>
      )}

      {/* Drag & Drop Box */}
      {!isProcessing && (
        <div
          id="dropzone-container"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
            className="hidden"
            id="file-upload-input"
          />

          <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-700 mx-auto flex items-center justify-center mb-3 border border-sky-100">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h4 className="text-base font-bold text-slate-800">
            {selectedFile ? selectedFile.name : 'Drag & drop lab report file here, or browse'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Photograph or scan of Complete Blood Count (CBC), Lipid Profile, Liver Function, Blood Sugar, or Thyroid reports.
          </p>

          {selectedFile && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              <CheckCircle className="w-4 h-4 text-emerald-600 ml-1" />
            </div>
          )}
        </div>
      )}

      {/* Processing State View */}
      {isProcessing && (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
          <h4 className="text-base font-bold text-slate-800">{progressStage}</h4>
          <p className="text-xs text-slate-500 mt-1">Multi-stage pipeline running in background worker...</p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 mt-5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Submit Action */}
      {!isProcessing && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Automated rotation, OCR, deterministic range check, and Indian voice synthesis.
          </p>

          <button
            id="start-analyze-button"
            disabled={!selectedFile}
            onClick={handleStartUpload}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              selectedFile
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Translate & Explain
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
