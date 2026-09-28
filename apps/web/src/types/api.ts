export type FlagType = 'normal' | 'low' | 'high' | 'critical';

export interface ExtractedValueItem {
  id: string;
  test_name: string;
  value: number;
  unit: string;
  ref_low: number | null;
  ref_high: number | null;
  flag: FlagType;
  page: number;
}

export interface WebReport {
  id: string;
  patient_name: string;
  patient_id: string;
  patient_age: number;
  patient_gender: string;
  test_title: string;
  date: string;
  source: 'app' | 'web' | 'whatsapp' | 'health_worker';
  status: 'uploaded' | 'ocr' | 'extracting' | 'ready' | 'failed';
  original_language: string;
  audio_available: boolean;
  plain_explanation: Record<string, string>; // language code -> text
  extracted_values: ExtractedValueItem[];
  file_name: string;
  file_type: string;
}

export interface EscalationTicket {
  id: string;
  report_id: string;
  patient_name: string;
  patient_phone: string;
  caregiver_phone: string;
  preferred_language: string;
  region: string;
  reason: string;
  critical_values: string[];
  status: 'open' | 'assigned' | 'resolved';
  assigned_worker: string | null;
  notes: string | null;
  created_at: string;
}

export const INITIAL_REPORTS: WebReport[] = [
  {
    id: 'rep-cbc-01',
    patient_name: 'Sita Ramulu (Father)',
    patient_id: 'pat-1',
    patient_age: 64,
    patient_gender: 'Male',
    test_title: 'Complete Blood Count (CBC)',
    date: '2026-09-28',
    source: 'app',
    status: 'ready',
    original_language: 'en',
    audio_available: true,
    file_name: 'cbc_blood_report.pdf',
    file_type: 'application/pdf',
    plain_explanation: {
      en: 'Your red blood cell count and hemoglobin [Hemoglobin] are slightly lower than the healthy reference range. Hemoglobin is the protein that carries oxygen to all parts of your body. When it is low, you might feel more tired than usual. Your white blood cells [WBC] and platelets [Platelets] are in the safe, healthy zone.',
      hi: 'आपके रक्त में हीमोग्लोबिन [Hemoglobin] और लाल रक्त कोशिकाओं की संख्या सामान्य से थोड़ी कम है। हीमोग्लोबिन आपके पूरे शरीर में ऑक्सीजन पहुंचाने का काम करता है। इसके कम होने से आपको थोड़ी थकान महसूस हो सकती है। आपकी रोग प्रतिरोधक कोशिकाएं (WBC) और प्लेटलेट्स बिल्कुल सुरक्षित और सामान्य स्तर पर हैं।',
      te: 'మీ రక్తంలో హిమోగ్లోబిన్ [Hemoglobin] మరియు ఎర్ర రక్త కణాల సంఖ్య సాధారణ స్థాయి కంటే కొద్దిగా తక్కువగా ఉంది. హిమోగ్లోబిన్ మీ శరీరమంతటా ఆక్సిజన్‌ను మోసుకెళ్ళే ప్రోటీన్. ఇది తక్కువగా ఉన్నప్పుడు అలసట అనిపించవచ్చు. మీ తెల్ల రక్త కణాలు మరియు ప్లేట్‌లెట్లు పూర్తి సురక్షిత పరిధిలో ఉన్నాయి.',
      bn: 'আপনার রক্তে হিমোগ্লোবিন [Hemoglobin] এবং লোহিত রক্তকণিকার পরিমাণ স্বাভাবিকের চেয়ে কিছুটা কম। হিমোগ্লোবিনের কাজ হলো সারা শরীরে অক্সিজেন পৌঁছে দেওয়া। এটি কম থাকলে দুর্বল বা ক্লান্ত লাগতে পারে। আপনার শ্বেত রক্তকণিকা ও প্লাটিলেট সম্পূর্ণ স্বাভাবিক অবস্থায় রয়েছে।',
    },
    extracted_values: [
      { id: 'v1', test_name: 'Hemoglobin', value: 11.2, unit: 'g/dL', ref_low: 13.0, ref_high: 17.0, flag: 'low', page: 1 },
      { id: 'v2', test_name: 'RBC Count', value: 4.1, unit: 'mil/uL', ref_low: 4.5, ref_high: 5.5, flag: 'low', page: 1 },
      { id: 'v3', test_name: 'WBC Count (TLC)', value: 8500, unit: 'cells/mcL', ref_low: 4000, ref_high: 11000, flag: 'normal', page: 1 },
      { id: 'v4', test_name: 'Platelet Count', value: 180000, unit: '/mcL', ref_low: 150000, ref_high: 450000, flag: 'normal', page: 1 },
      { id: 'v5', test_name: 'Packed Cell Volume (PCV)', value: 34.5, unit: '%', ref_low: 40.0, ref_high: 50.0, flag: 'low', page: 1 },
      { id: 'v6', test_name: 'Mean Corpuscular Vol (MCV)', value: 82.0, unit: 'fL', ref_low: 80.0, ref_high: 100.0, flag: 'normal', page: 1 },
    ],
  },
  {
    id: 'rep-lipid-02',
    patient_name: 'Ramesh Patel (Grandfather)',
    patient_id: 'pat-2',
    patient_age: 68,
    patient_gender: 'Male',
    test_title: 'Lipid Profile (Cholesterol Panel)',
    date: '2026-09-27',
    source: 'web',
    status: 'ready',
    original_language: 'en',
    audio_available: true,
    file_name: 'lipid_profile_scan.jpg',
    file_type: 'image/jpeg',
    plain_explanation: {
      en: 'Your total cholesterol [Total Cholesterol] and bad cholesterol [LDL Cholesterol] are above the recommended healthy limits. These fats can build up inside your blood vessels over time. Your good cholesterol [HDL Cholesterol] is slightly low. We recommend discussing diet and lifestyle adjustments with your doctor.',
      hi: 'आपकी रिपोर्ट में कुल कोलेस्ट्रॉल [Total Cholesterol] और खराब कोलेस्ट्रॉल [LDL Cholesterol] सामान्य सीमा से अधिक है। यह वसा समय के साथ रक्त नलिकाओं में जमा हो सकती है। आपका अच्छा कोलेस्ट्रॉल [HDL Cholesterol] थोड़ा कम है। अपने डॉक्टर से खान-पान और जीवनशैली के बारे में अवश्य परामर्श लें।',
      te: 'మీ రక్తంలో మొత్తం కొలెస్ట్రాల్ [Total Cholesterol] మరియు హానికరమైన కొలెస్ట్రాల్ [LDL Cholesterol] సాధారణ పరిమితి కంటే ఎక్కువగా ఉన్నాయి. మంచి కొలెస్ట్రాల్ [HDL Cholesterol] కొద్దిగా తక్కువగా ఉంది. ఆహార నియమాల కోసం వైద్యుడిని సంప్రదించండి.',
      bn: 'আপনার রক্তে মোট কোলেস্টেরল [Total Cholesterol] এবং ক্ষতিকর কোলেস্টেরল [LDL Cholesterol] নির্ধারিত মাত্রার চেয়ে বেশি। ভালো কোলেস্টেরল [HDL Cholesterol] কিছুটা কম। খাদ্যাভ্যাস সম্পর্কে চিকিৎসকের পরামর্শ নেওয়া উচিত।',
    },
    extracted_values: [
      { id: 'v7', test_name: 'Total Cholesterol', value: 235.0, unit: 'mg/dL', ref_low: 125.0, ref_high: 200.0, flag: 'high', page: 1 },
      { id: 'v8', test_name: 'Triglycerides', value: 190.0, unit: 'mg/dL', ref_low: 50.0, ref_high: 150.0, flag: 'high', page: 1 },
      { id: 'v9', test_name: 'HDL Cholesterol (Good)', value: 38.0, unit: 'mg/dL', ref_low: 40.0, ref_high: 60.0, flag: 'low', page: 1 },
      { id: 'v10', test_name: 'LDL Cholesterol (Bad)', value: 152.0, unit: 'mg/dL', ref_low: 0.0, ref_high: 100.0, flag: 'high', page: 1 },
      { id: 'v11', test_name: 'VLDL Cholesterol', value: 38.0, unit: 'mg/dL', ref_low: 10.0, ref_high: 30.0, flag: 'high', page: 1 },
    ],
  },
  {
    id: 'rep-sugar-03',
    patient_name: 'Lakshmi Devi (Mother)',
    patient_id: 'pat-3',
    patient_age: 61,
    patient_gender: 'Female',
    test_title: 'Diabetic Health Panel (HbA1c & Glucose)',
    date: '2026-09-26',
    source: 'app',
    status: 'ready',
    original_language: 'en',
    audio_available: true,
    file_name: 'blood_sugar_report.png',
    file_type: 'image/png',
    plain_explanation: {
      en: 'Your average 3-month blood sugar [HbA1c] is 8.2%, which is higher than the recommended target of 5.7%. Your morning fasting blood glucose [Fasting Blood Sugar] is also elevated at 174 mg/dL. This means there is more sugar circulating in your bloodstream. Please see your physician promptly for guidance.',
      hi: 'आपके पिछले 3 महीनों का औसत ब्लड शुगर [HbA1c] 8.2% है, जो सामान्य लक्ष्य 5.7% से अधिक है। सुबह खाली पेट की चीनी [Fasting Blood Sugar] भी 174 mg/dL पर बढ़ी हुई है। इसका मतलब है कि रक्त में ग्लूकोज की मात्रा अधिक है। कृपया डॉक्टर से मार्गदर्शन लें।',
      te: 'గత 3 నెలల సగటు బ్లడ్ షుగర్ [HbA1c] 8.2% గా ఉంది, ఇది సాధారణ పరిమితి 5.7% కంటే ఎక్కువ. ఉదయం పరగడుపున రక్తంలో చక్కెర [Fasting Blood Sugar] కూడా 174 mg/dL గా ఉంది. తగిన సలహా కోసం వెంటనే మీ వైద్యుడిని కలవండి.',
      bn: 'আপনার গত ৩ মাসের গড় রক্তের শর্করা [HbA1c] ৮.২%, যা স্বাভাবিক মাত্রা ৫.৭%-এর চেয়ে বেশি। খালি পেটে রক্তের শর্করা [Fasting Blood Sugar] ১৭৪ mg/dL-এ বৃদ্ধি পেয়েছে। অনুগ্রহ করে দ্রুত ডাক্তারের পরামর্শ নিন।',
    },
    extracted_values: [
      { id: 'v12', test_name: 'HbA1c (Glycated Hemoglobin)', value: 8.2, unit: '%', ref_low: 4.0, ref_high: 5.7, flag: 'critical', page: 1 },
      { id: 'v13', test_name: 'Fasting Blood Glucose', value: 174.0, unit: 'mg/dL', ref_low: 70.0, ref_high: 100.0, flag: 'high', page: 1 },
      { id: 'v14', test_name: 'Average Estimated Glucose', value: 189.0, unit: 'mg/dL', ref_low: 90.0, ref_high: 120.0, flag: 'high', page: 1 },
    ],
  },
];

