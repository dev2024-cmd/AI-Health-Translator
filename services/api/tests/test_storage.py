import pytest
from app.storage.local import LocalStorageService


@pytest.mark.asyncio
async def test_local_storage_lifecycle():
    storage = LocalStorageService()
    test_key = "test_reports/report_1.pdf"
    content = b"%PDF-1.4 sample pdf content for medical test"

    # Upload
    uploaded_key = await storage.upload_file(test_key, content, "application/pdf")
    assert uploaded_key == test_key

    # Download
    downloaded = await storage.download_file(test_key)
    assert downloaded == content

    # Presigned URL
    url = await storage.generate_presigned_url(test_key)
    assert test_key in url
    assert "token" in url

    # Delete
    deleted = await storage.delete_file(test_key)
    assert deleted is True

    # Confirm deleted
    with pytest.raises(FileNotFoundError):
        await storage.download_file(test_key)
