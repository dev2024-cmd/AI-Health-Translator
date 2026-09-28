import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface GiantButtonProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  isGiant?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const GiantButton: React.FC<GiantButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'primary',
  isGiant = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '#16a34a'; // Emerald green
      case 'secondary':
        return '#0284c7'; // Medical blue
      case 'accent':
        return '#7c3aed'; // Purple
      case 'danger':
        return '#dc2626'; // Red
      default:
        return '#16a34a';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || subtitle}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          minHeight: isGiant ? 90 : 64,
          paddingVertical: isGiant ? 18 : 14,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={[styles.title, isGiant && styles.giantTitle]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 22,
    paddingHorizontal: 22,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  giantTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
});
