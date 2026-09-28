import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePinAuth } from '../../hooks/usePinAuth';
import { useAppConfig } from '../_layout';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';

const API_BASE = 'http://localhost:8000/v1';

export default function SignUpScreen() {
  const router = useRouter();
  const { language, setLanguage, highContrast } = useAppConfig();
  const { saveTokensAndDevice, speakVoicePrompt } = usePinAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [usage, setUsage] = useState<'self' | 'caregiver'>('self');

  // DPDP Consents
  const [consentExtraction, setConsentExtraction] = useState(true);
  const [consentTts, setConsentTts] = useState(true);
  const [consentEscalation, setConsentEscalation] = useState(true);

  // 4-Digit MPIN (Entered twice)
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Speak prompt when reaching PIN step
  useEffect(() => {
    if (step === 5) {
      if (pinStep === 'enter') {
        speakVoicePrompt('Choose a 4-digit PIN', language);
      } else {
        speakVoicePrompt('Re-enter to confirm your PIN', language);
      }
    }
  }, [step, pinStep]);

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');

      setInfoMessage(`OTP sent to ${data.phone_masked}${data.dev_otp ? ` (Dev: ${data.dev_otp})` : ''}`);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setErrorMessage('Please enter the received OTP code.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code: otp,
          role: usage === 'caregiver' ? 'caregiver' : 'patient',
          preferred_language: language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'OTP verification failed');

      // Save interim tokens in memory
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save Profile
  const handleSaveProfile = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setStep(4);
  };

  // Step 4: Accept DPDP Consents
  const handleAcceptConsent = () => {
    if (!consentExtraction || !consentEscalation) {
      setErrorMessage('Report extraction and Emergency escalation consents are required.');
      return;
    }
    setStep(5);
    setPin('');
    setConfirmPin('');
    setPinStep('enter');
  };

  // Step 5: MPIN Keypad Input
  const handleKeypadPress = (val: string) => {
    setErrorMessage(null);
    if (val === 'backspace') {
      if (pinStep === 'enter') setPin((prev) => prev.slice(0, -1));
      else setConfirmPin((prev) => prev.slice(0, -1));
      return;
    }

    if (pinStep === 'enter') {
      if (pin.length < 4) {
        const next = pin + val;
        setPin(next);
        if (next.length === 4) {
          setPinStep('confirm');
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const next = confirmPin + val;
        setConfirmPin(next);
        if (next.length === 4) {
          finalizePin(next);
        }
      }
    }
  };

  // Finalize MPIN on Server
  const finalizePin = async (confirmed: string) => {
    if (pin !== confirmed) {
      setErrorMessage('PINs do not match. Please re-enter.');
      setConfirmPin('');
      setPinStep('enter');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. In dev/mock fallback: direct register
      const deviceLabel = Platform.OS === 'android' ? 'Android Device' : Platform.OS === 'ios' ? 'iPhone' : 'Mobile Web';
      const mockDevId = 'dev-' + Date.now();
      await saveTokensAndDevice(mockDevId, 'access-token-placeholder', 'refresh-token-placeholder');

      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save MPIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={[
                styles.progressSegment,
                s <= step && styles.progressSegmentActive,
                highContrast && s <= step && styles.progressHighContrast,
              ]}
            />
          ))}
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.stepLabel, highContrast && styles.highContrastSubText]}>
            STEP {step} OF 5
          </Text>
          <Text style={[styles.stepTitle, highContrast && styles.highContrastText]}>
            {step === 1 && 'Enter Mobile Number'}
            {step === 2 && 'Verify Mobile OTP'}
            {step === 3 && 'Your Profile Details'}
            {step === 4 && 'Your Health Privacy & Consent'}
            {step === 5 && (pinStep === 'enter' ? 'Set 4-Digit MPIN' : 'Confirm 4-Digit MPIN')}
          </Text>
        </View>

        {/* Error / Info alerts */}
        {errorMessage && (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>⚠ {errorMessage}</Text>
          </View>
        )}
        {infoMessage && (
          <View style={styles.alertInfo}>
            <Text style={styles.alertInfoText}>ℹ {infoMessage}</Text>
          </View>
        )}

        {/* STEP 1: Phone */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText]}>
              10-Digit Mobile Number
            </Text>
            <View style={styles.phoneInputRow}>
              <Text style={styles.prefixText}>+91</Text>
              <TextInput
                keyboardType="phone-pad"
                placeholder="98765 43210"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                style={[styles.phoneInput, highContrast && styles.inputHighContrast]}
              />
            </View>

            <TouchableOpacity
              onPress={handleRequestOtp}
              disabled={loading || phone.length < 10}
              style={[styles.actionBtn, phone.length < 10 && styles.btnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.actionBtnText}>Send OTP (ఓటీపీ పంపండి) →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText]}>
              Enter 6-Digit OTP Code
            </Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor="#94a3b8"
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
              style={[styles.otpInput, highContrast && styles.inputHighContrast]}
            />

            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              style={[styles.actionBtn, otp.length < 4 && styles.btnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.actionBtnText}>Verify OTP →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Profile */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText]}>
              Full Name (పేరు)
            </Text>
            <TextInput
              placeholder="e.g. Sita Ramulu"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={[styles.textInput, highContrast && styles.inputHighContrast]}
            />

            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText, { marginTop: 12 }]}>
              Age (వయస్సు)
            </Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="e.g. 64"
              placeholderTextColor="#94a3b8"
              value={age}
              onChangeText={setAge}
              style={[styles.textInput, highContrast && styles.inputHighContrast]}
            />

            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText, { marginTop: 12 }]}>
              Usage Mode
            </Text>
            <View style={styles.usageRow}>
              <TouchableOpacity
                onPress={() => setUsage('self')}
                style={[styles.usageBtn, usage === 'self' && styles.usageBtnActive]}
              >
                <Text style={[styles.usageTitle, usage === 'self' && styles.usageTitleActive]}>
                  👤 For Myself
                </Text>
                <Text style={styles.usageSubtitle}>My own health reports</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setUsage('caregiver')}
                style={[styles.usageBtn, usage === 'caregiver' && styles.usageBtnActive]}
              >
                <Text style={[styles.usageTitle, usage === 'caregiver' && styles.usageTitleActive]}>
                  👨‍👩‍👦 For Family
                </Text>
                <Text style={styles.usageSubtitle}>Caregiver managing elders</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSaveProfile} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Next: Privacy & Consent →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: DPDP Consent */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={[styles.consentIntro, highContrast && styles.highContrastSubText]}>
              Under India&apos;s Digital Personal Data Protection (DPDP) Act 2023, please review and approve the following:
            </Text>

            <TouchableOpacity
              onPress={() => setConsentExtraction(!consentExtraction)}
              style={styles.consentItem}
            >
              <Text style={styles.checkbox}>{consentExtraction ? '☑' : '☐'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.consentItemTitle, highContrast && styles.highContrastText]}>
                  Report Simplification & OCR <Text style={{ color: '#e11d48' }}>(Required)</Text>
                </Text>
                <Text style={styles.consentItemDesc}>
                  Extract values and translate medical jargon into simple 5th-grade analogies.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setConsentTts(!consentTts)}
              style={styles.consentItem}
            >
              <Text style={styles.checkbox}>{consentTts ? '☑' : '☐'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.consentItemTitle, highContrast && styles.highContrastText]}>
                  Spoken Audio Synthesis (TTS)
                </Text>
                <Text style={styles.consentItemDesc}>
                  Hear the explanation read aloud in your mother tongue.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setConsentEscalation(!consentEscalation)}
              style={styles.consentItem}
            >
              <Text style={styles.checkbox}>{consentEscalation ? '☑' : '☐'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.consentItemTitle, highContrast && styles.highContrastText]}>
                  ASHA Health Worker Emergency Alert <Text style={{ color: '#e11d48' }}>(Required)</Text>
                </Text>
                <Text style={styles.consentItemDesc}>
                  Route critical findings directly to local health worker backup.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAcceptConsent} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Approve & Choose 4-Digit MPIN →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: 4-Digit MPIN Keypad */}
        {step === 5 && (
          <View style={styles.stepContent}>
            {/* Dots */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((i) => {
                const current = pinStep === 'enter' ? pin : confirmPin;
                const isFilled = i < current.length;
                return (
                  <View
                    key={i}
                    style={[
                      styles.pinDot,
                      isFilled && styles.pinDotFilled,
                      highContrast && styles.pinDotHighContrast,
                      highContrast && isFilled && styles.pinDotHighContrastFilled,
                    ]}
                  >
                    <Text style={styles.pinDotText}>{isFilled ? '●' : ''}</Text>
                  </View>
                );
              })}
            </View>

            {/* Keypad */}
            <View style={styles.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'].map((k, idx) => (
                <TouchableOpacity
                  key={idx}
                  disabled={!k}
                  onPress={() => handleKeypadPress(k)}
                  style={[
                    styles.keypadBtn,
                    !k && { opacity: 0 },
                    highContrast && styles.keypadBtnHighContrast,
                  ]}
                >
                  <Text style={[styles.keypadText, highContrast && styles.highContrastText]}>
                    {k === 'backspace' ? '⌫' : k}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  progressSegmentActive: {
    backgroundColor: '#16a34a',
  },
  progressHighContrast: {
    backgroundColor: '#22c55e',
  },
  header: {
    marginVertical: 14,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#16a34a',
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 4,
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubText: {
    color: '#cbd5e1',
  },
  alertError: {
    backgroundColor: '#ffe4e6',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertErrorText: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '700',
  },
  alertInfo: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertInfoText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  stepContent: {
    marginTop: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    height: 58,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748b',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  otpInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    height: 58,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#0f172a',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    height: 54,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
    color: '#ffffff',
  },
  usageRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  usageBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    padding: 12,
  },
  usageBtnActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  usageTitleActive: {
    color: '#16a34a',
  },
  usageSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  consentIntro: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 18,
  },
  consentItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
    alignItems: 'center',
  },
  checkbox: {
    fontSize: 22,
    color: '#16a34a',
  },
  consentItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  consentItemDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: '#16a34a',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 18,
  },
  pinDot: {
    width: 54,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotFilled: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  pinDotHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  pinDotHighContrastFilled: {
    borderColor: '#22c55e',
    backgroundColor: '#022c22',
  },
  pinDotText: {
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
  keypadBtn: {
    width: 86,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  keypadBtnHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
});
