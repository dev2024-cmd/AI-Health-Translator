import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SUPPORTED_LANGUAGES, LanguageConfig } from '@ai-health/shared';
import { useVoicePrompt } from '../hooks/useVoicePrompt.js';
import { useAppConfig } from './_layout.js';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { language, setLanguage, highContrast } = useAppConfig();
  const { speak } = useVoicePrompt();
  const [selected, setSelected] = useState<string>(language);

  const handleTilePress = (lang: LanguageConfig) => {
    setSelected(lang.code);
    // Play spoken sample in that language
    speak(lang.sampleAudioText, lang.code);
  };

  const handleConfirm = () => {
    setLanguage(selected);
    router.back();
  };

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <View style={styles.headerNotice}>
        <Text style={[styles.heading, highContrast && styles.highContrastText]}>
          Choose Your Language
        </Text>
        <Text style={[styles.subheading, highContrast && styles.highContrastSubtext]}>
          Tap any language tile to hear a spoken sample aloud.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isCurrent = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.75}
              onPress={() => handleTilePress(lang)}
              style={[
                styles.langTile,
                isCurrent && styles.activeTile,
                highContrast && styles.highContrastTile,
                highContrast && isCurrent && styles.highContrastActiveTile,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${lang.name}, ${lang.nativeName}`}
            >
              <Text
                style={[
                  styles.nativeText,
                  isCurrent && styles.activeNativeText,
                  highContrast && styles.highContrastText,
                ]}
              >
                {lang.nativeName}
              </Text>
              <Text
                style={[
                  styles.englishText,
                  isCurrent && styles.activeEnglishText,
                  highContrast && styles.highContrastSubtext,
                ]}
              >
                {lang.name}
              </Text>
              {isCurrent && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingBadgeText}>🔊 Speaking Sample</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Confirmation Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleConfirm}
          style={[styles.confirmBtn, highContrast && styles.highContrastConfirmBtn]}
          accessibilityRole="button"
          accessibilityLabel="Save language choice"
        >
          <Text style={styles.confirmBtnText}>Save Language & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  headerNotice: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  subheading: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubtext: {
    color: '#cbd5e1',
  },
  gridContainer: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 90,
  },
  langTile: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activeTile: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  highContrastTile: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  highContrastActiveTile: {
    borderColor: '#4ade80',
    borderWidth: 3,
  },
  nativeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  activeNativeText: {
    color: '#15803d',
  },
  englishText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  activeEnglishText: {
    color: '#166534',
  },
  playingBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
  },
  playingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#14532d',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  confirmBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  highContrastConfirmBtn: {
    backgroundColor: '#ffffff',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
