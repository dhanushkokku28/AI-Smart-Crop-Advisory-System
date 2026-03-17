from fastapi import APIRouter
from app.schemas.feedback_schema import FeedbackRequest
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["System Feedback"])
feedback_service = FeedbackService()

@router.post("/", response_model=dict)
def submit_feedback(request: FeedbackRequest):
    return feedback_service.process_feedback(request)
