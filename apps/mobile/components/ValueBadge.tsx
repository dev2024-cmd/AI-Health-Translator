import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type FlagType = 'normal' | 'low' | 'high' | 'critical';

interface ValueBadgeProps {
  flag: FlagType;
}

export const ValueBadge: React.FC<ValueBadgeProps> = ({ flag }) => {
  const getBadgeConfig = () => {
    switch (flag) {
      case 'normal':
        return {
          label: 'Normal',
          icon: '✓',
          bg: '#dcfce7',
          border: '#86efac',
          text: '#14532d',
        };
      case 'low':
        return {
          label: 'Low',
          icon: '↓',
          bg: '#fef3c7',
          border: '#fde047',
          text: '#78350f',
        };
      case 'high':
        return {
          label: 'High',
          icon: '↑',
          bg: '#ffedd5',
          border: '#fdba74',
          text: '#7c2d12',
        };
      case 'critical':
        return {
          label: 'See Doctor',
          icon: '⚠',
          bg: '#fee2e2',
          border: '#fca5a5',
          text: '#7f1d1d',
        };
      default:
        return {
          label: 'Normal',
          icon: '✓',
          bg: '#f1f5f9',
          border: '#cbd5e1',
          text: '#334155',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${config.label}`}
    >
      <Text style={[styles.icon, { color: config.text }]}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  icon: {
    fontSize: 12,
    fontWeight: '900',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
