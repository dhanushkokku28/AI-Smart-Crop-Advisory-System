from app.schemas.crop_schema import CropRecommendationRequest, CropRecommendationResponse, CropRecommendationItem
from app.utils.dataset_utils import DatasetLoader
from app.utils.model_preprocessor import MLPreprocessor
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class CropService:
    def __init__(self):
        self.dataset_loader = DatasetLoader()
        self.preprocessor = MLPreprocessor()
        self.model = None
        
        # In a real environment, this is loaded via joblib.
        # e.g., self.model = joblib.load("app/models/random_forest_crop_model.joblib")
        # For our mock testing setup, we'll instantiate our MockRandomForest if the file is missing
        try:
            model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "random_forest_crop_model.joblib")
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
            else:
                logger.warning("Real ML model not found. Loading Mock Random Forest.")
                from app.models.mock_rf_model import MockRandomForest
                self.model = MockRandomForest()
        except Exception as e:
            logger.error(f"Failed to load ML model: {e}. Will fallback to dataset intelligence.")
            self.model = None

    def recommend_crops(self, request: CropRecommendationRequest) -> CropRecommendationResponse:
        recommended = []
        confidence_threshold = 0.2
        
        # 1. Try ML Prediction First
        if self.model is not None:
            try:
                # Preprocess inputs
                X = self.preprocessor.preprocess(
                    request.soil_type,
                    request.rainfall,
                    request.temperature,
                    request.season,
                    request.district
                )
                
                # Get probabilities
                probs = self.model.predict_proba(X)[0]
                classes = self.model.classes_
                
                # Map probabilities to classes
                for i, prob in enumerate(probs):
                    if prob >= confidence_threshold:
                        crop_name = classes[i]
                        cal = self.dataset_loader.get_crop_calendar(crop_name)
                        
                        recommended.append(
                            CropRecommendationItem(
                                name=crop_name,
                                local_name="", # Needs translation layer
                                confidence=round(float(prob), 2),
                                reason=f"ML Predicted for {request.district} conditions",
                                suitable_season=cal["season"].capitalize(),
                                expected_yield_level="High" if prob > 0.7 else "Average"
                            )
                        )
                
                # Sort by confidence
                recommended.sort(key=lambda x: x.confidence, reverse=True)
                
                # If ML model gives highly confident predictions, return them
                if recommended and recommended[0].confidence > 0.4:
                    return CropRecommendationResponse(recommended_crops=recommended)
                    
            except Exception as e:
                logger.error(f"ML inference failed: {e}. Falling back to rules.")

        # 2. Rule-Based Fallback (Phase 2 Logic)
        district_crops = self.dataset_loader.get_district_crops(request.district)
        
        for crop in district_crops:
            cal = self.dataset_loader.get_crop_calendar(crop)
            confidence = 0.85
            if request.season.lower() != cal["season"].lower() and cal["season"].lower() != "perennial":
                confidence = 0.40 # Penalize if off season
            
            recommended.append(
                CropRecommendationItem(
                    name=crop.capitalize(),
                    local_name="", 
                    confidence=confidence,
                    reason=f"Dataset fallback for {request.district} during {cal['season']}",
                    suitable_season=cal["season"].capitalize(),
                    expected_yield_level="Average"
                )
            )
            
        recommended.sort(key=lambda x: x.confidence, reverse=True)
        return CropRecommendationResponse(recommended_crops=recommended)
