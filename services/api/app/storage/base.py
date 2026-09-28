from abc import ABC, abstractmethod
from typing import Optional


class BaseStorageService(ABC):
    @abstractmethod
    async def upload_file(self, key: str, data: bytes, mime_type: str = "application/octet-stream") -> str:
        """Upload file content to storage and return storage key."""
        pass

    @abstractmethod
    async def download_file(self, key: str) -> bytes:
        """Download file content by storage key."""
        pass

    @abstractmethod
    async def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate a time-limited presigned URL for downloading the file."""
        pass

    @abstractmethod
    async def delete_file(self, key: str) -> bool:
        """Permanently delete a file from storage."""
        pass
