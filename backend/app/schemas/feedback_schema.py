from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FeedbackRequest(BaseModel):
    recommendation_id: str
    feedback: str
    location: Optional[str] = ""
    crop: Optional[str] = ""
    timestamp: Optional[datetime] = None
