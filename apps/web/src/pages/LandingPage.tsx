import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Volume2,
  Phone,
  ShieldCheck,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Globe,
  Sparkles,
  Lock,
  HeartPulse,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageConfig } from '@ai-health/shared';

interface LandingPageProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

// Translations for major languages with fallback
const LANDING_COPY: Record<string, {
  badge: string;
  tagline: string;
  subheadline: string;
  getStarted: string;
  signIn: string;
  howItWorks: string;
  steps: { title: string; desc: string; icon: string }[];
  phoneSupportTitle: string;
  phoneSupportDesc: string;
  healthWorkerTitle: string;
  healthWorkerDesc: string;
  trustTitle: string;
  trustSubtitle: string;
  disclaimerTitle: string;
  disclaimerText: string;
}> = {
  en: {
    badge: 'India’s 1st Multilingual Medical Report Simplifier',
    tagline: 'Your Medical Reports in Simple, Spoken Language',
    subheadline:
      'Photograph any lab report or prescription. Get easy 5th-grade analogies, clear color-coded safety badges, and hear it read aloud in your mother tongue.',
    getStarted: 'Get Started Free',
    signIn: 'Sign In with PIN',
    howItWorks: 'How It Works in 3 Simple Steps',
    steps: [
      {
        title: '1. Scan or Photograph',
        desc: 'Snap a picture of your blood test, scan, or doctor prescription using your phone or upload a PDF.',
        icon: 'scan',
      },
      {
        title: '2. Understand Instantly',
        desc: 'Medical jargon is translated into Grade-5 analogies with clear Green, Amber, and Red safety indicators.',
        icon: 'understand',
      },
      {
        title: '3. Listen in Your Language',
        desc: 'Tap one giant button to hear your complete report read aloud warmly across all 22 Indian languages.',
        icon: 'listen',
      },
    ],
    phoneSupportTitle: '2G Feature Phone & Voice Call Support',
    phoneSupportDesc:
      'No smartphone or internet? Patients can dial our toll-free IVR number from any basic button phone, enter their 4-digit code, and listen to report summaries. Instant 160-character SMS summaries are delivered directly to their phone.',
    healthWorkerTitle: 'ASHA & Community Health Worker Backup',
    healthWorkerDesc:
      'Whenever critical abnormal values are detected (e.g., dangerously low platelets or critical blood sugar), an escalation ticket is automatically routed to your registered local ASHA or ANM health worker for immediate guidance.',
    trustTitle: 'DPDP Act 2023 Compliant & Secure',
    trustSubtitle: 'Your health data is encrypted, strictly consent-gated, and never sold to third parties.',
    disclaimerTitle: 'Statutory Clinical Disclaimer',
    disclaimerText:
      'This AI tool simplifies medical terminology for educational understanding only. It is NOT a clinical diagnosis, medical treatment, or prescription. Always consult a licensed healthcare professional for clinical decisions.',
  },
  te: {
    badge: 'భారతదేశ మొట్టమొదటి బహుభాషా వైద్య నివేదిక అనువాదకుడు',
    tagline: 'మీ వైద్య నివేదికలు సులభమైన, మాట్లాడే భాషలో',
    subheadline:
      'ఏదైనా రక్త పరీక్ష లేదా ప్రిస్క్రిప్షన్ ఫోటో తీయండి. సులభమైన వివరణలు, రంగు సంకేతాలు పొందండి మరియు మీ మాతృభాషలో స్పష్టంగా వినండి.',
    getStarted: 'ఉచితంగా ప్రారంభించండి',
    signIn: 'పిన్‌తో లాగిన్ అవ్వండి',
    howItWorks: '3 సులభమైన దశల్లో ఎలా పనిచేస్తుంది',
    steps: [
      {
        title: '1. ఫోటో తీయండి లేదా స్కాన్ చేయండి',
        desc: 'మీ మొబైల్ కెమెరాతో మెడికల్ రిపోర్ట్ లేదా డాక్టర్ ప్రిస్క్రిప్షన్ ఫోటో తీయండి.',
        icon: 'scan',
      },
      {
        title: '2. సులభంగా అర్థం చేసుకోండి',
        desc: 'క్లిష్టమైన వైద్య పదాలు సాధారణ భాషలోకి మారి ఆకుపచ్చ, పసుపు, ఎరుపు రంగు బ్యాడ్జీలతో కనిపిస్తాయి.',
        icon: 'understand',
      },
      {
        title: '3. మీ స్వంత భాషలో వినండి',
        desc: 'ఒక్క బటన్ నొక్కడం ద్వారా మొత్తం నివేదికను మీ మాతృభాషలో స్పష్టమైన గొంతుతో వినండి.',
        icon: 'listen',
      },
    ],
    phoneSupportTitle: 'సాధారణ బటన్ ఫోన్ (2G) & వాయిస్ కాల్ సహాయం',
    phoneSupportDesc:
      'స్మార్ట్‌ఫోన్ లేదా ఇంటర్నెట్ లేదా? మా టోల్-ఫ్రీ నంబర్‌కు సాధారణ బటన్ ఫోన్ నుండి కాల్ చేసి, మీ రిపోర్ట్ వివరాలు వినవచ్చు. అంతేకాకుండా 160 అక్షరాల సాధారణ SMS కూడా అందుతుంది.',
    healthWorkerTitle: 'ఆశా (ASHA) కార్యకర్తల సహకారం',
    healthWorkerDesc:
      'నివేదికలో ప్రమాదకరమైన ఫలితాలు ఉన్నప్పుడు, మీ స్థానిక ఆశా లేదా ఏఎన్ఎం కార్యకర్తకు వెంటనే సమాచారం చేరుతుంది, తద్వారా వారు మీకు సహాయపడతారు.',
    trustTitle: 'DPDP చట్టం 2023 ప్రకారం పూర్తి భద్రత',
    trustSubtitle: 'మీ ఆరోగ్య సమాచారం ఎన్‌క్రిప్ట్ చేయబడి అత్యంత సురక్షితంగా ఉంటుంది.',
    disclaimerTitle: 'ముఖ్యమైన చట్టబద్ధమైన హెచ్చరిక',
    disclaimerText:
      'ఈ వ్యవస్థ అవగాహన కోసం మాత్రమే. ఇది వైద్య నిర్ధారణ లేదా చికిత్స కాదు. ఏదైనా ఆరోగ్య నిర్ణయం కోసం మీ వైద్యుడిని సంప్రదించండి.',
  },
  hi: {
    badge: 'भारत का पहला बहुभाषी मेडिकल रिपोर्ट अनुवादक',
    tagline: 'आपकी मेडिकल रिपोर्ट अब आपकी अपनी सरल भाषा में',
    subheadline:
      'किसी भी लैब रिपोर्ट या पर्चे की फोटो खींचें। आसान 5वीं कक्षा के उदाहरण, रंगीन सुरक्षा बैज पाएं और अपनी मातृभाषा में आवाज में सुनें।',
    getStarted: 'निःशुल्क शुरू करें',
    signIn: 'पिन से साइन इन करें',
    howItWorks: '3 आसान चरणों में यह कैसे काम करता है',
    steps: [
      {
        title: '1. फोटो खींचें या अपलोड करें',
        desc: 'अपने फोन के कैमरे से खून की जांच या डॉक्टर के पर्चे की साफ फोटो लें या पीडीएफ चुनें।',
        icon: 'scan',
      },
      {
        title: '2. तुरंत आसानी से समझें',
        desc: 'जटिल डॉक्टरी शब्द आसान भाषा में बदल जाते हैं और हरे, पीले व लाल सुरक्षा रंग दिखते हैं।',
        icon: 'understand',
      },
      {
        title: '3. अपनी भाषा में सुनें',
        desc: 'एक बड़ा बटन दबाकर पूरी रिपोर्ट अपनी पसंदीदा भारतीय भाषा में आवाज में सुनें।',
        icon: 'listen',
      },
    ],
    phoneSupportTitle: 'साधारण बटन फोन (2G) और वॉयस कॉल सुविधा',
    phoneSupportDesc:
      'स्मार्टफोन या इंटरनेट नहीं है? किसी भी साधारण फोन से टोल-फ्री नंबर पर कॉल करें और अपनी रिपोर्ट का विवरण आवाज में सुनें। साथ ही 160 अक्षरों का सीधा SMS भी प्राप्त करें।',
    healthWorkerTitle: 'आशा व स्वास्थ्य कार्यकर्ता सहायता',
    healthWorkerDesc:
      'गंभीर असामान्य परिणाम मिलने पर आपकी पंजीकृत आशा या स्वास्थ्य कार्यकर्ता को तुरंत सूचना भेजी जाती है ताकि वे समय पर मार्गदर्शन कर सकें।',
    trustTitle: 'DPDP अधिनियम 2023 के तहत पूर्ण सुरक्षित',
    trustSubtitle: 'आपका स्वास्थ्य डेटा एन्क्रिप्टेड है और कभी किसी तीसरे पक्ष को नहीं बेचा जाता।',
    disclaimerTitle: 'वैधानिक चिकित्सीय अस्वीकरण',
    disclaimerText:
      'यह एआई टूल केवल रिपोर्ट को समझने के लिए है। यह कोई डॉक्टरी निदान या इलाज नहीं है। हमेशा योग्य डॉक्टर से परामर्श लें।',
  },
  ta: {
    badge: 'இந்தியாவின் முதல் பன்மொழி மருத்துவ அறிக்கை எளிய மொழிபெயர்ப்பாளர்',
    tagline: 'உங்கள் மருத்துவ அறிக்கைகள் எளிய, பேசும் மொழியில்',
    subheadline:
      'எந்தவொரு இரத்தப் பரிசோதனை அல்லது மருந்துச் சீட்டையும் புகைப்படம் எடுங்கள். எளிய விளக்கங்கள், வண்ணக் குறியீடுகள் பெற்று உங்கள் தாய்மொழியில் கேளுங்கள்.',
    getStarted: 'இலவசமாகத் தொடங்குங்கள்',
    signIn: 'PIN உடன் உள்நுழைக',
    howItWorks: '3 எளிய படிகளில் எவ்வாறு செயல்படுகிறது',
    steps: [
      {
        title: '1. புகைப்படம் எடுக்கவும்',
        desc: 'உங்கள் தொலைபேசி மூலம் அறிக்கையைப் படம் பிடிக்கவும் அல்லது PDF பதிவேற்றவும்.',
        icon: 'scan',
      },
      {
        title: '2. எளிதில் புரிந்து கொள்ளுங்கள்',
        desc: 'கடினமான மருத்துவச் சொற்கள் எளிய மொழியாக்கப்பட்டு வண்ணக் குறியீடுகளுடன் காட்டப்படும்.',
        icon: 'understand',
      },
      {
        title: '3. உங்கள் மொழியில் கேளுங்கள்',
        desc: 'ஒற்றைப் பொத்தானை அழுத்தி முழு அறிக்கையையும் உங்கள் தாய்மொழியில் ஒலியாகக் கேளுங்கள்.',
        icon: 'listen',
      },
    ],
    phoneSupportTitle: 'சாதாரண பட்டன் போன் (2G) ஆதரவு',
    phoneSupportDesc:
      'ஸ்மார்ட்போன் இல்லையா? கட்டணமில்லா எண்ணிற்கு அழைத்து குரல் வழியே விவரங்களைக் கேளுங்கள் மற்றும் நேரடி SMS பெறுங்கள்.',
    healthWorkerTitle: 'ஆஷா சுகாதாரப் பணியாளர் உதவி',
    healthWorkerDesc:
      'அவசர சிகிச்சை தேவைப்படும் நிலைகளில் உங்கள் பகுதி ஆஷா பணியாளருக்குத் தானாகத் தகவல் அனுப்பப்படும்.',
    trustTitle: 'DPDP சட்டம் 2023 பாதுகாப்பு உறுதி',
    trustSubtitle: 'உங்கள் மருத்துவத் தரவுகள் பாதுகாப்பாகவும் இரகசியமாகவும் வைக்கப்படும்.',
    disclaimerTitle: 'சட்டரீதியான மறுப்புரை',
    disclaimerText:
      'இது புரிதலுக்காக மட்டுமே. இது மருத்துவ நோயறிதல் அல்லது சிகிச்சை அல்ல. தகுதியான மருத்துவரை அணுகவும்.',
  },
  bn: {
    badge: 'ভারতের প্রথম বহুভাষিক মেডিকেল রিপোর্ট অনুবাদক',
    tagline: 'আপনার মেডিকেল রিপোর্ট সহজ ও বোধগম্য বাংলায়',
    subheadline:
      'যেকোনো রক্তের পরীক্ষা বা প্রেসক্রিপশনের ছবি তুলুন। সহজ উদাহরণ, রঙিন সুরক্ষা নির্দেশক পান এবং নিজের ভাষায় শুনুন।',
    getStarted: 'বিনামূল্যে শুরু করুন',
    signIn: 'PIN দিয়ে সাইন ইন করুন',
    howItWorks: '৩টি সহজ ধাপে কীভাবে কাজ করে',
    steps: [
      {
        title: '১. ছবি তুলুন বা স্ক্যান করুন',
        desc: 'আপনার ফোন দিয়ে রিপোর্ট বা প্রেসক্রিপশনের ছবি তুলুন অথবা ফাইল আপলোড করুন।',
        icon: 'scan',
      },
      {
        title: '২. সহজে বুঝে নিন',
        desc: 'জটিল ডাক্তারি পরিভাষা সহজ ব্যাখ্যায় রূপান্তরিত হয় ও রঙ নির্দেশ করে সতর্কতা।',
        icon: 'understand',
      },
      {
        title: '৩. নিজের ভাষায় শুনুন',
        desc: 'একটি মাত্র বোতাম ছুঁয়ে পুরো রিপোর্টটি স্পষ্ট গলায় মুখে শুনুন।',
        icon: 'listen',
      },
    ],
    phoneSupportTitle: '২জি বোতাম ফোন এবং ভয়েস কল সুবিধা',
    phoneSupportDesc:
      'স্মার্টফোন বা ইন্টারনেট নেই? যেকোনো সাধারণ ফোন থেকে আমাদের টোল-ফ্রি নম্বরে ডায়াল করে রিপোর্ট শুনুন ও সংক্ষিপ্ত SMS পান।',
    healthWorkerTitle: 'আশা স্বাস্থ্যকর্মীদের ব্যাকআপ',
    healthWorkerDesc:
      'কোনো গুরুতর অস্বাভাবিক ফলাফল পাওয়া গেলে সাথে সাথে স্থানীয় আশা কর্মীর কাছে সতর্কতা বার্তা পাঠানো হয়।',
    trustTitle: 'DPDP আইন ২০২৩ অনুযায়ী সম্পূর্ণ সুরক্ষিত',
    trustSubtitle: 'আপনার স্বাস্থ্য সংক্রান্ত তথ্য সম্পূর্ণ সুরক্ষিত ও গোপনীয় রাখা হয়।',
    disclaimerTitle: 'সংবিধিবদ্ধ মেডিকেল দাবিত্যাগ',
    disclaimerText:
      'এই সিস্টেমটি শুধুমাত্র রিপোর্ট সহজে বোঝার জন্য। এটি কোনো ডাক্তারি প্রেসক্রিপশন বা চিকিৎসা নয়। ডাক্তারের পরামর্শ নিন।',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  selectedLanguage,
  onLanguageChange,
  onGetStarted,
  onSignIn,
  darkMode,
  onToggleDarkMode,
}) => {
  const copy = LANDING_COPY[selectedLanguage] || LANDING_COPY['en'];
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Bharat Swasth"
              className="w-12 h-12 rounded-2xl object-contain shadow-md border border-emerald-500/20 bg-white p-0.5"
            />
            <div>
              <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Bharat Swasth
              </span>
              <span className={`block text-[11px] font-bold tracking-wider uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Your Health, Simplified.
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* 22 Languages Selector with Native Scripts */}
            <div className="relative group">
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                darkMode ? 'bg-slate-900 border-slate-700 hover:border-emerald-500 text-slate-200' : 'bg-white border-slate-200 hover:border-emerald-500 text-slate-800'
              }`}>
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="font-bold">{currentLangObj.nativeName}</span>
                <span className="text-xs opacity-60">({currentLangObj.name})</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-900">
                    {lang.nativeName} — {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`p-2.5 rounded-xl border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons */}
            <button
              onClick={onSignIn}
              className={`hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {copy.signIn}
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all"
            >
              <span>{copy.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border mb-6 ${
              darkMode ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{copy.badge}</span>
          </motion.div>

          {/* Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] max-w-4xl mx-auto"
          >
            {copy.tagline.split(' ').map((word, i) => (
              <span
                key={i}
                className={i % 3 === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent' : ''}
              >
                {word}{' '}
              </span>
            ))}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            {copy.subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span>{copy.getStarted}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onSignIn}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl border font-bold text-base transition-all flex items-center justify-center gap-3 ${
                darkMode ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>{copy.signIn}</span>
            </button>
          </motion.div>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: 'Scheduled Languages', val: '22 + English' },
              { label: 'Clinical Accuracy', val: 'Deterministic' },
              { label: 'Reading Level', val: 'Grade-5 Plain' },
              { label: 'Offline & 2G Backup', val: 'IVR + SMS' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <div className="text-xl sm:text-2xl font-black text-emerald-500">{stat.val}</div>
                <div className={`text-xs mt-1 font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section className={`py-20 border-y ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-emerald-50/50 border-emerald-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{copy.howItWorks}</h2>
            <p className={`mt-3 text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Built specifically so that elderly parents, rural citizens, and low-literacy users never feel confused by clinical numbers.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {copy.steps.map((step, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-3xl border transition-all hover:-translate-y-1 ${
                  darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-lg shadow-slate-100 hover:border-emerald-500'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-500 flex items-center justify-center font-black text-2xl mb-6">
                  {idx === 0 && <FileText className="w-8 h-8" />}
                  {idx === 1 && <CheckCircle className="w-8 h-8" />}
                  {idx === 2 && <Volume2 className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2G Feature Phone & Voice Call Support Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold mb-4 ${
                darkMode ? 'bg-amber-950/60 border border-amber-800 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}>
                <Phone className="w-3.5 h-3.5" />
                <span>Works on 2G Button Phones</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{copy.phoneSupportTitle}</h2>
              <p className={`mt-4 text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {copy.phoneSupportDesc}
              </p>

              <div className="mt-6 space-y-3">
                {[
                  'Toll-free IVR hotline with DTMF button navigation (Press 1, 2, 3)',
                  'Direct 160-character plain-text SMS summary in mother tongue',
                  'Zero internet connectivity required for rural patients',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Phone Card */}
            <div className={`p-8 rounded-3xl border relative ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">2G Voice Hotline Simulator</h4>
                    <p className="text-xs text-slate-400">1800-SWASTH (Toll-Free)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">Live Active</span>
              </div>

              <div className="mt-6 space-y-3 font-mono text-xs">
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  📢 &quot;తెలుగు కోసం 1 నొక్కండి... हिन्दी के लिए 2 दबाएँ... For English press 3&quot;
                </div>
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  📩 SMS: &quot;నమస్తే రమేష్ గారు, మీ రక్తంలో హిమోగ్లోబిన్ [Hemoglobin] 11.2 సాధారణం కంటే తక్కువగా ఉంది. వైద్యుడిని సంప్రదించండి.&quot;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Health Worker Backup Section */}
      <section className={`py-20 border-t ${darkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100/60 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Queue Card */}
            <div className={`p-8 rounded-3xl border order-2 lg:order-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Automated Critical Escalation</h4>
                  <p className="text-xs text-slate-400">Connected to ASHA / ANM Network</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Critical Alert: Sita Ramulu</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px]">Urgent</span>
                  </div>
                  <p className="mt-1 text-xs">
                    Blood Sugar HbA1c is 8.2% (Target &lt;5.7%). Escalation assigned to ANM Sunita Rao.
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold mb-4 ${
                darkMode ? 'bg-teal-950/60 border border-teal-800 text-teal-300' : 'bg-teal-50 border border-teal-200 text-teal-800'
              }`}>
                <Users className="w-3.5 h-3.5" />
                <span>Human Touch in Healthcare</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{copy.healthWorkerTitle}</h2>
              <p className={`mt-4 text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {copy.healthWorkerDesc}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs border-2 border-white dark:border-slate-900">
                    ASHA
                  </div>
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs border-2 border-white dark:border-slate-900">
                    ANM
                  </div>
                  <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs border-2 border-white dark:border-slate-900">
                    CHO
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">Supported across primary healthcare centres</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges & DPDP Compliance */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">{copy.trustTitle}</h2>
          <p className={`mt-2 text-sm max-w-xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {copy.trustSubtitle}
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'DPDP Act 2023 Compliant', desc: 'Purpose-specific consent, masked audit logs, and one-tap right to erasure.' },
              { title: 'Argon2id Device-Bound Security', desc: 'Hardware-bound PINs hashed with Argon2id and locked on repeated failed attempts.' },
              { title: 'Zero Commercial Data Selling', desc: 'Your medical health records are processed locally and never sold to advertisers.' },
            ].map((b, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-bold text-sm mb-1">{b.title}</h4>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mandatory Statutory Medical Disclaimer Banner */}
      <section className="py-10 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`p-6 rounded-2xl border flex items-start gap-4 ${
            darkMode ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider">{copy.disclaimerTitle}</h4>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{copy.disclaimerText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Bharat Swasth"
              className="w-10 h-10 rounded-xl object-contain shadow-sm border border-emerald-500/20 bg-white p-0.5"
            />
            <div>
              <span className="font-black text-lg text-emerald-600">Bharat Swasth</span>
              <p className="text-xs text-slate-500 mt-0.5">Your Health, Simplified. • 22 Scheduled Indian Languages</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
            <button onClick={onGetStarted} className="hover:text-emerald-500">Sign Up</button>
            <button onClick={onSignIn} className="hover:text-emerald-500">Sign In</button>
            <span>DPDP Consent Policy</span>
            <span>Emergency Guidelines</span>
            <span>Helpline: 1800-SWASTH</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
