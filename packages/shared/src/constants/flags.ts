import { FlagType } from '../types/index.js';

export interface FlagMetadata {
  type: FlagType;
  label: string;
  colorHex: string;
  bgColorHex: string;
  iconName: string; // e.g. check-circle, arrow-down-circle, alert-triangle, alert-octagon
  description: string;
}

export const FLAG_METADATA: Record<FlagType, FlagMetadata> = {
  normal: {
    type: 'normal',
    label: 'Normal',
    colorHex: '#16a34a', // green-600
    bgColorHex: '#dcfce7', // green-100
    iconName: 'checkmark-circle',
    description: 'This value is within the standard healthy reference range.',
  },
  low: {
    type: 'low',
    label: 'Low',
    colorHex: '#d97706', // amber-600
    bgColorHex: '#fef3c7', // amber-100
    iconName: 'arrow-down-circle',
    description: 'This value is lower than normal. Watch and discuss with your doctor.',
  },
  high: {
    type: 'high',
    label: 'High',
    colorHex: '#ea580c', // orange-600
    bgColorHex: '#ffedd5', // orange-100
    iconName: 'arrow-up-circle',
    description: 'This value is higher than normal. Watch and discuss with your doctor.',
  },
  critical: {
    type: 'critical',
    label: 'Consult Doctor',
    colorHex: '#dc2626', // red-600
    bgColorHex: '#fee2e2', // red-100
    iconName: 'alert-circle',
    description: 'This value requires prompt medical attention. Contact a health worker or doctor.',
  },
};
