from pydantic import BaseModel

class DiseaseDetectionResponse(BaseModel):
    disease: str
    confidence: float
    treatment: str
    prevention: str = ""
    severity: str = ""
