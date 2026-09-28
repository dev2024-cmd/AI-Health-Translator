"""
Languages Matrix API Endpoint.
Exposes metadata for all 22 scheduled Indian languages plus English (23 total).
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from app.core.languages import SUPPORTED_LANGUAGES

router = APIRouter(prefix="/languages", tags=["Languages"])


@router.get("", response_model=List[Dict[str, Any]])
async def list_supported_languages():
    """
    Returns the full matrix of all 22 scheduled Indian languages + English,
    including writing direction (LTR/RTL), native script names, and TTS availability.
    """
    return SUPPORTED_LANGUAGES
