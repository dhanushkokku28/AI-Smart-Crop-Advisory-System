from fastapi import APIRouter
from app.schemas.advisory_schema import AdvisoryRequest, AdvisoryResponse
from app.services.advisory_service import AdvisoryService

router = APIRouter(prefix="/advisor", tags=["AI Advisory"])
advisory_service = AdvisoryService()

@router.post("/query", response_model=AdvisoryResponse)
def query_advisor(request: AdvisoryRequest):
    return advisory_service.query_advisor(request)
