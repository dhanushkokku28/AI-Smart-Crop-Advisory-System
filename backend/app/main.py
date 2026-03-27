from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    farm_router,
    crop_router,
    disease_router,
    weather_router,
    market_router,
    advisory_router,
    feedback_router,
    system_router,
    voice_router
)

app = FastAPI(
    title="Smart Crop Advisory System API",
    description="Backend API for location-aware agricultural guidance.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(farm_router.router)
app.include_router(crop_router.router)
app.include_router(disease_router.router)
app.include_router(weather_router.router)
app.include_router(market_router.router)
app.include_router(advisory_router.router)
app.include_router(feedback_router.router)
app.include_router(system_router.router)
app.include_router(voice_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Crop Advisory System API"}
