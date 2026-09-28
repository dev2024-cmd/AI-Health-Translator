import os
import io
import asyncio
from typing import Dict
from app.storage.base import BaseStorageService


class LocalStorageService(BaseStorageService):
    """
    Local in-memory / directory storage provider for isolated testing and offline dev.
    """
    def __init__(self, base_dir: str = "temp_storage"):
        self.base_dir = base_dir
        self._memory_store: Dict[str, bytes] = {}
        self._mime_store: Dict[str, str] = {}

    async def upload_file(self, key: str, data: bytes, mime_type: str = "application/octet-stream") -> str:
        self._memory_store[key] = data
        self._mime_store[key] = mime_type
        return key

    async def download_file(self, key: str) -> bytes:
        if key not in self._memory_store:
            raise FileNotFoundError(f"Storage key '{key}' not found.")
        return self._memory_store[key]

    async def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        # Returns a mock signed URL pointing to local media streaming route
        return f"/v1/storage/file/{key}?token=mock_signed_token_{expires_in}"

    async def delete_file(self, key: str) -> bool:
        if key in self._memory_store:
            del self._memory_store[key]
            self._mime_store.pop(key, None)
            return True
        return False
