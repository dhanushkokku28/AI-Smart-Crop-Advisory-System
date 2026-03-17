from fastapi import APIRouter, UploadFile, File, Form
from app.schemas.disease_schema import DiseaseDetectionResponse
from app.services.disease_service import DiseaseService

router = APIRouter(prefix="/disease", tags=["Disease Detection"])
disease_service = DiseaseService()

@router.post("/detect", response_model=DiseaseDetectionResponse)
async def detect_disease(image: UploadFile = File(...), crop_name: str = Form(...)):
    image_bytes = await image.read()
    return disease_service.detect_disease(image_bytes, crop_name, image.filename)
