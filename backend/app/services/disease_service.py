from __future__ import annotations

import json
import logging
import os
from typing import Any

from fastapi import HTTPException

from app.models.trained_disease_model import TrainedDiseaseModel
from app.schemas.disease_schema import DiseaseDetectionResponse, DiseaseModelStatusResponse, FertilizerPlanItem
from app.utils.image_utils import ImagePreprocessor

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "models", "disease_classifier.joblib")
DEFAULT_TRAINING_DATA_DIR = os.path.join(DATASETS_DIR, "disease_images")

SUPPORTED_LANGUAGES = {"english", "hindi", "tamil"}
SUPPORTED_LANGUAGE_LIST = ["english", "hindi", "tamil"]
LANGUAGE_ALIASES = {
    "en": "english",
    "english": "english",
    "hi": "hindi",
    "hindi": "hindi",
    "ta": "tamil",
    "tamil": "tamil",
}

DISEASE_NAME_TRANSLATIONS: dict[str, dict[str, str]] = {
    "hindi": {
        "Leaf Blight": "Leaf Blight (Patta Jhulsa)",
        "Sigatoka": "Sigatoka",
        "Anthracnose": "Anthracnose",
        "Powdery Mildew": "Powdery Mildew (Safed Fafund)",
        "Healthy": "Swasth",
        "Unknown": "Agyat",
    },
    "tamil": {
        "Leaf Blight": "Leaf Blight (Ilai Karugal)",
        "Sigatoka": "Sigatoka",
        "Anthracnose": "Anthracnose",
        "Powdery Mildew": "Powdery Mildew (Thool Poosanam)",
        "Healthy": "Aarokkiyam",
        "Unknown": "Ariyappadadha",
    },
}

SEVERITY_TRANSLATIONS: dict[str, dict[str, str]] = {
    "hindi": {
        "high": "Uchch",
        "medium": "Madhyam",
        "low": "Kam",
        "none": "Nahin",
        "unknown": "Agyat",
    },
    "tamil": {
        "high": "Adhigam",
        "medium": "Nadutharam",
        "low": "Kuraivu",
        "none": "Illai",
        "unknown": "Ariyappadadha",
    },
}

