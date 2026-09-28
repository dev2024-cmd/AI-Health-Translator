import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getI18nStrings } from '@ai-health/shared';

interface DisclaimerBannerProps {
  languageCode: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ languageCode }) => {
  const strings = getI18nStrings(languageCode);

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.heading}>⚠ IMPORTANT MEDICAL DISCLAIMER</Text>
      <Text style={styles.text}>{strings.disclaimer}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  heading: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400e',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    color: '#78350f',
    fontWeight: '500',
  },
});
