# ================================================
# PLOT TWIST — FastAPI Backend Entry Point
# ================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import session, swipe, recommend
from models.database import init_db

app = FastAPI(
    title="Plot Twist API",
    description="Session-based, mood-aware movie recommendation engine.",
    version="1.0.0",
)

# CORS — tighten allow_origins to your real frontend domain before launch
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router, prefix="/session", tags=["session"])
app.include_router(swipe.router, prefix="/swipe", tags=["swipe"])
app.include_router(recommend.router, prefix="/recommend", tags=["recommend"])


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/")
async def root():
    return {"status": "ok", "service": "plot-twist-api"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
