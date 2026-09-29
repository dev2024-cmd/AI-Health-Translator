import React, { useState, useEffect } from 'react';
import { Phone, Radio, Volume2, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

interface PhoneSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  patientName: string;
  patientPhone: string;
  language: string;
  reportTitle?: string;
  customExplanation?: string;
  deliveryReason?: string;
  autoStart?: boolean;
}

export const PhoneSimulatorModal: React.FC<PhoneSimulatorModalProps> = ({
  isOpen,
  onClose,
  reportId = 'rep-call-01',
  patientName,
  patientPhone,
  language: initialLang,
  reportTitle,
  customExplanation,
  deliveryReason = 'Patient does not use WhatsApp or Email • Automated Voice Call Delivery',
  autoStart = false,
}) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>('Standby');
  const [lcdText, setLcdText] = useState<string>('Ready to Call');
  const [currentLang, setCurrentLang] = useState<string>(initialLang || 'en');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [keyHistory, setKeyHistory] = useState<string[]>([]);
  const [callSessionId, setCallSessionId] = useState<string>('');

  // Keep language in sync if initialLang changes
  useEffect(() => {
    if (initialLang) {
      setCurrentLang(initialLang);
    }
  }, [initialLang]);

  // Speech helper using HTML5 SpeechSynthesis with Indian regional voices
  const speakText = (text: string, lang: string = 'en', isSlow: boolean = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean markdown tags or bullets before speaking
      const cleaned = text.replace(/[*#_`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleaned);
      const speechMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        bn: 'bn-IN',
      };
      utterance.lang = speechMap[lang] || 'en-IN';
      utterance.rate = isSlow ? 0.72 : 0.92;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    let timer: any;
    if (callActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  // Clean up speech synthesis when modal is closed
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCallActive(false);
      setCallStatus('Standby');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getGreeting = (lang: string, name: string): string => {
    const greetings: Record<string, string> = {
      ta: `வணக்கம் ${name} அவர்களே. பாரத் ஸ்வஸ்த் தானியங்கி குரல் அழைப்பு. உங்கள் மருத்துவ அறிக்கை தயாராக உள்ளது. அறிக்கையை கேட்க 1, மெதுவாக கேட்க 2, ஆஷா பணியாளருக்கு 3, மொழி மாற்ற 0 அழுத்தவும்.`,
      te: `నమస్కారం ${name} గారు. భారత్ స్వస్థ్ ఆటోమేటెడ్ వాయిస్ కాల్. మీ మెడికల్ రిపోర్ట్ సిద్ధంగా ఉంది. వినడానికి 1, నెమ్మదిగా వినడానికి 2, ఆశా కార్యకర్త కోసం 3, భాష కోసం 0 నొక్కండి.`,
      hi: `नमस्ते ${name} जी। भारत स्वस्थ स्वचालित वॉयस कॉल। आपकी मेडिकल टेस्ट रिपोर्ट तैयार है। रिपोर्ट सुनने के लिए 1, धीरे सुनने के लिए 2, आशा दीदी से बात करने के लिए 3, भाषा बदलने के लिए 0 दबाएं।`,
      bn: `নমস্কার ${name} মহাশয়। ভারত স্বস্থ স্বয়ংক্রিয় ভয়েস কল। আপনার মেডিকেল রিপোর্ট প্রস্তুত। শুনতে 1, ধীরে শুনতে 2, আশা দিদির সাথে কথা বলতে 3, ভাষা পরিবর্তনের জন্য 0 টিপুন।`,
      en: `Hello ${name}. Bharat Swasth automated voice dispatch. Your medical test report is ready. Press 1 to listen, 2 to listen slowly, 3 to request health worker callback, 0 for language.`,
    };
    return greetings[lang] || greetings['en'];
  };

  const getSpokenExplanation = (lang: string): string => {
    if (customExplanation && customExplanation.trim()) {
      return customExplanation;
    }

    const defaultExplanations: Record<string, string> = {
      ta: 'உங்கள் ரத்த பரிசோதனையில் ஹீமோகுளோபின் அளவு 11.2 ஆக உள்ளது, இது சற்று குறைவு. தட்டணுக்கள் ஆரோக்கியமாக உள்ளன. உங்கள் மருத்துவரை அணுகவும்.',
      te: 'మీ రక్తంలో హిమోగ్లోబిన్ 11.2 గా ఉంది, ఇది కొద్దిగా తక్కువ. ప్లేట్‌లెట్లు సాధారణంగా ఉన్నాయి. డాక్టర్‌ని సంప్రదించండి.',
      hi: 'आपके रक्त में हीमोग्लोबिन 11.2 है, जो सामान्य से थोड़ा कम है। प्लेटलेट्स सामान्य हैं। डॉक्टर से सलाह लें।',
      bn: 'আপনার রক্তে হিমোগ্লোবিন 11.2, যা কিছুটা কম। প্লেটলেট স্বাভাবিক আছে। ডাক্তারের পরামর্শ নিন।',
      en: 'Your hemoglobin is 11.2, slightly lower than normal reference range. Platelets are healthy. Consult your doctor.',
    };

    return defaultExplanations[lang] || defaultExplanations['en'];
  };

  const handleStartCall = async () => {
    setCallActive(true);
    setCallStatus('Connecting...');
    setLcdText(`Dialing ${patientPhone}...`);

    // Backend Telephony Log synchronization
    try {
      const token = localStorage.getItem('swasthya_access_token');
      if (token) {
        const resp = await fetch('http://localhost:8000/v1/telephony/call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            report_id: reportId || 'rep-mock-01',
            patient_id: 'pat-self',
          }),
        }).catch(() => null);

        if (resp && resp.ok) {
          const data = await resp.json();
          if (data.call_id) setCallSessionId(data.call_id);
        }
      }
    } catch {
      // Graceful local simulation fallback
    }

    setTimeout(() => {
      setCallStatus('Connected');
      const greetingText = getGreeting(currentLang, patientName || 'Patient');
      setLcdText(greetingText);
      speakText(greetingText, currentLang, false);
    }, 1300);
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallActive(false);
    setCallStatus('Call Ended');
    setLcdText('Call Ended. Stay healthy.');
    setTimeout(() => {
      setLcdText('Standby');
      setCallStatus('Standby');
    }, 2000);
  };

  const handleKeyPress = async (digit: string) => {
    if (!callActive) return;

    setKeyHistory((prev) => [...prev, digit]);

    // Backend DTMF tracking sync
    if (callSessionId) {
      try {
        const token = localStorage.getItem('swasthya_access_token');
        if (token) {
          fetch('http://localhost:8000/v1/telephony/dtmf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              call_id: callSessionId,
              digit,
            }),
          }).catch(() => {});
        }
      } catch {}
    }

    if (digit === '1') {
      // Normal playback of medical summary
      const text = getSpokenExplanation(currentLang);
      setLcdText(`[Key 1] Playing Explanation: ${text}`);
      speakText(text, currentLang, false);
    } else if (digit === '2') {
      // Slow playback
      const baseText = getSpokenExplanation(currentLang);
      const slowPrefaces: Record<string, string> = {
        ta: 'மெதுவான குரல் பதிவு: ',
        te: 'నిదానంగా వివరిస్తున్నాము: ',
        hi: 'धीमी गति से विवरण: ',
        bn: 'ধীর গতিতে বিবরণ: ',
        en: 'Speaking slowly and clearly: ',
      };
      const text = `${slowPrefaces[currentLang] || ''}${baseText}`;
      setLcdText(`[Key 2] Slow Speed: ${text}`);
      speakText(text, currentLang, true);
    } else if (digit === '3') {
      // Health worker callback request
      const callbackMessages: Record<string, string> = {
        ta: 'உங்கள் பகுதி ஆஷா மருத்துவ பணியாளருக்கு அவசர தகவல் அனுப்பப்பட்டுள்ளது. அவர்கள் விரைவில் உங்களுக்கு போன் செய்வார்கள்.',
        te: 'మీ ఆశా కార్యకర్త (లక్ష్మీ దేవి) కి సమాచారం ఇవ్వబడింది. వారు త్వరలోనే మీకు ఫోన్ చేసి మాట్లాడతారు.',
        hi: 'आपकी आशा दीदी (लक्ष्मी देवी) को कॉल करने हेतु सूचित कर दिया गया है। वे जल्द ही आपको फोन करेंगी।',
        bn: 'আপনার আশা স্বাস্থ্যকর্মীকে জানানো হয়েছে। তিনি শীঘ্রই আপনাকে কল করবেন।',
        en: 'Your community health worker (ASHA / ANM) has been notified. They will call your phone shortly.',
      };
      const confirmText = callbackMessages[currentLang] || callbackMessages['en'];
      setLcdText(`[Key 3] Callback Confirmed: ${confirmText}`);
      speakText(confirmText, currentLang, false);

      setTimeout(() => {
        handleEndCall();
      }, 4500);
    } else if (digit === '0') {
      // Cycle languages: en -> ta -> te -> hi -> bn -> en
      const langOrder = ['en', 'ta', 'te', 'hi', 'bn'];
      const nextIdx = (langOrder.indexOf(currentLang) + 1) % langOrder.length;
      const nextLang = langOrder[nextIdx];
      setCurrentLang(nextLang);

      const switchTexts: Record<string, string> = {
        ta: 'மொழி தமிழுக்கு மாற்றப்பட்டது. அறிக்கையைக் கேட்க 1 அழுத்தவும்.',
        te: 'భాష తెలుగులోకి మార్చబడింది. రిపోర్ట్ వినడానికి 1 నొక్కండి.',
        hi: 'भाषा बदलकर हिन्दी की गई। रिपोर्ट सुनने के लिए 1 दबाएं।',
        bn: 'ভাষা পরিবর্তন করে বাংলা করা হয়েছে। রিপোর্ট শুনতে 1 টিপুন।',
        en: 'Language changed to English. Press 1 to listen to your report.',
      };

      const switchMsg = switchTexts[nextLang] || switchTexts['en'];
      setLcdText(`[Key 0] Language Switched: ${nextLang.toUpperCase()}`);
      speakText(switchMsg, nextLang, false);
    } else {
      const invalidTexts: Record<string, string> = {
        ta: 'தவறான எண். 1, 2, 3 அல்லது 0 அழுத்தவும்.',
        te: 'సరైన బటన్ నొక్కండి. 1, 2, 3 లేదా 0 నొక్కండి.',
        hi: 'अमान्य बटन। 1, 2, 3 या 0 दबाएं।',
        bn: 'ভুল বোতাম। 1, 2, 3 বা 0 টিপুন।',
        en: 'Invalid key. Press 1 to listen, 2 for slow, 3 for health worker, or 0 for language.',
      };
      const invalidText = invalidTexts[currentLang] || invalidTexts['en'];
      setLcdText(`[Key ${digit}] ${invalidText}`);
      speakText(invalidText, currentLang);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="phone-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Banner highlighting Voice Call Fallback when WhatsApp/Email is not used */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Radio className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
            <span>
              <strong>Voice Call Active:</strong> {deliveryReason}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200">
            No WhatsApp / Email Needed
          </span>
        </div>

        {/* Modal Header */}
        <div className="phone-modal-header">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="phone-modal-title">Automated Voice Call Simulator (IVR)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Telecom 2G/4G
              </span>
            </div>
            <p className="phone-modal-subtitle">
              Delivering spoken medical explanation to <strong>{patientName}</strong> ({patientPhone}) in{' '}
              <strong className="uppercase">{currentLang}</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close phone simulator">
            ✕
          </button>
        </div>

        <div className="phone-simulator-layout">
          {/* RETRO FEATURE PHONE CASING */}
          <div className="retro-phone-casing">
            <div className="phone-earpiece" />

            {/* RETRO LCD SCREEN */}
            <div className="phone-lcd-screen">
              <div className="lcd-header">
                <span>AIRTEL 4G</span>
                <span>{callActive ? formatSeconds(callDuration) : '98%'}</span>
              </div>

              <div className="lcd-body">
                <div className="lcd-caller-id">
                  {callActive ? 'AI Swasthya Helpline (+91 1800-SWSTH)' : `To: ${patientPhone}`}
                </div>
                <div className="lcd-status-badge">{callStatus.toUpperCase()}</div>
                <div className="lcd-text-stream">{lcdText}</div>
              </div>

              <div className="lcd-footer">
                <span>LANG: {currentLang.toUpperCase()}</span>
                <span>DTMF: {keyHistory.slice(-4).join(' ')}</span>
              </div>
            </div>

            {/* CALL ACTION BUTTONS */}
            <div className="phone-action-row">
              <button
                className={`phone-call-btn ${callActive ? 'disabled' : ''}`}
                onClick={handleStartCall}
                disabled={callActive}
              >
                Call Patient
              </button>
              <button
                className={`phone-hangup-btn ${!callActive ? 'disabled' : ''}`}
                onClick={handleEndCall}
                disabled={!callActive}
              >
                End Call
              </button>
            </div>

            {/* RETRO 12-KEY NUMBER PAD */}
            <div className="phone-keypad-grid">
              {[
                { key: '1', sub: 'Listen' },
                { key: '2', sub: 'Slow 0.7x' },
                { key: '3', sub: 'ASHA Call' },
                { key: '4', sub: 'GHI' },
                { key: '5', sub: 'JKL' },
                { key: '6', sub: 'MNO' },
                { key: '7', sub: 'PQRS' },
                { key: '8', sub: 'TUV' },
                { key: '9', sub: 'WXYZ' },
                { key: '*', sub: 'Tone' },
                { key: '0', sub: 'Language' },
                { key: '#', sub: 'Enter' },
              ].map((item) => (
                <button
                  key={item.key}
                  className="keypad-btn"
                  onClick={() => handleKeyPress(item.key)}
                  disabled={!callActive}
                >
                  <span className="key-digit">{item.key}</span>
                  <span className="key-sub">{item.sub}</span>
                </button>
              ))}
            </div>

            <div className="phone-mic-hole" />
          </div>

          {/* SIMULATOR INSTRUCTIONS & DTMF TRAIL */}
          <div className="simulator-side-info">
            <div className="info-guide-box">
              <h4>Non-Digital Patient Accessibility Guide</h4>
              <p className="text-[11px] text-slate-500 mb-2">
                Designed for patients who cannot read complex text or do not use WhatsApp / Email:
              </p>
              <ul>
                <li>
                  <strong>Press 1:</strong> Listens to the medical summary in plain everyday language.
                </li>
                <li>
                  <strong>Press 2:</strong> Replays at slow, high-clarity speed (0.7x) for elders.
                </li>
                <li>
                  <strong>Press 3:</strong> Requests an immediate callback from their local ASHA or ANM
                  health worker.
                </li>
                <li>
                  <strong>Press 0:</strong> Cycles language (English ↔ Tamil ↔ Telugu ↔ Hindi ↔ Bengali).
                </li>
              </ul>
            </div>

            {/* Real-time explanation preview being spoken */}
            {customExplanation && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Audio Voice Payload:
                </span>
                <p className="text-slate-700 dark:text-slate-300 line-clamp-3 text-[11px]">
                  {customExplanation}
                </p>
              </div>
            )}

            <div className="dtmf-history-card">
              <h4>Keypress Audit Trail (Telecom Telemetry)</h4>
              {keyHistory.length === 0 ? (
                <p className="no-events-text">Click &quot;Call Patient&quot; and use the keypad.</p>
              ) : (
                <div className="key-trail-list">
                  {keyHistory.map((k, idx) => (
                    <div key={idx} className="trail-item">
                      <span className="trail-key">Key {k}</span>
                      <span className="trail-desc">
                        {k === '1'
                          ? 'Played standard medical explanation'
                          : k === '2'
                          ? 'Played slow explanation (0.7x)'
                          : k === '3'
                          ? 'Requested ASHA health worker callback'
                          : k === '0'
                          ? 'Switched language'
                          : 'Tone recorded'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
