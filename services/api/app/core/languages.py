"""
Supported Languages Configuration (22 Scheduled Indian Languages + English = 23 Total).
Provides script, direction, TTS availability, and fallback configurations.
"""

from typing import Dict, List, Any

SUPPORTED_LANGUAGES: List[Dict[str, Any]] = [
    {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "Welcome to AI Health Report Translator.",
        "fallback_language": None
    },
    {
        "code": "hi",
        "name": "Hindi",
        "native_name": "हिन्दी",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "एआई स्वास्थ्य रिपोर्ट अनुवादक में आपका स्वागत है।",
        "fallback_language": "en"
    },
    {
        "code": "bn",
        "name": "Bengali",
        "native_name": "বাংলা",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "এআই স্বাস্থ্য রিপোর্ট অনুবাদকে স্বাগতম।",
        "fallback_language": "en"
    },
    {
        "code": "te",
        "name": "Telugu",
        "native_name": "తెలుగు",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "ఏఐ ఆరోగ్య నివేదిక అనువాదకుడికి స్వాగతం.",
        "fallback_language": "en"
    },
    {
        "code": "mr",
        "name": "Marathi",
        "native_name": "मराठी",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "एआय आरोग्य अहवाल अनुवादकामध्ये आपले स्वागत आहे.",
        "fallback_language": "hi"
    },
    {
        "code": "ta",
        "name": "Tamil",
        "native_name": "தமிழ்",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "AI சுகாதார அறிக்கை மொழிபெயர்ப்பாளருக்கு வரவேற்கிறோம்.",
        "fallback_language": "en"
    },
    {
        "code": "gu",
        "name": "Gujarati",
        "native_name": "ગુજરાતી",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "એઆઈ આરોગ્ય અહેવાલ અનુવાદકમાં તમારું સ્વાગત છે.",
        "fallback_language": "hi"
    },
    {
        "code": "ur",
        "name": "Urdu",
        "native_name": "اردو",
        "direction": "rtl",
        "tts_available": True,
        "sample_audio_text": "اے آئی ہیلتھ رپورٹ ٹرانسلیٹر میں خوش آمدید۔",
        "fallback_language": "hi"
    },
    {
        "code": "kn",
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "ಎಐ ಆರೋಗ್ಯ ವರದಿ ಅನುವಾದಕಕ್ಕೆ ಸುಸ್ವಾಗತ.",
        "fallback_language": "en"
    },
    {
        "code": "or",
        "name": "Odia",
        "native_name": "ଓଡ଼ିଆ",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "ଏଆଇ ସ୍ୱାସ୍ଥ୍ୟ ରିପୋର୍ଟ ଅନୁବାଦକକୁ ସ୍ୱାଗତ।",
        "fallback_language": "en"
    },
    {
        "code": "ml",
        "name": "Malayalam",
        "native_name": "മലയാളം",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "എഐ ആരോഗ്യ റിപ്പോർട്ട് വിവർത്തകനിലേക്ക് സ്വാഗതം.",
        "fallback_language": "en"
    },
    {
        "code": "pa",
        "name": "Punjabi",
        "native_name": "ਪੰਜਾਬੀ",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "ਏਆਈ ਸਿਹਤ ਰਿਪੋਰਟ ਅਨੁਵਾਦਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।",
        "fallback_language": "hi"
    },
    {
        "code": "as",
        "name": "Assamese",
        "native_name": "অসমীয়া",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "এআই স্বাস্থ্য প্ৰতিবেদন অনুবাদকলৈ স্বাগতম।",
        "fallback_language": "bn"
    },
    {
        "code": "mai",
        "name": "Maithili",
        "native_name": "मैथिली",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "एआई स्वास्थ्य रिपोर्ट अनुवादक मे अहाँक स्वागत अछि।",
        "fallback_language": "hi"
    },
    {
        "code": "sat",
        "name": "Santali",
        "native_name": "ᱥᱟᱱᱛᱟᱲᱤ",
        "direction": "ltr",
        "tts_available": False,
        "sample_audio_text": "ᱮᱟᱭ ᱦᱚᱲᱢᱚ ᱨᱤᱯᱚᱴ ᱛᱚᱨᱡᱚᱢᱟ ᱨᱮ ᱡᱚᱦᱟᱨ᱾",
        "fallback_language": "hi"
    },
    {
        "code": "ks",
        "name": "Kashmiri",
        "native_name": "کٲشُر",
        "direction": "rtl",
        "tts_available": False,
        "sample_audio_text": "اے آئی صحت رپورٹ ترجمہ کرنس منٛز خوش آمدید۔",
        "fallback_language": "ur"
    },
    {
        "code": "ne",
        "name": "Nepali",
        "native_name": "नेपाली",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "एआई स्वास्थ्य रिपोर्ट अनुवादकमा स्वागत छ।",
        "fallback_language": "hi"
    },
    {
        "code": "kok",
        "name": "Konkani",
        "native_name": "कोंकणी",
        "direction": "ltr",
        "tts_available": False,
        "sample_audio_text": "एआय भलायकी अहवाल भाशांतरकारांत तुमकां येवकार।",
        "fallback_language": "mr"
    },
    {
        "code": "sd",
        "name": "Sindhi",
        "native_name": "سنڌي",
        "direction": "rtl",
        "tts_available": False,
        "sample_audio_text": "اي آءِ صحت رپورٽ ٽرانسليٽر ۾ ڀلي ڪري آيا.",
        "fallback_language": "hi"
    },
    {
        "code": "doi",
        "name": "Dogri",
        "native_name": "डोगरी",
        "direction": "ltr",
        "tts_available": False,
        "sample_audio_text": "एआई सेहत रिपोर्ट अनुवादक च थुआड़ा स्वागत ऐ।",
        "fallback_language": "hi"
    },
    {
        "code": "mni",
        "name": "Manipuri",
        "native_name": "মৈতৈলোন্",
        "direction": "ltr",
        "tts_available": False,
        "sample_audio_text": "AI হকশেলগী পাউদম হন্দোকপদা তরাম্না ওকচরি।",
        "fallback_language": "bn"
    },
    {
        "code": "brx",
        "name": "Bodo",
        "native_name": "बर’",
        "direction": "ltr",
        "tts_available": False,
        "sample_audio_text": "AI सावस्रि रिपर्ट राव सोलायग्रायाव बरायबाय।",
        "fallback_language": "as"
    },
    {
        "code": "sa",
        "name": "Sanskrit",
        "native_name": "संस्कृतम्",
        "direction": "ltr",
        "tts_available": True,
        "sample_audio_text": "एआई स्वास्थ्य प्रतिवेदन अनुवादके स्वागतम्।",
        "fallback_language": "hi"
    },
]

LANGUAGE_DICT: Dict[str, Dict[str, Any]] = {
    lang["code"]: lang for lang in SUPPORTED_LANGUAGES
}

# Also support common alias "dog" -> "doi"
LANGUAGE_DICT["dog"] = LANGUAGE_DICT["doi"]


def is_valid_language(code: str) -> bool:
    return code.lower() in LANGUAGE_DICT


def get_language_config(code: str) -> Dict[str, Any]:
    norm = code.lower()
    return LANGUAGE_DICT.get(norm, LANGUAGE_DICT["en"])
