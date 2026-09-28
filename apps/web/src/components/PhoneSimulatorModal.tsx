import React, { useState, useEffect } from 'react';

interface PhoneSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  patientName: string;
  patientPhone: string;
  language: string;
}

export const PhoneSimulatorModal: React.FC<PhoneSimulatorModalProps> = ({
  isOpen,
  onClose,
  reportId,
  patientName,
  patientPhone,
  language: initialLang,
}) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>('Standby');
  const [lcdText, setLcdText] = useState<string>('Ready to Call');
  const [currentLang, setCurrentLang] = useState<string>(initialLang || 'te');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [keyHistory, setKeyHistory] = useState<string[]>([]);
  const [callId, setCallId] = useState<string>('');

  // Speech helper
  const speakText = (text: string, lang: string = 'en', isSlow: boolean = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const speechMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        bn: 'bn-IN',
      };
      utterance.lang = speechMap[lang] || 'en-IN';
      utterance.rate = isSlow ? 0.75 : 0.95;
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

  if (!isOpen) return null;

  const handleStartCall = async () => {
    setCallActive(true);
    setCallStatus('Connecting...');
    setLcdText('Dialing +91 96666 66666...');

    setTimeout(() => {
      setCallStatus('Connected');
      const greetings: Record<string, string> = {
        te: `నమస్కారం ${patientName} గారు. మీ మెడికల్ రిపోర్ట్ సిద్ధంగా ఉంది. వినడానికి 1, నెమ్మదిగా వినడానికి 2, ఆశా కార్యకర్త కోసం 3, భాష కోసం 0 నొక్కండి.`,
        hi: `नमस्ते ${patientName} जी। आपकी मेडिकल टेस्ट रिपोर्ट तैयार है। सुनने के लिए 1, धीरे सुनने के लिए 2, आशा दीदी से बात करने के लिए 3, भाषा के लिए 0 दबाएं।`,
        en: `Hello ${patientName}. Your medical report is ready. Press 1 to listen, 2 to listen slowly, 3 to request health worker callback, 0 for language.`,
      };

      const greetingText = greetings[currentLang] || greetings['en'];
      setLcdText(greetingText);
      speakText(greetingText, currentLang);
    }, 1200);
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallActive(false);
    setCallStatus('Call Ended');
    setLcdText('Call Ended. Thank you.');
    setTimeout(() => {
      setLcdText('Standby');
      setCallStatus('Standby');
    }, 2000);
  };

  const handleKeyPress = (digit: string) => {
    if (!callActive) return;

    setKeyHistory((prev) => [...prev, digit]);

    if (digit === '1') {
      // Normal playback
      const text =
        currentLang === 'hi'
          ? 'आपके रक्त में हीमोग्लोबिन [Hemoglobin] 11.2 है, जो थोड़ा कम है। प्लेटलेट्स सामान्य हैं। डॉक्टर से सलाह लें।'
          : currentLang === 'te'
          ? 'మీ రక్తంలో హిమోగ్లోబిన్ [Hemoglobin] 11.2 గా ఉంది, ఇది కొద్దిగా తక్కువ. ప్లేట్‌లెట్లు సాధారణంగా ఉన్నాయి.'
          : 'Your hemoglobin [Hemoglobin] is 11.2, slightly lower than normal. Platelets are healthy. Consult your doctor.';

      setLcdText(`[Key 1] Playing Explanation: ${text}`);
      speakText(text, currentLang, false);
    } else if (digit === '2') {
      // Slow playback
      const text =
        currentLang === 'hi'
          ? 'धीमी गति: आपके रक्त में हीमोग्लोबिन [Hemoglobin] 11.2 है। यह सामान्य से थोड़ा कम है।'
          : currentLang === 'te'
          ? 'నిదానంగా: మీ రక్తంలో హిమోగ్లోబిన్ 11.2 గా ఉంది. సాధారణం కంటే తక్కువ.'
          : 'Speaking slowly: Your hemoglobin [Hemoglobin] is 11.2 g/dL. Lower than normal reference range.';

      setLcdText(`[Key 2] Slow Speed: ${text}`);
      speakText(text, currentLang, true);
    } else if (digit === '3') {
      // Health worker callback request
      const confirmText =
        currentLang === 'hi'
          ? 'आपकी आशा दीदी (लक्ष्मी देवी) को कॉल करने हेतु सूचित कर दिया गया है। वे जल्द ही आपको फोन करेंगी।'
          : currentLang === 'te'
          ? 'మీ ఆశా కార్యకర్త (లక్ష్మీ దేవి) కి సమాచారం ఇవ్వబడింది. వారు త్వరలోనే మీకు ఫోన్ చేస్తారు.'
          : 'Your community health worker (Lakshmi Devi) has been notified. She will call you shortly.';

      setLcdText(`[Key 3] Callback Confirmed: ${confirmText}`);
      speakText(confirmText, currentLang);

      setTimeout(() => {
        handleEndCall();
      }, 4000);
    } else if (digit === '0') {
      // Toggle language
      const nextLang = currentLang === 'te' ? 'hi' : currentLang === 'hi' ? 'en' : 'te';
      setCurrentLang(nextLang);
      const switchText =
        nextLang === 'hi'
          ? 'भाषा बदलकर हिन्दी की गई। सुनने के लिए 1 दबाएं।'
          : nextLang === 'te'
          ? 'భాష తెలుగులోకి మార్చబడింది. వినడానికి 1 నొక్కండి.'
          : 'Language changed to English. Press 1 to listen.';

      setLcdText(`[Key 0] Language Switched: ${nextLang.toUpperCase()}`);
      speakText(switchText, nextLang);
    } else {
      const invalidText =
        currentLang === 'hi' ? 'अमान्य बटन। 1, 2, 3 या 0 दबाएं।' : 'Invalid key. Press 1, 2, 3 or 0.';
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
        <div className="phone-modal-header">
          <div>
            <h3 className="phone-modal-title">📞 Rural Feature Phone IVR Simulator</h3>
            <p className="phone-modal-subtitle">
              Simulates automated 2G voice calls for low-literacy parents without internet
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
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
                <span>📶 JIO 4G</span>
                <span>{callActive ? `📞 ${formatSeconds(callDuration)}` : '🔋 98%'}</span>
              </div>

              <div className="lcd-body">
                <div className="lcd-caller-id">
                  {callActive ? 'AI Health Helpline (1800-111-222)' : `Target: ${patientPhone}`}
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
                📞 Call
              </button>
              <button
                className={`phone-hangup-btn ${!callActive ? 'disabled' : ''}`}
                onClick={handleEndCall}
                disabled={!callActive}
              >
                🔴 End
              </button>
            </div>

            {/* RETRO 12-KEY NUMBER PAD */}
            <div className="phone-keypad-grid">
              {[
                { key: '1', sub: 'Listen' },
                { key: '2', sub: 'Slow 0.8x' },
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
              <h4>🎯 How Rural Users Navigate</h4>
              <ul>
                <li>
                  <strong>Press 1:</strong> Listens to the report explanation spoken aloud.
                </li>
                <li>
                  <strong>Press 2:</strong> Plays the explanation at slow, clear speed (0.8x).
                </li>
                <li>
                  <strong>Press 3:</strong> Automatically generates an Escalation Ticket for the
                  community health worker (ASHA / ANM) to call back.
                </li>
                <li>
                  <strong>Press 0:</strong> Toggles language (Telugu ↔ Hindi ↔ English).
                </li>
              </ul>
            </div>

            <div className="dtmf-history-card">
              <h4>📊 Live DTMF Keypress Audit Trail</h4>
              {keyHistory.length === 0 ? (
                <p className="no-events-text">No keypresses yet. Initiate a call and press keys.</p>
              ) : (
                <div className="key-trail-list">
                  {keyHistory.map((k, idx) => (
                    <div key={idx} className="trail-item">
                      <span className="trail-key">Key {k}</span>
                      <span className="trail-desc">
                        {k === '1'
                          ? 'Played standard explanation'
                          : k === '2'
                          ? 'Played slow explanation'
                          : k === '3'
                          ? 'Requested ASHA health worker callback'
                          : k === '0'
                          ? 'Switched language'
                          : 'Key recorded'}
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
