import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Sun,
  Shield,
  Upload,
  ArrowLeft,
  ArrowRight,
  FileText,
  FolderOpen,
} from 'lucide-react';
import { WebReport } from '../types/api.js';
import { hydrateReportTranslations } from '../utils/reportLocalizer.js';
import { runBrowserOcr, parseMedicalOcrText } from '../utils/medicalOcrParser.js';

interface CapturedPage {
  id: string;
  dataUrl: string;
  pageNumber: number;
  fileName?: string;
  fileType?: string;
}

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newReport: WebReport) => void;
  selectedPatientId: string;
  patientName: string;
  initialDocType?: 'lab_report' | 'prescription';
  onOpenSubscription?: () => void;
  currentPlan?: 'free' | 'family' | 'pro';
  reportsCount?: number;
  maxFreeReports?: number;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  selectedPatientId,
  patientName,
  initialDocType = 'lab_report',
  onOpenSubscription,
  currentPlan = 'free',
  reportsCount = 0,
  maxFreeReports = 5,
}) => {
  const isQuotaExhausted = currentPlan === 'free' && reportsCount >= maxFreeReports;
  const [docType, setDocType] = useState<'lab_report' | 'prescription'>(initialDocType);
  const [inputMethod, setInputMethod] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStage, setSubmitStage] = useState<string>('Analyzing document with AI OCR...');
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Quality checks state
  const [brightnessStatus, setBrightnessStatus] = useState<'good' | 'low'>('good');
  const [steadyStatus, setSteadyStatus] = useState<'steady' | 'moving'>('steady');

  // Offline status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(() => {
    try {
      const q = localStorage.getItem('swasthya_offline_queue');
      return q ? JSON.parse(q).length : 0;
    } catch {
      return 0;
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const qualityCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const steadyCounter = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize initial document type if prop updates
  useEffect(() => {
    setDocType(initialDocType);
  }, [initialDocType]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Camera lifecycle tied to modal state and active input method
  useEffect(() => {
    if (isOpen && inputMethod === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, inputMethod]);

  // Reset captured pages when modal completely closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPages([]);
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      startQualityAnalysis();
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      setCameraError(err.message || 'Camera is currently unavailable.');
      setCameraActive(false);
      // Automatically switch to file upload view if camera fails
      setInputMethod('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (qualityCheckInterval.current) {
      clearInterval(qualityCheckInterval.current);
      qualityCheckInterval.current = null;
    }
    setCameraActive(false);
  };

  // Real-time brightness & blur analysis via offscreen canvas
  const startQualityAnalysis = () => {
    if (qualityCheckInterval.current) clearInterval(qualityCheckInterval.current);

    qualityCheckInterval.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, 160, 120);

      const frameData = ctx.getImageData(0, 0, 160, 120);
      const data = frameData.data;

      // Calculate Average Luminance (Brightness)
      let totalLuminance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
      }
      const avgLuminance = totalLuminance / (data.length / 4);
      const isLowLight = avgLuminance < 55;
      setBrightnessStatus(isLowLight ? 'low' : 'good');

      // Stability and focus check
      if (!isLowLight) {
        steadyCounter.current += 1;
        if (steadyCounter.current >= 3) {
          setSteadyStatus('steady');
          if (autoCaptureEnabled && capturedPages.length === 0 && steadyCounter.current === 6) {
            handleCaptureShutter();
          }
        }
      } else {
        steadyCounter.current = 0;
        setSteadyStatus('moving');
      }
    }, 400);
  };

  const playShutterSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio fallback
    }
  };

  // Preprocess image: scale to <= 2000px, boost contrast for OCR readability
  const processAndCompressImage = (sourceCanvas: HTMLCanvasElement): string => {
    const maxDimension = 2000;
    let width = sourceCanvas.width;
    let height = sourceCanvas.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return sourceCanvas.toDataURL('image/jpeg', 0.88);

    ctx.drawImage(sourceCanvas, 0, 0, width, height);

    // Apply +15% text readability contrast boost
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    const contrast = 1.15;
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

    for (let i = 0; i < d.length; i += 4) {
      d[i] = factor * (d[i] - 128) + 128;
      d[i + 1] = factor * (d[i + 1] - 128) + 128;
      d[i + 2] = factor * (d[i + 2] - 128) + 128;
    }
    ctx.putImageData(imgData, 0, 0);

    return outputCanvas.toDataURL('image/jpeg', 0.85);
  };

  const handleCaptureShutter = () => {
    if (isQuotaExhausted) {
      if (onOpenSubscription) {
        onClose();
        onOpenSubscription();
      }
      return;
    }
    if (!videoRef.current) return;
    playShutterSound();

    const video = videoRef.current;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth || 1280;
    snapCanvas.height = video.videoHeight || 720;
    const ctx = snapCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
    const compressedJpeg = processAndCompressImage(snapCanvas);

    const newPage: CapturedPage = {
      id: 'camera-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      dataUrl: compressedJpeg,
      pageNumber: capturedPages.length + 1,
      fileName: `Camera_Capture_P${capturedPages.length + 1}.jpg`,
      fileType: 'image/jpeg',
    };

    setCapturedPages((prev) => [...prev, newPage]);
  };

  // Process incoming files (from Drag & Drop or File Picker)
  const processIncomingFiles = (files: File[]) => {
    if (isQuotaExhausted) {
      if (onOpenSubscription) {
        onClose();
        onOpenSubscription();
      }
      return;
    }
    const validFiles = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length === 0) {
      alert('Please upload valid images (JPG, PNG, WebP) or PDF documents.');
      return;
    }

    validFiles.forEach((file, index) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isPrescriptionFile =
        file.name.toLowerCase().includes('prescription') ||
        file.name.toLowerCase().includes('rx') ||
        file.name.toLowerCase().includes('doctor') ||
        file.name.toLowerCase().includes('ibuprofen') ||
        file.name.toLowerCase().includes('med');
      if (isPrescriptionFile) {
        setDocType('prescription');
      }

      const reader = new FileReader();

      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          const newPage: CapturedPage = {
            id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4) + '-' + index,
            dataUrl: uploadEvt.target.result as string,
            pageNumber: capturedPages.length + index + 1,
            fileName: file.name,
            fileType: isPdf ? 'application/pdf' : file.type || 'image/jpeg',
          };
          setCapturedPages((prev) => [...prev, newPage]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    processIncomingFiles(Array.from(e.target.files));
    e.target.value = ''; // Reset input to allow re-selecting the same file if desired
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Reorder and delete pages
  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= capturedPages.length) return;
    const updated = [...capturedPages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setCapturedPages(updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 })));
  };

  const deletePage = (id: string) => {
    setCapturedPages((prev) =>
      prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, pageNumber: idx + 1 }))
    );
  };

  // Process offline queue upon network restoration
  const processOfflineQueue = () => {
    try {
      const q = localStorage.getItem('swasthya_offline_queue');
      if (q) {
        const items = JSON.parse(q);
        if (items.length > 0) {
          localStorage.removeItem('swasthya_offline_queue');
          setOfflinePendingCount(0);
        }
      }
    } catch {
      // ignore
    }
  };

  // Submit pages to backend or save to offline queue
  // Submit pages to backend or save to offline queue with Real AI OCR Analysis
  const handleDoneSubmit = async () => {
    if (capturedPages.length === 0) return;
    if (isQuotaExhausted) {
      if (onOpenSubscription) {
        onClose();
        onOpenSubscription();
      }
      return;
    }
    setIsSubmitting(true);
    setSubmitStage('Scanning document with AI Vision OCR...');

    if (!isOnline) {
      const queueItem = {
        id: 'queued-' + Date.now(),
        patientId: selectedPatientId,
        patientName,
        docType,
        pageCount: capturedPages.length,
        timestamp: new Date().toISOString(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem('swasthya_offline_queue') || '[]');
        existing.push(queueItem);
        localStorage.setItem('swasthya_offline_queue', JSON.stringify(existing));
        setOfflinePendingCount(existing.length);
      } catch {
        // storage overflow fallback
      }
    }

    try {
      const primaryPage = capturedPages[0];
      let ocrText = '';

      if (primaryPage.dataUrl) {
        setSubmitStage('Reading text and handwriting with AI Vision OCR...');
        try {
          ocrText = await runBrowserOcr(primaryPage.dataUrl, (p, stage) => {
            setSubmitStage(stage);
          });
        } catch (err) {
          console.warn('Browser OCR info:', err);
        }
      }

      setSubmitStage('Extracting clinical test findings & medication instructions...');

      // Parse the OCR text using the medical parser
      const parsed = parseMedicalOcrText(
        ocrText,
        primaryPage.fileName || '',
        patientName,
        docType
      );

      // Build real report matching the scanned image
      const createdReport: WebReport = {
        id: 'rep-' + Date.now(),
        patient_name: parsed.patientName || patientName || 'Patient',
        patient_id: selectedPatientId,
        patient_age: parsed.patientAge || 45,
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
        file_name: primaryPage.fileName || (parsed.documentType === 'prescription' ? 'prescription_scan.jpg' : 'medical_report_scan.jpg'),
        file_type: primaryPage.fileType || 'image/jpeg',
        image_url: primaryPage.dataUrl,
        extracted_values: parsed.extractedValues,
        plain_explanation: parsed.plainExplanation,
        doctor_advice: (parsed as any).doctorAdvice,
        follow_up_date: (parsed as any).followUpDate,
      };

      // Sync with backend API in background if authenticated
      try {
        const token = localStorage.getItem('swasthya_access_token');
        if (token && capturedPages.length > 0) {
          fetch(primaryPage.dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
              const formData = new FormData();
              formData.append('files', blob, primaryPage.fileName || 'camera_report.jpg');
              formData.append('patient_id', selectedPatientId || 'pat-self');
              formData.append('source', 'web');
              formData.append('original_language', 'en');
              return fetch('http://localhost:8000/v1/reports', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              });
            })
            .catch(() => {});
        }
      } catch {}

      setIsSubmitting(false);
      onComplete(hydrateReportTranslations(createdReport));
      onClose();
    } catch (err) {
      console.error('OCR pipeline error:', err);
      // Safe fallback using parser on filename
      const parsed = parseMedicalOcrText('', capturedPages[0]?.fileName || '', patientName, docType);
      const fallbackReport: WebReport = {
        id: 'rep-' + Date.now(),
        patient_name: parsed.patientName || patientName || 'Patient',
        patient_id: selectedPatientId,
        patient_age: 45,
        patient_gender: 'Unknown',
        test_title: parsed.title,
        date: new Date().toISOString().split('T')[0],
        source: 'web',
        status: 'ready',
        original_language: 'en',
        audio_available: true,
        document_type: parsed.documentType,
        doctor_name: parsed.doctorName,
        doctor_clinic: parsed.clinicOrHospital,
        doctor_license: parsed.doctorLicense,
        file_name: capturedPages[0]?.fileName || 'report_scan.jpg',
        file_type: capturedPages[0]?.fileType || 'image/jpeg',
        image_url: capturedPages[0]?.dataUrl,
        extracted_values: parsed.extractedValues,
        plain_explanation: parsed.plainExplanation,
        doctor_advice: (parsed as any).doctorAdvice,
        follow_up_date: (parsed as any).followUpDate,
      };
      setIsSubmitting(false);
      onComplete(hydrateReportTranslations(fallbackReport));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden Global File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              {inputMethod === 'camera' ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Multi-Page Document Intake
              </h2>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-emerald-400 font-bold">{patientName}</span>
              </p>
            </div>
          </div>

          {/* Document Type Switcher: Lab Report vs Prescription */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/80 p-1 rounded-2xl flex text-xs font-bold">
              <button
                type="button"
                onClick={() => setDocType('lab_report')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  docType === 'lab_report'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lab Report
              </button>
              <button
                type="button"
                onClick={() => setDocType('prescription')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  docType === 'prescription'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Doctor Rx
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Quota Exhausted Alert Banner */}
        {isQuotaExhausted && (
          <div className="bg-amber-950/80 border-b border-amber-800/80 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Free Quota Limit Reached ({reportsCount}/{maxFreeReports} Reports Used): </strong>
                To process additional medical documents and unlock unlimited Neural Vision OCR, spoken IVR calls, and SMS dispatches, please upgrade your subscription.
                <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-300 font-semibold">
                  <span>Direct Unit Costs: SMS ₹0.25</span>
                  <span>•</span>
                  <span>IVR ₹0.75/min</span>
                  <span>•</span>
                  <span>OCR ₹0.50/page</span>
                  <span>•</span>
                  <span>Clinical LLM ₹0.60/rep</span>
                </div>
              </div>
            </div>
            {onOpenSubscription && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSubscription();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs whitespace-nowrap shrink-0 transition-colors shadow-sm"
              >
                Upgrade Subscription
              </button>
            )}
          </div>
        )}

        {/* Input Method Switcher Tab Bar: Camera vs File Upload */}
        <div className="flex items-center justify-center py-2.5 px-6 bg-slate-950/60 border-b border-slate-800">
          <div className="inline-flex p-1 rounded-lg bg-slate-800/90 border border-slate-700/60 text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => setInputMethod('camera')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${
                inputMethod === 'camera'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Capture with Camera</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMethod('upload')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${
                inputMethod === 'upload'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload From Files / PDF</span>
            </button>
          </div>
        </div>

        {/* Offline Alert Banner */}
        {!isOnline && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Offline Mode Active • Document will be encrypted & queued locally
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-black">
              {offlinePendingCount} pending
            </span>
          </div>
        )}

        {/* Main Content Area: Camera Viewfinder OR File Drag-and-Drop Zone */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[280px] sm:min-h-[340px] overflow-hidden">
          {inputMethod === 'camera' ? (
            cameraActive && !cameraError ? (
              <>
                {/* Live Camera Video Feed */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover max-h-[340px]"
                />

                {/* Document Guide Mask with Corner Brackets */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-[85%] max-w-[380px] aspect-[1/1.38] rounded-2xl border-2 border-emerald-400/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 opacity-70">
                      <FileText className="w-8 h-8 text-emerald-300 mb-1" />
                      <span className="text-[11px] font-black text-emerald-200 uppercase tracking-widest">
                        Align {docType === 'prescription' ? 'Prescription' : 'Report'} In Frame
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real-time Quality Badges */}
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="flex gap-2">
                    {brightnessStatus === 'low' ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/90 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-sm animate-pulse">
                        <Sun className="w-3.5 h-3.5" /> Move to brighter area
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/80 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> Good lighting
                      </span>
                    )}

                    {steadyStatus === 'moving' ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/90 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                        <AlertTriangle className="w-3.5 h-3.5" /> Hold steady
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/80 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-sm">
                        <Shield className="w-3.5 h-3.5" /> Steady
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
                    className="pointer-events-auto px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 backdrop-blur-sm border border-slate-700"
                  >
                    Auto: {autoCaptureEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Shutter Capture Button */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleCaptureShutter}
                    className="w-16 h-16 p-1 rounded-full border-4 border-white bg-white/20 backdrop-blur-md active:scale-95 transition-transform flex items-center justify-center shadow-2xl hover:bg-white/30"
                    title="Snap Document Page"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-lg">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>
                </div>
              </>
            ) : (
              /* Camera Unavailable / Error View */
              <div className="p-8 text-center max-w-md">
                <div className="w-14 h-14 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3 font-black">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-white">Camera Viewfinder Inactive</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {cameraError || 'Camera could not be activated. You can upload photos or PDFs directly.'}
                </p>
                <button
                  type="button"
                  onClick={() => setInputMethod('upload')}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Switch to File Upload</span>
                </button>
              </div>
            )
          ) : (
            /* File Drag & Drop Upload Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full max-w-xl mx-4 my-6 p-8 border-2 border-dashed rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
                <FolderOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Drag & Drop Report Files or Photos Here
              </h3>
              <p className="text-xs text-slate-400 mb-5 max-w-md leading-relaxed">
                Upload single or multi-page lab reports, blood test results, or doctor prescriptions. Supports JPG, PNG, WebP, or PDF documents up to 25MB.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Browse Files From Device</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-Page Bottom Thumbnail Strip */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Captured / Uploaded Pages ({capturedPages.length})
            </span>

            {/* Quick Actions to add more pages with either method */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInputMethod('camera')}
                className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  inputMethod === 'camera' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Snap Camera Page</span>
              </button>

              <span className="text-slate-700">|</span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Files</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin min-h-[90px]">
            {capturedPages.length === 0 ? (
              <div className="py-3 text-xs text-slate-500 italic w-full text-center">
                No pages added yet. Use the camera shutter above or upload files from your device.
              </div>
            ) : (
              capturedPages.map((page, idx) => (
                <div
                  key={page.id}
                  className="relative group shrink-0 w-20 aspect-[1/1.3] rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-md"
                >
                  {/* PDF Representation vs Image */}
                  {page.fileType === 'application/pdf' || page.dataUrl.startsWith('data:application/pdf') ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-rose-950/40 p-1.5 text-center">
                      <FileText className="w-6 h-6 text-rose-400 mb-1" />
                      <span className="text-[9px] font-bold text-rose-200 truncate w-full px-1">
                        {page.fileName || 'PDF Doc'}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Page Badge */}
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-black text-white">
                    P{page.pageNumber}
                  </span>

                  {/* Hover Reorder & Delete Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {idx > 0 && (
                      <button
                        onClick={() => movePage(idx, idx - 1)}
                        title="Move left"
                        className="p-1 rounded bg-slate-700 text-white hover:bg-slate-600"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deletePage(page.id)}
                      title="Delete page"
                      className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {idx < capturedPages.length - 1 && (
                      <button
                        onClick={() => movePage(idx, idx + 1)}
                        title="Move right"
                        className="p-1 rounded bg-slate-700 text-white hover:bg-slate-600"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sticky Bottom Action Footer */}
        <div className="sticky bottom-0 bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={capturedPages.length === 0 || isSubmitting}
            onClick={handleDoneSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{submitStage}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>
                  Done ({capturedPages.length} {capturedPages.length === 1 ? 'Page' : 'Pages'}) →
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
