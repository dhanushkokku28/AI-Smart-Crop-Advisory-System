from pydantic import BaseModel

class WeatherAdvisoryResponse(BaseModel):
    rainfall_forecast: str
    advisory: str
