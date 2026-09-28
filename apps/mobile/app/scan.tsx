import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppConfig } from './_layout';
import { useVoicePrompt } from '../hooks/useVoicePrompt';

interface PageItem {
  id: string;
  pageNumber: number;
  label: string;
}

export default function ScanScreen() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();
  const { speak } = useVoicePrompt();

  const [docType, setDocType] = useState<'lab_report' | 'prescription'>('lab_report');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<string>('');

  // Real-time quality checks state
  const [lighting, setLighting] = useState<'good' | 'low'>('good');
  const [stability, setStability] = useState<'steady' | 'moving'>('steady');
  const [autoCapture, setAutoCapture] = useState<boolean>(true);

  // Offline queue state
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  useEffect(() => {
    const scanPromptMap: Record<string, string> = {
      en: 'Multi-page scanner ready. Align document within the frame. Hold steady with good lighting.',
      hi: 'दस्तावेज़ स्कैनर तैयार है। दस्तावेज़ को फ्रेम में सीधा रखें और रोशनी अच्छी रखें।',
      te: 'బహుళ పేజీల స్కానర్ సిద్ధంగా ఉంది. డాక్యుమెంట్‌ను ఫ్రేమ్‌లో ఉంచి నిలకడగా పట్టుకోండి.',
      bn: 'মাল্টি-পেজ স্ক্যানার প্রস্তুত। ফ্রেমের মধ্যে নথিটি রাখুন।',
    };
    const prompt = scanPromptMap[language] || scanPromptMap['en'];
    speak(prompt, language);
  }, [language]);

  const handleCapturePage = () => {
    const newPageNum = pages.length + 1;
    const newPage: PageItem = {
      id: 'page-' + Date.now(),
      pageNumber: newPageNum,
      label: `Page ${newPageNum}`,
    };
    setPages((prev) => [...prev, newPage]);

    speak(`Page ${newPageNum} captured. Add another page or tap Done.`, language);
  };

  const handleDeletePage = (id: string) => {
    setPages((prev) =>
      prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, pageNumber: idx + 1, label: `Page ${idx + 1}` }))
    );
  };

  const handleDone = () => {
    if (pages.length === 0) {
      Alert.alert('No Pages Captured', 'Please capture at least one page before proceeding.');
      return;
    }

    setIsProcessing(true);
    speak('Processing all document pages. Running OCR text extraction and safe analysis.', language);

    setPipelineStep(`Running OCR on ${pages.length} pages in order...`);
    setTimeout(() => {
      setPipelineStep(
        docType === 'prescription'
          ? 'Extracting prescribed medicines and checking drug interactions...'
          : 'Concatenating page markers and checking laboratory reference ranges...'
      );
    }, 1400);

    setTimeout(() => {
      setPipelineStep(
        docType === 'prescription'
          ? 'Generating safe daily dosage routine without modifying doctor doses...'
          : 'Simplifying clinical jargon into Grade 5 plain-language...'
      );
    }, 2800);

    setTimeout(() => {
      setIsProcessing(false);
      speak('Analysis complete. Showing report explanation.', language);
      const targetId = docType === 'prescription' ? 'rep-mob-3' : 'rep-mob-1';
      router.replace(`/report/${targetId}`);
    }, 4200);
  };

  const handlePickFile = () => {
    Alert.alert(
      'Document Selected from Device',
      'Clinical_Report_MultiPage.pdf (2 pages) selected.',
      [
        {
          text: 'Add to Pages',
          onPress: () => {
            const p1: PageItem = { id: 'file-p1', pageNumber: pages.length + 1, label: `Page ${pages.length + 1}` };
            const p2: PageItem = { id: 'file-p2', pageNumber: pages.length + 2, label: `Page ${pages.length + 2}` };
            setPages((prev) => [...prev, p1, p2]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, highContrast && styles.highContrastBg]}>
      {isProcessing ? (
        <View style={styles.processingCard}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={[styles.processingTitle, highContrast && styles.highContrastText]}>
            Analyzing Your Document
          </Text>
          <Text style={[styles.processingStep, highContrast && styles.highContrastSubtext]}>
            {pipelineStep}
          </Text>
          <Text style={styles.processingNote}>
            🔒 Your health data is processed privately and securely under DPDP Act 2023.
          </Text>
        </View>
      ) : (
        <>
          {/* Top Bar: Mode Switcher (Lab Report vs Prescription) */}
          <View style={styles.topModeBar}>
            <TouchableOpacity
              onPress={() => setDocType('lab_report')}
              style={[
                styles.modeBtn,
                docType === 'lab_report' && styles.modeBtnActive,
                highContrast && styles.modeBtnHighContrast,
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  docType === 'lab_report' && styles.modeBtnTextActive,
                ]}
              >
                📑 Lab Report
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDocType('prescription')}
              style={[
                styles.modeBtn,
                docType === 'prescription' && styles.modeBtnActivePrescription,
                highContrast && styles.modeBtnHighContrast,
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  docType === 'prescription' && styles.modeBtnTextActive,
                ]}
              >
                📋 Prescription (Rx)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Real-time Quality Guidance Badges */}
          <View style={styles.qualityRow}>
            <TouchableOpacity
              onPress={() => setLighting(lighting === 'good' ? 'low' : 'good')}
              style={[
                styles.qualityBadge,
                lighting === 'low' ? styles.qualityBadgeWarning : styles.qualityBadgeGood,
              ]}
            >
              <Text style={styles.qualityBadgeText}>
                {lighting === 'good' ? '✓ Good Lighting' : '⚠️ Move to brighter area'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStability(stability === 'steady' ? 'moving' : 'steady')}
              style={[
                styles.qualityBadge,
                stability === 'moving' ? styles.qualityBadgeWarning : styles.qualityBadgeGood,
              ]}
            >
              <Text style={styles.qualityBadgeText}>
                {stability === 'steady' ? '✓ Steady' : '⚠️ Hold steady'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAutoCapture(!autoCapture)}
              style={styles.autoCaptureBadge}
            >
              <Text style={styles.autoCaptureText}>
                Auto: {autoCapture ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Viewfinder with Rectangular Document-Guide Overlay & Corner Brackets */}
          <View style={[styles.viewfinder, highContrast && styles.highContrastViewfinder]}>
            {/* Viewfinder 4 Corner Brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <View style={styles.viewfinderCenter}>
              <Text style={styles.viewfinderIcon}>
                {docType === 'prescription' ? '📋' : '📄'}
              </Text>
              <Text style={[styles.viewfinderPrompt, highContrast && styles.highContrastText]}>
                {docType === 'prescription'
                  ? 'Align Doctor Prescription'
                  : 'Align Paper Medical Report'}
              </Text>
              <Text style={styles.viewfinderTip}>
                {docType === 'prescription'
                  ? 'Ensure medication names & doctor instructions fit in frame'
                  : 'Ensure all test names and biological reference ranges are visible'}
              </Text>
            </View>

            {/* Simulated Live Viewfinder Watermark */}
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>CAMERA READY</Text>
            </View>
          </View>

          {/* Multi-Page Bottom Thumbnail Strip */}
          <View style={styles.thumbnailSection}>
            <View style={styles.thumbnailHeader}>
              <Text style={[styles.thumbnailCount, highContrast && styles.highContrastText]}>
                Captured Pages: {pages.length}
              </Text>
              <TouchableOpacity onPress={handlePickFile}>
                <Text style={styles.galleryLink}>+ From Gallery / PDF</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
              {pages.length === 0 ? (
                <View style={styles.emptyStrip}>
                  <Text style={styles.emptyStripText}>
                    No pages captured yet. Tap the shutter button below.
                  </Text>
                </View>
              ) : (
                pages.map((p) => (
                  <View key={p.id} style={styles.thumbnailItem}>
                    <View style={styles.thumbnailBox}>
                      <Text style={styles.thumbnailPageNum}>{p.label}</Text>
                      <Text style={{ fontSize: 24 }}>📄</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletePage(p.id)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* Shutter & Multi-Page Actions */}
          <View style={styles.actionSection}>
            <View style={styles.shutterRow}>
              {/* Add Page Shutter Button */}
              <TouchableOpacity
                onPress={handleCapturePage}
                activeOpacity={0.85}
                style={[styles.shutterBtn, highContrast && styles.shutterBtnHighContrast]}
                accessibilityLabel="Capture page"
              >
                <Text style={styles.shutterIcon}>📸</Text>
                <Text style={styles.shutterText}>
                  {pages.length === 0 ? 'Capture Page 1' : `+ Add Page ${pages.length + 1}`}
                </Text>
              </TouchableOpacity>

              {/* Done Button */}
              <TouchableOpacity
                onPress={handleDone}
                disabled={pages.length === 0}
                activeOpacity={0.85}
                style={[
                  styles.doneBtn,
                  pages.length === 0 && styles.doneBtnDisabled,
                  docType === 'prescription' && styles.doneBtnPrescription,
                ]}
                accessibilityLabel="Finish and analyze document"
              >
                <Text style={styles.doneBtnText}>
                  Done ({pages.length} {pages.length === 1 ? 'Page' : 'Pages'}) →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
  },
  highContrastBg: {
    backgroundColor: '#000000',
  },
  topModeBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  modeBtnActivePrescription: {
    borderColor: '#9333ea',
    backgroundColor: '#faf5ff',
  },
  modeBtnHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  modeBtnTextActive: {
    color: '#0f172a',
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  qualityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  qualityBadgeGood: {
    backgroundColor: '#dcfce7',
  },
  qualityBadgeWarning: {
    backgroundColor: '#fef08a',
  },
  qualityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  autoCaptureBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  autoCaptureText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  viewfinder: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 240,
  },
  highContrastViewfinder: {
    backgroundColor: '#121212',
    borderColor: '#ffffff',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#16a34a',
  },
  topLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  viewfinderCenter: {
    alignItems: 'center',
    padding: 20,
  },
  viewfinderIcon: {
    fontSize: 44,
    marginBottom: 6,
  },
  viewfinderPrompt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
  },
  viewfinderTip: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 240,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  thumbnailSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  thumbnailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  thumbnailCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  galleryLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
  },
  thumbnailScroll: {
    flexDirection: 'row',
  },
  emptyStrip: {
    paddingVertical: 10,
  },
  emptyStripText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  thumbnailItem: {
    marginRight: 10,
    position: 'relative',
  },
  thumbnailBox: {
    width: 64,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPageNum: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  deleteBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  actionSection: {
    marginTop: 6,
  },
  shutterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shutterBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  shutterBtnHighContrast: {
    backgroundColor: '#22c55e',
  },
  shutterIcon: {
    fontSize: 20,
  },
  shutterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  doneBtn: {
    paddingHorizontal: 20,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnPrescription: {
    backgroundColor: '#7c3aed',
  },
  doneBtnDisabled: {
    opacity: 0.4,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  processingCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  processingStep: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '700',
    textAlign: 'center',
  },
  processingNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
  },
  highContrastText: {
    color: '#ffffff',
  },
  highContrastSubtext: {
    color: '#cbd5e1',
  },
});
