import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Phone,
  KeyRound,
  ShieldCheck,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (userData: any) => void;
  selectedLanguage: string;
  requestedRole: 'patient' | 'admin';
}

type AuthStep =
  | 'phone_input'
  | 'otp_verify'
  | 'profile_setup'
  | 'consent_agree'
  | 'pin_setup'
  | 'pin_unlock'
  | 'pin_reset_otp'
  | 'pin_reset_new';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
  selectedLanguage,
  requestedRole,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [step, setStep] = useState<AuthStep>('phone_input');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [lang, setLang] = useState(selectedLanguage);
  const [usage, setUsage] = useState<'self' | 'caregiver'>('self');

  // Consent states
  const [consentExtraction, setConsentExtraction] = useState(true);
  const [consentTts, setConsentTts] = useState(true);
  const [consentEscalation, setConsentEscalation] = useState(true);

  // PIN states (6 digits for web)
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [pinShowDigits, setPinShowDigits] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Stored device ID for returning users
  const [storedDeviceId, setStoredDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const devId = localStorage.getItem('swasthya_web_device_id');
    setStoredDeviceId(devId);
    if (initialMode === 'signin' && devId && requestedRole !== 'admin') {
      setStep('pin_unlock');
    } else {
      setStep('phone_input');
    }
    setMode(initialMode);
    setErrorMessage(null);
    setInfoMessage(null);
    setPin('');
    setConfirmPin('');
  }, [isOpen, initialMode, requestedRole]);

  if (!isOpen) return null;

  // Keypad press handler
  const handleKeypadPress = (val: string) => {
    setErrorMessage(null);
    if (val === 'backspace') {
      if (step === 'pin_unlock' || (step === 'pin_setup' && pinStep === 'enter')) {
        setPin((prev) => prev.slice(0, -1));
      } else if (step === 'pin_setup' && pinStep === 'confirm') {
        setConfirmPin((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (step === 'pin_unlock') {
      if (pin.length < 6) setPin((prev) => prev + val);
    } else if (step === 'pin_setup') {
      if (pinStep === 'enter' && pin.length < 6) {
        setPin((prev) => prev + val);
      } else if (pinStep === 'confirm' && confirmPin.length < 6) {
        setConfirmPin((prev) => prev + val);
      }
    }
  };

  // 1. Request OTP
  const handleRequestOtp = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('http://localhost:8000/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');

      setInfoMessage(`OTP sent to ${data.phone_masked}${data.dev_otp ? ` (Dev code: ${data.dev_otp})` : ''}`);
      setStep('otp_verify');
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setErrorMessage('Please enter the received OTP code.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('http://localhost:8000/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code: otp,
          role: requestedRole === 'admin' ? 'admin' : usage === 'caregiver' ? 'caregiver' : 'patient',
          preferred_language: lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'OTP verification failed');

      localStorage.setItem('swasthya_access_token', data.access_token);
      localStorage.setItem('swasthya_refresh_token', data.refresh_token);

      if (mode === 'signup') {
        setStep('profile_setup');
      } else {
        // Sign-in on new device -> prompt to set device PIN
        setStep('pin_setup');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Save Profile
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('swasthya_access_token');
      const res = await fetch('http://localhost:8000/v1/auth/signup/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          age: age ? Number(age) : null,
          preferred_language: lang,
          usage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Profile update failed');

      setStep('consent_agree');
    } catch (err: any) {
      setErrorMessage(err.message || 'Profile error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Accept DPDP Consents
  const handleAcceptConsent = async () => {
    if (!consentExtraction || !consentEscalation) {
      setErrorMessage('Report extraction and Emergency escalation consents are required to use the system safely.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('swasthya_access_token');
      if (token) {
        await fetch('http://localhost:8000/v1/consents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            purpose: 'medical_report_ocr_simplification_and_voice_assistance',
          }),
        }).catch(() => {});
      }
    } catch {}
    setLoading(false);
    setStep('pin_setup');
    setPin('');
    setConfirmPin('');
    setPinStep('enter');
  };

  // 5. Submit 6-digit PIN Setup
  const handleSetPinSubmit = async () => {
    if (pin.length !== 6 || confirmPin.length !== 6) {
      setErrorMessage('Web PIN must be exactly 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMessage('PINs do not match. Please re-enter.');
      setConfirmPin('');
      setPinStep('enter');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('swasthya_access_token');
      const res = await fetch('http://localhost:8000/v1/auth/pin/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: 'web',
          device_label: 'Web Browser / ' + navigator.userAgent.slice(0, 30),
          pin,
          confirm_pin: confirmPin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to configure PIN');

      localStorage.setItem('swasthya_web_device_id', data.device_id);
      localStorage.setItem('swasthya_access_token', data.access_token);
      localStorage.setItem('swasthya_refresh_token', data.refresh_token);

      // Ensure consent recorded for this user session
      try {
        await fetch('http://localhost:8000/v1/consents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.access_token}`,
          },
          body: JSON.stringify({
            purpose: 'medical_report_ocr_simplification_and_voice_assistance',
          }),
        }).catch(() => {});
      } catch {}

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'PIN configuration error');
      setPin('');
      setConfirmPin('');
      setPinStep('enter');
    } finally {
      setLoading(false);
    }
  };

  // 6. Verify PIN on Known Device (Quick-Unlock)
  const handleUnlockWithPin = async () => {
    if (pin.length !== 6) {
      setErrorMessage('Please enter your 6-digit PIN.');
      return;
    }
    const devId = storedDeviceId || localStorage.getItem('swasthya_web_device_id');
    if (!devId) {
      setStep('phone_input');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('http://localhost:8000/v1/auth/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: devId,
          pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Incorrect PIN');

      localStorage.setItem('swasthya_access_token', data.access_token);
      localStorage.setItem('swasthya_refresh_token', data.refresh_token);

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const demoPhone = '9876543210';
      // 1. Request OTP
      await fetch('http://localhost:8000/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: demoPhone, purpose: 'login' }),
      }).catch(() => {});

      // 2. Verify with default dev OTP 123456
      const verRes = await fetch('http://localhost:8000/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: demoPhone, code: '123456' }),
      });
      const data = await verRes.json();
      if (data.access_token) {
        localStorage.setItem('swasthya_access_token', data.access_token);
        localStorage.setItem('swasthya_current_user', JSON.stringify(data.user));

        // Auto grant DPDP consent
        try {
          await fetch('http://localhost:8000/v1/consents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.access_token}`,
            },
            body: JSON.stringify({ purpose: 'medical_report_translation' }),
          });
        } catch {}

        onSuccess(data.user);
        onClose();
        return;
      }
      throw new Error('Demo login failed');
    } catch {
      // Fallback local demo user if backend is unavailable
      const mockUser = {
        id: '9a6f5201-9831-4e00-8812-7177e57dda54',
        name: 'Parvathi Devi K (Demo)',
        phone: '+919876543210',
        role: 'patient',
        preferred_language: 'en',
      };
      localStorage.setItem('swasthya_current_user', JSON.stringify(mockUser));
      localStorage.setItem('swasthya_access_token', 'demo-token');
      onSuccess(mockUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {mode === 'signup' ? 'Create Your Account' : 'Sign In with Quick PIN'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'pin_unlock'
                  ? 'Enter 6-digit PIN on this device'
                  : 'DPDP 2023 Encrypted & Safe'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Quick Demo Access Bar */}
          {requestedRole !== 'admin' && <div className="mb-5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Instant Testing & Demonstration</span>
            </p>
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3.5 rounded-lg bg-sky-700 text-white font-semibold text-xs hover:bg-sky-800 shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Instant Demo Login</span>}
            </button>
          </div>}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info Message */}
          {infoMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: Phone Input */}
          {step === 'phone_input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Mobile Number (India +91)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-14 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleRequestOtp}
                disabled={loading || phone.length < 10}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send OTP Code</span>}
              </button>

              {storedDeviceId && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setStep('pin_unlock');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Unlock with this device&apos;s 6-digit PIN instead
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: OTP Verify */}
          {step === 'otp_verify' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center tracking-widest text-2xl font-black py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 4}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Continue</span>}
              </button>

              <div className="text-center">
                <button
                  onClick={() => setStep('phone_input')}
                  className="text-xs text-slate-400 hover:underline"
                >
                  Change phone number
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Profile Setup */}
          {step === 'profile_setup' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 52"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Primary Language
                  </label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm outline-none focus:border-emerald-500"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  How will you use this?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUsage('self')}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all ${
                      usage === 'self'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    👤 For Myself
                    <span className="block font-normal text-[11px] text-slate-400 mt-1">My own health reports</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsage('caregiver')}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all ${
                      usage === 'caregiver'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    👨‍👩‍👧 For My Family
                    <span className="block font-normal text-[11px] text-slate-400 mt-1">Caregiver managing elders</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading || !name.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                Continue to Consent
              </button>
            </div>
          )}

          {/* STEP 4: DPDP Per-Purpose Consent */}
          {step === 'consent_agree' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-emerald-600 block mb-1">DPDP Act 2023 Purpose Transparency</span>
                Please review and approve the specific data processing purposes for your medical documents:
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentExtraction}
                    onChange={(e) => setConsentExtraction(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      1. Medical Report OCR & Simplification{' '}
                      <span className="text-rose-500 font-extrabold">(Required)</span>
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Extract test values and generate Grade-5 analogies in your mother tongue.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentTts}
                    onChange={(e) => setConsentTts(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      2. Voice Audio Synthesis (TTS)
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Synthesize warm spoken audio explanations in your native language.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentEscalation}
                    onChange={(e) => setConsentEscalation(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      3. Health Worker Emergency Escalation{' '}
                      <span className="text-rose-500 font-extrabold">(Required)</span>
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Notify your local ASHA worker if a critical test value is detected.
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleAcceptConsent}
                disabled={!consentExtraction || !consentEscalation}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all"
              >
                Approve & Set Quick PIN
              </button>
            </div>
          )}

          {/* STEP 5: Set 6-Digit PIN with keyboard input */}
          {step === 'pin_setup' && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {pinStep === 'enter' ? 'Choose a 6-Digit Web PIN' : 'Confirm Your 6-Digit Web PIN'}
                </span>
                <div className="hidden">
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const currentVal = pinStep === 'enter' ? pin : confirmPin;
                    const isFilled = i < currentVal.length;
                    return (
                      <div
                        key={i}
                        className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl transition-all ${
                          isFilled
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {isFilled ? (pinShowDigits ? currentVal[i] : '•') : ''}
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setPinShowDigits(!pinShowDigits)}
                  className="text-xs text-slate-400 flex items-center justify-center gap-1 mx-auto"
                >
                  {pinShowDigits ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{pinShowDigits ? 'Hide' : 'Show'} digits</span>
                </button>
                <label className="block max-w-xs mx-auto mt-4 text-left">
                  <span className="sr-only">{pinStep === 'enter' ? 'Enter your six digit PIN' : 'Re-enter your six digit PIN'}</span>
                  <input
                    type={pinShowDigits ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="new-password"
                    value={pinStep === 'enter' ? pin : confirmPin}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, '').slice(0, 6);
                      pinStep === 'enter' ? setPin(digits) : setConfirmPin(digits);
                    }}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-center text-xl tracking-[0.45em] font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </label>
              </div>

              {/* Keyboard input replaces the on-screen keypad. */}
              <div className="hidden">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'].map((key, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!key}
                    onClick={() => handleKeypadPress(key)}
                    className={`h-12 rounded-2xl font-bold text-lg flex items-center justify-center transition-all ${
                      !key
                        ? 'opacity-0 pointer-events-none'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-white'
                    }`}
                  >
                    {key === 'backspace' ? '⌫' : key}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                {pinStep === 'enter' ? (
                  <button
                    onClick={() => {
                      if (pin.length !== 6) {
                        setErrorMessage('Please enter all 6 digits.');
                        return;
                      }
                      setPinStep('confirm');
                    }}
                    disabled={pin.length !== 6}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-40"
                  >
                    Next: Re-enter to Confirm
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmPin('');
                        setPinStep('enter');
                      }}
                      className="w-1/3 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSetPinSubmit}
                      disabled={loading || confirmPin.length !== 6}
                      className="w-2/3 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-40"
                    >
                      {loading ? 'Saving PIN...' : 'Confirm PIN & Finish'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: Quick PIN Unlock on Known Device */}
          {step === 'pin_unlock' && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Enter 6-Digit PIN to Unlock
                </span>
                <div className="hidden">
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const isFilled = i < pin.length;
                    return (
                      <div
                        key={i}
                        className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl transition-all ${
                          isFilled
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {isFilled ? (pinShowDigits ? pin[i] : '•') : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="max-w-xs mx-auto mt-4 space-y-2">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPinShowDigits(!pinShowDigits)}
                      className="text-xs text-slate-400 flex items-center gap-1"
                    >
                      {pinShowDigits ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {pinShowDigits ? 'Hide' : 'Show'} digits
                    </button>
                  </div>
                  <input
                    type={pinShowDigits ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="current-password"
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-center text-xl tracking-[0.45em] font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Keyboard input replaces the on-screen keypad. */}
              <div className="hidden">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'].map((key, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!key}
                    onClick={() => handleKeypadPress(key)}
                    className={`h-12 rounded-2xl font-bold text-lg flex items-center justify-center transition-all ${
                      !key
                        ? 'opacity-0 pointer-events-none'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-white'
                    }`}
                  >
                    {key === 'backspace' ? '⌫' : key}
                  </button>
                ))}
              </div>

              <button
                onClick={handleUnlockWithPin}
                disabled={loading || pin.length !== 6}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Unlock Portal</span>}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  onClick={() => {
                    setMode('signin');
                    setStep('phone_input');
                    setErrorMessage(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Sign in with phone instead
                </button>
                <button
                  onClick={() => {
                    setStep('phone_input');
                    setErrorMessage(null);
                    setInfoMessage('Enter your phone number to reset your PIN via OTP.');
                  }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Forgot PIN?
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
