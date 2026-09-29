# AI Health Report Translator — Infrastructure Guide

This directory contains the containerized infrastructure definitions for local development and production deployments.

## Services Overview

The Docker Compose configuration (`docker-compose.yml`) orchestrates 5 core services:

1. **`postgres` (PostgreSQL 16 + pgvector)**
   - Database server equipped with the `pgvector` extension for semantic glossary retrieval and cosine similarity search.
   - Port: `5432:5432`
   - Image: `pgvector/pgvector:pg16`

2. **`redis` (Redis 7)**
   - Asynchronous queue broker (for background OCR, translation, and TTS generation) and session cache.
   - Port: `6379:6379`
   - Image: `redis:7-alpine`

3. **`minio` & `minio-init` (MinIO S3 Object Storage)**
   - High-performance, S3-compatible object storage for encrypted medical reports and synthesized TTS audio files.
   - Web Console Port: `9001:9001`
   - API Port: `9000:9000`
   - Automated bucket provisioning: `medical-reports` bucket initialized on boot.

4. **`api` (FastAPI 0.111+ & Python 3.11)**
   - RESTful backend serving OpenAPI v1 endpoints, DPDP Act consent management, OTP authentication, and the multi-stage AI pipeline.
   - Port: `8000:8000`
   - Interactive Swagger docs: `http://localhost:8000/docs`

5. **`worker` (Background Job Runner)**
   - Asynchronous task worker consuming jobs from Redis to run multi-page OCR, test extraction, deterministic flagging, and translation.

---

## Quickstart

### 1. Start all infrastructure services
```bash
docker compose -f infra/docker-compose.yml up -d
```

### 2. Verify container health
```bash
docker compose -f infra/docker-compose.yml ps
```

### 3. Run database migrations
```bash
docker compose -f infra/docker-compose.yml exec api alembic upgrade head
```

### 4. Seed demo users & sample data
```bash
docker compose -f infra/docker-compose.yml exec api python -m seed.seed_db
```

### 5. Access Services
- **FastAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)
- **Health Probe:** [http://localhost:8000/v1/health](http://localhost:8000/v1/health)

---

## Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `development` | Runtime environment (`development`, `test`, `production`) |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Asynchronous PostgreSQL connection string |
| `REDIS_URL` | `redis://redis:6379/0` | Redis broker connection URI |
| `S3_ENDPOINT_URL` | `http://minio:9000` | S3-compatible object storage endpoint |
| `S3_BUCKET_NAME` | `medical-reports` | Default S3 bucket for reports & audio |
| `JWT_SECRET_KEY` | `dev_jwt_secret...` | Secret key for signing JWT tokens |
| `OTP_DEV_MODE` | `true` | When true, returns `123456` OTP for local development |
| `OTP_PROVIDER` | `mock` | Set to `twilio_verify` to send and verify actual login SMS messages |

### Real login SMS with Twilio Verify

For real messages, create a Twilio Verify service, then set these values in the
environment file used to start the API (for Docker Compose, use `infra/.env`):

```env
OTP_DEV_MODE=false
OTP_PROVIDER=twilio_verify
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Restart the API after changing the values. The normal Twilio Verify trial and
India sender/recipient restrictions still apply; complete the required Twilio
and Indian DLT registration before testing with an unverified Indian number.

### First administrator account

Set `BOOTSTRAP_ADMIN_PHONE` to your own E.164 phone number before the first
administrator OTP sign-in. Then use **Admin access** on the web landing page
and verify that number. Other phone numbers cannot self-register as admins.
| `MOCK_PROVIDERS` | `true` | Allows full end-to-end pipeline execution without external API keys |
| `OCR_PROVIDER` | `mock` | OCR engine (`mock`, `tesseract`, `google_vision`, `azure_doc_intelligence`) |
| `TRANSLATION_PROVIDER` | `mock` | Translation engine (`mock`, `bhashini`, `indictrans2`) |
| `TTS_PROVIDER` | `mock` | Speech synthesis engine (`mock`, `bhashini`, `azure`, `google`) |
| `TELEPHONY_PROVIDER` | `mock` | IVR/SMS telephony provider (`mock`, `exotel`, `twilio`) |
