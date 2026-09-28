import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppConfig } from '../_layout';
import { useVoicePrompt } from '../../hooks/useVoicePrompt';
import { MOCK_OFFLINE_REPORTS } from '../../hooks/useOfflineStore';
import { ValueBadge } from '../../components/ValueBadge';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { GiantButton } from '../../components/GiantButton';

export default function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, highContrast, fontScale, setFontScale } = useAppConfig();
  const { speak, stop } = useVoicePrompt();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'0.8x' | '1.0x'>('0.8x');

  // Find report or fallback to first
  const report =
    MOCK_OFFLINE_REPORTS.find((r) => r.id === id) || MOCK_OFFLINE_REPORTS[0];

  const plainText =
    report.plain_explanation[language] ||
    report.plain_explanation['en'] ||
    'Report explanation unavailable.';

  // Spoken voice guidance on screen load
  useEffect(() => {
    // Autoplay audio on load (vital for rural/low-literacy users)
    const isSlow = playbackSpeed === '0.8x';
    speak(plainText, language, isSlow);
    setIsPlaying(true);

    return () => {
      stop();
    };
  }, [language, playbackSpeed]);

  const toggleAudio = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      speak(plainText, language, playbackSpeed === '0.8x');
      setIsPlaying(true);
    }
  };

  const handleHealthWorkerCall = () => {
    Alert.alert(
      'Request Health Worker Callback',
      `Would you like a community health worker to review your ${report.test_title} and call you with advice?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Call Now',
          onPress: () => {
            Alert.alert(
              'Request Sent',
              'An accredited ASHA worker has been notified and will call you within 30 minutes.'
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        highContrast && styles.highContrastBg,
      ]}
    >
      {/* Header card with test title, patient, and date */}
      <View style={[styles.headerCard, highContrast && styles.highContrastCard]}>
        <View style={styles.headerTop}>
          <Text style={[styles.testTitle, highContrast && styles.highContrastText]}>
            {report.test_title}
          </Text>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>Verified Lab</Text>
          </View>
        </View>
        <Text style={[styles.patientMeta, highContrast && styles.highContrastSubtext]}>
          👤 {report.patient_name} • 📅 {report.date}
        </Text>
      </View>

      {/* AUDIO PLAYER CONTROLS (prominent, high-priority for low-literacy) */}
      <View style={[styles.audioCard, highContrast && styles.highContrastAudio]}>
        <View style={styles.audioTopRow}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playingButton]}
            onPress={toggleAudio}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause spoken explanation' : 'Play spoken explanation'}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Pause Audio' : 'Listen Aloud'}
            </Text>
          </TouchableOpacity>

          {/* 0.8x / 1.0x Speed Toggle */}
          <TouchableOpacity
            style={styles.speedButton}
            onPress={() =>
              setPlaybackSpeed(playbackSpeed === '0.8x' ? '1.0x' : '0.8x')
            }
            accessibilityRole="button"
            accessibilityLabel={`Audio Speed: ${playbackSpeed}`}
          >
            <Text style={styles.speedText}>
              {playbackSpeed === '0.8x' ? '🐢 Slow (0.8x)' : '⚡ Normal (1.0x)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Text Size (A-, A, A+) Adjuster */}
        <View style={styles.fontControlsRow}>
          <Text style={[styles.fontLabel, highContrast && styles.highContrastText]}>
            Text Size:
          </Text>
          <View style={styles.fontButtons}>
            <TouchableOpacity
              style={[styles.fontBtn, fontScale === 0.9 && styles.fontBtnActive]}
              onPress={() => setFontScale(0.9)}
              accessibilityLabel="Small text"
            >
              <Text style={styles.fontBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fontBtn, fontScale === 1.0 && styles.fontBtnActive]}
              onPress={() => setFontScale(1.0)}
              accessibilityLabel="Normal text"
            >
              <Text style={styles.fontBtnText}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fontBtn, fontScale === 1.25 && styles.fontBtnActive]}
              onPress={() => setFontScale(1.25)}
              accessibilityLabel="Large text"
            >
              <Text style={styles.fontBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* PLAIN-LANGUAGE EXPLANATION */}
      <View style={[styles.sectionCard, highContrast && styles.highContrastCard]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💬</Text>
          <Text style={[styles.sectionTitle, highContrast && styles.highContrastText]}>
            Simple Plain-Language Explanation
          </Text>
        </View>
        <Text
          style={[
            styles.explanationText,
            { fontSize: 16 * fontScale, lineHeight: 26 * fontScale },
            highContrast && styles.highContrastText,
          ]}
        >
          {plainText}
        </Text>
      </View>

      {/* EXTRACTED TEST VALUES WITH NORMAL/LOW/HIGH BADGES */}
      <View style={[styles.sectionCard, highContrast && styles.highContrastCard]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📊</Text>
          <Text style={[styles.sectionTitle, highContrast && styles.highContrastText]}>
            Test Measurements
          </Text>
        </View>

        <View style={styles.valuesList}>
          {report.extracted_values.map((val) => (
            <View
              key={val.id}
              style={[styles.valueRow, highContrast && styles.highContrastRow]}
            >
              <View style={styles.valueInfo}>
                <Text style={[styles.valueName, highContrast && styles.highContrastText]}>
                  {val.test_name}
                </Text>
                <Text style={styles.referenceText}>
                  Normal:{' '}
                  {val.ref_low !== null && val.ref_high !== null
                    ? `${val.ref_low} - ${val.ref_high} ${val.unit}`
                    : 'Standard'}
                </Text>
              </View>

              <View style={styles.valueResult}>
                <Text style={[styles.metricNumber, highContrast && styles.highContrastText]}>
                  {val.value} <Text style={styles.metricUnit}>{val.unit}</Text>
                </Text>
                <ValueBadge flag={val.flag} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* MANDATORY MEDICAL DISCLAIMER */}
      <DisclaimerBanner languageCode={language} />

      {/* PRIMARY ACTION: Talk to Health Worker */}
      <View style={styles.actionContainer}>
        <GiantButton
          title="Talk to Health Worker"
          subtitle="Request free phone call to explain this report"
          icon={<Text style={styles.btnIcon}>📞</Text>}
          onPress={handleHealthWorkerCall}
          variant="accent"
          isGiant={false}
          accessibilityLabel="Call Community Health Worker"
        />

        <TouchableOpacity
          style={[styles.backButton, highContrast && styles.highContrastBtn]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to previous screen"
        >
          <Text style={[styles.backButtonText, highContrast && styles.highContrastText]}>
            ← Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#f8fafc',
    paddingBottom: 40,
  },
  highContrastBg: {
    backgroundColor: '#000000',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  highContrastCard: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
  },
  tagPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  patientMeta: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 6,
  },
  audioCard: {
    backgroundColor: '#047857',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  highContrastAudio: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  audioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  playingButton: {
    backgroundColor: '#059669',
  },
  playIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  playButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  speedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
  },
  speedText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  fontControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  fontLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '700',
  },
  fontButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fontBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fontBtnActive: {
    backgroundColor: '#ffffff',
  },
  fontBtnText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  explanationText: {
    color: '#334155',
    fontWeight: '500',
  },
  valuesList: {
    gap: 10,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  highContrastRow: {
    borderBottomColor: '#333333',
  },
  valueInfo: {
    flex: 1,
  },
  valueName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  referenceText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  valueResult: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  actionContainer: {
    marginTop: 8,
    gap: 8,
  },
  btnIcon: {
    fontSize: 22,
  },
  backButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    marginTop: 4,
  },
  highContrastBtn: {
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubtext: {
    color: '#94a3b8',
  },
});
