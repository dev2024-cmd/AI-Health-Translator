from app.core.config import settings
from app.storage.base import BaseStorageService
from app.storage.s3 import S3StorageService
from app.storage.local import LocalStorageService

_storage_instance: BaseStorageService | None = None


def get_storage_service() -> BaseStorageService:
    global _storage_instance
    if _storage_instance is not None:
        return _storage_instance

    if settings.ENVIRONMENT == "test" or settings.MOCK_PROVIDERS:
        _storage_instance = LocalStorageService()
        return _storage_instance

    try:
        _storage_instance = S3StorageService()
        return _storage_instance
    except Exception:
        _storage_instance = LocalStorageService()
        return _storage_instance


def set_storage_service(service: BaseStorageService | None):
    global _storage_instance
    _storage_instance = service


__all__ = ["BaseStorageService", "S3StorageService", "LocalStorageService", "get_storage_service", "set_storage_service"]
