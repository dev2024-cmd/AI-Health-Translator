import { useCallback } from 'react';
import * as Speech from 'expo-speech';

export const useVoicePrompt = () => {
  const speak = useCallback((text: string, langCode: string = 'en', isSlow: boolean = false) => {
    try {
      Speech.stop();

      // Map language code to standard speech code
      const speechLangMap: Record<string, string> = {
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

      const targetLang = speechLangMap[langCode] || 'en-IN';

      Speech.speak(text, {
        language: targetLang,
        rate: isSlow ? 0.75 : 0.95,
        pitch: 1.0,
      });
    } catch (e) {
      console.warn('Voice prompt error:', e);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      Speech.stop();
    } catch (e) {
      // ignore
    }
  }, []);

  return { speak, stop };
};