TEXT_TRANSLATIONS: dict[str, dict[str, str]] = {
    "hindi": {
        "Apply copper fungicide spray": "Copper fafundnashi spray karein",
        "Use mancozeb or chlorothalonil": "Mancozeb ya chlorothalonil ka upyog karein",
        "Apply carbendazim or mancozeb": "Carbendazim ya mancozeb spray karein",
        "Use sulfur-based fungicide": "Sulfur aadharit fafundnashi ka upyog karein",
        "No action needed": "Koi upchar avashyak nahin",
        "Avoid overhead irrigation, ensure proper plant spacing": "Upar se sinchai se bachen, paudhon ka sahi spacing rakhen",
        "Remove infected leaves and improve soil drainage": "Sankramit pattiyan hataen aur mitti ka drainage sudharen",
        "Ensure good air circulation, prune infected parts": "Achha hawa pravah rakhen aur sankramit hisson ki chhatayi karein",
        "Improve air circulation, avoid excess nitrogen": "Hawa ka pravah badhaen aur adhik nitrogen se bachen",
        "Maintain regular watering and fertilizing schedule": "Niyamit sinchai aur urvarak schedule banaye rakhen",
        "Apply in soil near root zone": "Jad ke paas mitti mein daalein",
        "Top dress after light irrigation": "Halki sinchai ke baad top dress karein",
        "Apply in standing water and drain after 24 hours": "Khade paani mein daalein aur 24 ghante baad nikaalein",
        "Foliar spray in evening": "Shaam mein foliar spray karein",
        "Apply in ring around plant base": "Paudhe ke base ke charon taraf ring mein daalein",
        "Mix with topsoil before irrigation": "Sinchai se pehle topsoil ke saath milayein",
        "Mix with compost and broadcast": "Compost ke saath milakar field mein chhidkein",
        "Apply in split doses": "Split doses mein dein",
        "Use as per product label": "Product label ke anusaar istemal karein",
    },
    "tamil": {
        "Apply copper fungicide spray": "Copper poonjanashi spray seiyungal",
        "Use mancozeb or chlorothalonil": "Mancozeb allathu chlorothalonil payanpaduthungal",
        "Apply carbendazim or mancozeb": "Carbendazim allathu mancozeb spray seiyungal",
        "Use sulfur-based fungicide": "Sulfur adharitha poonjanashi payanpaduthungal",
        "No action needed": "Sikichai thevai illai",
        "Avoid overhead irrigation, ensure proper plant spacing": "Mel neerpaasanathai thavirthu sariyana idaivelaiyai kaappathungal",
        "Remove infected leaves and improve soil drainage": "Pathikkappatta ilaigalai neeki mann vadikalaimaiyai meempaduthungal",
        "Ensure good air circulation, prune infected parts": "Nalla kaatr ottathai urudhi seithu pathikkappatta pagudigalai vettungal",
        "Improve air circulation, avoid excess nitrogen": "Kaatr ottathai meempaduthi adhiga nitrogen-ai thavirthungal",
        "Maintain regular watering and fertilizing schedule": "Niyamamaana neerpaasanam matrum ura attavanaiyai pinpatrungal",
        "Apply in soil near root zone": "Ver pagudikku arugil mannil idungal",
        "Top dress after light irrigation": "Ilagu neerpaasanathin pin top dress seiyungal",
        "Apply in standing water and drain after 24 hours": "Nirkum neeril iduvathodu 24 mani neram pin vadikungal",
        "Foliar spray in evening": "Maalai nerathil foliar spray seiyungal",
        "Apply in ring around plant base": "Thavar adippagudiyai sutri ring-aaga idungal",
        "Mix with topsoil before irrigation": "Neerpaasanathirkku mun topsoil-udan kalandhu idungal",
        "Mix with compost and broadcast": "Compost-udan kalandhu nilathil parappi idungal",
        "Apply in split doses": "Pirivu pirivaga alavil idungal",
        "Use as per product label": "Product label vazhikaattudhalin padi payanpaduthungal",
    },
}


