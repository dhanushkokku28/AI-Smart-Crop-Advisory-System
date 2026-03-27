from pydantic import BaseModel, Field


class FertilizerPlanItem(BaseModel):
    name: str
    dosage: str
    interval_days: int
    application_method: str
    note: str = ""


class DiseaseDetectionResponse(BaseModel):
    disease: str
    disease_display_name: str = ""
    confidence: float
    treatment: str
    prevention: str = ""
    severity: str = ""
    fertilizers: list[str] = Field(default_factory=list)
    fertilizer_plan: list[FertilizerPlanItem] = Field(default_factory=list)
    language: str = "english"
    model_name: str = ""
    model_source: str = ""


class DiseaseModelStatusResponse(BaseModel):
    model_name: str
    model_source: str
    model_version: str = ""
    model_path: str = ""
    training_data_dir: str = ""
    training_data_available: bool = False
    supported_languages: list[str] = Field(default_factory=list)
