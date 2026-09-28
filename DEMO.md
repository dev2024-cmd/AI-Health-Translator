# AI Health Report Translator - Evaluator Demo Guide

This guide walks you through verifying the entire end-to-end functionality of the AI Health Report Translator.

---

## 🚀 1-Minute Quick Verification

Run the automated walkthrough script from the project root:

```powershell
python demo_walkthrough.py
```

### What This Demonstrates Live:
1. **Curated pgvector Medical Glossary:** Loads 58 clinical terms with Grade-5 bodily analogies.
2. **Caregiver & Dependent Profile:** Links Caregiver to father *Sita Ramulu* (Telugu speaker on a feature phone).
3. **DPDP Act 2023 Consent Gate:** Explicit consent granted under Section 6.
4. **Deterministic Rules-Based Flagging:**
   - Hemoglobin 11.2 g/dL -> `[LOW]`
   - Platelet Count 220,000 /mcL -> `[NORMAL]`
   - Serum Potassium 6.8 mmol/L -> `[CRITICAL]` (Emergency panic threshold triggered!)
5. **Grade-5 Simplification & Safety Guardrail:** Reassurance on normal readings first, calm explanation of low hemoglobin, warning on potassium, original English terms bracketed (e.g. `[Hemoglobin]`), and mandatory medical disclaimer appended. Zero diagnoses or prescriptions.
6. **Multilingual Translation:** Translates into **Telugu (`te`)** and **Hindi (`hi`)**, proving that original English terms remain intact in brackets (`[Hemoglobin]`, `[Serum Potassium]`).
7. **Voice Synthesis (TTS):** Generates MP3 audio for speech narration.
8. **2G Feature Phone IVR Call Simulation:**
   - Dials father's phone (`+919666666666`).
   - Speaks Telugu IVR menu.
   - Simulates pressing Key `1` (Listen to explanation).
   - Simulates pressing Key `3` (Requests Community Health Worker callback).
   - Auto-generates an Escalation Ticket for ASHA worker *Lakshmi Devi*.
9. **160-Character SMS Dispatch:** Sends compact vernacular SMS summary to the phone.

---

## 🌐 Testing the Web Application (React PWA)

1. Start the web application:
   ```powershell
   cd apps/web
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.
3. Explore the 3 main dashboards:
   - **Caregiver Portal:** Switch between parents, view past reports, upload new files, and click **"Launch 2G Phone Simulator"** to test the retro keypad!
   - **Health Worker Dashboard:** View the triage escalation queue for abnormal and critical lab results, filter by urgency, review clinical findings, and take notes.
   - **Consent & DPDP Center:** Audit trail of data access, consent revocation toggle, and Right to Erasure actions.

---

## 📱 Testing the Mobile Application (React Native / Expo)

1. Start Expo:
   ```powershell
   cd apps/mobile
   npx expo start
   ```
2. Press `w` to run in web browser or scan the QR code using Expo Go on Android/iOS.
3. Highlights:
   - **Low-Literacy 3-Giant-Action UX:** 90dp touch targets for "Scan Report", "My Reports", and "Talk to Health Worker".
   - **Voice Prompts on Screen Load:** Spoken voice guidance in the selected Indian language.
   - **Autoplay Audio Player:** Spoken explanation plays automatically when opening a report, with `0.8x` slow speed toggle and font size controls (`A-`, `A`, `A+`).
   - **High-Contrast Toggle:** Immediate one-tap contrast inversion for low-vision users.

---

## 🧪 Running the Automated Test Suites

```powershell
# 1. Backend Pytest Suites (58 tests)
services\api\.venv\Scripts\pytest.exe -v services\api\tests

# 2. Shared Library Unit Tests (4 tests)
node packages/shared/test/shared.test.mjs

# 3. Web App Production Build
cd apps/web && npm run build

# 4. Mobile App TypeScript Typecheck
cd apps/mobile && npx tsc --noEmit
```
