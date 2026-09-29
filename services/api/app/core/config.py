from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # General
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "dev_secret_health_translator_super_secure_key_change_in_prod_2026"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: Union[List[str], str] = ["*"]

    # Database
    POSTGRES_USER: str = "health_user"
    POSTGRES_PASSWORD: str = "health_password"
    POSTGRES_DB: str = "health_translator_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql+asyncpg://health_user:health_password@localhost:5432/health_translator_db"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage (S3 / MinIO)
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "medical-reports"
    S3_REGION: str = "us-east-1"
    S3_SECURE: bool = False

    # Authentication & JWT
    JWT_SECRET_KEY: str = "dev_jwt_secret_change_in_production_key_parvathi_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # OTP
    OTP_DEV_MODE: bool = True
    OTP_DEFAULT_CODE: str = "123456"
    OTP_EXPIRY_SECONDS: int = 300
    MAX_OTP_ATTEMPTS: int = 5
    # OTP delivery: mock (local code) | twilio_verify (real SMS)
    OTP_PROVIDER: str = "mock"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""

    # The one phone number allowed to bootstrap the first administrator account.
    # Leave empty to disable self-service admin enrollment.
    BOOTSTRAP_ADMIN_PHONE: str = ""

    # AI Pipeline Swappable Flags
    MOCK_PROVIDERS: bool = True
    OCR_PROVIDER: str = "mock"
    EXTRACTION_PROVIDER: str = "mock"
    TRANSLATION_PROVIDER: str = "mock"
    TTS_PROVIDER: str = "mock"

    # Telephony
    TELEPHONY_PROVIDER: str = "mock"
    TELEPHONY_WEBHOOK_BASE_URL: str = "http://localhost:8000"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_database_url(cls, v: Union[str, None]) -> str:
        if not v or not isinstance(v, str) or not v.strip():
            return "sqlite+aiosqlite:///./dev_health.db"
        v = v.strip()
        if v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]
        elif v.startswith("postgresql://") and "+asyncpg" not in v:
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        return v


settings = Settings()
