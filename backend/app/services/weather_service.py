import httpx
from app.schemas.weather_schema import WeatherAdvisoryResponse
from app.utils.weather_utils import parse_openweather_response
from app.config import settings
import asyncio

class WeatherService:
    def __init__(self):
        # We'll use a local client or the caller can pass one
        self.api_key = settings.weather_api_key

    async def get_weather_advisory(self, lat: float, lon: float) -> WeatherAdvisoryResponse:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            for attempt in range(2):
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    data = response.json()
                    parsed = parse_openweather_response(data)
                    return WeatherAdvisoryResponse(**parsed)
                except httpx.HTTPError:
                    if attempt == 1:
                        # Fallback on failure
                        return WeatherAdvisoryResponse(
                            rainfall_forecast="Unknown",
                            advisory="Weather data unavailable at this moment."
                        )
                    await asyncio.sleep(1)
        
        return WeatherAdvisoryResponse(
            rainfall_forecast="Unknown",
            advisory="Weather data unavailable at this moment."
        )
