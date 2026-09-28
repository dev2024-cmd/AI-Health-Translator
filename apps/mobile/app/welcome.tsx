import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';
import { useAppConfig } from './_layout';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { language, setLanguage, highContrast } = useAppConfig();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: '📸',
      title: 'Scan Any Report or Prescription',
      desc: 'Snap a clear photo of your lab test or doctor prescription using your camera. We extract the values automatically.',
    },
    {
      icon: '💡',
      title: 'Understand in 5th-Grade Language',
      desc: 'No confusing medical jargon. Complex tests are simplified into friendly analogies with Green, Amber, and Red badges.',
    },
    {
      icon: '🔊',
      title: 'Listen in Your Mother Tongue',
      desc: 'Tap one big button to hear your results read aloud warmly across 22 Indian languages, with 2G button-phone voice backup.',
    },
  ];

  const handleSelectLanguage = (code: string, sampleText: string) => {
    setLanguage(code);
    try {
      Speech.stop();
      Speech.speak(sampleText, { language: code, rate: 0.85 });
    } catch (e) {
      // ignore
    }
  };

  return (
    <SafeAreaView style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Text style={styles.logoBadge}>🏥 SwasthyaAnuvad</Text>
          <Text style={[styles.title, highContrast && styles.highContrastText]}>
            Choose Your Language
          </Text>
          <Text style={[styles.subtitle, highContrast && styles.highContrastSubText]}>
            మీ మాతృభాషను ఎంచుకోండి • अपनी भाषा चुनें
          </Text>
        </View>

        {/* Language Grid (Large Tiles with Native Script and Spoken Sample) */}
        <View style={styles.langGrid}>
          {SUPPORTED_LANGUAGES.slice(0, 10).map((l) => {
            const isSelected = language === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                onPress={() => handleSelectLanguage(l.code, l.sampleAudioText)}
                activeOpacity={0.8}
                style={[
                  styles.langTile,
                  isSelected && styles.langTileSelected,
                  highContrast && styles.langTileHighContrast,
                  highContrast && isSelected && styles.langTileHighContrastSelected,
                ]}
              >
                <Text
                  style={[
                    styles.langNative,
                    isSelected && styles.langNativeSelected,
                    highContrast && styles.highContrastText,
                  ]}
                >
                  {l.nativeName}
                </Text>
                <Text style={styles.langEnglish}>
                  {l.name} {l.ttsAvailable ? '🔊' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Skippable 3-Slide Welcome Carousel */}
        <View style={[styles.carouselContainer, highContrast && styles.carouselHighContrast]}>
          <View style={styles.carouselIconBox}>
            <Text style={styles.carouselIcon}>{slides[currentSlide].icon}</Text>
          </View>
          <Text style={[styles.carouselTitle, highContrast && styles.highContrastText]}>
            {slides[currentSlide].title}
          </Text>
          <Text style={[styles.carouselDesc, highContrast && styles.highContrastSubText]}>
            {slides[currentSlide].desc}
          </Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentSlide(i)}
                style={[styles.dot, i === currentSlide && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons: Sign In / Sign Up */}
        <View style={styles.actionsBox}>
          <TouchableOpacity
            onPress={() => router.push('/auth/sign-up')}
            activeOpacity={0.85}
            style={[styles.primaryBtn, highContrast && styles.primaryBtnHighContrast]}
          >
            <Text style={styles.primaryBtnText}>Get Started (కొత్త ఖాతా / शुरू करें)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/sign-in')}
            activeOpacity={0.85}
            style={[styles.secondaryBtn, highContrast && styles.secondaryBtnHighContrast]}
          >
            <Text style={[styles.secondaryBtnText, highContrast && styles.highContrastText]}>
              Sign In with 4-Digit MPIN (లాగిన్ / साइन इन)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={styles.skipBtn}
          >
            <Text style={styles.skipBtnText}>Skip to Home →</Text>
          </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  logoBadge: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubText: {
    color: '#cbd5e1',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  langTile: {
    width: (width - 50) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  langTileSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  langTileHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  langTileHighContrastSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#0f291e',
  },
  langNative: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  langNativeSelected: {
    color: '#16a34a',
  },
  langEnglish: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  carouselContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginVertical: 12,
  },
  carouselHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  carouselIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  carouselIcon: {
    fontSize: 28,
  },
  carouselTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  carouselDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#16a34a',
  },
  actionsBox: {
    gap: 12,
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnHighContrast: {
    backgroundColor: '#22c55e',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  secondaryBtnHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  secondaryBtnText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '800',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
});
