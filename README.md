# AI Health Report Translator

> **Accessible, voice-enabled health and lab report simplification for elderly, low-literacy, and rural citizens across India in all 22 scheduled Indian languages plus English.**

[![Monorepo](https://img.shields.io/badge/monorepo-pnpm-blue.svg)](https://pnpm.io)
[![Backend](https://img.shields.io/badge/FastAPI-0.111+-009688.svg)](https://fastapi.tiangolo.com)
[![Database](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-336791.svg)](https://github.com/pgvector/pgvector)
[![Compliance](https://img.shields.io/badge/Compliance-India%20DPDP%20Act%202023-4caf50.svg)](#india-dpdp-act-2023-compliance)
[![Build Status](https://img.shields.io/badge/Tests-58%20Passed-brightgreen.svg)](#testing)

---

## The Problem
Pathology and diagnostic lab reports in India are filled with clinical abbreviations, reference intervals, and scientific jargon. For over 800 million citizens—especially elderly parents in villages, manual laborers, and individuals with limited literacy—understanding a blood test or lipid panel is overwhelming. Furthermore, over 90% of medical reports are printed exclusively in English, creating a massive linguistic divide.

## The Solution
1. **Multi-Page OCR:** Scan or upload paper report photographs (JPEG, PNG) or multi-page PDFs with automatic rotation and de-skewing.
2. **Deterministic Rules-Based Flagging:** Test values are evaluated deterministically (`normal`, `low`, `high`, `critical`) against clinical panic limits. **AI is strictly forbidden from deciding flags.**
3. **Grounded Grade-5 Simplification:** Plain-language explanations grounded in a curated **pgvector medical glossary (60 terms)** using everyday analogies (e.g. *Hemoglobin = oxygen delivery boats, Platelets = sticky band-aids*).
4. **Clinical Safety Guardrails:** Strict automated filters block any diagnosis or prescription advice and append mandatory medical disclaimers.
5. **Multilingual Translation (23 Languages):** High-fidelity translation across all 22 scheduled Indian languages (Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, Sanskrit, Konkani, Maithili, Dogri, Bodo, Santali, Manipuri, Nepali, Kashmiri, Sindhi) + English. Original English terms are preserved in brackets (e.g. `[Hemoglobin]`).
6. **Voice Synthesis (TTS):** Spoken audio narration with speed controls (`0.8x` slow / `1.0x` normal) and graceful degradation for voiceless languages.
7. **2G Feature Phone Channel:** Automated voice calls (IVR) and 160-character SMS summaries with interactive keypad navigation:
   - `1` = Listen to explanation
   - `2` = Listen slowly (`0.8x`)
   - `3` = Request callback from local community health worker (ASHA / ANM)
   - `0` = Change language
8. **Community Health Worker Triage:** Immediate escalation tickets when critical/panic values are detected.

---

## Monorepo Architecture

```
AI Medical Translator/
├── apps/
│   ├── web/            # React 18 + Vite PWA (Caregiver portal, ASHA triage queue, Phone simulator)
│   └── mobile/         # React Native + Expo Router (3-action low-literacy UX, audio autoplay, high contrast)
├── packages/
│   └── shared/         # TypeScript types, 23 language constants, RTL metadata, i18n dictionaries
├── services/
│   └── api/            # Python 3.11+ / FastAPI, SQLAlchemy 2, pgvector, Alembic, S3/MinIO
│       ├── app/
│       │   ├── api/v1/         # REST endpoints (auth, reports, consents, languages, telephony)
│       │   ├── models/         # 13 SQLAlchemy models
│       │   ├── pipeline/       # OCR, Extraction, Flagging, Glossary, Simplification, Safety, Escalation
│       │   ├── telephony/      # IVR state machine, DTMF handler, SMS formatter
│       │   └── storage/        # AES-256 S3/MinIO + Local fallback storage
│       └── tests/              # 58 Pytest unit & integration test suites
├── infra/
│   ├── docker-compose.yml      # PostgreSQL (pgvector), Redis, MinIO, API & Celery/Worker
│   └── .env.example
├── .github/workflows/ci.yml    # GitHub Actions CI workflow
├── demo_walkthrough.py         # End-to-end interactive CLI demo script
└── package.json                # pnpm workspace root
```

---

## Supported Languages Matrix (23 Languages)

| Code | English Name | Native Script | Direction | TTS Voice | Fallback |
|:---:|:---|:---|:---:|:---:|:---:|
| `en` | English | English | LTR | Yes | - |
| `hi` | Hindi | हिन्दी | LTR | Yes | `en` |
| `bn` | Bengali | বাংলা | LTR | Yes | `en` |
| `te` | Telugu | తెలుగు | LTR | Yes | `en` |
| `mr` | Marathi | मराठी | LTR | Yes | `hi` |
| `ta` | Tamil | தமிழ் | LTR | Yes | `en` |
| `gu` | Gujarati | ગુજરાતી | LTR | Yes | `hi` |
| `ur` | Urdu | اردو | **RTL** | Yes | `hi` |
| `kn` | Kannada | ಕನ್ನಡ | LTR | Yes | `en` |
| `or` | Odia | ଓଡ଼ିଆ | LTR | Yes | `en` |
| `ml` | Malayalam | മലയാളം | LTR | Yes | `en` |
| `pa` | Punjabi | ਪੰਜਾਬੀ | LTR | Yes | `hi` |
| `as` | Assamese | অসমীয়া | LTR | Yes | `bn` |
| `mai`| Maithili | मैथिली | LTR | Yes | `hi` |
| `sat`| Santali | ᱥᱟᱱᱛᱟᱲᱤ | LTR | *Degraded* | `hi` |
| `ks` | Kashmiri | کٲشُر | **RTL** | *Degraded* | `ur` |
| `ne` | Nepali | नेपाली | LTR | Yes | `hi` |
| `kok`| Konkani | कोंकणी | LTR | *Degraded* | `mr` |
| `sd` | Sindhi | سنڌي | **RTL** | *Degraded* | `hi` |
| `doi`| Dogri | डोगरी | LTR | *Degraded* | `hi` |
| `mni`| Manipuri | মৈতৈলোন্ | LTR | *Degraded* | `bn` |
| `brx`| Bodo | बर’ | LTR | *Degraded* | `as` |
| `sa` | Sanskrit | संस्कृतम् | LTR | Yes | `hi` |

---

## India DPDP Act 2023 Compliance

Under Section 6 of India's **Digital Personal Data Protection Act, 2023**:
- **Explicit Consent Gate:** Uploading or processing health reports requires affirmative informed consent (`POST /v1/consents`).
- **Data Minimization:** Raw documents and extracted values are encrypted at rest with AES-256 (SSE-S3).
- **Masked Phone Logging:** All logs and telemetry automatically mask phone numbers (e.g. `+91 98*** **210`).
- **Right to Erasure:** `DELETE /v1/reports/{id}` permanently scrubs files, extracted rows, explanations, and audio recordings.
- **Immutable Audit Trail:** All access, download, and deletion actions are recorded in the `audit_logs` table.

---

## Quickstart Guide

### 1. Run with Docker Compose
```bash
docker compose -f infra/docker-compose.yml up -d
```
This boots up PostgreSQL (with pgvector), Redis, MinIO object store, and the FastAPI API server.

### 2. Run Database Seeding
```bash
# Seeds Admin, Health Worker, Caregiver, Parent Patient, and 58 Curated Medical Terms & Embeddings
$env:PYTHONPATH='services/api'; services\api\.venv\Scripts\python.exe services/api/seed/seed_db.py
```

### 3. Run Backend API Locally
```bash
cd services/api
.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```
Interactive API docs available at: `http://localhost:8000/docs`

### 4. Run React Web Portal
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:5173` to access:
- **Caregiver Portal:** Manage parent health records & test the **2G Phone Simulator**.
- **Community Health Worker Dashboard:** Real-time triage queue for abnormal/critical test escalations.
- **DPDP Consent & Privacy Center:** Review active consents, audit trails, and exercise Right to Erasure.

### 5. Run React Native Mobile App
```bash
cd apps/mobile
npx expo start
```

---

## Live End-to-End Walkthrough Script

We provide a complete standalone demo script that exercises all 9 stages of the product (Database, Caregiver Auth, DPDP Consent, Blood Report Upload, Deterministic Flagging, Grade-5 Simplification, Telugu/Hindi Translation with Bracketed Terms, TTS Voice Synthesis, 2G Feature Phone IVR Call, and SMS Dispatch):

```bash
python demo_walkthrough.py
```

---

## Testing

Run all 58 Pytest test suites:
```bash
services\api\.venv\Scripts\pytest.exe -v services\api\tests
```

Run Shared Library tests:
```bash
node packages/shared/test/shared.test.mjs
```

Build Web Application:
```bash
cd apps/web && npm run build
```

Typecheck Mobile Application:
```bash
cd apps/mobile && npx tsc --noEmit
```

---

## License
Apache 2.0. Built for accessible healthcare equality across rural India.
