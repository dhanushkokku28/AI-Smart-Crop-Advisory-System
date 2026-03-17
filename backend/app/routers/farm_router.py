from fastapi import APIRouter
from app.schemas.farm_schema import FarmContextRequest, FarmContextResponse
from app.services.geo_service import GeoService

router = APIRouter(prefix="/farm", tags=["Farm Operations"])
geo_service = GeoService()

@router.post("/context", response_model=FarmContextResponse)
async def get_farm_context(request: FarmContextRequest):
    return await geo_service.get_farm_context(request)
