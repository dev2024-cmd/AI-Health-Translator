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
  what_it_is?: string;
  what_it_is_for?: string;
  what_it_will_do?: string;
  how_to_take?: string;
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
  image_url?: string;
  document_type?: 'lab_report' | 'prescription';
  doctor_name?: string;
  doctor_clinic?: string;
  doctor_license?: string;
  doctor_advice?: string;
  follow_up_date?: string;
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
      ta: 'உங்கள் இரத்தத்தில் ஹீமோகுளோபின் [Hemoglobin] மற்றும் சிவப்பு இரத்த அணுக்களின் அளவு இயல்பான அளவை விட சற்று குறைவாக உள்ளது. ஹீமோகுளோபின் என்பது உங்கள் உடல் முழுவதும் ஆக்ஸிஜனைக் கொண்டு செல்லும் முக்கிய புரதமாகும். இது குறைவாக இருக்கும்போது, நீங்கள் வழக்கத்தை விட சற்று சோர்வாக உணரலாம். உங்கள் வெள்ளை இரத்த அணுக்கள் (WBC) மற்றும் பிளேட்லெட்டுகள் பாதுகாப்பான, ஆரோக்கியமான இயல்பான வரம்பில் உள்ளன.',
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
      ta: 'உங்கள் இரத்தத்தில் மொத்த கொலஸ்ட்ரால் [Total Cholesterol] மற்றும் கெட்ட கொலஸ்ட்ரால் [LDL Cholesterol] பரிந்துரைக்கப்பட்ட ஆரோக்கியமான அளவை விட அதிகமாக உள்ளன. இந்த கொழுப்புகள் காலப்போக்கில் இரத்த நாளங்களில் படியக்கூடும். உங்கள் நல்ல கொலஸ்ட்ரால் [HDL Cholesterol] சற்றே குறைவாக உள்ளது. உணவு மற்றும் உடற்பயிற்சி மாற்றங்கள் குறித்து உங்கள் மருத்துவரிடம் ஆலோசனை பெறுமாறு பரிந்துரைக்கிறோம்.',
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
      ta: 'உங்கள் கடந்த 3 மாத சராசரி இரத்த சர்க்கரை அளவு [HbA1c] 8.2% ஆக உள்ளது, இது பரிந்துரைக்கப்பட்ட 5.7% இலக்கை விட அதிகமாகும். உங்கள் காலை வெறும் வயிற்று சர்க்கரை அளவும் [Fasting Blood Sugar] 174 mg/dL ஆக உயர்ந்துள்ளது. இதன் பொருள் இரத்தத்தில் சர்க்கரையின் அளவு அதிகமாக உள்ளது. உடனடியாக தகுந்த ஆலோசனைக்கு உங்கள் மருத்துவரை அணுகவும்.',
      bn: 'আপনার গত ৩ মাসের গড় রক্তের শর্করা [HbA1c] ৮.২%, যা স্বাভাবিক মাত্রা ৫.৭%-এর চেয়ে বেশি। খালি পেটে রক্তের শর্করা [Fasting Blood Sugar] ১৭৪ mg/dL-এ বৃদ্ধি পেয়েছে। অনুগ্রহ করে দ্রুত ডাক্তারের পরামর্শ নিন।',
    },
    extracted_values: [
      { id: 'v12', test_name: 'HbA1c (Glycated Hemoglobin)', value: 8.2, unit: '%', ref_low: 4.0, ref_high: 5.7, flag: 'critical', page: 1 },
      { id: 'v13', test_name: 'Fasting Blood Glucose', value: 174.0, unit: 'mg/dL', ref_low: 70.0, ref_high: 100.0, flag: 'high', page: 1 },
      { id: 'v14', test_name: 'Average Estimated Glucose', value: 189.0, unit: 'mg/dL', ref_low: 90.0, ref_high: 120.0, flag: 'high', page: 1 },
    ],
  },
  {
    id: 'rep-prescription-04',
    patient_name: 'Rajesh Kumar (Demo Patient)',
    patient_id: 'pat-4',
    patient_age: 42,
    patient_gender: 'Male',
    test_title: 'Doctor Prescription (Dr. R. K. Sharma)',
    date: '2026-09-28',
    source: 'web',
    status: 'ready',
    original_language: 'en',
    audio_available: true,
    document_type: 'prescription',
    doctor_name: 'Dr. R. K. Sharma (M.B.B.S, M.D., M.S.)',
    doctor_clinic: 'Clinic Station, Pune',
    doctor_license: 'MH-48291',
    file_name: 'prescription_scan.jpg',
    file_type: 'image/jpeg',
    doctor_advice: 'AVOID OILY AND SPICY FOOD',
    follow_up_date: '12-05-2020',
    extracted_values: [
      {
        id: 'rx-v1',
        test_name: 'Rx: TAB. DEMO MEDICINE 1',
        value: 1,
        unit: '1 Morning, 1 Night (Before Food)',
        ref_low: null,
        ref_high: null,
        flag: 'normal',
        page: 1,
        what_it_is: 'Gastro-Protective Acid Reducer (PPI / Pantoprazole Tablet)',
        what_it_is_for: 'Relieving severe stomach acidity, gastritis, heartburn, and protecting your stomach lining from developing ulcers.',
        what_it_will_do: 'It turns off the tiny acid-producing pumps inside your stomach wall so stomach acid levels drop safely, stopping burning pain and allowing inflamed stomach tissue to heal.',
        how_to_take: 'Take 1 tablet in the morning and 1 tablet at night 30 minutes before food for 10 days.',
      },
      {
        id: 'rx-v2',
        test_name: 'Rx: CAP. DEMO MEDICINE 2',
        value: 2,
        unit: '1 Morning (Before Food)',
        ref_low: null,
        ref_high: null,
        flag: 'normal',
        page: 1,
        what_it_is: 'Anti-Reflux & Digestive Motility Regulator (Prokinetic Capsule)',
        what_it_is_for: 'Treating nausea, heavy bloating, abdominal fullness, and preventing stomach acid and food from traveling backward into your food pipe (acid reflux).',
        what_it_will_do: 'It tightens the muscular valve at the entrance of your stomach and speeds up stomach emptying so food and digestive fluids move smoothly downward into the intestines without reflux.',
        how_to_take: 'Take 1 capsule in the morning 15-30 minutes before breakfast for 10 days.',
      },
      {
        id: 'rx-v3',
        test_name: 'Rx: TAB. DEMO MEDICINE 3',
        value: 3,
        unit: '1 Morning, 1 Aft, 1 Eve, 1 Night (After Food)',
        ref_low: null,
        ref_high: null,
        flag: 'normal',
        page: 1,
        what_it_is: 'Broad-Spectrum Anti-Infective / Antibacterial Tablet',
        what_it_is_for: 'Treating active bacterial infections, destroying harmful bacteria, and preventing infection from spreading in your body.',
        what_it_will_do: 'It directly attacks and breaks down the protective cell walls of infectious bacteria so they cannot replicate and are eliminated by your immune defenses.',
        how_to_take: 'Take 1 tablet four times daily (morning, afternoon, evening, night) after meals for 10 days. Complete the entire course.',
      },
      {
        id: 'rx-v4',
        test_name: 'Rx: TAB. DEMO MEDICINE 4',
        value: 4,
        unit: '1/2 Morning, 1/2 Night (After Food)',
        ref_low: null,
        ref_high: null,
        flag: 'normal',
        page: 1,
        what_it_is: 'Anti-Inflammatory & Pain-Relief Tablet',
        what_it_is_for: 'Reducing internal tissue swelling, inflammation, body aches, and post-illness muscular soreness.',
        what_it_will_do: 'It blocks the production of inflammatory chemical signals in your tissues and breaks down inflammatory fluids so sore areas soothe and heal quickly.',
        how_to_take: 'Take 1/2 tablet in the morning and 1/2 tablet at night after food for 10 days.',
      },
    ],
    plain_explanation: {
      en: `CLINICAL SAFETY & DOCTOR PRESCRIPTION GUIDANCE
Prescribing Doctor: Dr. R. K. Sharma (M.B.B.S, M.D., M.S.)
Patient: Rajesh Kumar (Demo Patient) • Date: 2026-09-28 • Clinic: Clinic Station, Pune

Take each medicine strictly as directed by your physician. Never alter your dosage without medical consultation.

Detailed Medication Breakdown:

1. TAB. DEMO MEDICINE 1 (10 Days Course):
   • What the tablet is: Gastro-Protective Acid Reducer (PPI / Pantoprazole Tablet)
   • What it is for: Relieving severe stomach acidity, gastritis, heartburn, and protecting your stomach lining from developing ulcers.
   • What will it do: It turns off the tiny acid-producing pumps inside your stomach wall so stomach acid levels drop safely, stopping burning pain and allowing inflamed stomach tissue to heal.
   • How & when to take: 1 Morning, 1 Night (Before Food). Take 1 tablet in the morning and 1 tablet at night 30 minutes before food for 10 days.

2. CAP. DEMO MEDICINE 2 (10 Days Course):
   • What the tablet is: Anti-Reflux & Digestive Motility Regulator (Prokinetic Capsule)
   • What it is for: Treating nausea, heavy bloating, abdominal fullness, and preventing stomach acid and food from traveling backward into your food pipe (acid reflux).
   • What will it do: It tightens the muscular valve at the entrance of your stomach and speeds up stomach emptying so food and digestive fluids move smoothly downward into the intestines without reflux.
   • How & when to take: 1 Morning (Before Food). Take 1 capsule in the morning 15-30 minutes before breakfast for 10 days.

3. TAB. DEMO MEDICINE 3 (10 Days Course):
   • What the tablet is: Broad-Spectrum Anti-Infective / Antibacterial Tablet
   • What it is for: Treating active bacterial infections, destroying harmful bacteria, and preventing infection from spreading in your body.
   • What will it do: It directly attacks and breaks down the protective cell walls of infectious bacteria so they cannot replicate and are eliminated by your immune defenses.
   • How & when to take: 1 Morning, 1 Aft, 1 Eve, 1 Night (After Food). Take 1 tablet four times daily after meals for 10 days. Complete the entire course.

4. TAB. DEMO MEDICINE 4 (10 Days Course):
   • What the tablet is: Anti-Inflammatory & Pain-Relief Tablet
   • What it is for: Reducing internal tissue swelling, inflammation, body aches, and post-illness muscular soreness.
   • What will it do: It blocks the production of inflammatory chemical signals in your tissues and breaks down inflammatory fluids so sore areas soothe and heal quickly.
   • How & when to take: 1/2 Morning, 1/2 Night (After Food). Take 1/2 tablet in the morning and 1/2 tablet at night after food for 10 days.

Doctor's Dietary & Lifestyle Advice:
• AVOID OILY AND SPICY FOOD
• Follow-up Scheduled: 12-05-2020

IMPORTANT MEDICAL DISCLAIMER: This explanation is for informational guidance only. Follow doctor instructions.`,
      hi: `नैदानिक सुरक्षा एवं डॉक्टर का पर्चा मार्गदर्शन
चिकित्सक: Dr. R. K. Sharma (M.B.B.S, M.D., M.S.)
मरीज़: Rajesh Kumar • दिनांक: 2026-09-28

प्रत्येक दवा का सेवन केवल डॉक्टर के निर्देशानुसार ही करें। खुराक में बदलाव न करें।

दवाइयों का विस्तृत विवरण (सरल भाषा में):

1. TAB. DEMO MEDICINE 1:
   • यह दवा क्या है: पेट में गैस और जलन कम करने वाली दवा (PPI एंटासिड टैबलेट)
   • यह किसलिए है: पेट में गैस, एसिडिटी, सीने में जलन और पेट के छालों (अल्सर) से बचाव और इलाज के लिए।
   • यह शरीर में क्या काम करेगी: यह आपके पेट की दीवार में एसिड बनाने वाले सूक्ष्म पंपों को शांत करता है जिससे पेट का एसिड कम होता है।
   • लेने का सही तरीका और समय: सुबह 1 गोली और रात को 1 गोली खाना खाने से 30 मिनट पहले लें (10 दिनों का कोर्स)।

2. CAP. DEMO MEDICINE 2:
   • यह दवा क्या है: पाचन गति सुधारक और उल्टी/खट्टी डकार रोकने वाला कैप्सूल
   • यह किसलिए है: पेट फूलना, भारीपन, मतली और पेट का खाना/एसिड गले की तरफ वापस आने से रोकने के लिए।
   • यह शरीर में क्या काम करेगी: यह पेट के द्वार की मांसपेशियों को कसता है और खाने को सुगमता से आगे बढ़ाता है।
   • लेने का सही तरीका और समय: सुबह नाश्ते से 15-30 मिनट पहले 1 कैप्सूल लें (10 दिनों का कोर्स)।

3. TAB. DEMO MEDICINE 3:
   • यह दवा क्या है: संक्रमण मिटाने वाली असरदार एंटीबायोटिक गोली
   • यह किसलिए है: शरीर में फैले किसी भी प्रकार के हानिकारक बैक्टीरिया को नष्ट करने और संक्रमण खत्म करने के लिए।
   • यह शरीर में क्या काम करेगी: यह बैक्टीरिया की बाहरी दीवार को तोड़कर उन्हें नष्ट करती है।
   • लेने का सही तरीका और समय: दिन में 4 बार खाना खाने के बाद 1 गोली लें (10 दिनों का पूरा कोर्स)।

4. TAB. DEMO MEDICINE 4:
   • यह दवा क्या है: सूजन और दर्द निवारक गोली
   • यह किसलिए है: अंदरूनी सूजन घटाने, शरीर के दर्द और मांसपेशियों की जकड़न को दूर करने के लिए।
   • यह शरीर में क्या काम करेगी: यह दर्द और सूजन पैदा करने वाले रासायनिक तत्वों को रोकती है।
   • लेने का सही तरीका और समय: सुबह आधी गोली और रात को आधी गोली खाना खाने के बाद लें (10 दिनों का कोर्स)।

डॉक्टर की आहार एवं जीवनशैली सलाह:
• AVOID OILY AND SPICY FOOD (तला-भुना और मसालेदार खाना पूरी तरह बंद रखें)
• अगली जांच तारीख: 12-05-2020`,
      te: `వైద్య భద్రత & డాక్టర్ ప్రిస్క్రిప్షన్ మార్గదర్శకాలు
వైద్యులు: Dr. R. K. Sharma (M.B.B.S, M.D., M.S.)
రోగి: Rajesh Kumar • తేదీ: 2026-09-28

ఈ మందులను మీ వైద్యుడు సూచించిన విధంగా మాత్రమే క్రమం తప్పకుండా వాడండి.

ఔషధాల పూర్తి వివరాలు (సరళమైన భాషలో):

1. TAB. DEMO MEDICINE 1:
   • ఈ మాత్ర ఏమిటి: కడుపులో గ్యాస్ మరియు ఎసిడిటీ తగ్గించే మాత్ర (యాంటాసిడ్ PPI)
   • దేనికోసం ఉపయోగపడుతుంది: అధిక కడుపు మంట, ఎసిడిటీ, ఛాతీలో మంట మరియు అల్సర్ల నుండి కడుపు లోపలి పొరను రక్షించడానికి.
   • శరీరంలో ఇది ఏమి చేస్తుంది: ఇది మీ కడుపు లోపల యాసిడ్ తయారుచేసే సూక్ష్మ పంపులను ఆపివేస్తుంది.
   • ఎలా మరియు ఎప్పుడు వేసుకోవాలి: ఉదయం 1 మాత్ర మరియు రాత్రి 1 మాత్ర భోజనానికి 30 నిమిషాల ముందు వేసుకోవాలి (10 రోజుల కోర్సు).

2. CAP. DEMO MEDICINE 2:
   • ఈ మాత్ర ఏమిటి: జీర్ణక్రియను వేగవంతం చేసే మరియు ఎసిడిటీ ఎదురురాకుండా ఆపే క్యాప్సూల్
   • దేనికోసం ఉపయోగపడుతుంది: వికారం, కడుపు ఉబ్బరం, అజీర్తి మరియు గొంతులోకి పుల్లటి నీళ్లు రాకుండా నిరోధించడానికి.
   • శరీరంలో ఇది ఏమి చేస్తుంది: ఇది జీర్ణకోశ కండరాలను సరిచేసి ఆహారం సజావుగా కిందికి వెళ్లేలా చేస్తుంది.
   • ఎలా మరియు ఎప్పుడు వేసుకోవాలి: ఉదయం అల్పాహారానికి 15-30 నిమిషాల ముందు 1 క్యాప్సూల్ వేసుకోవాలి (10 రోజుల కోర్సు).

3. TAB. DEMO MEDICINE 3:
   • ఈ మాత్ర ఏమిటి: ఇన్ఫెక్షన్లను సమూలంగా తగ్గించే శక్తివంతమైన యాంటీబయాటిక్ మాత్ర
   • దేనికోసం ఉపయోగపడుతుంది: శరీరంలో ఉన్న హానికర బ్యాక్టీరియాను పూర్తిగా నశింపజేసి వ్యాధి తగ్గించడానికి.
   • శరీరంలో ఇది ఏమి చేస్తుంది: ఇది బ్యాక్టీరియా కణాల బయటి పొరను నాశనం చేసి శరీర రోగనిరోధక శక్తికి సహాయపడుతుంది.
   • ఎలా మరియు ఎప్పుడు వేసుకోవాలి: రోజుకు 4 సార్లు భోజనం తర్వాత 1 మాత్ర వేసుకోవాలి (10 రోజుల పూర్తి కోర్సు).

4. TAB. DEMO MEDICINE 4:
   • ఈ మాత్ర ఏమిటి: వాపు మరియు నొప్పులు తగ్గించే మాత్ర
   • దేనికోసం ఉపయోగపడుతుంది: శరీరంలో వాపు, నొప్పులు మరియు కండరాల బిగుతును నివారించడానికి.
   • శరీరంలో ఇది ఏమి చేస్తుంది: ఇది వాపును కలిగించే రసాయనాలను నిరోధించి త్వరగా ఉపశమనం ఇస్తుంది.
   • ఎలా మరియు ఎప్పుడు వేసుకోవాలి: ఉదయం అర మాత్ర మరియు రాత్రి అర మాత్ర భోజనం తర్వాత వేసుకోవాలి (10 రోజుల కోర్సు).

డాక్టర్ గారి ఆహార సలహాలు:
• AVOID OILY AND SPICY FOOD (నూనె మరియు కారపు వస్తువులు తినవద్దు)
• తదుపరి డాక్టర్ సంప్రదింపు: 12-05-2020`,
    },
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