class DiseaseService:
    def __init__(self):
        self.preprocessor = ImagePreprocessor()

        model_path = os.getenv("DISEASE_MODEL_PATH", DEFAULT_MODEL_PATH)
        training_data_dir = os.getenv("DISEASE_TRAINING_DATA_DIR", DEFAULT_TRAINING_DATA_DIR)
        self.model_path = model_path
        self.training_data_dir = training_data_dir

        try:
            self.model = TrainedDiseaseModel(model_path=model_path, training_data_dir=training_data_dir)
            logger.info(
                "Disease model ready: name=%s version=%s source=%s",
                self.model.model_name,
                self.model.model_version,
                self.model.model_source,
            )
        except Exception as exc:
            logger.error("Failed to initialize trained disease model: %s", exc)
            from app.models.mock_cnn_model import MockCNNModel

            self.model = MockCNNModel()
            self.model.model_name = "MockCNNModel"
            self.model.model_source = "mock-fallback"

        self.treatments_map: dict[str, Any] = {}
        treatments_path = os.path.join(DATASETS_DIR, "disease_treatments.json")
        if os.path.exists(treatments_path):
            with open(treatments_path, "r", encoding="utf-8") as file_obj:
                self.treatments_map = json.load(file_obj)

    def get_model_status(self) -> DiseaseModelStatusResponse:
        model_name = str(getattr(self.model, "model_name", self.model.__class__.__name__))
        model_source = str(getattr(self.model, "model_source", "runtime"))
        model_version = str(getattr(self.model, "model_version", ""))

        training_data_available = False
        if os.path.isdir(self.training_data_dir):
            for entry in os.scandir(self.training_data_dir):
                if entry.is_dir():
                    training_data_available = True
                    break

        return DiseaseModelStatusResponse(
            model_name=model_name,
            model_source=model_source,
            model_version=model_version,
            model_path=self.model_path,
            training_data_dir=self.training_data_dir,
            training_data_available=training_data_available,
            supported_languages=SUPPORTED_LANGUAGE_LIST,
        )

    def detect_disease(
        self,
        image_bytes: bytes,
        crop_name: str,
        filename: str,
        language: str = "english",
    ) -> DiseaseDetectionResponse:
        normalized_language = self._normalize_language(language)

        try:
            self.preprocessor.validate_image(image_bytes, filename)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))

        try:
            image_tensor = self.preprocessor.process(image_bytes)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Image processing failed: {exc}")

        confidence_threshold = 0.42
        try:
            probs = self.model.predict(image_tensor)[0]
            max_idx = int(probs.argmax())
            disease_class = str(self.model.classes_[max_idx])
            confidence = float(probs[max_idx])
        except Exception as exc:
            logger.error("Model inference error: %s", exc)
            raise HTTPException(status_code=500, detail="Disease inference failed internally.")

        model_name = str(getattr(self.model, "model_name", self.model.__class__.__name__))
        model_source = str(getattr(self.model, "model_source", "runtime"))

        if confidence < confidence_threshold:
            message = self._unknown_message(normalized_language)
            return DiseaseDetectionResponse(
                disease="Unknown",
                disease_display_name=self._translate_disease_name("Unknown", normalized_language),
                confidence=round(confidence, 2),
                treatment=message,
                prevention="",
                severity=self._translate_severity("unknown", normalized_language),
                fertilizers=[],
                fertilizer_plan=[],
                language=normalized_language,
                model_name=model_name,
                model_source=model_source,
            )

        metadata = self.treatments_map.get(disease_class, {})
        treatment = str(metadata.get("treatment", "Consult local agricultural extension officer."))
        prevention = str(metadata.get("prevention", ""))
        severity = str(metadata.get("severity", "unknown"))
        associated_crops = [str(crop).strip().lower() for crop in metadata.get("associated_crops", [])]

        normalized_crop = (crop_name or "").strip().lower()
        if normalized_crop and normalized_crop not in associated_crops and "Healthy" not in disease_class:
            confidence = confidence * 0.6
            if confidence < confidence_threshold:
                message = self._mismatch_message(normalized_language, disease_class, crop_name)
                return DiseaseDetectionResponse(
                    disease="Unknown",
                    disease_display_name=self._translate_disease_name("Unknown", normalized_language),
                    confidence=round(confidence, 2),
                    treatment=message,
                    prevention="",
                    severity=self._translate_severity("unknown", normalized_language),
                    fertilizers=[],
                    fertilizer_plan=[],
                    language=normalized_language,
                    model_name=model_name,
                    model_source=model_source,
                )

        fertilizer_plan = self._build_fertilizer_plan(metadata, normalized_crop, normalized_language)
        fertilizer_summaries = self._build_fertilizer_summaries(fertilizer_plan, normalized_language)

        return DiseaseDetectionResponse(
            disease=disease_class,
            disease_display_name=self._translate_disease_name(disease_class, normalized_language),
            confidence=round(confidence, 2),
            treatment=self._translate_text(treatment, normalized_language),
            prevention=self._translate_text(prevention, normalized_language),
            severity=self._translate_severity(severity, normalized_language),
            fertilizers=fertilizer_summaries,
            fertilizer_plan=fertilizer_plan,
            language=normalized_language,
            model_name=model_name,
            model_source=model_source,
        )

    def _normalize_language(self, language: str) -> str:
        normalized = str(language or "english").lower().strip()
        normalized = LANGUAGE_ALIASES.get(normalized, normalized)
        if normalized not in SUPPORTED_LANGUAGES:
            return "english"
        return normalized

    def _translate_text(self, text: str, language: str) -> str:
        if language == "english":
            return text
        return TEXT_TRANSLATIONS.get(language, {}).get(text, text)

    def _translate_disease_name(self, disease_name: str, language: str) -> str:
        if language == "english":
            return disease_name
        return DISEASE_NAME_TRANSLATIONS.get(language, {}).get(disease_name, disease_name)

    def _translate_severity(self, severity: str, language: str) -> str:
        normalized = str(severity or "unknown").lower().strip()
        if language == "english":
            return normalized
        return SEVERITY_TRANSLATIONS.get(language, {}).get(normalized, normalized)

    def _safe_int(self, value: Any, fallback: int) -> int:
        try:
            parsed = int(value)
            if parsed < 1:
                return fallback
            return parsed
        except Exception:
            return fallback

    def _build_fertilizer_plan(self, metadata: dict[str, Any], crop_name: str, language: str) -> list[FertilizerPlanItem]:
        plan_map = metadata.get("fertilizer_plan", {})
        selected_plan: list[dict[str, Any]] = []

        if isinstance(plan_map, dict):
            plan_for_crop = plan_map.get(crop_name)
            plan_default = plan_map.get("default")

            if isinstance(plan_for_crop, list):
                selected_plan = plan_for_crop
            elif isinstance(plan_default, list):
                selected_plan = plan_default

        items: list[FertilizerPlanItem] = []
        for raw_item in selected_plan:
            if not isinstance(raw_item, dict):
                continue

            name = str(raw_item.get("name", "")).strip()
            if not name:
                continue

            dosage = str(raw_item.get("dosage", "Use as per product label")).strip()
            interval_days = self._safe_int(raw_item.get("interval_days", 15), 15)
            application_method = str(raw_item.get("application_method", "Apply in split doses")).strip()
            note = str(raw_item.get("note", "")).strip()

            items.append(
                FertilizerPlanItem(
                    name=self._translate_text(name, language),
                    dosage=self._translate_text(dosage, language),
                    interval_days=interval_days,
                    application_method=self._translate_text(application_method, language),
                    note=self._translate_text(note, language),
                )
            )

        if items:
            return items

        fallback_fertilizers = metadata.get("fertilizers", [])
        if isinstance(fallback_fertilizers, list):
            for fertilizer in fallback_fertilizers:
                fertilizer_name = str(fertilizer).strip()
                if not fertilizer_name:
                    continue
                items.append(
                    FertilizerPlanItem(
                        name=self._translate_text(fertilizer_name, language),
                        dosage=self._translate_text("Use as per product label", language),
                        interval_days=15,
                        application_method=self._translate_text("Apply in split doses", language),
                        note="",
                    )
                )

        return items

    def _build_fertilizer_summaries(self, fertilizer_plan: list[FertilizerPlanItem], language: str) -> list[str]:
        summaries: list[str] = []
        for item in fertilizer_plan:
            if language == "hindi":
                summary = f"{item.name} - {item.dosage}, har {item.interval_days} din"
            elif language == "tamil":
                summary = f"{item.name} - {item.dosage}, ovvoru {item.interval_days} naatkalukku oru murai"
            else:
                summary = f"{item.name} - {item.dosage}, every {item.interval_days} days"
            summaries.append(summary)
        return summaries

    def _unknown_message(self, language: str) -> str:
        if language == "hindi":
            return "Rog ka bharosemand pata nahin chala. Kripya adhik spasht tasveer lein."
        if language == "tamil":
            return "Noi-ai nambagamaa kandariya mudiyavillai. Dayavu seithu thelivaana padam upload seiyungal."
        return "Unable to confidently detect disease. Please capture a clearer image."

    def _mismatch_message(self, language: str, disease_name: str, crop_name: str) -> str:
        if language == "hindi":
            return f"Pattern {disease_name} jaisa laga, lekin yeh aam taur par {crop_name} mein nahin milta. Kripya clearer photo dein."
        if language == "tamil":
            return f"Padam {disease_name} pola therigiradhu, aana idhu saadharanamaaga {crop_name} payiril illai. Thelivaana padam meendum upload seiyungal."
        return f"Detected pattern resembled {disease_name}, but this is rarely found in {crop_name}. Please recapture."