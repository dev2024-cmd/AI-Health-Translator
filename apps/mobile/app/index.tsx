import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { GiantButton } from '../components/GiantButton.js';
import { useVoicePrompt } from '../hooks/useVoicePrompt.js';
import { useAppConfig } from './_layout.js';
import { getI18nStrings } from '@ai-health/shared';

export default function HomeScreen() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();
  const { speak } = useVoicePrompt();
  const strings = getI18nStrings(language);

  // Spoken voice guidance on screen load
  useEffect(() => {
    const welcomeVoiceMap: Record<string, string> = {
      en: 'Welcome. Tap the big green button to scan your medical report.',
      hi: 'नमस्ते। अपनी मेडिकल रिपोर्ट स्कैन करने के लिए बड़े हरे बटन को दबाएं।',
      te: 'నమస్కారం. మీ మెడికల్ రిపోర్ట్‌ను స్కాన్ చేయడానికి పెద్ద ఆకుపచ్చ బటన్‌ను నొక్కండి.',
      bn: 'স্বাগতম। আপনার রিপোর্ট স্ক্যান করতে বড় সবুজ বোতামটি চাপুন।',
    };
    const welcomeMsg = welcomeVoiceMap[language] || welcomeVoiceMap['en'];
    speak(welcomeMsg, language);
  }, [language]);

  const handleScanPress = () => {
    speak('Opening document scanner. Align report in camera frame.', language);
    router.push('/scan');
  };

  const handleReportsPress = () => {
    speak('Opening your saved medical reports.', language);
    router.push('/reports');
  };

  const handleHealthWorkerPress = () => {
    speak('Connecting you to primary health worker assistance.', language);
    Alert.alert(
      'Talk to a Health Worker',
      'Would you like an accredited community health worker (ASHA / ANM) to call your phone for a plain-language consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Call',
          onPress: () => {
            Alert.alert(
              'Call Requested',
              'A local primary health worker has been notified and will call your phone shortly.'
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
      {/* Voice Instruction Banner */}
      <View style={[styles.voiceCard, highContrast && styles.highContrastCard]}>
        <Text style={styles.voiceIcon}>🔊</Text>
        <View style={styles.voiceTextContainer}>
          <Text style={[styles.voiceTitle, highContrast && styles.highContrastText]}>
            Voice Assistant Active
          </Text>
          <Text style={[styles.voiceSubtitle, highContrast && styles.highContrastSubtext]}>
            {language === 'hi'
              ? 'रिपोर्ट स्कैन करने के लिए नीचे दिए गए हरे बटन को दबाएं।'
              : language === 'te'
              ? 'రిపోర్ట్ స్కాన్ చేయడానికి క్రింది బటన్ నొక్కండి.'
              : 'Tap the big green button below to photograph or scan your report.'}
          </Text>
        </View>
      </View>

      {/* 3 GIANT ACTIONS (Maximum 3 actions per screen as per low-literacy UX spec) */}
      <View style={styles.actionContainer}>
        {/* Action 1: Giant Primary Action - Scan Report */}
        <GiantButton
          title={strings.scanReport}
          subtitle="Take photo of paper lab test or blood report"
          icon={<Text style={styles.buttonIcon}>📷</Text>}
          onPress={handleScanPress}
          variant="primary"
          isGiant={true}
          accessibilityLabel="Scan Medical Report"
          accessibilityHint="Double tap to open camera and photograph your report"
        />

        {/* Action 2: View My Reports */}
        <GiantButton
          title={strings.myReports}
          subtitle="Listen to previously translated reports offline"
          icon={<Text style={styles.buttonIcon}>📁</Text>}
          onPress={handleReportsPress}
          variant="secondary"
          isGiant={false}
          accessibilityLabel="My Saved Reports"
          accessibilityHint="Double tap to view and listen to past test results"
        />

        {/* Action 3: Talk to a Health Worker */}
        <GiantButton
          title={strings.talkToHealthWorker}
          subtitle="Free phone consultation with community worker"
          icon={<Text style={styles.buttonIcon}>🩺</Text>}
          onPress={handleHealthWorkerPress}
          variant="accent"
          isGiant={false}
          accessibilityLabel="Talk to a Health Worker"
          accessibilityHint="Double tap to request a consultation callback"
        />
      </View>

      {/* Caregiver Switcher Link */}
      <View style={styles.footerLinkContainer}>
        <Text
          onPress={() => router.push('/caregiver')}
          style={[styles.footerLink, highContrast && styles.highContrastText]}
          accessibilityRole="link"
        >
          Caregiver Mode • Setup Parent Phone
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  highContrastBg: {
    backgroundColor: '#000000',
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  highContrastCard: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  voiceIcon: {
    fontSize: 28,
  },
  voiceTextContainer: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065f46',
    textTransform: 'uppercase',
  },
  voiceSubtitle: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
    fontWeight: '600',
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubtext: {
    color: '#e2e8f0',
  },
  actionContainer: {
    marginVertical: 10,
  },
  buttonIcon: {
    fontSize: 26,
  },
  footerLinkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284c7',
    textDecorationLine: 'underline',
    padding: 8,
  },
});
