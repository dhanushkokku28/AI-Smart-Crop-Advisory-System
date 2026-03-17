from fastapi import APIRouter
from app.schemas.weather_schema import WeatherAdvisoryResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather Advisory"])
weather_service = WeatherService()

@router.get("/advisory", response_model=WeatherAdvisoryResponse)
async def get_weather_advisory(lat: float, lon: float):
    return await weather_service.get_weather_advisory(lat, lon)
