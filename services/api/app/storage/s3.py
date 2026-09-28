import io
import asyncio
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.core.config import settings
from app.storage.base import BaseStorageService


class S3StorageService(BaseStorageService):
    def __init__(self):
        self.endpoint_url = settings.S3_ENDPOINT_URL
        self.bucket_name = settings.S3_BUCKET_NAME
        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )
        self._ensure_bucket()

    def _ensure_bucket(self):
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.client.create_bucket(Bucket=self.bucket_name)
            except Exception:
                pass

    async def upload_file(self, key: str, data: bytes, mime_type: str = "application/octet-stream") -> str:
        def _upload():
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=data,
                ContentType=mime_type,
                ServerSideEncryption="AES256",
            )
            return key

        return await asyncio.to_thread(_upload)

    async def download_file(self, key: str) -> bytes:
        def _download():
            response = self.client.get_object(Bucket=self.bucket_name, Key=key)
            return response["Body"].read()

        return await asyncio.to_thread(_download)

    async def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        def _url():
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in,
            )

        return await asyncio.to_thread(_url)

    async def delete_file(self, key: str) -> bool:
        def _delete():
            try:
                self.client.delete_object(Bucket=self.bucket_name, Key=key)
                return True
            except Exception:
                return False

        return await asyncio.to_thread(_delete)
