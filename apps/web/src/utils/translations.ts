export interface UITranslation {
  appName: string;
  tagline: string;
  subTagline: string;
  languageLabel: string;
  nav: {
    home: string;
    caregiver: string;
    healthWorker: string;
    consent: string;
    dashboard: string;
    myReports: string;
    familyProfiles: string;
    uploadNewReport: string;
    signIn: string;
    signOut: string;
    dpdpBadge: string;
  };
  greetings: {
    morning: string;
    afternoon: string;
    evening: string;
    welcomeSubtitle: string;
    listenAloud: string;
    pauseAudio: string;
    spokenIntro: (name: string, total: number, critical: number) => string;
  };
  actionCards: {
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card1Btn: string;
    card2Badge: string;
    card2Title: string;
    card2Desc: string;
    card2Btn: string;
    card3Badge: string;
    card3Title: string;
    card3Desc: string;
    card3Btn: string;
  };
  statusCards: {
    safeTitle: string;
    safeDesc: string;
    attentionTitle: string;
    attentionDesc: string;
    doctorTitle: string;
    doctorDesc: string;
    criticalWarning: string;
    allClearNotice: string;
  };
  reportsSection: {
    recentTitle: string;
    recentSubtitle: string;
    noReports: string;
    noReportsDesc: string;
    scanFirstReport: string;
    safeBadge: string;
    attentionBadge: string;
    criticalBadge: string;
    listen: string;
    stop: string;
    shareWhatsApp: string;
    prescriptionTag: string;
    labReportTag: string;
    allFamily: string;
    self: string;
    father: string;
    mother: string;
    grandfather: string;
  };
}

