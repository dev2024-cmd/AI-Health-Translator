import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';

interface CreateNewSheetProps {
  visible: boolean;
  onClose: () => void;
  highContrast?: boolean;
}

export const CreateNewSheet: React.FC<CreateNewSheetProps> = ({
  visible,
  onClose,
  highContrast = false,
}) => {
  const router = useRouter();

  const handleAction = (type: 'camera' | 'gallery' | 'pdf') => {
    onClose();
    if (type === 'camera') {
      router.push('/scan');
    } else {
      router.push('/scan');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheetContainer, highContrast && styles.sheetHighContrast]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={[styles.title, highContrast && styles.highContrastText]}>
            Create New (కొత్తది జోడించండి)
          </Text>
          <Text style={[styles.subtitle, highContrast && styles.highContrastSubText]}>
            Add a medical lab report or handwritten doctor prescription
          </Text>

          <View style={styles.optionsList}>
            {/* 1. Scan with Camera */}
            <TouchableOpacity
              onPress={() => handleAction('camera')}
              activeOpacity={0.8}
              style={[styles.optionBtn, highContrast && styles.optionBtnHighContrast]}
            >
              <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                <Text style={styles.icon}>📸</Text>
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.optionTitle, highContrast && styles.highContrastText]}>
                  Scan with Camera (కెమెరాతో స్కాన్)
                </Text>
                <Text style={styles.optionDesc}>
                  Capture page by page with auto-alignment & blur detection
                </Text>
              </View>
            </TouchableOpacity>

            {/* 2. Choose Photo */}
            <TouchableOpacity
              onPress={() => handleAction('gallery')}
              activeOpacity={0.8}
              style={[styles.optionBtn, highContrast && styles.optionBtnHighContrast]}
            >
              <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                <Text style={styles.icon}>🖼️</Text>
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.optionTitle, highContrast && styles.highContrastText]}>
                  Choose Photo from Gallery
                </Text>
                <Text style={styles.optionDesc}>
                  Select saved report photos (JPG, PNG) from phone storage
                </Text>
              </View>
            </TouchableOpacity>

            {/* 3. Choose PDF */}
            <TouchableOpacity
              onPress={() => handleAction('pdf')}
              activeOpacity={0.8}
              style={[styles.optionBtn, highContrast && styles.optionBtnHighContrast]}
            >
              <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                <Text style={styles.icon}>📑</Text>
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.optionTitle, highContrast && styles.highContrastText]}>
                  Choose PDF Document
                </Text>
                <Text style={styles.optionDesc}>
                  Upload digital multi-page lab reports directly
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelBtnText, highContrast && styles.highContrastText]}>
              Cancel (రద్దు చేయండి)
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubText: {
    color: '#94a3b8',
  },
  optionsList: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  optionBtnHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 14,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
});
