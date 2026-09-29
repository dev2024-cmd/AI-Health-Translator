import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2, Lock, X } from 'lucide-react';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized: () => void;
  selectedLanguage: string;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  onAuthorized,
  selectedLanguage,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = accessCode.trim().toUpperCase();

    // Accepted unique access codes for administrators and health supervisors
    if (cleanCode === 'ADMIN-2026' || cleanCode === '7788' || cleanCode === 'SWATH-STAFF') {
      setError(null);
      setAccessCode('');
      onAuthorized();
      onClose();
    } else {
      setError(
        selectedLanguage === 'ta'
          ? 'தவறான நிர்வாகக் குறியீடு. அனுமதி மறுக்கப்பட்டது.'
          : selectedLanguage === 'te'
          ? 'చెల్లని అడ్మిన్ యాక్సెస్ కోడ్. ప్రవేశం నిరాకరించబడింది.'
          : selectedLanguage === 'hi'
          ? 'अमान्य एडमिन कोड। प्रवेश प्रतिबंधित है।'
          : 'Invalid Admin Access Key. Access restricted to authorized personnel.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              RESTRICTED ACCESS
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {selectedLanguage === 'ta'
                ? 'நிர்வாக மற்றும் பணியாளர் தளம்'
                : selectedLanguage === 'te'
                ? 'అడ్మిన్ & స్టాఫ్ పోర్టల్'
                : selectedLanguage === 'hi'
                ? 'व्यवस्थापक और स्वास्थ्य कार्यकर्ता पोर्टल'
                : 'Healthcare Administrator Gateway'}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
          {selectedLanguage === 'ta'
            ? 'அனைத்து பயனர்கள் மற்றும் மருத்துவக் குழுவை நிர்வகிக்க பிரத்யேக நிர்வாகக் குறியீட்டை உள்ளிடவும்.'
            : selectedLanguage === 'te'
            ? 'యూజర్లు మరియు ఆరోగ్య కార్యకర్తలను నిర్వహించడానికి ప్రత్యేక అడ్మిన్ కోడ్‌ను నమోదు చేయండి.'
            : selectedLanguage === 'hi'
            ? 'सभी उपयोगकर्ताओं और रिपोर्टों का प्रबंधन करने के लिए अपना अद्वितीय कोड दर्ज करें।'
            : 'Enter your unique administrator security passkey to access multi-patient records and operational queues.'}
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              {selectedLanguage === 'ta' ? 'நிர்வாகக் குறியீடு (Unique Code)' : 'Security Passkey / Code'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="e.g. ADMIN-2026 or 7788"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-black tracking-widest text-slate-900 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1.5 animate-shake">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-black shadow-lg shadow-amber-600/20 hover:from-amber-700 hover:to-amber-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Unlock Admin</span>
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold">
            Passkey for Demo/Supervisors: <code className="font-mono font-bold text-amber-600">ADMIN-2026</code> or <code className="font-mono font-bold text-amber-600">7788</code>
          </span>
        </div>
      </div>
    </div>
  );
};
