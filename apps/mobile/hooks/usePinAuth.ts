import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Speech from 'expo-speech';

const API_BASE = 'http://localhost:8000/v1';

export interface DeviceAuthData {
  deviceId: string;
  pinSet: boolean;
  accessToken: string | null;
  user: any;
}

export const usePinAuth = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [pinSet, setPinSet] = useState<boolean>(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      // Check biometrics
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricsAvailable(hasHw && isEnrolled);

      // Load stored device ID
      let storedDevId: string | null = null;
      if (Platform.OS !== 'web') {
        storedDevId = await SecureStore.getItemAsync('swasthya_device_id');
      } else {
        storedDevId = localStorage.getItem('swasthya_device_id');
      }

      if (storedDevId) {
        setDeviceId(storedDevId);
        setPinSet(true);
      }
    } catch (e) {
      console.warn('Init auth fallback:', e);
    }
  };

  const saveTokensAndDevice = async (devId: string, accessToken: string, refreshToken: string) => {
    setDeviceId(devId);
    setPinSet(true);
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('swasthya_device_id', devId);
        await SecureStore.setItemAsync('swasthya_access_token', accessToken);
        await SecureStore.setItemAsync('swasthya_refresh_token', refreshToken);
      } else {
        localStorage.setItem('swasthya_device_id', devId);
        localStorage.setItem('swasthya_access_token', accessToken);
        localStorage.setItem('swasthya_refresh_token', refreshToken);
      }
    } catch (e) {
      console.warn('SecureStore save error:', e);
    }
  };

  const speakVoicePrompt = (text: string, lang = 'hi') => {
    try {
      Speech.stop();
      Speech.speak(text, { language: lang, rate: 0.9 });
    } catch (e) {
      // ignore audio errors
    }
  };

  // Verify MPIN on registered device
  const verifyMpin = async (pin: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (!deviceId) return { success: false, error: 'Device not registered. Please sign in with phone.' };
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/pin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Incorrect PIN' };
      }
      await saveTokensAndDevice(deviceId, data.access_token, data.refresh_token);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error' };
    } finally {
      setLoading(false);
    }
  };

  // Biometric authentication trigger
  const authenticateBiometrics = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock SwasthyaAnuvad',
        cancelLabel: 'Use 4-digit PIN',
        fallbackLabel: 'Use PIN',
      });
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: 'Biometric verification cancelled' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Biometrics failed' };
    }
  };

  return {
    deviceId,
    pinSet,
    biometricsAvailable,
    loading,
    verifyMpin,
    authenticateBiometrics,
    saveTokensAndDevice,
    speakVoicePrompt,
  };
};
