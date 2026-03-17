from pydantic import BaseModel
from typing import List

class CropRecommendationRequest(BaseModel):
    soil_type: str
    rainfall: float
    temperature: float
    season: str
    district: str

class CropRecommendationItem(BaseModel):
    name: str
    local_name: str
    confidence: float
    reason: str = ""
    suitable_season: str = ""
    expected_yield_level: str = ""

class CropRecommendationResponse(BaseModel):
    recommended_crops: List[CropRecommendationItem]
