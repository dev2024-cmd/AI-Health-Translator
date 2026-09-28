export interface I18nStrings {
  appTitle: string;
  scanReport: string;
  myReports: string;
  talkToHealthWorker: string;
  disclaimer: string;
  readingSpeedNormal: string;
  readingSpeedSlow: string;
  playAudio: string;
  pauseAudio: string;
  fontSize: string;
  highContrast: string;
  uploadingReport: string;
  processingReport: string;
  criticalNotice: string;
  normalBadge: string;
  lowBadge: string;
  highBadge: string;
  criticalBadge: string;
  consentTitle: string;
  consentBody: string;
  agreeAndContinue: string;
}

export const I18N_RESOURCES: Record<string, I18nStrings> = {
  en: {
    appTitle: 'AI Health Report Translator',
    scanReport: 'Scan Report',
    myReports: 'My Reports',
    talkToHealthWorker: 'Talk to a Health Worker',
    disclaimer:
      'DISCLAIMER: This plain-language explanation is for informational and educational purposes only. It is NOT a medical diagnosis, prescription, or treatment plan. Always consult a qualified doctor or healthcare professional for clinical decisions.',
    readingSpeedNormal: 'Speed: Normal',
    readingSpeedSlow: 'Speed: Slow',
    playAudio: 'Play Explanation',
    pauseAudio: 'Pause',
    fontSize: 'Font Size',
    highContrast: 'High Contrast',
    uploadingReport: 'Uploading your report...',
    processingReport: 'Translating and simplifying your report...',
    criticalNotice: 'One or more values need medical attention. Please consult a doctor.',
    normalBadge: 'Normal',
    lowBadge: 'Low',
    highBadge: 'High',
    criticalBadge: 'See Doctor',
    consentTitle: 'Your Health Privacy & Consent',
    consentBody:
      'We process your medical report solely to extract values, simplify medical jargon into your language, and enable voice assistance under India’s Digital Personal Data Protection (DPDP) Act 2023. We never sell your data.',
    agreeAndContinue: 'I Agree & Continue',
  },
  hi: {
    appTitle: 'एआई स्वास्थ्य रिपोर्ट अनुवादक',
    scanReport: 'रिपोर्ट स्कैन करें',
    myReports: 'मेरी रिपोर्ट',
    talkToHealthWorker: 'स्वास्थ्य कार्यकर्ता से बात करें',
    disclaimer:
      'अस्वीकरण: यह सरल भाषा विवरण केवल जानकारी और समझ के लिए है। यह कोई चिकित्सीय निदान, नुस्खा या उपचार योजना नहीं है। चिकित्सीय सलाह के लिए हमेशा योग्य डॉक्टर से संपर्क करें।',
    readingSpeedNormal: 'गति: सामान्य',
    readingSpeedSlow: 'गति: धीमी',
    playAudio: 'विवरण सुनें',
    pauseAudio: 'रोकें',
    fontSize: 'अक्षर का आकार',
    highContrast: 'उच्च कंट्रास्ट',
    uploadingReport: 'आपकी रिपोर्ट अपलोड हो रही है...',
    processingReport: 'आपकी रिपोर्ट का अनुवाद और सरलीकरण हो रहा है...',
    criticalNotice: 'कुछ जांच परिणामों पर डॉक्टर का ध्यान आवश्यक है।',
    normalBadge: 'सामान्य',
    lowBadge: 'कम',
    highBadge: 'अधिक',
    criticalBadge: 'डॉक्टर से मिलें',
    consentTitle: 'आपकी स्वास्थ्य गोपनीयता एवं सहमति',
    consentBody:
      'हम आपकी मेडिकल रिपोर्ट केवल जांच परिणाम निकालने, सरल भाषा में समझाने और आवाज में सुनाने के लिए डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 के तहत संसाधित करते हैं।',
    agreeAndContinue: 'मैं सहमत हूँ और आगे बढ़ें',
  },
  bn: {
    appTitle: 'এআই স্বাস্থ্য রিপোর্ট অনুবাদক',
    scanReport: 'রিপোর্ট স্ক্যান করুন',
    myReports: 'আমার রিপোর্ট',
    talkToHealthWorker: 'স্বাস্থ্যকর্মীর সাথে কথা বলুন',
    disclaimer:
      'দাবিত্যাগ: এই সহজ ভাষার ব্যাখ্যাটি শুধুমাত্র বোঝার জন্য। এটি কোনও চিকিৎসার রোগ নির্ণয় বা ব্যবস্থাপত্র নয়। চিকিৎসার জন্য সর্বদা চিকিৎসকের পরামর্শ নিন।',
    readingSpeedNormal: 'গতি: সাধারণ',
    readingSpeedSlow: 'গতি: ধীর',
    playAudio: 'ব্যাখ্যা শুনুন',
    pauseAudio: 'থামুন',
    fontSize: 'হরফের আকার',
    highContrast: 'উচ্চ বৈসাদৃশ্য',
    uploadingReport: 'আপনার রিপোর্ট আপলোড হচ্ছে...',
    processingReport: 'আপনার রিপোর্ট অনুবাদ ও সহজ করা হচ্ছে...',
    criticalNotice: 'এক বা একাধিক মানের জন্য ডাক্তারের পরামর্শ প্রয়োজন।',
    normalBadge: 'স্বাভাবিক',
    lowBadge: 'কম',
    highBadge: 'বেশি',
    criticalBadge: 'ডাক্তার দেখান',
    consentTitle: 'আপনার স্বাস্থ্য গোপনীয়তা ও সম্মতি',
    consentBody:
      'আমরা আপনার রিপোর্ট প্রক্রিয়াকরণ করি শুধুমাত্র মান নিষ্কাশন এবং সহজ ভাষায় ব্যাখ্যা করার জন্য। আপনার তথ্য নিরাপদ।',
    agreeAndContinue: 'আমি সম্মত এবং এগিয়ে যান',
  },
  te: {
    appTitle: 'ఏఐ ఆరోగ్య నివేదిక అనువాదకుడు',
    scanReport: 'రిపోర్ట్ స్కాన్ చేయండి',
    myReports: 'నా రిపోర్టులు',
    talkToHealthWorker: 'ఆరోగ్య కార్యకర్తతో మాట్లాడండి',
    disclaimer:
      'హెచ్చరిక: ఈ సరళమైన వివరణ సమాచారం కోసం మాత్రమే. ఇది వైద్య నిర్ధారణ లేదా చికిత్స కాదు. ఎల్లప్పుడూ అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.',
    readingSpeedNormal: 'వేగం: సాధారణం',
    readingSpeedSlow: 'వేగం: నెమ్మదిగా',
    playAudio: 'వివరణ వినండి',
    pauseAudio: 'ఆపండి',
    fontSize: 'అక్షర పరిమాణం',
    highContrast: 'హై కాంట్రాస్ట్',
    uploadingReport: 'మీ రిపోర్ట్ అప్‌లోడ్ అవుతోంది...',
    processingReport: 'మీ రిపోర్ట్ అనువదింపబడుతోంది...',
    criticalNotice: 'కొన్ని పరీక్షల కోసం వైద్యుడిని సంప్రదించడం అవసరం.',
    normalBadge: 'సాధారణం',
    lowBadge: 'తక్కువ',
    highBadge: 'ఎక్కువ',
    criticalBadge: 'డాక్టర్‌ని కలవండి',
    consentTitle: 'మీ ఆరోగ్య గోప్యత & సమ్మతి',
    consentBody:
      'మేము మీ వైద్య నివేదికను సరళమైన భాషలో వివరించడానికి మరియు వాయిస్ సహాయం అందించడానికి మాత్రమే ఉపయోగిస్తాము.',
    agreeAndContinue: 'నేను అంగీకరిస్తున్నాను',
  },
  as: {
    appTitle: 'এআই স্বাস্থ্য প্ৰতিবেদন অনুবাদক',
    scanReport: 'প্ৰতিবেদন স্কেন কৰক',
    myReports: 'মোৰ প্ৰতিবেদনসমূহ',
    talkToHealthWorker: 'স্বাস্থ্যকৰ্মীৰ সৈতে কথা পাতক',
    disclaimer:
      'অস্বীকাৰোক্তি: এই সৰল ভাষাৰ ব্যাখ্যা কেৱল তথ্যৰ বাবেহে। ই কোনো চিকিৎসা নিদান বা প্ৰেছক্ৰিপচন নহয়। চিকিৎসা পৰামৰ্শৰ বাবে সদায় চিকিৎসকৰ ওচৰলৈ যাওক।',
    readingSpeedNormal: 'গতি: স্বাভাৱিক',
    readingSpeedSlow: 'গতি: লেহেমীয়া',
    playAudio: 'ব্যাখ্যা শুনক',
    pauseAudio: 'ৰখাওক',
    fontSize: 'ফণ্টৰ আকাৰ',
    highContrast: 'উচ্চ বৈসাদৃশ্য',
    uploadingReport: 'প্ৰতিবেদন আপলোড হৈ আছে...',
    processingReport: 'প্ৰতিবেদন অনুবাদ আৰু সৰলীকৰণ কৰা হৈ আছে...',
    criticalNotice: 'কিছুমান ফলাফলৰ বাবে চিকিৎসকৰ পৰামৰ্শ প্ৰয়োজন।',
    normalBadge: 'স্বাভাৱিক',
    lowBadge: 'কম',
    highBadge: 'অধিক',
    criticalBadge: 'চিকিৎসকক দেখুৱাওক',
    consentTitle: 'স্বাস্থ্য গোপনীয়তা আৰু সন্মতি',
    consentBody:
      'আমি কেৱল আপোনাৰ প্ৰতিবেদন সৰলকৈ বুজাবলৈ তথ্য ব্যৱহাৰ কৰোঁ। আপোনাৰ তথ্য সুৰক্ষিত।',
    agreeAndContinue: 'মই সন্মত আৰু আগবাঢ়ক',
  },
  ur: {
    appTitle: 'اے آئی ہیلتھ رپورٹ ٹرانسلیٹر',
    scanReport: 'رپورٹ اسکین کریں',
    myReports: 'میری رپورٹس',
    talkToHealthWorker: 'صحت کے کارکن سے بات کریں',
    disclaimer:
      'انتباہ: یہ سادہ وضاحتی خلاصہ صرف تفہیم کے لیے ہے۔ یہ کوئی طبی تشخیص یا علاج نہیں ہے۔ ہمیشہ مستند ڈاکٹر سے رجوع کریں۔',
    readingSpeedNormal: 'رفتار: عام',
    readingSpeedSlow: 'رفتار: دھیمی',
    playAudio: 'وضاحت سنیں',
    pauseAudio: 'روکیں',
    fontSize: 'حروف کا سائز',
    highContrast: 'ہائی کنٹراسٹ',
    uploadingReport: 'رپورٹ اپ لوڈ ہو رہی ہے...',
    processingReport: 'رپورٹ کا ترجمہ کیا جا رہا ہے...',
    criticalNotice: 'کچھ نتائج کے لیے فوری طور پر ڈاکٹر سے مشورہ کریں۔',
    normalBadge: 'معمول',
    lowBadge: 'کم',
    highBadge: 'زیادہ',
    criticalBadge: 'ڈاکٹر کو دکھائیں',
    consentTitle: 'رازداری اور رضامندی',
    consentBody:
      'ہم آپ کی میڈیکل رپورٹ کا ڈیٹا صرف آسان الفاظ میں سمجھانے اور آواز کی سہولت فراہم کرنے کے لیے استعمال کرتے ہیں۔',
    agreeAndContinue: 'میں متفق ہوں',
  },
};

export function getI18nStrings(langCode: string): I18nStrings {
  return I18N_RESOURCES[langCode] || I18N_RESOURCES['en'];
}
