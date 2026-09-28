import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePinAuth } from '../../hooks/usePinAuth';
import { useAppConfig } from '../_layout';

export default function SignInScreen() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();
  const {
    deviceId,
    biometricsAvailable,
    loading,
    verifyMpin,
    authenticateBiometrics,
    speakVoicePrompt,
  } = usePinAuth();

  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Spoken prompt on load
  useEffect(() => {
    const prompt =
      language === 'te'
        ? 'దయచేసి మీ 4 అంకెల ఎం-పిన్ నమోదు చేయండి'
        : language === 'hi'
        ? 'कृपया अपना 4 अंकों का पिन दर्ज करें'
        : 'Please enter your 4-digit PIN';
    speakVoicePrompt(prompt, language);
  }, []);

  const handleKeyPress = (val: string) => {
    setErrorMessage(null);
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const submitPin = async (inputPin: string) => {
    if (!deviceId) {
      // In dev or new device, allow direct entry
      router.replace('/');
      return;
    }
    const res = await verifyMpin(inputPin);
    if (res.success) {
      router.replace('/');
    } else {
      setErrorMessage(res.error || 'Incorrect PIN. Try again.');
      setPin('');
      speakVoicePrompt('Incorrect PIN, please try again', language);
    }
  };

  const handleBiometricPress = async () => {
    const res = await authenticateBiometrics();
    if (res.success) {
      router.replace('/');
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, highContrast && styles.highContrastBg]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.keyIcon}>🔐</Text>
          <Text style={[styles.title, highContrast && styles.highContrastText]}>
            Enter 4-Digit MPIN
          </Text>
          <Text style={[styles.subtitle, highContrast && styles.highContrastSubText]}>
            {language === 'te'
              ? 'మీ 4 అంకెల ఎం-పిన్ నమోదు చేయండి'
              : language === 'hi'
              ? 'अपना 4 अंकों का पिन दर्ज करें'
              : 'Quick unlock on this phone'}
          </Text>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {errorMessage}</Text>
          </View>
        )}

        {/* 4 PIN Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => {
            const isFilled = i < pin.length;
            return (
              <View
                key={i}
                style={[
                  styles.dotBox,
                  isFilled && styles.dotBoxFilled,
                  highContrast && styles.dotBoxHighContrast,
                  highContrast && isFilled && styles.dotBoxHighContrastFilled,
                ]}
              >
                <Text style={styles.dotText}>{isFilled ? '●' : ''}</Text>
              </View>
            );
          })}
        </View>

        {loading && <ActivityIndicator size="small" color="#16a34a" style={{ marginVertical: 10 }} />}

        {/* Numeric Keypad (48-60dp touch targets) */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <TouchableOpacity
              key={digit}
              onPress={() => handleKeyPress(digit)}
              activeOpacity={0.7}
              style={[styles.keyBtn, highContrast && styles.keyBtnHighContrast]}
            >
              <Text style={[styles.keyDigit, highContrast && styles.highContrastText]}>
                {digit}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Biometrics Button */}
          {biometricsAvailable ? (
            <TouchableOpacity
              onPress={handleBiometricPress}
              activeOpacity={0.7}
              style={[styles.keyBtn, styles.specialKeyBtn]}
            >
              <Text style={styles.specialKeyText}>👆</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.keyBtn} />
          )}

          {/* 0 */}
          <TouchableOpacity
            onPress={() => handleKeyPress('0')}
            activeOpacity={0.7}
            style={[styles.keyBtn, highContrast && styles.keyBtnHighContrast]}
          >
            <Text style={[styles.keyDigit, highContrast && styles.highContrastText]}>0</Text>
          </TouchableOpacity>

          {/* Backspace */}
          <TouchableOpacity
            onPress={() => handleKeyPress('backspace')}
            activeOpacity={0.7}
            style={[styles.keyBtn, styles.specialKeyBtn]}
          >
            <Text style={styles.specialKeyText}>⌫</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Options */}
        <View style={styles.bottomRow}>
          <TouchableOpacity onPress={() => router.push('/auth/forgot-pin')}>
            <Text style={[styles.linkText, highContrast && styles.highContrastText]}>
              Forgot PIN? (పిన్ మర్చిపోయారా?)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
            <Text style={styles.primaryLinkText}>
              New Phone / Register →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  highContrastBg: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  keyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubText: {
    color: '#cbd5e1',
  },
  errorBox: {
    backgroundColor: '#ffe4e6',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  errorText: {
    color: '#be123c',
    fontSize: 13,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  dotBox: {
    width: 54,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBoxFilled: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  dotBoxHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  dotBoxHighContrastFilled: {
    borderColor: '#22c55e',
    backgroundColor: '#022c22',
  },
  dotText: {
    fontSize: 24,
    color: '#16a34a',
    fontWeight: '900',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    maxWidth: 320,
    alignSelf: 'center',
  },
  keyBtn: {
    width: 86,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  keyBtnHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  keyDigit: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  specialKeyBtn: {
    backgroundColor: '#f1f5f9',
  },
  specialKeyText: {
    fontSize: 22,
    color: '#475569',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  linkText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
  },
  primaryLinkText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '800',
  },
});
