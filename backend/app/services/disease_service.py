from app.schemas.disease_schema import DiseaseDetectionResponse
from app.utils.image_utils import ImagePreprocessor
from fastapi import HTTPException
import json
import os
import logging

logger = logging.getLogger(__name__)

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")

class DiseaseService:
    def __init__(self):
        self.preprocessor = ImagePreprocessor()
        
        # 1. Load the Model Data
        try:
            # TODO: Load real model here: self.model = load_model("path/to/cnn.h5")
            # Using Mock as requested for lightweight setup
            from app.models.mock_cnn_model import MockCNNModel
            self.model = MockCNNModel()
        except Exception as e:
            logger.error(f"Failed to load CNN model: {e}")
            from app.models.mock_cnn_model import MockCNNModel
            self.model = MockCNNModel()

        # 2. Load the Treatments Mapping
        self.treatments_map = {}
        treatments_path = os.path.join(DATASETS_DIR, "disease_treatments.json")
        if os.path.exists(treatments_path):
            with open(treatments_path, "r") as f:
                self.treatments_map = json.load(f)

    def detect_disease(self, image_bytes: bytes, crop_name: str, filename: str) -> DiseaseDetectionResponse:
        
        # 1. Validation
        try:
            self.preprocessor.validate_image(image_bytes, filename)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        # 2. Preprocessing
        try:
            image_tensor = self.preprocessor.process(image_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")
            
        # 3. Model Inference
        confidence_threshold = 0.40
        try:
            probs = self.model.predict(image_tensor)[0]
            max_idx = probs.argmax()
            disease_class = self.model.classes_[max_idx]
            confidence = float(probs[max_idx])
        except Exception as e:
            logger.error(f"Model Inference error: {e}")
            raise HTTPException(status_code=500, detail="Disease inference failed internally.")
            
        # 4. Filter by confidence
        if confidence < confidence_threshold:
            return DiseaseDetectionResponse(
                disease="Unknown",
                confidence=round(confidence, 2),
                treatment="Unable to confidently detect disease. Please capture a clearer image."
            )
            
        # 5. Load treatment metadata
        metadata = self.treatments_map.get(disease_class, {})
        treatment = metadata.get("treatment", "Consult local agricultural extension officer.")
        prevention = metadata.get("prevention", "")
        severity = metadata.get("severity", "unknown")
        associated_crops = metadata.get("associated_crops", [])
        
        # 6. Apply crop context validation constraint
        if crop_name and crop_name.lower() not in associated_crops and "Healthy" not in disease_class:
            confidence = confidence * 0.6  # heavily penalize the confidence if mismatch
            if confidence < confidence_threshold:
                return DiseaseDetectionResponse(
                    disease="Unknown",
                    confidence=round(confidence, 2),
                    treatment=f"Detected pattern resembled {disease_class}, but this is rarely found in {crop_name}. Please recapture."
                )
                
        return DiseaseDetectionResponse(
            disease=disease_class,
            confidence=round(confidence, 2),
            treatment=treatment,
            prevention=prevention,
            severity=severity
        )
