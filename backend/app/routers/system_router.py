from fastapi import APIRouter
import httpx
from app.config import settings

router = APIRouter(prefix="/system", tags=["System Health Check"])

@router.get("/dependencies")
async def check_dependencies():
    status = {
        "openweather": "Checking...",
        "nominatim": "Checking...",
        "market_api": "Simulated Active"
    }

    async with httpx.AsyncClient(timeout=5.0) as client:
        # Check OpenWeather
        try:
            url_weather = f"https://api.openweathermap.org/data/2.5/weather?lat=0&lon=0&appid={settings.weather_api_key}"
            response = await client.get(url_weather)
            # Even if 401 Unauthorized for bad API Key, it means the API is reachable.
            status["openweather"] = "Reachable" if response.status_code in (200, 401) else "Error"
        except httpx.HTTPError:
            status["openweather"] = "Unreachable"

        # Check Nominatim
        try:
            url_geo = "https://nominatim.openstreetmap.org/status.php?format=json"
            headers = {"User-Agent": "SmartCropAdvisory/1.0"}
            response = await client.get(url_geo, headers=headers)
            status["nominatim"] = "Reachable" if response.status_code == 200 else "Error"
        except httpx.HTTPError:
            status["nominatim"] = "Unreachable"

    return {"dependencies": status}
