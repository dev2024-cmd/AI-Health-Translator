import { useState } from 'react';

export interface MobileReport {
  id: string;
  test_title: string;
  patient_name: string;
  date: string;
  plain_explanation: Record<string, string>;
  extracted_values: Array<{
    id: string;
    test_name: string;
    value: number;
    unit: string;
    ref_low: number | null;
    ref_high: number | null;
    flag: 'normal' | 'low' | 'high' | 'critical';
  }>;
}

export const MOCK_OFFLINE_REPORTS: MobileReport[] = [
  {
    id: 'rep-mob-1',
    test_title: 'Complete Blood Count (CBC)',
    patient_name: 'Sita Ramulu (Father)',
    date: '2026-09-28',
    plain_explanation: {
      en: 'Your hemoglobin [Hemoglobin] is slightly lower than normal at 11.2. Hemoglobin carries oxygen throughout your body. Because it is lower, you might feel a little tired. Your white blood cells [WBC] and platelets [Platelets] are healthy and safe.',
      hi: 'आपके रक्त में हीमोग्लोबिन [Hemoglobin] का स्तर 11.2 है, जो सामान्य से थोड़ा कम है। हीमोग्लोबिन शरीर में ऑक्सीजन पहुंचाता है। इसके कम होने से आपको हल्की थकान लग सकती है। आपकी रोग प्रतिरोधक कोशिकाएं और प्लेटलेट्स बिल्कुल सामान्य और सुरक्षित हैं।',
      te: 'మీ రక్తంలో హిమోగ్లోబిన్ [Hemoglobin] 11.2 గా ఉంది, ఇది సాధారణ స్థాయి కంటే కొద్దిగా తక్కువ. హిమోగ్లోబిన్ మీ శరీరానికి ఆక్సిజన్‌ను అందిస్తుంది. ఇది తక్కువగా ఉన్నందున కొద్దిగా అలసట అనిపించవచ్చు. మీ తెల్ల రక్త కణాలు మరియు ప్లేట్‌లెట్లు ఆరోగ్యంగా ఉన్నాయి.',
      bn: 'আপনার হিমোগ্লোবিন [Hemoglobin] স্বাভাবিকের চেয়ে কিছুটা কম (১১.২)। এর কারণে কিছুটা ক্লান্তি বোধ হতে পারে। তবে অন্যান্য রক্তকণিকা সম্পূর্ণ স্বাভাবিক আছে।',
    },
    extracted_values: [
      { id: 'm1', test_name: 'Hemoglobin', value: 11.2, unit: 'g/dL', ref_low: 13.0, ref_high: 17.0, flag: 'low' },
      { id: 'm2', test_name: 'RBC Count', value: 4.1, unit: 'mil/uL', ref_low: 4.5, ref_high: 5.5, flag: 'low' },
      { id: 'm3', test_name: 'WBC Count', value: 8500, unit: 'cells/mcL', ref_low: 4000, ref_high: 11000, flag: 'normal' },
      { id: 'm4', test_name: 'Platelet Count', value: 180000, unit: '/mcL', ref_low: 150000, ref_high: 450000, flag: 'normal' },
    ],
  },
  {
    id: 'rep-mob-2',
    test_title: 'Lipid Profile (Cholesterol)',
    patient_name: 'Sita Ramulu (Father)',
    date: '2026-09-20',
    plain_explanation: {
      en: 'Your total cholesterol [Total Cholesterol] is 235, which is higher than normal. Your good cholesterol [HDL] is slightly low. Consider discussing dietary choices with your doctor.',
      hi: 'आपका कुल कोलेस्ट्रॉल [Total Cholesterol] 235 है, जो सामान्य से अधिक है। अच्छा कोलेस्ट्रॉल थोड़ा कम है। कृपया डॉक्टर से खान-पान के बारे में सलाह लें।',
      te: 'మీ మొత్తం కొలెస్ట్రాల్ [Total Cholesterol] 235 గా ఉంది, ఇది సాధారణం కంటే ఎక్కువ. ఆహారపు అలవాట్ల కోసం డాక్టర్‌ను సంప్రదించండి.',
      bn: 'আপনার মোট কোলেস্টেরল [Total Cholesterol] স্বাভাবিকের চেয়ে বেশি (২৩৫)। খাদ্যাভ্যাসে সতর্ক হওয়া প্রয়োজন।',
    },
    extracted_values: [
      { id: 'm5', test_name: 'Total Cholesterol', value: 235.0, unit: 'mg/dL', ref_low: 125.0, ref_high: 200.0, flag: 'high' },
      { id: 'm6', test_name: 'Triglycerides', value: 190.0, unit: 'mg/dL', ref_low: 50.0, ref_high: 150.0, flag: 'high' },
      { id: 'm7', test_name: 'HDL (Good)', value: 38.0, unit: 'mg/dL', ref_low: 40.0, ref_high: 60.0, flag: 'low' },
    ],
  },
];
