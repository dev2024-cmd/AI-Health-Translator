import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward } from 'lucide-react';

interface AudioPlayerProps {
  textToSpeak: string;
  languageCode: string;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  textToSpeak,
  languageCode,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSlowSpeed, setIsSlowSpeed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop any active speech on unmount or text change
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      // Map Bhashini language code to browser speech language
      const bhashiniToBCP47: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN',
        ur: 'ur-IN',
      };
      utterance.lang = bhashiniToBCP47[languageCode] || 'en-IN';
      utterance.rate = isSlowSpeed ? 0.8 : 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
      };
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;

      if (autoPlay) {
        window.speechSynthesis.speak(utterance);
      }
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToSpeak, languageCode, isSlowSpeed]);

  const togglePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      if (utteranceRef.current) {
        utteranceRef.current.rate = isSlowSpeed ? 0.8 : 1.0;
        window.speechSynthesis.speak(utteranceRef.current);
        setIsPlaying(true);
      }
    }
  };

  const toggleSpeed = () => {
    setIsSlowSpeed(!isSlowSpeed);
    if (isPlaying && utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current.rate = !isSlowSpeed ? 0.8 : 1.0;
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  const restartAudio = () => {
    if ('speechSynthesis' in window && utteranceRef.current) {
      window.speechSynthesis.cancel();
      setProgress(0);
      window.speechSynthesis.speak(utteranceRef.current);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-900/10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Main Controls & Waveform */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Giant Primary Play/Pause Button */}
          <button
            id="audio-play-pause-btn"
            onClick={togglePlay}
            className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center justify-center font-bold"
            aria-label={isPlaying ? 'Pause Audio Explanation' : 'Play Voice Explanation'}
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-emerald-700" /> : <Play className="w-7 h-7 fill-emerald-700 ml-1" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide uppercase text-emerald-200">
                Voice Assistant
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium animate-pulse">
                  Speaking ({isSlowSpeed ? '0.8x' : '1.0x'})
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white leading-tight">
              {isPlaying ? 'Reading Plain-Language Explanation' : 'Tap to Listen to Report Aloud'}
            </h4>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Available in Indian languages for low-literacy clarity
            </p>
          </div>
        </div>

        {/* Action Buttons: Speed toggle & Restart */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/20">
          {/* Speed Toggle (Normal / Slow) */}
          <button
            id="audio-speed-toggle-btn"
            onClick={toggleSpeed}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSlowSpeed
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title="Toggle between Normal (1.0x) and Slower (0.8x) reading speed for elderly listeners"
          >
            <FastForward className="w-3.5 h-3.5" />
            {isSlowSpeed ? 'Slow: 0.8x' : 'Speed: 1.0x'}
          </button>

          {/* Replay */}
          <button
            id="audio-replay-btn"
            onClick={restartAudio}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            title="Replay from beginning"
            aria-label="Replay explanation from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animated Sound Waveform Indicator */}
      {isPlaying && (
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/15">
          <div className="w-1.5 h-4 bg-white/80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-8 bg-emerald-200 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-1.5 h-3 bg-white/70 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
          <span className="text-xs text-emerald-100 ml-2">Audio active in chosen language...</span>
        </div>
      )}
    </div>
  );
};
