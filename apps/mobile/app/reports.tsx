import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppConfig } from './_layout';
import { useVoicePrompt } from '../hooks/useVoicePrompt';
import { MOCK_OFFLINE_REPORTS, MobileReport } from '../hooks/useOfflineStore';
import { ValueBadge } from '../components/ValueBadge';

export default function ReportsListScreen() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();
  const { speak, stop } = useVoicePrompt();

  useEffect(() => {
    const promptMap: Record<string, string> = {
      en: 'Showing your saved medical reports. Tap any card to open or tap Listen to hear the summary.',
      hi: 'आपकी सहेजी गई मेडिकल रिपोर्टें। पूरा विवरण देखने के लिए कार्ड पर टैप करें।',
      te: 'మీ సేవ్ చేసిన మెడికల్ రిపోర్టులు. వినడానికి కార్డుపై నొక్కండి.',
      bn: 'আপনার সংরক্ষিত রিপোর্টসমূহ। শুনতে বা দেখতে কার্ডে চাপুন।',
    };
    const prompt = promptMap[language] || promptMap['en'];
    speak(prompt, language);

    return () => stop();
  }, [language]);

  const handleListenReport = (report: MobileReport) => {
    const text =
      report.plain_explanation[language] ||
      report.plain_explanation['en'] ||
      'No explanation available.';
    speak(text, language, true);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        highContrast && styles.highContrastBg,
      ]}
    >
      {/* Offline Status Banner */}
      <View style={[styles.offlineBanner, highContrast && styles.highContrastBanner]}>
        <Text style={styles.offlineIcon}>📡</Text>
        <View style={styles.offlineTextContainer}>
          <Text style={[styles.offlineTitle, highContrast && styles.highContrastText]}>
            Offline Storage Active
          </Text>
          <Text style={[styles.offlineSubtitle, highContrast && styles.highContrastSubtext]}>
            All past translated reports & explanations are saved locally on your phone.
          </Text>
        </View>
      </View>

      <Text style={[styles.heading, highContrast && styles.highContrastText]}>
        Saved Medical Reports ({MOCK_OFFLINE_REPORTS.length})
      </Text>

      {/* Reports List */}
      <View style={styles.list}>
        {MOCK_OFFLINE_REPORTS.map((report) => {
          // Count flags
          const flagsCount = report.extracted_values.reduce(
            (acc, val) => {
              acc[val.flag] = (acc[val.flag] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          return (
            <View
              key={report.id}
              style={[styles.card, highContrast && styles.highContrastCard]}
            >
              <TouchableOpacity
                onPress={() => router.push(`/report/${report.id}`)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Open report: ${report.test_title}`}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerInfo}>
                    <Text style={[styles.testTitle, highContrast && styles.highContrastText]}>
                      {report.test_title}
                    </Text>
                    <Text style={[styles.patientMeta, highContrast && styles.highContrastSubtext]}>
                      👤 {report.patient_name} • 📅 {report.date}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>→</Text>
                </View>

                {/* Flags summary */}
                <View style={styles.flagsRow}>
                  {flagsCount['critical'] ? (
                    <ValueBadge flag="critical" />
                  ) : null}
                  {flagsCount['high'] ? <ValueBadge flag="high" /> : null}
                  {flagsCount['low'] ? <ValueBadge flag="low" /> : null}
                  {flagsCount['normal'] ? <ValueBadge flag="normal" /> : null}
                </View>

                {/* Preview text */}
                <Text
                  numberOfLines={2}
                  style={[styles.previewText, highContrast && styles.highContrastSubtext]}
                >
                  {report.plain_explanation[language] ||
                    report.plain_explanation['en']}
                </Text>
              </TouchableOpacity>

              {/* Bottom Card Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.listenBtn, highContrast && styles.highContrastBtn]}
                  onPress={() => handleListenReport(report)}
                  accessibilityRole="button"
                  accessibilityLabel={`Listen to explanation for ${report.test_title}`}
                >
                  <Text style={styles.listenIcon}>🔊</Text>
                  <Text style={[styles.listenText, highContrast && styles.highContrastText]}>
                    Listen Aloud
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewDetailBtn}
                  onPress={() => router.push(`/report/${report.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel="View full report"
                >
                  <Text style={styles.viewDetailText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  highContrastBanner: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  offlineIcon: {
    fontSize: 26,
  },
  offlineTextContainer: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e40af',
    textTransform: 'uppercase',
  },
  offlineSubtitle: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 2,
    fontWeight: '500',
  },
  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 14,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  highContrastCard: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  patientMeta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '700',
    marginLeft: 8,
  },
  flagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  previewText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  highContrastBtn: {
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  listenIcon: {
    fontSize: 15,
  },
  listenText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  viewDetailBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  viewDetailText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubtext: {
    color: '#94a3b8',
  },
});
