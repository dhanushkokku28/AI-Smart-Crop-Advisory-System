from pydantic import BaseModel
from typing import Optional

class AdvisoryRequest(BaseModel):
    query: str
    language: str
    district: Optional[str] = None
    soil_type: Optional[str] = None
    season: Optional[str] = None
    weather_summary: Optional[str] = None

class AdvisoryResponse(BaseModel):
    response: str

