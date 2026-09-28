from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.consents import router as consents_router
from app.api.v1.health import router as health_router
from app.api.v1.reports import router as reports_router
from app.api.v1.languages import router as languages_router
from app.api.v1.telephony import router as telephony_router

v1_router = APIRouter(prefix="/v1")

v1_router.include_router(auth_router)
v1_router.include_router(patients_router)
v1_router.include_router(consents_router)
v1_router.include_router(health_router)
v1_router.include_router(reports_router)
v1_router.include_router(languages_router)
v1_router.include_router(telephony_router)
