import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePinAuth } from '../../hooks/usePinAuth';
import { useAppConfig } from '../_layout';

const API_BASE = 'http://localhost:8000/v1';

export default function ForgotPinScreen() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();
  const { deviceId, saveTokensAndDevice } = usePinAuth();

  const [step, setStep] = useState<'phone' | 'otp_and_pin'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Request OTP for Reset
  const handleRequestResetOtp = async () => {
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

      setInfoMessage(`Reset OTP sent to ${data.phone_masked}${data.dev_otp ? ` (Dev: ${data.dev_otp})` : ''}`);
      setStep('otp_and_pin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Reset with Fresh OTP & New MPIN
  const handleResetPinSubmit = async () => {
    if (otp.length < 4) {
      setErrorMessage('Please enter the received OTP code.');
      return;
    }
    if (newPin.length !== 4) {
      setErrorMessage('New MPIN must be 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMessage('New PINs do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/pin/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          otp_code: otp,
          device_id: deviceId || 'dev-' + Date.now(),
          new_pin: newPin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed');

      await saveTokensAndDevice(data.device_id, data.access_token, data.refresh_token);
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'PIN reset error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>🔄</Text>
          <Text style={[styles.title, highContrast && styles.highContrastText]}>
            Reset Your 4-Digit MPIN
          </Text>
          <Text style={[styles.subtitle, highContrast && styles.highContrastSubText]}>
            Requires a fresh OTP sent to your registered phone number.
          </Text>
        </View>

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

        {step === 'phone' ? (
          <View style={styles.card}>
            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText]}>
              Registered Mobile Number
            </Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="98765 43210"
              placeholderTextColor="#94a3b8"
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              style={[styles.input, highContrast && styles.inputHighContrast]}
            />

            <TouchableOpacity
              onPress={handleRequestResetOtp}
              disabled={loading || phone.length < 10}
              style={[styles.btn, phone.length < 10 && styles.btnDisabled]}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Send Reset OTP →</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText]}>
              Enter 6-Digit OTP Code
            </Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor="#94a3b8"
              value={otp}
              onChangeText={setOtp}
              style={[styles.input, highContrast && styles.inputHighContrast]}
            />

            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText, { marginTop: 12 }]}>
              New 4-Digit MPIN
            </Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor="#94a3b8"
              value={newPin}
              onChangeText={setNewPin}
              style={[styles.input, highContrast && styles.inputHighContrast]}
            />

            <Text style={[styles.fieldLabel, highContrast && styles.highContrastSubText, { marginTop: 12 }]}>
              Confirm New 4-Digit MPIN
            </Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor="#94a3b8"
              value={confirmPin}
              onChangeText={setConfirmPin}
              style={[styles.input, highContrast && styles.inputHighContrast]}
            />

            <TouchableOpacity
              onPress={handleResetPinSubmit}
              disabled={loading || newPin.length !== 4 || confirmPin.length !== 4}
              style={styles.btn}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Reset PIN & Unlock →</Text>}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Sign In</Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginVertical: 18,
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
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
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    height: 52,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
    color: '#ffffff',
  },
  btn: {
    backgroundColor: '#16a34a',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  backBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
});
