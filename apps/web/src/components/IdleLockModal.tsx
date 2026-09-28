import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';

interface IdleLockModalProps {
  isLocked: boolean;
  onUnlocked: () => void;
  onSignOut?: () => void;
  userName?: string;
}

export const IdleLockModal: React.FC<IdleLockModalProps> = ({
  isLocked,
  onUnlocked,
  onSignOut,
  userName = 'User',
}) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLocked) return null;

  const handleKeypadPress = (val: string) => {
    setErrorMessage(null);
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length < 6) {
      setPin((prev) => prev + val);
    }
  };

  const handleUnlock = async () => {
    if (pin.length !== 6) {
      setErrorMessage('Please enter your 6-digit PIN.');
      return;
    }
    const devId = localStorage.getItem('swasthya_web_device_id');
    if (!devId) {
      // No device ID, fallback unlock
      onUnlocked();
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
      setPin('');
      onUnlocked();
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect PIN. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto mb-4 font-black">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white">Session Locked</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          You have been idle for 10 minutes. Enter your 6-digit PIN to resume, {userName}.
        </p>

        {errorMessage && (
          <div className="my-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6-Digit Dots */}
        <div className="flex justify-center gap-3 my-5">
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
                {isFilled ? '•' : ''}
              </div>
            );
          })}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'].map((key, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!key}
              onClick={() => handleKeypadPress(key)}
              className={`h-11 rounded-2xl font-bold text-base flex items-center justify-center transition-all ${
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
          onClick={handleUnlock}
          disabled={loading || pin.length !== 6}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Unlock Portal</span>}
        </button>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="mt-4 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors block w-full text-center"
          >
            Sign Out or Switch Account →
          </button>
        )}
      </motion.div>
    </div>
  );
};
