import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [progress, setProgress] = useState<number>(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textOffsetRef = useRef(0);
  const hasStartedRef = useRef(false);

  const estimatedDuration = useMemo(() => {
    const words = textToSpeak.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(4, Math.ceil(words / (isSlowSpeed ? 2 : 2.5)));
  }, [textToSpeak, isSlowSpeed]);

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speechLanguage = (code: string) => {
    const languageMap: Record<string, string> = {
      en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', bn: 'bn-IN',
      mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', ur: 'ur-IN',
    };
    return languageMap[code] || 'en-IN';
  };

  const speakFrom = useCallback((startOffset: number) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const safeOffset = Math.max(0, Math.min(startOffset, textToSpeak.length));
    const utterance = new SpeechSynthesisUtterance(textToSpeak.slice(safeOffset));
    utterance.lang = speechLanguage(languageCode);
    utterance.rate = isSlowSpeed ? 0.8 : 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onboundary = (event) => {
      const absoluteOffset = safeOffset + event.charIndex;
      textOffsetRef.current = absoluteOffset;
      setProgress((absoluteOffset / Math.max(textToSpeak.length, 1)) * 100);
    };
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        textOffsetRef.current = textToSpeak.length;
        setProgress(100);
        setIsPlaying(false);
      }
    };
    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') setIsPlaying(false);
    };

    textOffsetRef.current = safeOffset;
    utteranceRef.current = utterance;
    hasStartedRef.current = true;
    window.speechSynthesis.speak(utterance);
  }, [isSlowSpeed, languageCode, textToSpeak]);

  // Stop active speech and reset the timeline when the selected explanation changes.
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);
      textOffsetRef.current = 0;
      hasStartedRef.current = false;
      if (autoPlay) speakFrom(0);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToSpeak, languageCode, isSlowSpeed, autoPlay, speakFrom]);

  const togglePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      speakFrom(progress >= 100 ? 0 : textOffsetRef.current);
    }
  };

  const toggleSpeed = () => {
    setIsSlowSpeed(!isSlowSpeed);
  };

  const restartAudio = () => {
    setProgress(0);
    speakFrom(0);
  };

  const seekAudio = (nextProgress: number) => {
    const normalized = Math.max(0, Math.min(nextProgress, 100));
    setProgress(normalized);
    speakFrom(Math.floor((normalized / 100) * textToSpeak.length));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-xs text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Header & Subtitle */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Listen to Report
              </h4>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                  Speaking ({isSlowSpeed ? '0.8x' : '1.0x'})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hear the explanation in the selected language.
            </p>
          </div>
        </div>

        {/* Action Controls: Play / Speed / Restart */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Primary Play/Pause Button */}
          <button
            id="audio-play-pause-btn"
            onClick={togglePlay}
            className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors active:scale-98"
            aria-label={isPlaying ? 'Pause Audio Explanation' : 'Play Voice Explanation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Speed Toggle (Normal / Slow) */}
          <button
            id="audio-speed-toggle-btn"
            onClick={toggleSpeed}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 ${
              isSlowSpeed
                ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Toggle between Normal (1.0x) and Slower (0.8x) reading speed"
          >
            <FastForward className="w-3.5 h-3.5 text-slate-500" />
            <span>{isSlowSpeed ? 'Speed: 0.8x' : 'Speed: 1.0x'}</span>
          </button>

          {/* Restart */}
          <button
            id="audio-replay-btn"
            onClick={restartAudio}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
            title="Restart from beginning"
            aria-label="Replay explanation from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Seekable Timeline */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1.5">
          <span>{formatTimestamp((progress / 100) * estimatedDuration)}</span>
          <span>{formatTimestamp(estimatedDuration)}</span>
        </div>
        <input
          id="audio-timeline"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={(event) => seekAudio(Number(event.target.value))}
          className="w-full h-1.5 cursor-pointer accent-slate-900 bg-slate-200 rounded-lg"
          aria-label="Audio timeline"
          aria-valuetext={`${formatTimestamp((progress / 100) * estimatedDuration)} of ${formatTimestamp(estimatedDuration)}`}
        />
      </div>

      {/* Subtle waveform / active indicator */}
      {isPlaying && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
          <div className="w-1 h-3 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-4 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-5 bg-teal-700 rounded-full animate-bounce"></div>
          <div className="w-1 h-3.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-1 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
          <span className="text-[11px] text-teal-800 ml-1.5 font-medium">Audio playback active</span>
        </div>
      )}
    </div>
  );
};
