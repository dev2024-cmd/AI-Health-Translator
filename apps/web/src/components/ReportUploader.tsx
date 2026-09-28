import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { WebReport } from '../types/api.js';

interface ReportUploaderProps {
  onUploadSuccess: (newReport: WebReport) => void;
  selectedPatientId: string;
  patientName: string;
}

export const ReportUploader: React.FC<ReportUploaderProps> = ({
  onUploadSuccess,
  selectedPatientId,
  patientName,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
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
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressStage('Uploading encrypted report to secure storage...');
    setUploadProgress(20);

    // Simulate pipeline progression
    setTimeout(() => {
      setProgressStage('Running auto-rotation and OCR text extraction...');
      setUploadProgress(50);

      setTimeout(() => {
        setProgressStage('Validating structured test values against reference ranges...');
        setUploadProgress(80);

        setTimeout(() => {
          setProgressStage('Simplifying medical jargon into plain language & generating speech...');
          setUploadProgress(100);

          setTimeout(() => {
            // Generate parsed report
            const isLipid = selectedFile.name.toLowerCase().includes('lipid') || selectedFile.name.toLowerCase().includes('chol');
            const isSugar = selectedFile.name.toLowerCase().includes('sugar') || selectedFile.name.toLowerCase().includes('glu') || selectedFile.name.toLowerCase().includes('hba1c');

            const generatedReport: WebReport = {
              id: 'rep-' + Date.now(),
              patient_name: patientName,
              patient_id: selectedPatientId,
              patient_age: 64,
              patient_gender: 'Male',
              test_title: isLipid
                ? 'Lipid Profile (Cholesterol Panel)'
                : isSugar
                ? 'Diabetic Health Panel (HbA1c & Fasting Glucose)'
                : 'Complete Blood Count (CBC)',
              date: new Date().toISOString().split('T')[0],
              source: 'web',
              status: 'ready',
              original_language: 'en',
              audio_available: true,
              file_name: selectedFile.name,
              file_type: selectedFile.type,
              plain_explanation: {
                en: isLipid
                  ? 'Your total cholesterol and LDL are slightly higher than normal. Your good cholesterol is in acceptable limits. Discuss dietary adjustments with your doctor.'
                  : isSugar
                  ? 'Your blood glucose readings are elevated above standard fasting thresholds. Please share this with your primary care provider for personalized advice.'
                  : 'Your hemoglobin and red blood cells are slightly low, while white blood cells and platelets are normal. You may experience mild fatigue.',
                hi: isLipid
                  ? 'आपकी रिपोर्ट में कुल कोलेस्ट्रॉल सामान्य से अधिक है। अच्छा कोलेस्ट्रॉल संतुलित है। कृपया डॉक्टर से खान-पान के बारे में चर्चा करें।'
                  : isSugar
                  ? 'आपके ब्लड ग्लूकोज के परिणाम सामान्य सीमा से अधिक हैं। डॉक्टर से अवश्य परामर्श लें।'
                  : 'आपके हीमोग्लोबिन और लाल रक्त कोशिकाओं का स्तर थोड़ा कम है। अन्य सभी कोशिकाएं सुरक्षित और सामान्य हैं।',
                te: isLipid
                  ? 'మీ రక్తంలో మొత్తం కొలెస్ట్రాల్ సాధారణ స్థాయి కంటే ఎక్కువగా ఉంది. మంచి ఆహారపు అలవాట్ల కోసం వైద్యుడిని సంప్రదించండి.'
                  : isSugar
                  ? 'మీ రక్తంలో గ్లూకోజ్ స్థాయిలు పెరిగాయి. సరైన సలహా కోసం మీ వైద్యుడిని కలవండి.'
                  : 'మీ రక్తంలో హిమోగ్లోబిన్ కొద్దిగా తక్కువగా ఉంది. మిగిలిన పరీక్షల ఫలితాలు సాధారణంగా ఉన్నాయి.',
                bn: 'আপনার রিপোর্ট অনুযায়ী হিমোগ্লোবিনের মাত্রা কিছুটা কম রয়েছে, তবে অন্যান্য কোষগুলি স্বাভাবিক রয়েছে।',
              },
              extracted_values: isLipid
                ? [
                    { id: 'u1', test_name: 'Total Cholesterol', value: 228.0, unit: 'mg/dL', ref_low: 125.0, ref_high: 200.0, flag: 'high', page: 1 },
                    { id: 'u2', test_name: 'Triglycerides', value: 175.0, unit: 'mg/dL', ref_low: 50.0, ref_high: 150.0, flag: 'high', page: 1 },
                    { id: 'u3', test_name: 'HDL Cholesterol', value: 42.0, unit: 'mg/dL', ref_low: 40.0, ref_high: 60.0, flag: 'normal', page: 1 },
                    { id: 'u4', test_name: 'LDL Cholesterol', value: 151.0, unit: 'mg/dL', ref_low: 0.0, ref_high: 100.0, flag: 'high', page: 1 },
                  ]
                : isSugar
                ? [
                    { id: 'u5', test_name: 'HbA1c', value: 7.6, unit: '%', ref_low: 4.0, ref_high: 5.7, flag: 'critical', page: 1 },
                    { id: 'u6', test_name: 'Fasting Blood Sugar', value: 162.0, unit: 'mg/dL', ref_low: 70.0, ref_high: 100.0, flag: 'high', page: 1 },
                  ]
                : [
                    { id: 'u7', test_name: 'Hemoglobin', value: 11.4, unit: 'g/dL', ref_low: 13.0, ref_high: 17.0, flag: 'low', page: 1 },
                    { id: 'u8', test_name: 'RBC Count', value: 4.2, unit: 'mil/uL', ref_low: 4.5, ref_high: 5.5, flag: 'low', page: 1 },
                    { id: 'u9', test_name: 'WBC Count', value: 7800, unit: 'cells/mcL', ref_low: 4000, ref_high: 11000, flag: 'normal', page: 1 },
                    { id: 'u10', test_name: 'Platelet Count', value: 210000, unit: '/mcL', ref_low: 150000, ref_high: 450000, flag: 'normal', page: 1 },
                  ],
            };

            setIsProcessing(false);
            setSelectedFile(null);
            onUploadSuccess(generatedReport);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Upload New Medical Report</h3>
          <p className="text-xs text-slate-500">
            For Patient: <strong className="text-brand-700">{patientName}</strong> (Encrypted at rest under DPDP Act 2023)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg">
          PDF, JPG, PNG up to 25MB
        </span>
      </div>

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

          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7" />
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