export const INITIAL_ESCALATIONS: EscalationTicket[] = [
  {
    id: 'esc-101',
    report_id: 'rep-sugar-03',
    patient_name: 'Lakshmi Devi (Mother)',
    patient_phone: '+919655544332',
    caregiver_phone: '+919777777777',
    preferred_language: 'te',
    region: 'South Region (Hyderabad / Telangana)',
    reason: 'Critical test value detected: HbA1c is 8.2% with Fasting Glucose 174 mg/dL.',
    critical_values: ['HbA1c: 8.2% (Target: <5.7%)', 'Fasting Blood Glucose: 174 mg/dL'],
    status: 'open',
    assigned_worker: null,
    notes: 'Patient experiences fatigue. Scheduled telephonic wellness check.',
    created_at: '2026-09-28 09:15 AM',
  },
  {
    id: 'esc-102',
    report_id: 'rep-cbc-01',
    patient_name: 'Sita Ramulu (Father)',
    patient_phone: '+919666666666',
    caregiver_phone: '+919777777777',
    preferred_language: 'te',
    region: 'South Region (Warangal)',
    reason: 'Caregiver requested primary health worker review: Low Hemoglobin (11.2 g/dL).',
    critical_values: ['Hemoglobin: 11.2 g/dL (Normal: 13.0 - 17.0)'],
    status: 'assigned',
    assigned_worker: 'Dr. Sunita Rao (ANM)',
    notes: 'Suggested iron-rich dietary consultation and routine follow-up checkup in 2 weeks.',
    created_at: '2026-09-27 04:30 PM',
  },
];
