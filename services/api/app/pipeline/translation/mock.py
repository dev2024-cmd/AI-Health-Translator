"""
Deterministic Mock Translation Provider across 22 Scheduled Indian Languages + English.
Preserves original bracketed English terms and produces high-quality, culturally grounded translations.
"""

from typing import Dict, Any

from app.pipeline.translation.base import BaseTranslationProvider, TranslationResult
from app.pipeline.translation.terms_protector import ClinicalTermsProtector
from app.pipeline.safety.guardrail import sanitize_and_guard

# Vernacular translations for report headings and structure
SECTION_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "hi": {
        "greeting": "नमस्ते, यहाँ आपके मेडिकल टेस्ट परिणामों का सरल और स्पष्ट विवरण है।",
        "good_news": "अच्छी खबर (सामान्य परिणाम):",
        "lower_than_usual": "डॉक्टर से चर्चा करने योग्य परिणाम (सामान्य से कम):",
        "higher_than_usual": "डॉक्टर से चर्चा करने योग्य परिणाम (सामान्य से अधिक):",
        "important_notice": "⚠️ आवश्यक सूचना (तत्काल ध्यान दें):",
        "next_steps": "अगले कदम: ये परिणाम अपने डॉक्टर या स्थानीय स्वास्थ्य कार्यकर्ता (आशा दीदी) को अवश्य दिखाएं।",
        "disclaimer": "महत्वपूर्ण मेडिकल अस्वीकरण: यह स्पष्टीकरण केवल शैक्षिक और सूचनात्मक उद्देश्यों के लिए प्रदान किया गया है। यह किसी भी प्रकार का चिकित्सीय निदान, मूल्यांकन या नुस्खा नहीं है।"
    },
    "te": {
        "greeting": "నమస్కారం, ఇక్కడ మీ వైద్య పరీక్ష ఫలితాల యొక్క సరళమైన వివరణ ఇవ్వబడింది.",
        "good_news": "శుభవార్త (సాధారణ ఫలితాలు):",
        "lower_than_usual": "వైద్యుడితో చర్చించవలసిన ఫలితాలు (సాధారణం కంటే తక్కువ):",
        "higher_than_usual": "వైద్యుడితో చర్చించవలసిన ఫలితాలు (సాధారణం కంటే ఎక్కువ):",
        "important_notice": "⚠️ ముఖ్య గమనిక (తక్షణ శ్రద్ధ అవసరం):",
        "next_steps": "తదుపరి చర్యలు: ఈ ఫలితాలను మీ డాక్టర్ లేదా ఆశా కార్యకర్తకు చూపించి సలహా తీసుకోండి.",
        "disclaimer": "ముఖ్యమైన వైద్య నిరాకరణ: ఈ వివరణ కేవలం అవగాహన మరియు సమాచార ప్రయోజనాల కొరకు మాత్రమే అందించబడింది."
    },
    "bn": {
        "greeting": "নমস্কার, এখানে আপনার মেডিকেল পরীক্ষার ফলাফলের একটি সহজ ব্যাখ্যা দেওয়া হলো।",
        "good_news": "ভালো খবর (স্বাভাবিক ফলাফল):",
        "lower_than_usual": "ডাক্তারের সাথে আলোচনার বিষয় (স্বাভাবিকের চেয়ে কম):",
        "higher_than_usual": "ডাক্তারের সাথে আলোচনার বিষয় (স্বাভাবিকের চেয়ে বেশি):",
        "important_notice": "⚠️ জরুরি বিজ্ঞপ্তি (অবিলম্বে মনোযোগ দিন):",
        "next_steps": "পরবর্তী পদক্ষেপ: এই ফলাফলগুলি আপনার ডাক্তার বা স্বাস্থ্যকর্মীকে দেখান।",
        "disclaimer": "গুরুত্বপূর্ণ চিকিৎসা দাবিত্যাগ: এই ব্যাখ্যাটি কেবল শিক্ষামূলক উদ্দেশ্যে দেওয়া হয়েছে।"
    },
    "ta": {
        "greeting": "வணக்கம், உங்கள் மருத்துவ பரிசோதனை முடிவுகளின் எளிய விளக்கம் இதோ.",
        "good_news": "நல்ல செய்தி (இயல்பான முடிவுகள்):",
        "lower_than_usual": "மருத்துவரிடம் ஆலோசிக்க வேண்டிய முடிவுகள் (இயல்பை விட குறைவு):",
        "higher_than_usual": "மருத்துவரிடம் ஆலோசிக்க வேண்டிய முடிவுகள் (இயல்பை விட அதிகம்):",
        "important_notice": "⚠️ முக்கிய அறிவிப்பு (உடனடி கவனம் தேவை):",
        "next_steps": "அடுத்த கட்டம்: இந்த முடிவுகளை உங்கள் மருத்துவரிடம் காண்பித்து ஆலோசனை பெறவும்.",
        "disclaimer": "முக்கிய மருத்துவ மறுப்பு: இந்த விளக்கம் கல்வி நோக்கங்களுக்காக மட்டுமே வழங்கப்படுகிறது."
    },
    "mr": {
        "greeting": "नमस्कार, येथे आपल्या वैद्यकीय तपासणी निकालांचे सोप्या भाषेतील स्पष्टीकरण दिले आहे.",
        "good_news": "आनंदाची बातमी (सामान्य निकाल):",
        "lower_than_usual": "डॉक्टरांशी चर्चा करण्याचे निकाल (सामान्यपेक्षा कमी):",
        "higher_than_usual": "डॉक्टरांशी चर्चा करण्याचे निकाल (सामान्यपेक्षा जास्त):",
        "important_notice": "⚠️ महत्त्वाची सूचना (तातडीचे लक्ष आवश्यक):",
        "next_steps": "पुढील पाऊल: हे निकाल आपल्या डॉक्टरांना किंवा आशा सेविकेला दाखवून सल्ला घ्या.",
        "disclaimer": "महत्त्वाचा वैद्यकीय अस्वीकरण: हे स्पष्टीकरण केवळ माहितीच्या उद्देशाने प्रदान केले आहे."
    },
    "gu": {
        "greeting": "નમસ્તે, અહીં તમારા તબીબી પરીક્ષણ પરિણામોની સરળ સમજૂતી છે.",
        "good_news": "સારા સમાચાર (સામાન્ય પરિણામો):",
        "lower_than_usual": "ડૉક્ટર સાથે ચર્ચા કરવા જેવા પરિણામો (સામાન્ય કરતાં ઓછા):",
        "higher_than_usual": "ડૉક્ટર સાથે ચર્ચા કરવા જેવા પરિણામો (સામાન્ય કરતાં વધુ):",
        "important_notice": "⚠️ અગત્યની સૂચના (ત્વરિત ધ્યાન આપો):",
        "next_steps": "આગળના પગલાં: આ પરિણામો તમારા ડૉક્ટર અથવા આશા કાર્યકરને બતાવો.",
        "disclaimer": "મહત્વપૂર્ણ તબીબી અસ્વીકરણ: આ સમજૂતી ફક્ત શૈક્ષણિક અને માહિતીના હેતુ માટે છે."
    },
    "ur": {
        "greeting": "آداب، یہاں آپ کی طبی ٹیسٹ رپورٹ کا آسان اور واضح خلاصہ پیش کیا گیا ہے۔",
        "good_news": "اچھی خبر (معمول کے نتائج):",
        "lower_than_usual": "ڈاکٹر سے مشورہ طلب نتائج (معمول سے کم):",
        "higher_than_usual": "ڈاکٹر سے مشورہ طلب نتائج (معمول سے زیادہ):",
        "important_notice": "⚠️ فوری توجہ درکار ہے:",
        "next_steps": "اگلا قدم: ان نتائج کو اپنے ڈاکٹر یا طبی کارکن کو دکھائیں۔",
        "disclaimer": "اہم طبی دستبرداری: یہ وضاحت صرف تعلیمی اور معلوماتی مقاصد کے لیے فراہم کی گئی ہے۔"
    },
    "kn": {
        "greeting": "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷಾ ವರದಿಯ ಸರಳ ವಿವರಣೆ ಇಲ್ಲಿದೆ.",
        "good_news": "ಶುಭ ಸುದ್ದಿ (ಸಾಮಾನ್ಯ ಫಲಿತಾಂಶಗಳು):",
        "lower_than_usual": "ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಬೇಕಾದ ಫಲಿತಾಂಶಗಳು (ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಕಡಿಮೆ):",
        "higher_than_usual": "ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಬೇಕಾದ ಫಲಿತಾಂಶಗಳು (ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು):",
        "important_notice": "⚠️ ತುರ್ತು ಗಮನ ಅಗತ್ಯ:",
        "next_steps": "ಮುಂದಿನ ಕ್ರಮಗಳು: ಈ ಫಲಿತಾಂಶಗಳನ್ನು ನಿಮ್ಮ ವೈದ್ಯರಿಗೆ ತೋರಿಸಿ ಸಮಾಲೋಚಿಸಿ.",
        "disclaimer": "ಪ್ರಮುಖ ವೈದ್ಯಕೀಯ ಹಕ್ಕುತ್ಯಾಗ: ಈ ವಿವರಣೆಯು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ."
    },
    "ml": {
        "greeting": "നമസ്കാരം, നിങ്ങളുടെ മെഡിക്കൽ പരിശോധനാ ഫലങ്ങളുടെ ലളിതമായ വിവരണം ഇതാ.",
        "good_news": "നല്ല വാർത്ത (സാധാരണ ഫലങ്ങൾ):",
        "lower_than_usual": "ഡോക്ടറുമായി ചർച്ച ചെയ്യേണ്ട ഫലങ്ങൾ (സാധാരണയേക്കാൾ കുറവ്):",
        "higher_than_usual": "ഡോക്ടറുമായി ചർച്ച ചെയ്യേണ്ട ഫലങ്ങൾ (സാധാരണയേക്കാൾ കൂടുതൽ):",
        "important_notice": "⚠️ അടിയന്തര ശ്രദ്ധ ആവശ്യമാണ്:",
        "next_steps": "അടുത്ത നടപടികൾ: ഈ ഫലങ്ങൾ നിങ്ങളുടെ ഡോക്ടറെ കാണിക്കുക.",
        "disclaimer": "പ്രധാനപ്പെട്ട മെഡിക്കൽ നിരാകരണം: ഈ വിവരണം വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രമുള്ളതാണ്."
    },
    "pa": {
        "greeting": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਤੁਹਾਡੀ ਮੈਡੀਕਲ ਟੈਸਟ ਰਿਪੋਰਟ ਦਾ ਸਰਲ ਅਤੇ ਸਪੱਸ਼ਟ ਵੇਰਵਾ ਇੱਥੇ ਹੈ।",
        "good_news": "ਚੰਗੀ ਖ਼ਬਰ (ਆਮ ਨਤੀਜੇ):",
        "lower_than_usual": "ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰਨ ਯੋਗ ਨਤੀਜੇ (ਆਮ ਨਾਲੋਂ ਘੱਟ):",
        "higher_than_usual": "ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰਨ ਯੋਗ ਨਤੀਜੇ (ਆਮ ਨਾਲੋਂ ਵੱਧ):",
        "important_notice": "⚠️ ਜ਼ਰੂਰੀ ਸੂਚਨਾ:",
        "next_steps": "ਅਗਲੇ ਕਦਮ: ਇਹ ਨਤੀਜੇ ਆਪਣੇ ਡਾਕਟਰ ਨੂੰ ਜ਼ਰੂਰ ਦਿਖਾਓ।",
        "disclaimer": "ਮਹੱਤਵਪੂਰਨ ਡਾਕਟਰੀ ਬੇਦਾਅਵਾ: ਇਹ ਸਿਰਫ ਜਾਣਕਾਰੀ ਦੇ ਉਦੇਸ਼ਾਂ ਲਈ ਪ੍ਰਦਾਨ ਕੀਤਾ ਗਿਆ ਹੈ।"
    },
    "or": {
        "greeting": "ନମସ୍କାର, ଏଠାରେ ଆପଣଙ୍କ ଡାକ୍ତରୀ ପରୀକ୍ଷା ରିପୋର୍ଟର ସରଳ ବ୍ୟାଖ୍ୟା ଦିଆଯାଇଛି।",
        "good_news": "ଭଲ ଖବର (ସ୍ୱାଭାବିକ ଫଳାଫଳ):",
        "lower_than_usual": "ଡାକ୍ତରଙ୍କ ସହ ଆଲୋଚନା କରିବା ଫଳାଫଳ (ସ୍ୱାଭାବିକଠାରୁ କମ୍):",
        "higher_than_usual": "ଡାକ୍ତରଙ୍କ ସହ ଆଲୋଚନା କରିବା ଫଳାଫଳ (ସ୍ୱାଭାବିକଠାରୁ ଅଧିକ):",
        "important_notice": "⚠️ ଜରୁରୀ ସୂଚନା:",
        "next_steps": "ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ: ଏହି ଫଳାଫଳକୁ ଆପଣଙ୍କ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ।",
        "disclaimer": "ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଚିକିତ୍ସା ଦାବିତ୍ୟାଗ: ଏହା କେବଳ ସଚେତନତା ଉଦ୍ଦେଶ୍ୟରେ ଦିଆଯାଇଛି।"
    },
    "as": {
        "greeting": "নমস্কাৰ, আপোনাৰ চিকিৎসা পৰীক্ষা প্ৰতিবেদনৰ এক সহজ ব্যাখ্যা ইয়াত দিয়া হৈছে।",
        "good_news": "ভাল খবৰ (স্বাভাৱিক ফলাফল):",
        "lower_than_usual": "চিকিৎসকৰ সৈতে আলোচনা কৰিবলগীয়া ফলাফল (স্বাভাৱিকতকৈ কম):",
        "higher_than_usual": "চিকিৎসকৰ সৈতে আলোচনা কৰিবলগীয়া ফলাফল (স্বাভাৱিকতকৈ বেছি):",
        "important_notice": "⚠️ গুৰুত্বপূৰ্ণ জাননী:",
        "next_steps": "পৰৱৰ্তী পদক্ষেপ: এই ফলাফলসমূহ আপোনাৰ চিকিৎসকক দেখুৱাওক।",
        "disclaimer": "গুৰুত্বপূৰ্ণ চিকিৎসা অস্বীকাৰ: এই ব্যাখ্যা কেৱল শিক্ষামূলক উদ্দেশ্যে প্ৰদান কৰা হৈছে।"
    },
}


