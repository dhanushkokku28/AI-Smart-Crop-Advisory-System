from pydantic import BaseModel
from typing import Optional

class FarmContextRequest(BaseModel):
    latitude: float
    longitude: float

class FarmContextResponse(BaseModel):
    district: str
    soil_type: str
    agro_zone: str
    season: str
    rainfall: float
    temperature: float
    humidity: Optional[float] = None