export const UI_TRANSLATIONS: Record<string, UITranslation> = {
  // TAMIL (தமிழ்)
  ta: {
    appName: 'பாரத் ஸ்வஸ்த் (Bharat Swasth)',
    tagline: 'உங்கள் உடல்நலம், எளிமையாக.',
    subTagline: 'எளிய தமிழில் மருத்துவ ஆய்வக அறிக்கைகள் & மருந்து அட்டவணை',
    languageLabel: 'மொழி / Language:',
    nav: {
      home: 'முகப்பு',
      caregiver: 'பராமரிப்பாளர் தளம்',
      healthWorker: 'சுகாதாரப் பணியாளர் வரிசை',
      consent: 'தனியுரிமை ஒப்புதல்',
      dashboard: 'முகப்பு பலகை (Dashboard)',
      myReports: 'என் மருத்துவ அறிக்கைகள்',
      familyProfiles: 'குடும்ப உறுப்பினர்கள்',
      uploadNewReport: '+ புதிய அறிக்கை பதிவேற்றுக',
      signIn: 'உள்நுழைக',
      signOut: 'வெளியேறுக',
      dpdpBadge: 'DPDP 2023 பாதுகாப்பு',
    },
    greetings: {
      morning: 'காலை வணக்கம்',
      afternoon: 'மதிய வணக்கம்',
      evening: 'மாலை வணக்கம்',
      welcomeSubtitle: 'உங்கள் உடல்நலம், எளிய தமிழில் • எந்தவொரு மருத்துவ அறிக்கையையும் எளிதாகப் புரிந்து கொள்ளுங்கள்.',
      listenAloud: 'தமிழில் கேளுங்கள் (Tap to Listen)',
      pauseAudio: 'ஆடியோவை நிறுத்துக (Pause)',
      spokenIntro: (name, total, critical) =>
        `வணக்கம் ${name}! பாரத் ஸ்வஸ்திற்கு வரவேற்கிறோம். உங்களிடம் ${total} மருத்துவ அறிக்கைகள் உள்ளன. ${
          critical > 0
            ? `${critical} முக்கியமான முடிவுகள் உள்ளன, உடனே மருத்துவரை அணுகவும்.`
            : 'அனைத்து பரிசோதனை முடிவுகளும் வழக்கமான வரம்பில் உள்ளன.'
        }`,
    },
    actionCards: {
      card1Badge: 'ஆய்வக அறிக்கை',
      card1Title: 'ஆய்வக அறிக்கை ஸ்கேன்',
      card1Desc: 'இரத்தப் பரிசோதனை, சர்க்கரை அளவு அல்லது ஸ்கேன் அறிக்கையைப் புகைப்படம் எடுக்கவும். எளிய தமிழில் கேளுங்கள்.',
      card1Btn: 'புகைப்படம் எடுக்கவும் (Open Camera) →',
      card2Badge: 'Rx நேர அட்டவணை',
      card2Title: 'மருத்துவர் மருந்துச் சீட்டு (Rx)',
      card2Desc: 'மருத்துவர் எழுதிய மருந்துகளை காலை மற்றும் இரவு எப்போது உட்கொள்ள வேண்டும் என்பதை எளிதாகக் கேளுங்கள்.',
      card2Btn: 'மருந்து விவரங்கள் (Scan Rx) →',
      card3Badge: 'வாட்ஸ்அப் / PDF',
      card3Title: 'கோப்பு பதிவேற்றுக',
      card3Desc: 'வாட்ஸ்அப்பில் வந்த ஆய்வக PDF அல்லது தொலைபேசி கேலரியில் உள்ள அறிக்கைகளைப் பதிவேற்றவும்.',
      card3Btn: 'கோப்பைத் தேர்ந்தெடுக்கவும் (Choose File) →',
    },
    statusCards: {
      safeTitle: 'அனைத்தும் சரி / SAFE',
      safeDesc: 'வழக்கமான வரம்பில் உள்ள பரிசோதனை முடிவுகள்',
      attentionTitle: 'கவனம் தேவை / ATTENTION',
      attentionDesc: 'சிறிது மாறுபட்ட அல்லது கவனிக்க வேண்டிய மதிப்புகள்',
      doctorTitle: 'மருத்துவர் ஆலோசனை / DOCTOR',
      doctorDesc: 'மருத்துவரின் நேரடி வழிகாட்டுதல் தேவை',
      criticalWarning: 'மருத்துவர் ஆலோசனை அவசியம்',
      allClearNotice: 'அவசர சிக்கல்கள் எதுவும் இல்லை',
    },
    reportsSection: {
      recentTitle: 'சமீபத்திய மருத்துவ அறிக்கைகள்',
      recentSubtitle: 'எந்தவொரு அறிக்கையையும் கேட்க "கேளுங்கள்" பொத்தானை அழுத்தவும்',
      noReports: 'இதுவரை எந்த அறிக்கைகளும் இல்லை',
      noReportsDesc: 'உங்கள் முதல் ஆய்வக அறிக்கை அல்லது மருந்துச் சீட்டைப் புகைப்படம் எடுக்கவும்.',
      scanFirstReport: 'முதல் அறிக்கையை ஸ்கேன் செய்க',
      safeBadge: 'அனைத்தும் சரி',
      attentionBadge: 'கவனம் தேவை',
      criticalBadge: 'மருத்துவர் தேவை',
      listen: 'கேளுங்கள்',
      stop: 'நிறுத்துக',
      shareWhatsApp: 'வாட்ஸ்அப்பில் பகிருங்கள்',
      prescriptionTag: 'மருந்துச் சீட்டு (Rx)',
      labReportTag: 'ஆய்வக அறிக்கை',
      allFamily: 'அனைத்துக் குடும்பத்தினர் (All)',
      self: 'சுயவிவரம் (Self)',
      father: 'தந்தை (Father)',
      mother: 'தாய் (Mother)',
      grandfather: 'தாத்தா (Grandfather)',
    },
  },

  // TELUGU (తెలుగు)
  te: {
    appName: 'భారత్ స్వస్థ్ (Bharat Swasth)',
    tagline: 'మీ ఆరోగ్యం, సరళమైన భాషలో.',
    subTagline: 'ల్యాబ్ రిపోర్టులు & మందుల టైమ్ టేబుల్ సాధారణ తెలుగులో',
    languageLabel: 'భాష / Language:',
    nav: {
      home: 'హోమ్',
      caregiver: 'సంరక్షకుడు',
      healthWorker: 'ఆరోగ్య కార్యకర్త క్యూ',
      consent: 'సమ్మతి & గోప్యత',
      dashboard: 'డ్యాష్‌బోర్డ్ (Dashboard)',
      myReports: 'నా రిపోర్టులు',
      familyProfiles: 'కుటుంబ సభ్యులు',
      uploadNewReport: '+ కొత్త రిపోర్ట్ అప్‌లోడ్',
      signIn: 'లాగిన్',
      signOut: 'లాగ్ అవుట్',
      dpdpBadge: 'DPDP 2023 రక్షణ',
    },
    greetings: {
      morning: 'శుభోదయం',
      afternoon: 'శుభ మధ్యాహ్నం',
      evening: 'శుభ సాయంత్రం',
      welcomeSubtitle: 'మీ ఆరోగ్యం, సరళమైన భాషలో • ఏ రిపోర్టునైనా సులభంగా అర్థం చేసుకోండి.',
      listenAloud: 'ఆరోగ్యం వినండి (Tap to Listen)',
      pauseAudio: 'ఆపండి (Pause)',
      spokenIntro: (name, total, critical) =>
        `${name} గారు! భారత స్వస్థ్ కి స్వాగతం. మీ వద్ద ${total} వైద్య నివేదికలు ఉన్నాయి. ${
          critical > 0
            ? `${critical} ముఖ్యమైన విలువలు ఉన్నాయి, డాక్టర్ గారి సలహా తీసుకోండి.`
            : 'అన్ని పరీక్షల ఫలితాలు సాధారణ పరిధిలో ఉన్నాయి.'
        }`,
    },
    actionCards: {
      card1Badge: 'ల్యాబ్ రిపోర్ట్',
      card1Title: 'ల్యాబ్ రిపోర్ట్ స్కాన్',
      card1Desc: 'రక్త పరీక్ష, యూరిన్ టెస్ట్ లేదా స్కాన్ రిపోర్ట్ ఫోటో తీయండి. వెంటనే సాధారణ తెలుగులో వినండి.',
      card1Btn: 'ఫోటో తీయండి (Open Camera) →',
      card2Badge: 'Rx టైమ్ టేబుల్',
      card2Title: 'మందుల చీటీ (Rx)',
      card2Desc: 'డాక్టర్ రాసిన మందులు ఎప్పుడు వేసుకోవాలో (ఉదయం/రాత్రి) సులభంగా వినండి. మోతాదు భద్రత.',
      card2Btn: 'మందుల వివరాలు (Scan Rx) →',
      card3Badge: 'వాట్సాప్ / PDF',
      card3Title: 'ఫైల్ అప్‌లోడ్',
      card3Desc: 'ల్యాబ్ నుండి వాట్సాప్‌లో వచ్చిన PDF లేదా మొబైల్ గ్యాలరీలో ఉన్న ఫోటోలను ఇక్కడ అప్‌లోడ్ చేయండి.',
      card3Btn: 'ఫైల్ ఎంచుకోండి (Choose File) →',
    },
    statusCards: {
      safeTitle: 'అంతా క్షేమం / SAFE',
      safeDesc: 'సాధారణ పరిధిలో ఉన్న ఫలితాలు',
      attentionTitle: 'శ్రద్ధ అవసరం / ATTENTION',
      attentionDesc: 'కొద్దిగా ఎక్కువ/తక్కువ ఉన్న విలువలు',
      doctorTitle: 'డాక్టర్ సలహా / DOCTOR',
      doctorDesc: 'వైద్యుని సంప్రదించడం అవసరం',
      criticalWarning: 'వైద్యుని సంప్రదించండి',
      allClearNotice: 'అత్యవసర సమస్యలు లేవు',
    },
    reportsSection: {
      recentTitle: 'ఇటీవలి ఆరోగ్య నివేదికలు',
      recentSubtitle: 'ఏ రిపోర్టునైనా వినడానికి "వినండి" బటన్ నొక్కండి',
      noReports: 'ఇంకా ఎలాంటి రిపోర్టులు లేవు',
      noReportsDesc: 'మీ మొదటి రిపోర్ట్ లేదా మందుల చీటీ ఫోటో తీయండి.',
      scanFirstReport: 'మొదటి రిపోర్ట్ స్కాన్ చేయండి',
      safeBadge: 'అంతా క్షేమం',
      attentionBadge: 'శ్రద్ధ అవసరం',
      criticalBadge: 'డాక్టర్ సలహా',
      listen: 'వినండి',
      stop: 'ఆపండి',
      shareWhatsApp: 'వాట్సాప్‌లో పంపండి',
      prescriptionTag: 'మందుల చీటీ (Rx)',
      labReportTag: 'ల్యాబ్ రిపోర్ట్',
      allFamily: 'అందరూ (All Family)',
      self: 'స్వయంగా (Self)',
      father: 'నాన్న (Father)',
      mother: 'అమ్మ (Mother)',
      grandfather: 'తాతయ్య (Grandfather)',
    },
  },

  // HINDI (हिन्दी)
  hi: {
    appName: 'भारत स्वस्थ (Bharat Swasth)',
    tagline: 'आपका स्वास्थ्य, सरल भाषा में।',
    subTagline: 'मेडिकल लैब रिपोर्ट्स और दवाई समय सारिणी आसान भाषा में',
    languageLabel: 'भाषा / Language:',
    nav: {
      home: 'होम',
      caregiver: 'देखभालकर्ता पोर्टल',
      healthWorker: 'स्वास्थ्य कार्यकर्ता कतार',
      consent: 'सहमति एवं गोपनीयता',
      dashboard: 'डैशबोर्ड (Dashboard)',
      myReports: 'मेरी रिपोर्ट्स',
      familyProfiles: 'परिवार के सदस्य',
      uploadNewReport: '+ नई रिपोर्ट अपलोड करें',
      signIn: 'साइन इन',
      signOut: 'साइन आउट',
      dpdpBadge: 'DPDP 2023 सुरक्षित',
    },
    greetings: {
      morning: 'सुप्रभात',
      afternoon: 'शुभ दोपहर',
      evening: 'शुभ संध्या',
      welcomeSubtitle: 'आपका स्वास्थ्य, सरल भाषा में • किसी भी मेडिकल रिपोर्ट को आसानी से समझें।',
      listenAloud: 'बोलकर सुनें (Tap to Listen)',
      pauseAudio: 'रोकें (Pause)',
      spokenIntro: (name, total, critical) =>
        `नमस्ते ${name} जी! भारत स्वस्थ में आपका स्वागत है। आपके पास ${total} मेडिकल रिपोर्ट हैं। ${
          critical > 0
            ? `${critical} महत्वपूर्ण जांच परिणाम हैं, डॉक्टर की सलाह अवश्य लें।`
            : 'सभी जांच परिणाम सामान्य सीमा में हैं।'
        }`,
    },
    actionCards: {
      card1Badge: 'लैब रिपोर्ट',
      card1Title: 'लैब रिपोर्ट स्कैन करें',
      card1Desc: 'ब्लड टेस्ट, यूरिन टेस्ट या स्कैन रिपोर्ट की फोटो लें। तुरंत अपनी सरल भाषा में सुनें।',
      card1Btn: 'फोटो लें (Open Camera) →',
      card2Badge: 'दवाई समय सारिणी',
      card2Title: 'डॉक्टर की पर्ची (Rx)',
      card2Desc: 'दवाई कब लेनी है (सुबह/रात) आसानी से अपनी भाषा में सुनें। सुरक्षित खुराक नियम।',
      card2Btn: 'दवाई विवरण (Scan Rx) →',
      card3Badge: 'व्हाट्सएप / PDF',
      card3Title: 'फाइल अपलोड करें',
      card3Desc: 'व्हाट्सएप पर आई रिपोर्ट पीडीएफ या मोबाइल गैलरी से कोई भी फोटो आसानी से अपलोड करें।',
      card3Btn: 'फाइल चुनें (Choose File) →',
    },
    statusCards: {
      safeTitle: 'सब सामान्य / SAFE',
      safeDesc: 'सामान्य सीमा में जांच परिणाम',
      attentionTitle: 'ध्यान दें / ATTENTION',
      attentionDesc: 'थोड़े असामान्य या ध्यान देने योग्य परिणाम',
      doctorTitle: 'डॉक्टर से मिलें / DOCTOR',
      doctorDesc: 'डॉक्टर का मार्गदर्शन आवश्यक है',
      criticalWarning: 'डॉक्टर की सलाह लें',
      allClearNotice: 'कोई आपातकालीन समस्या नहीं',
    },
    reportsSection: {
      recentTitle: 'हाल की मेडिकल रिपोर्ट्स',
      recentSubtitle: 'किसी भी रिपोर्ट को सुनने के लिए "सुनें" बटन दबाएं',
      noReports: 'अभी कोई रिपोर्ट नहीं है',
      noReportsDesc: 'अपनी पहली लैब रिपोर्ट या डॉक्टर की पर्ची का फोटो लें।',
      scanFirstReport: 'पहली रिपोर्ट स्कैन करें',
      safeBadge: 'सब सामान्य',
      attentionBadge: 'ध्यान दें',
      criticalBadge: 'डॉक्टर से मिलें',
      listen: 'सुनें',
      stop: 'रोकें',
      shareWhatsApp: 'व्हाट्सएप पर भेजें',
      prescriptionTag: 'डॉक्टर पर्ची (Rx)',
      labReportTag: 'लैब रिपोर्ट',
      allFamily: 'सभी परिवार (All)',
      self: 'स्वयं (Self)',
      father: 'पिताजी (Father)',
      mother: 'माताजी (Mother)',
      grandfather: 'दादाजी (Grandfather)',
    },
  },

  // BENGALI (বাংলা)
  bn: {
    appName: 'ভারত সুস্থ (Bharat Swasth)',
    tagline: 'আপনার স্বাস্থ্য, সহজ ভাষায়।',
    subTagline: 'মেডিকেল রিপোর্ট এবং প্রেসক্রিপশন সহজ বাংলায়',
    languageLabel: 'ভাষা / Language:',
    nav: {
      home: 'হোম',
      caregiver: 'পরিচর্যাকারী পোর্টাল',
      healthWorker: 'স্বাস্থ্যকর্মী সারি',
      consent: 'সম্মতি ও গোপনীয়তা',
      dashboard: 'ড্যাশবোর্ড (Dashboard)',
      myReports: 'আমার রিপোর্ট',
      familyProfiles: 'পরিবারের প্রোফাইল',
      uploadNewReport: '+ নতুন রিপোর্ট আপলোড',
      signIn: 'সাইন ইন',
      signOut: 'সাইন আউট',
      dpdpBadge: 'DPDP 2023 সুরক্ষিত',
    },
    greetings: {
      morning: 'সুপ্রভাত',
      afternoon: 'শুভ অপরাহ্ন',
      evening: 'শুভ সন্ধ্যা',
      welcomeSubtitle: 'আপনার স্বাস্থ্য, সহজ ভাষায় • যেকোনো মেডিকেল রিপোর্ট সহজে বুঝুন।',
      listenAloud: 'বাংলায় শুনুন (Tap to Listen)',
      pauseAudio: 'থামুন (Pause)',
      spokenIntro: (name, total, critical) =>
        `নমস্কার ${name}! ভারত সুস্থে আপনাকে স্বাগতম। আপনার ${total}টি রিপোর্ট রয়েছে। ${
          critical > 0
            ? `${critical}টি বিষয়ে ডাক্তারের পরামর্শ প্রয়োজন।`
            : 'সব রিপোর্ট স্বাভাবিক রয়েছে।'
        }`,
    },
    actionCards: {
      card1Badge: 'ল্যাব রিপোর্ট',
      card1Title: 'ল্যাব রিপোর্ট স্ক্যান',
      card1Desc: 'রক্ত পরীক্ষা বা ল্যাব রিপোর্টের ছবি তুলুন। সহজ বাংলায় ব্যাখ্যা শুনুন।',
      card1Btn: 'ছবি তুলুন (Open Camera) →',
      card2Badge: 'ওষুধের সময়সূচী',
      card2Title: 'ডাক্তারের প্রেসক্রিপশন (Rx)',
      card2Desc: 'সকাল ও রাতে কখন কোন ওষুধ খেতে হবে তা সহজ বাংলায় শুনুন।',
      card2Btn: 'ওষুধের বিবরণ (Scan Rx) →',
      card3Badge: 'হোয়াটসঅ্যাপ / PDF',
      card3Title: 'ফাইল আপলোড',
      card3Desc: 'হোয়াটসঅ্যাপে আসা রিপোর্ট পিডিএফ বা গ্যালারি থেকে ফাইল আপলোড করুন।',
      card3Btn: 'ফাইল বেছে নিন (Choose File) →',
    },
    statusCards: {
      safeTitle: 'সব ঠিক / SAFE',
      safeDesc: 'স্বাভাবিক সীমার মধ্যে পরীক্ষার ফলাফল',
      attentionTitle: 'মনোযোগ দিন / ATTENTION',
      attentionDesc: 'সামান্য পরিবর্তিত বা লক্ষণীয় মান',
      doctorTitle: 'ডাক্তারের পরামর্শ / DOCTOR',
      doctorDesc: 'ডাক্তারের সরাসরি পরামর্শ প্রয়োজন',
      criticalWarning: 'ডাক্তার দেখান',
      allClearNotice: 'জরুরী সমস্যা নেই',
    },
    reportsSection: {
      recentTitle: 'সাম্প্রতিক মেডিকেল রিপোর্ট',
      recentSubtitle: 'যেকোনো রিপোর্ট শুনতে "শুনুন" বোতাম টিপুন',
      noReports: 'এখনও কোনো রিপোর্ট নেই',
      noReportsDesc: 'আপনার প্রথম ল্যাব রিপোর্ট বা প্রেসক্রিপশনের ছবি তুলুন।',
      scanFirstReport: 'প্রথম রিপোর্ট স্ক্যান করুন',
      safeBadge: 'সব ঠিক',
      attentionBadge: 'মনোযোগ দিন',
      criticalBadge: 'ডাক্তার দেখান',
      listen: 'শুনুন',
      stop: 'থামুন',
      shareWhatsApp: 'হোয়াটসঅ্যাপে পাঠান',
      prescriptionTag: 'প্রেসক্রিপশন (Rx)',
      labReportTag: 'ল্যাব রিপোর্ট',
      allFamily: 'সকল পরিবার (All)',
      self: 'নিজে (Self)',
      father: 'বাবা (Father)',
      mother: 'মা (Mother)',
      grandfather: 'দাদু (Grandfather)',
    },
  },

  // ENGLISH (DEFAULT)
  en: {
    appName: 'Bharat Swasth',
    tagline: 'Your Health, Simplified.',
    subTagline: 'Plain-language medical lab reports & prescription timetable',
    languageLabel: 'Language / மொழி / भाषा:',
    nav: {
      home: 'Home',
      caregiver: 'Caregiver Portal',
      healthWorker: 'Health Worker Queue',
      consent: 'Consent & Privacy',
      dashboard: 'Dashboard',
      myReports: 'My Reports',
      familyProfiles: 'Family Profiles',
      uploadNewReport: '+ Upload New Report',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      dpdpBadge: 'DPDP 2023 Shield',
    },
    greetings: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      welcomeSubtitle: 'Understand any medical report or prescription with ease.',
      listenAloud: 'Listen to Health Summary',
      pauseAudio: 'Pause Audio',
      spokenIntro: (name, total, critical) =>
        `Hello ${name}! Welcome to Bharat Swasth. You have ${total} health reports on file. ${
          critical > 0
            ? `${critical} critical values require your doctor's review.`
            : 'All routine test values are within normal reference range.'
        }`,
    },
    actionCards: {
      card1Badge: 'Lab Report',
      card1Title: 'Scan Lab Report',
      card1Desc: 'Snap a picture of blood test, sugar, lipid, or scan reports. Auto-cropped & spoken aloud.',
      card1Btn: 'Snap Report (Open Camera) →',
      card2Badge: 'Rx Timetable',
      card2Title: 'Doctor Prescription (Rx)',
      card2Desc: 'Clear morning & night pill schedule without modifying prescribed doses. Drug safety checks.',
      card2Btn: 'Scan Prescription (Rx) →',
      card3Badge: 'WhatsApp / PDF',
      card3Title: 'Upload File / PDF',
      card3Desc: 'Upload diagnostic lab PDFs received on WhatsApp or photos from your gallery.',
      card3Btn: 'Choose File (Browse) →',
    },
    statusCards: {
      safeTitle: 'All Normal',
      safeDesc: 'Results within standard biological range',
      attentionTitle: 'Needs Attention',
      attentionDesc: 'Values slightly outside normal range',
      doctorTitle: 'Doctor Review',
      doctorDesc: 'Requires clinical consultation',
      criticalWarning: 'Doctor Consultation Advised',
      allClearNotice: 'No emergency issues detected',
    },
    reportsSection: {
      recentTitle: 'Recent Health Reports',
      recentSubtitle: 'Click "Listen" on any report to hear plain-language audio explanation',
      noReports: 'No reports on file yet',
      noReportsDesc: 'Photograph your first lab report or doctor prescription to get started.',
      scanFirstReport: 'Scan Your First Report',
      safeBadge: 'All Normal',
      attentionBadge: 'Attention',
      criticalBadge: 'Doctor Review',
      listen: 'Listen',
      stop: 'Pause',
      shareWhatsApp: 'Share on WhatsApp',
      prescriptionTag: 'Doctor Prescription (Rx)',
      labReportTag: 'Lab Report',
      allFamily: 'All Family Members',
      self: 'Self',
      father: 'Father',
      mother: 'Mother',
      grandfather: 'Grandfather',
    },
  },
};

export function getUITranslation(languageCode: string): UITranslation {
  return UI_TRANSLATIONS[languageCode] || UI_TRANSLATIONS['en'];
}
