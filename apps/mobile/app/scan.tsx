import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppConfig } from './_layout';
import { useVoicePrompt } from '../hooks/useVoicePrompt';
import { GiantButton } from '../components/GiantButton';

export default function ScanScreen() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();
  const { speak } = useVoicePrompt();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<string>('');

  useEffect(() => {
    const scanPromptMap: Record<string, string> = {
      en: 'Please hold steady. Point camera at your paper lab report and tap Capture.',
      hi: 'कृपया फोन सीधा रखें। कैमरे को अपनी रिपोर्ट पर रखें और फोटो खींचें।',
      te: 'దయచేసి ఫోన్ నిలకడగా ఉంచండి. రిపోర్ట్ పై కెమెరా ఉంచి ఫోటో తీయండి.',
      bn: 'দয়া করে ক্যামেরা রিপোর্টটির উপর রাখুন এবং ছবি তুলুন।',
    };
    const prompt = scanPromptMap[language] || scanPromptMap['en'];
    speak(prompt, language);
  }, [language]);

  const handleCapture = () => {
    setIsProcessing(true);
    speak('Capturing report. Please wait while we process.', language);

    // Realistic pipeline simulation
    setPipelineStep('Reading text from document (OCR)...');
    setTimeout(() => {
      setPipelineStep('Finding test values & checking normal ranges...');
    }, 1200);

    setTimeout(() => {
      setPipelineStep('Translating into simple plain language...');
    }, 2400);

    setTimeout(() => {
      setIsProcessing(false);
      speak('Analysis complete. Showing report explanation.', language);
      router.replace('/report/rep-mob-1');
    }, 3600);
  };

  const handlePickFile = () => {
    Alert.alert(
      'Document Selected',
      'Blood_Test_CBC_Report_Sept2026.pdf selected. Beginning analysis.',
      [
        {
          text: 'Process Report',
          onPress: handleCapture,
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        highContrast && styles.highContrastBg,
      ]}
    >
      {isProcessing ? (
        <View style={styles.processingCard}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={[styles.processingTitle, highContrast && styles.highContrastText]}>
            Analyzing Your Report
          </Text>
          <Text style={[styles.processingStep, highContrast && styles.highContrastSubtext]}>
            {pipelineStep}
          </Text>
          <Text style={styles.processingNote}>
            🔒 Your health data is processed privately and securely.
          </Text>
        </View>
      ) : (
        <>
          {/* Instructions pill */}
          <View style={[styles.instructionBox, highContrast && styles.highContrastBox]}>
            <Text style={styles.instructionIcon}>💡</Text>
            <Text style={[styles.instructionText, highContrast && styles.highContrastText]}>
              Place the paper report on a flat surface with good lighting.
            </Text>
          </View>

          {/* Viewfinder simulation */}
          <View style={[styles.viewfinder, highContrast && styles.highContrastViewfinder]}>
            {/* Viewfinder corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <View style={styles.viewfinderCenter}>
              <Text style={styles.viewfinderIcon}>📄</Text>
              <Text style={[styles.viewfinderPrompt, highContrast && styles.highContrastText]}>
                Align Medical Report Here
              </Text>
              <Text style={styles.viewfinderTip}>Ensure all text and values are visible</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionSection}>
            <GiantButton
              title="Capture Report"
              subtitle="Take photo now"
              icon={<Text style={styles.buttonIcon}>📸</Text>}
              onPress={handleCapture}
              variant="primary"
              isGiant={true}
              accessibilityLabel="Capture Medical Report"
            />

            <TouchableOpacity
              onPress={handlePickFile}
              style={[styles.secondaryButton, highContrast && styles.highContrastBtn]}
              accessibilityRole="button"
              accessibilityLabel="Upload PDF or photo from gallery"
            >
              <Text style={[styles.secondaryButtonText, highContrast && styles.highContrastText]}>
                📁 Choose File / Photo from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
  },
  highContrastBg: {
    backgroundColor: '#000000',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#7dd3fc',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  highContrastBox: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  instructionIcon: {
    fontSize: 22,
  },
  instructionText: {
    fontSize: 13,
    color: '#0369a1',
    fontWeight: '700',
    flex: 1,
  },
  viewfinder: {
    flex: 1,
    marginVertical: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  highContrastViewfinder: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
    borderStyle: 'solid',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#16a34a',
  },
  topLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 16,
    right: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  viewfinderCenter: {
    alignItems: 'center',
    padding: 20,
  },
  viewfinderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  viewfinderPrompt: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  viewfinderTip: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  actionSection: {
    gap: 10,
  },
  buttonIcon: {
    fontSize: 28,
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  highContrastBtn: {
    backgroundColor: '#262626',
    borderColor: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  processingCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 20,
  },
  processingStep: {
    fontSize: 15,
    color: '#16a34a',
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  processingNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 28,
    textAlign: 'center',
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubtext: {
    color: '#4ade80',
  },
});
