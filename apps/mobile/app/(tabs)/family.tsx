import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { useAppConfig } from '../_layout';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  phone: string;
  language: string;
  phoneType: 'smartphone' | 'feature';
}

const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'pat-1',
    name: 'Sita Ramulu',
    relation: 'Father (నాన్నగారు)',
    age: 64,
    phone: '+91 96666 66666',
    language: 'te',
    phoneType: 'feature',
  },
  {
    id: 'pat-2',
    name: 'Lakshmi Devi',
    relation: 'Mother (అమ్మ)',
    age: 61,
    phone: '+91 96555 44332',
    language: 'te',
    phoneType: 'smartphone',
  },
  {
    id: 'pat-3',
    name: 'Ramesh Patel',
    relation: 'Grandfather (తాతయ్య)',
    age: 68,
    phone: '+91 98888 11111',
    language: 'hi',
    phoneType: 'feature',
  },
];

export default function FamilyProfilesScreen() {
  const { language, highContrast } = useAppConfig();
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [memberLang, setMemberLang] = useState('te');
  const [phoneType, setPhoneType] = useState<'smartphone' | 'feature'>('feature');

  const handleAdd = () => {
    if (!name.trim()) return;
    const newM: FamilyMember = {
      id: 'pat-' + Date.now(),
      name: name.trim(),
      relation: relation || 'Family Member',
      age: Number(age) || 50,
      phone: phone || '+91 98765 00000',
      language: memberLang,
      phoneType,
    };
    setMembers([...members, newM]);
    setName('');
    setRelation('');
    setAge('');
    setPhone('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, highContrast && styles.highContrastText]}>
            Family Profiles (కుటుంబ సభ్యులు)
          </Text>
          <Text style={[styles.subtitle, highContrast && styles.highContrastSubText]}>
            Manage elderly dependents and their 2G phone voice alerts
          </Text>
        </View>

        {/* Add Member Floating Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addBtn, highContrast && styles.addBtnHighContrast]}
        >
          <Text style={styles.addBtnText}>+ Add Family Member</Text>
        </TouchableOpacity>

        {/* Member Cards List */}
        <View style={styles.cardsList}>
          {members.map((m) => (
            <View
              key={m.id}
              style={[styles.memberCard, highContrast && styles.cardHighContrast]}
            >
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.memberName, highContrast && styles.highContrastText]}>
                    {m.name}
                  </Text>
                  <Text style={styles.memberRelation}>{m.relation} • {m.age} yrs</Text>
                </View>
                <View style={styles.langPill}>
                  <Text style={styles.langPillText}>{m.language.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📞</Text>
                  <Text style={[styles.infoText, highContrast && styles.highContrastSubText]}>
                    {m.phone}
                  </Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {m.phoneType === 'feature' ? '2G Button Phone' : 'Smartphone'}
                    </Text>
                  </View>
                </View>

                <View style={styles.badgeRow}>
                  <Text style={styles.dpdpTag}>✓ DPDP Consented</Text>
                  <Text style={styles.ashaTag}>ASHA: Sunita Rao</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, highContrast && styles.cardHighContrast]}>
              <Text style={[styles.modalTitle, highContrast && styles.highContrastText]}>
                Add Family Dependent
              </Text>

              <TextInput
                placeholder="Full Name (పేరు)"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                style={[styles.modalInput, highContrast && styles.inputHighContrast]}
              />
              <TextInput
                placeholder="Relation (e.g. Father, Mother)"
                placeholderTextColor="#94a3b8"
                value={relation}
                onChangeText={setRelation}
                style={[styles.modalInput, highContrast && styles.inputHighContrast]}
              />
              <TextInput
                placeholder="Age"
                keyboardType="number-pad"
                placeholderTextColor="#94a3b8"
                value={age}
                onChangeText={setAge}
                style={[styles.modalInput, highContrast && styles.inputHighContrast]}
              />
              <TextInput
                placeholder="Mobile Number (e.g. 98765 43210)"
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={setPhone}
                style={[styles.modalInput, highContrast && styles.inputHighContrast]}
              />

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAdd} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save Member</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginVertical: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubText: {
    color: '#cbd5e1',
  },
  addBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  addBtnHighContrast: {
    backgroundColor: '#22c55e',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  cardsList: {
    gap: 14,
    marginTop: 8,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16a34a',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  memberRelation: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  langPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
  },
  cardBottom: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 13,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  typeBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#334155',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dpdpTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
  },
  ashaTag: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  inputHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
    color: '#ffffff',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
