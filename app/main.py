from fastapi import FastAPI
from app.routers import auth, file_upload, payment, chatbot, admin, calendar, prediction
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from fastapi.staticfiles import StaticFiles
import logging

for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)
logging.basicConfig(level=logging.INFO)
class IgnoreGeoNames(logging.Filter):
    def filter(self, record):
        msg = record.getMessage().lower()
        return not (
            "geonames" in msg or
            "timezone/coordinates" in msg or
            "no geonames username" in msg
        )

# áp dụng filter cho root
logging.getLogger().addFilter(IgnoreGeoNames())
logging.getLogger("kerykeion").setLevel(logging.CRITICAL)
logging.getLogger("kerykeion.fetch_geonames").setLevel(logging.CRITICAL)
logger = logging.getLogger(__name__)
# Prefix API theo version
api_prefix = f"/api/{settings.VERSION_APP}"

# Tạo instance của FastAPI
app = FastAPI(
    title=settings.TITLE_APP,
    docs_url=f"{api_prefix}/docs",
    redoc_url=f"{api_prefix}/redoc",
    openapi_url=f"{api_prefix}/openapi.json",
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include các router vào ứng dụng chính
app.include_router(auth.router, prefix=api_prefix)
app.include_router(file_upload.router, prefix=api_prefix)
app.include_router(payment.router, prefix=api_prefix)
app.include_router(chatbot.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(calendar.router, prefix=api_prefix)
app.include_router(prediction.router, prefix=api_prefix)


@app.get(f"{api_prefix}/")
def read_root():
    return {"message": f"Welcome to {settings.TITLE_APP}"}
