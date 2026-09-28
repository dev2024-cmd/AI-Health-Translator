import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppConfig } from './_layout';
import { GiantButton } from '../components/GiantButton';

export default function CaregiverScreen() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();

  const [parentName, setParentName] = useState<string>('Sita Ramulu');
  const [relationship, setRelationship] = useState<string>('Father');
  const [parentPhone, setParentPhone] = useState<string>('+91 98765 43210');
  const [smsDelivery, setSmsDelivery] = useState<boolean>(true);
  const [voiceCallSummary, setVoiceCallSummary] = useState<boolean>(true);
  const [dpdpConsentGiven, setDpdpConsentGiven] = useState<boolean>(true);

  const handleSaveProfile = () => {
    Alert.alert(
      'Profile Saved',
      `Caregiver settings updated for ${parentName} (${relationship}). Voice summaries and SMS updates will be delivered in the chosen language.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
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
      {/* Intro info box */}
      <View style={[styles.infoCard, highContrast && styles.highContrastCard]}>
        <Text style={styles.infoIcon}>🛡️</Text>
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, highContrast && styles.highContrastText]}>
            Caregiver Mode
          </Text>
          <Text style={[styles.infoSubtitle, highContrast && styles.highContrastSubtext]}>
            Manage and translate medical reports on behalf of your elderly or rural family members.
          </Text>
        </View>
      </View>

      {/* Parent Information Section */}
      <View style={[styles.section, highContrast && styles.highContrastCard]}>
        <Text style={[styles.sectionTitle, highContrast && styles.highContrastText]}>
          Parent / Dependent Profile
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, highContrast && styles.highContrastText]}>Full Name</Text>
          <TextInput
            style={[styles.input, highContrast && styles.highContrastInput]}
            value={parentName}
            onChangeText={setParentName}
            placeholder="e.g. Sita Ramulu"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, highContrast && styles.highContrastText]}>Relationship</Text>
          <TextInput
            style={[styles.input, highContrast && styles.highContrastInput]}
            value={relationship}
            onChangeText={setRelationship}
            placeholder="e.g. Father, Mother, Aunt"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, highContrast && styles.highContrastText]}>
            Parent Phone Number (for SMS / Voice Call)
          </Text>
          <TextInput
            style={[styles.input, highContrast && styles.highContrastInput]}
            value={parentPhone}
            onChangeText={setParentPhone}
            keyboardType="phone-pad"
            placeholder="+91 98765 43210"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* Automated Delivery Channels */}
      <View style={[styles.section, highContrast && styles.highContrastCard]}>
        <Text style={[styles.sectionTitle, highContrast && styles.highContrastText]}>
          Parent Notification Channels
        </Text>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={[styles.switchTitle, highContrast && styles.highContrastText]}>
              Send SMS Summary
            </Text>
            <Text style={[styles.switchSubtitle, highContrast && styles.highContrastSubtext]}>
              Deliver short translated text summary to parent's phone
            </Text>
          </View>
          <Switch
            value={smsDelivery}
            onValueChange={setSmsDelivery}
            trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={[styles.switchTitle, highContrast && styles.highContrastText]}>
              Automated IVR Voice Call
            </Text>
            <Text style={[styles.switchSubtitle, highContrast && styles.highContrastSubtext]}>
              Call parent to speak the report aloud in their language
            </Text>
          </View>
          <Switch
            value={voiceCallSummary}
            onValueChange={setVoiceCallSummary}
            trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
          />
        </View>
      </View>

      {/* DPDP Act 2023 Consent Gate */}
      <View style={[styles.section, highContrast && styles.highContrastCard]}>
        <Text style={[styles.sectionTitle, highContrast && styles.highContrastText]}>
          DPDP Act 2023 Compliance & Consent
        </Text>
        <Text style={[styles.consentDescription, highContrast && styles.highContrastSubtext]}>
          Under Section 6 of India's Digital Personal Data Protection Act, health data processing requires explicit informed consent.
        </Text>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={[styles.switchTitle, highContrast && styles.highContrastText]}>
              Parent Consent on File
            </Text>
            <Text style={[styles.switchSubtitle, highContrast && styles.highContrastSubtext]}>
              Verified consent recorded for processing medical reports
            </Text>
          </View>
          <Switch
            value={dpdpConsentGiven}
            onValueChange={setDpdpConsentGiven}
            trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
          />
        </View>
      </View>

      {/* Community Health Worker info */}
      <View style={[styles.healthWorkerCard, highContrast && styles.highContrastCard]}>
        <Text style={styles.healthWorkerIcon}>🩺</Text>
        <View style={styles.healthWorkerInfo}>
          <Text style={[styles.healthWorkerTitle, highContrast && styles.highContrastText]}>
            Assigned Community Health Worker
          </Text>
          <Text style={styles.healthWorkerName}>Lakshmi Devi (ASHA Worker)</Text>
          <Text style={[styles.healthWorkerSub, highContrast && styles.highContrastSubtext]}>
            PHC Chandanagar, Sector 4 • Verified
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <GiantButton
          title="Save Caregiver Profile"
          subtitle="Apply parent settings"
          icon={<Text style={styles.saveIcon}>💾</Text>}
          onPress={handleSaveProfile}
          variant="primary"
          accessibilityLabel="Save caregiver settings"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#f8fafc',
    paddingBottom: 40,
  },
  highContrastBg: {
    backgroundColor: '#000000',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    fontSize: 28,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
  },
  infoSubtitle: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 2,
    lineHeight: 17,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  highContrastCard: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
  },
  highContrastInput: {
    backgroundColor: '#262626',
    borderColor: '#ffffff',
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  consentDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  healthWorkerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 12,
  },
  healthWorkerIcon: {
    fontSize: 30,
  },
  healthWorkerInfo: {
    flex: 1,
  },
  healthWorkerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
    textTransform: 'uppercase',
  },
  healthWorkerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  healthWorkerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  saveContainer: {
    marginTop: 8,
  },
  saveIcon: {
    fontSize: 22,
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubtext: {
    color: '#94a3b8',
  },
});
