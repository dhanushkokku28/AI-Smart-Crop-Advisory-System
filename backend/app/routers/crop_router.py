from fastapi import APIRouter
from app.schemas.crop_schema import CropRecommendationRequest, CropRecommendationResponse
from app.services.crop_service import CropService

router = APIRouter(prefix="/crop", tags=["Crop Recommendation"])
crop_service = CropService()

@router.post("/recommend", response_model=CropRecommendationResponse)
def recommend_crops(request: CropRecommendationRequest):
    return crop_service.recommend_crops(request)
