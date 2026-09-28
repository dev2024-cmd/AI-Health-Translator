import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useAppConfig } from '../_layout';
import { useOfflineStore, MobileReport } from '../../hooks/useOfflineStore';

const GREETINGS: Record<string, { morning: string; afternoon: string; evening: string }> = {
  en: { morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening' },
  te: { morning: 'శుభోదయం', afternoon: 'శుభ మధ్యాహ్నం', evening: 'శుభ సాయంత్రం' },
  hi: { morning: 'सुप्रभात', afternoon: 'शुभ दोपहर', evening: 'शुभ संध्या' },
  ta: { morning: 'காலை வணக்கம்', afternoon: 'மதிய வணக்கம்', evening: 'மாலை வணக்கம்' },
  bn: { morning: 'সুপ্রভাত', afternoon: 'শুভ অপরাহ্ন', evening: 'শুভ সন্ধ্যা' },
};

export default function MobileDashboard() {
  const router = useRouter();
  const { language, highContrast, fontScale } = useAppConfig();
  const { reports } = useOfflineStore();

  const [selectedPatient, setSelectedPatient] = useState('all');
  const [isSpeakingGreeting, setIsSpeakingGreeting] = useState(false);

  // Time of day calculation
  const hour = new Date().getHours();
  const timeKey = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : 'evening';
  const greetingObj = GREETINGS[language] || GREETINGS['en'];
  const localizedGreeting = greetingObj[timeKey];
  const userName = 'Sita Ramulu';

  const patients = [
    { id: 'all', name: 'All Family (అందరూ)' },
    { id: 'pat-1', name: 'Sita Ramulu (Father)' },
    { id: 'pat-2', name: 'Lakshmi Devi (Mother)' },
    { id: 'pat-3', name: 'Ramesh Patel (Grandfather)' },
  ];

  // Statistics
  const totalAnalyzed = reports.length;
  let criticalCount = 0;
  let attentionCount = 0;
  reports.forEach((r: MobileReport) => {
    r.extracted_values.forEach((v: any) => {
      if (v.flag === 'critical') criticalCount++;
      else if (v.flag === 'low' || v.flag === 'high') attentionCount++;
    });
  });

  const handleSpeakGreeting = () => {
    if (isSpeakingGreeting) {
      Speech.stop();
      setIsSpeakingGreeting(false);
      return;
    }

    const greetingText =
      language === 'te'
        ? `${localizedGreeting} ${userName} గారు! భారత స్వస్థ్ కి స్వాగతం. మీరు ${totalAnalyzed} వైద్య నివేదికలను విశ్లేషించారు. ${criticalCount > 0 ? `${criticalCount} ముఖ్యమైన విలువలు ఉన్నాయి, జాగ్రత్తగా ఉండండి.` : 'అన్నీ సాధారణంగా ఉన్నాయి.'}`
        : language === 'hi'
        ? `${localizedGreeting} ${userName} जी! भारत स्वस्थ में आपका स्वागत है। आपके पास ${totalAnalyzed} मेडिकल रिपोर्ट हैं।`
        : `${localizedGreeting}, ${userName}! Welcome to Bharat Swasth. You have ${totalAnalyzed} health reports on file.`;

    Speech.stop();
    setIsSpeakingGreeting(true);
    Speech.speak(greetingText, {
      language,
      rate: 0.85,
      onDone: () => setIsSpeakingGreeting(false),
      onError: () => setIsSpeakingGreeting(false),
    });
  };

  const handleSpeakReport = (summary: string) => {
    Speech.stop();
    Speech.speak(summary, { language, rate: 0.85 });
  };

  return (
    <SafeAreaView style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar: Bharat Swasth Logo, Greeting, Speaker */}
        <View style={styles.topHeader}>
          <View style={styles.userRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 46, height: 46, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' }}
              resizeMode="contain"
            />
            <View style={{ marginLeft: 10 }}>
              <View style={styles.greetingRow}>
                <Text style={[styles.greetingText, highContrast && styles.highContrastText]}>
                  {localizedGreeting},
                </Text>
                {/* Speaker icon that reads greeting & summary aloud */}
                <TouchableOpacity
                  onPress={handleSpeakGreeting}
                  style={styles.speakerBtn}
                  accessibilityLabel="Read greeting and summary aloud"
                >
                  <Text style={styles.speakerIcon}>{isSpeakingGreeting ? '⏸' : '🔊'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.userName, highContrast && styles.highContrastText]}>
                {userName} గారు
              </Text>
              <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '800' }}>
                Bharat Swasth • Your Health, Simplified.
              </Text>
            </View>
          </View>

          {/* Right Header: Language Chip & Bell */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push('/language-select')}
              style={styles.langChip}
            >
              <Text style={styles.langChipText}>🌐 {language.toUpperCase()}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bellBtn}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
              {criticalCount > 0 && <View style={styles.bellBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Patient Switcher Pill Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patientPillsRow}>
          {patients.map((p) => {
            const isSelected = selectedPatient === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedPatient(p.id)}
                style={[
                  styles.patientPill,
                  isSelected && styles.patientPillActive,
                  highContrast && styles.pillHighContrast,
                  highContrast && isSelected && styles.pillHighContrastActive,
                ]}
              >
                <Text
                  style={[
                    styles.patientPillText,
                    isSelected && styles.patientPillTextActive,
                    highContrast && styles.highContrastText,
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Summary Cards */}
        <View style={styles.statsRow}>
          {/* Card 1: Reports Analysed */}
          <View style={[styles.statCard, highContrast && styles.cardHighContrast]}>
            <Text style={styles.statLabel}>REPORTS</Text>
            <Text style={[styles.statValue, highContrast && styles.highContrastText]}>
              {totalAnalyzed}
            </Text>
            <Text style={styles.statSub}>✓ Voice Ready</Text>
          </View>

          {/* Card 2: Attention Items */}
          <View style={[styles.statCard, highContrast && styles.cardHighContrast]}>
            <Text style={styles.statLabel}>ATTENTION</Text>
            <Text style={[styles.statValue, { color: '#e11d48' }]}>
              {criticalCount + attentionCount}
            </Text>
            <Text style={styles.statSub}>{criticalCount} Critical</Text>
          </View>

          {/* Card 3: Escalation */}
          <View style={[styles.statCard, highContrast && styles.cardHighContrast]}>
            <Text style={styles.statLabel}>ASHA BACKUP</Text>
            <Text style={[styles.statValue, { color: '#0d9488' }]}>Active</Text>
            <Text style={styles.statSub}>ANM Sunita Rao</Text>
          </View>
        </View>

        {/* Two Large Primary Gradient Action Tiles */}
        <View style={styles.primaryTilesBox}>
          {/* Tile 1: Scan New Report (Emerald) */}
          <TouchableOpacity
            onPress={() => router.push('/scan')}
            activeOpacity={0.88}
            style={[styles.actionTile, styles.scanTile]}
          >
            <View style={styles.tileHeaderRow}>
              <View style={styles.tileIconBox}>
                <Text style={styles.tileEmoji}>📸</Text>
              </View>
              <View style={styles.uploadBadge}>
                <Text style={styles.uploadBadgeText}>+ UPLOAD</Text>
              </View>
            </View>
            <Text style={styles.tileTitle}>Scan New Report (రిపోర్ట్ స్కాన్)</Text>
            <Text style={styles.tileSubtitle}>
              Photograph lab reports or blood tests with auto-crop & multi-page scan
            </Text>
            <View style={styles.tileActionBadge}>
              <Text style={styles.tileBadgeText}>Open Camera →</Text>
            </View>
          </TouchableOpacity>

          {/* Tile 2: Translate Prescription (Violet/Purple) */}
          <TouchableOpacity
            onPress={() => router.push('/scan')}
            activeOpacity={0.88}
            style={[styles.actionTile, styles.prescriptionTile]}
          >
            <View style={styles.tileHeaderRow}>
              <View style={styles.tileIconBox}>
                <Text style={styles.tileEmoji}>📋</Text>
              </View>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>✨ NEW</Text>
              </View>
            </View>
            <Text style={styles.tileTitle}>Translate Prescription (ప్రిస్క్రిప్షన్)</Text>
            <Text style={styles.tileSubtitle}>
              Doctor's handwritten prescriptions translated into simple dosage guides safely
            </Text>
            <View style={styles.tileActionBadge}>
              <Text style={[styles.tileBadgeText, { color: '#6d28d9' }]}>Translate Prescription →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Reports List */}
        <View style={styles.recentReportsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, highContrast && styles.highContrastText]}>
              Recent Reports (ఇటీవలి నివేదికలు)
            </Text>
            <TouchableOpacity onPress={() => router.push('/reports')}>
              <Text style={styles.viewAllText}>View All ({reports.length}) →</Text>
            </TouchableOpacity>
          </View>

          {reports.length === 0 ? (
            <View style={[styles.emptyBox, highContrast && styles.cardHighContrast]}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📄</Text>
              <Text style={[styles.emptyTitle, highContrast && styles.highContrastText]}>
                No reports yet. Scan your first report.
              </Text>
              <Text style={styles.emptySubtitle}>
                మొదటి నివేదికను స్కాన్ చేయండి
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/scan')}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Scan Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {reports.slice(0, 3).map((r: MobileReport) => {
                const hasCritical = r.extracted_values.some((v: any) => v.flag === 'critical');
                const hasAbnormal = r.extracted_values.some((v: any) => v.flag === 'low' || v.flag === 'high');

                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => router.push(`/report/${r.id}`)}
                    activeOpacity={0.8}
                    style={[styles.reportCard, highContrast && styles.cardHighContrast]}
                  >
                    <View style={styles.reportCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reportTitle, highContrast && styles.highContrastText]}>
                          {r.test_title}
                        </Text>
                        <Text style={styles.reportMeta}>
                          {r.patient_name} • {r.date}
                        </Text>
                      </View>

                      {/* Status Badges */}
                      {hasCritical ? (
                        <View style={styles.badgeCritical}>
                          <Text style={styles.badgeCriticalText}>● Critical</Text>
                        </View>
                      ) : hasAbnormal ? (
                        <View style={styles.badgeAttention}>
                          <Text style={styles.badgeAttentionText}>▲ Attention</Text>
                        </View>
                      ) : (
                        <View style={styles.badgeNormal}>
                          <Text style={styles.badgeNormalText}>✓ Normal</Text>
                        </View>
                      )}
                    </View>

                    {/* Listen Button */}
                    <View style={styles.reportCardBottom}>
                      <TouchableOpacity
                        onPress={() => handleSpeakReport(r.plain_explanation[language] || r.plain_explanation['en'])}
                        style={styles.listenBtn}
                      >
                        <Text style={styles.listenBtnIcon}>🔊</Text>
                        <Text style={styles.listenBtnText}>Listen (వినండి)</Text>
                      </TouchableOpacity>

                      <Text style={styles.detailsLink}>View Details →</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
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
    padding: 18,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  speakerBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
  },
  speakerIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  highContrastText: {
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  bellBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  patientPillsRow: {
    marginVertical: 14,
  },
  patientPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  patientPillActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  pillHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  pillHighContrastActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  patientPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  patientPillTextActive: {
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 2,
  },
  statSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  primaryTilesBox: {
    gap: 14,
    marginVertical: 14,
  },
  actionTile: {
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  scanTile: {
    backgroundColor: '#059669',
  },
  prescriptionTile: {
    backgroundColor: '#7c3aed',
  },
  uploadTile: {
    backgroundColor: '#0d9488',
  },
  tileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  uploadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  newBadge: {
    backgroundColor: '#fef08a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#713f12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: {
    fontSize: 24,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  tileSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    lineHeight: 16,
  },
  tileActionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 12,
  },
  tileBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0f172a',
  },
  recentReportsSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reportCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  reportMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badgeCritical: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeCriticalText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#e11d48',
  },
  badgeAttention: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeAttentionText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#d97706',
  },
  badgeNormal: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeNormalText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#16a34a',
  },
  reportCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  listenBtnIcon: {
    fontSize: 14,
  },
  listenBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  detailsLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
});