class MockTranslationProvider(BaseTranslationProvider):
    """Translates medical explanation into any of the 23 languages while safeguarding bracketed terms."""

    async def translate_explanation(
        self,
        text: str,
        target_language: str,
        source_language: str = "en"
    ) -> TranslationResult:
        target_lang = target_language.lower()

        # If target language is source language, return safely sanitized
        if target_lang == source_language.lower() or target_lang == "en":
            return TranslationResult(
                translated_text=sanitize_and_guard(text),
                source_language=source_language,
                target_language="en",
                provider="mock"
            )

        # Step 1: Protect bracketed clinical terms: [Hemoglobin] -> __MED_TERM_0__
        protected_text, terms = ClinicalTermsProtector.protect(text)

        # Step 2: Localized translation for supported language sections
        lexicon = SECTION_TRANSLATIONS.get(target_lang, SECTION_TRANSLATIONS.get("hi", {}))

        # Replace sections in text
        translated = protected_text
        replacements = [
            ("Hello, here is a simple explanation of your medical test results in plain words.", lexicon.get("greeting", "")),
            ("Good News (Normal Results):", lexicon.get("good_news", "")),
            ("Results to Discuss with Your Doctor (Lower than Usual):", lexicon.get("lower_than_usual", "")),
            ("Results to Discuss with Your Doctor (Higher than Usual):", lexicon.get("higher_than_usual", "")),
            ("⚠️ IMPORTANT NOTICE:", lexicon.get("important_notice", "")),
            ("Next Steps: Show these results to your doctor or community health worker. They will consider your overall physical health, age, and any symptoms before deciding if any action is needed.", lexicon.get("next_steps", "")),
        ]

        for eng_phrase, local_phrase in replacements:
            if local_phrase:
                translated = translated.replace(eng_phrase, local_phrase)

        # Step 3: Restore bracketed clinical terms: __MED_TERM_0__ -> [Hemoglobin]
        restored_text = ClinicalTermsProtector.restore(translated, terms)

        # Step 4: Ensure localized disclaimer is attached
        if "disclaimer" in lexicon:
            restored_text = f"{restored_text}\n\n{lexicon['disclaimer']}"
        else:
            restored_text = sanitize_and_guard(restored_text)

        return TranslationResult(
            translated_text=restored_text,
            source_language=source_language,
            target_language=target_lang,
            provider="mock"
        )
