from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier

logger = logging.getLogger(__name__)


class TrainedDiseaseModel:
    """
    Lightweight trained image model.

    Training priority:
    1. Load persisted model artifact if present.
    2. Train from real labeled images in training_data_dir if available.
    3. Backfill missing classes with synthetic bootstrap samples.
    """

    DEFAULT_CLASSES = ["Leaf Blight", "Sigatoka", "Anthracnose", "Powdery Mildew", "Healthy"]
    ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

    def __init__(self, model_path: str, training_data_dir: str | None = None):
        self.model_path = Path(model_path)
        self.training_data_dir = Path(training_data_dir) if training_data_dir else None
        self.classifier: RandomForestClassifier | None = None
        self.classes_: list[str] = self.DEFAULT_CLASSES.copy()
        self.model_name = "RandomForestImageDiseaseModel"
        self.model_version = "rf-image-v2"
        self.model_source = "unknown"
        self._load_or_train()

    def predict(self, image_tensor: np.ndarray) -> np.ndarray:
        if self.classifier is None:
            raise RuntimeError("Disease classifier has not been initialized.")

        features = self._tensor_to_features(image_tensor)
        probs = self.classifier.predict_proba(features)
        return probs

    def _load_or_train(self) -> None:
        if self.model_path.exists():
            if self._try_load_artifact():
                return

        features, labels, source = self._build_training_dataset()

        classifier = RandomForestClassifier(
            n_estimators=260,
            max_depth=14,
            random_state=42,
            min_samples_leaf=2,
            class_weight="balanced_subsample",
        )
        classifier.fit(features, labels)

        self.classifier = classifier
        self.classes_ = [str(label) for label in classifier.classes_]
        self.model_source = source

        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        artifact = {
            "classifier": classifier,
            "classes": self.classes_,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "model_source": self.model_source,
        }
        joblib.dump(artifact, self.model_path)
        logger.info("Trained disease model saved at %s (%s)", self.model_path, self.model_source)

    def _try_load_artifact(self) -> bool:
        try:
            artifact = joblib.load(self.model_path)

            if isinstance(artifact, dict):
                classifier = artifact.get("classifier")
                if classifier is None:
                    return False

                self.classifier = classifier
                self.classes_ = [str(label) for label in artifact.get("classes", classifier.classes_)]
                self.model_name = str(artifact.get("model_name", self.model_name))
                self.model_version = str(artifact.get("model_version", self.model_version))
                self.model_source = str(artifact.get("model_source", "artifact"))
            else:
                # Backward compatibility: plain sklearn model
                self.classifier = artifact
                self.classes_ = [str(label) for label in artifact.classes_]
                self.model_source = "artifact"

            logger.info("Loaded disease model artifact from %s", self.model_path)
            return True
        except Exception as exc:
            logger.warning("Failed to load model artifact from %s: %s", self.model_path, exc)
            return False

    def _build_training_dataset(self) -> tuple[np.ndarray, np.ndarray, str]:
        class_feature_map = self._load_features_from_real_images()
        rng = np.random.default_rng(42)

        all_features: list[np.ndarray] = []
        all_labels: list[str] = []

        real_classes = 0
        synthetic_classes = 0

        for class_name in self.DEFAULT_CLASSES:
            real_vectors = class_feature_map.get(class_name, [])
            if len(real_vectors) >= 8:
                class_matrix = np.vstack(real_vectors)
                all_features.append(class_matrix)
                all_labels.extend([class_name] * class_matrix.shape[0])
                real_classes += 1
            else:
                synthetic = self._generate_synthetic_features(class_name, count=220, rng=rng)
                all_features.append(synthetic)
                all_labels.extend([class_name] * synthetic.shape[0])
                synthetic_classes += 1

        features = np.vstack(all_features).astype(np.float32)
        labels = np.array(all_labels)

        if real_classes > 0 and synthetic_classes == 0:
            source = "real-image-trained"
        elif real_classes > 0:
            source = "mixed-real-bootstrap"
        else:
            source = "bootstrap-trained"

        return features, labels, source

    def _load_features_from_real_images(self) -> dict[str, list[np.ndarray]]:
        class_feature_map: dict[str, list[np.ndarray]] = {name: [] for name in self.DEFAULT_CLASSES}

        if not self.training_data_dir or not self.training_data_dir.exists():
            return class_feature_map

        folder_lookup = {
            class_name: [
                class_name,
                class_name.lower(),
                class_name.lower().replace(" ", "_"),
                class_name.lower().replace(" ", "-"),
            ]
            for class_name in self.DEFAULT_CLASSES
        }

        for class_name, candidate_folders in folder_lookup.items():
            folder = None
            for candidate in candidate_folders:
                path = self.training_data_dir / candidate
                if path.exists() and path.is_dir():
                    folder = path
                    break

            if folder is None:
                continue

            for image_path in folder.iterdir():
                if image_path.suffix.lower() not in self.ALLOWED_IMAGE_EXTENSIONS:
                    continue

                try:
                    image = Image.open(image_path).convert("RGB").resize((224, 224))
                    image_arr = np.array(image, dtype=np.float32) / 255.0
                    class_feature_map[class_name].append(self._extract_features(image_arr))
                except Exception as exc:
                    logger.warning("Skipping invalid training image %s: %s", image_path, exc)

        return class_feature_map

    def _tensor_to_features(self, image_tensor: np.ndarray) -> np.ndarray:
        if image_tensor.ndim != 4 or image_tensor.shape[-1] != 3:
            raise ValueError(f"Expected image tensor shape (batch, h, w, 3), got {image_tensor.shape}")

        feature_rows = [self._extract_features(sample) for sample in image_tensor]
        return np.vstack(feature_rows).astype(np.float32)

    def _extract_features(self, image_arr: np.ndarray) -> np.ndarray:
        arr = image_arr.astype(np.float32)
        if arr.max() > 1.0:
            arr = arr / 255.0

        mean_rgb = arr.mean(axis=(0, 1))
        std_rgb = arr.std(axis=(0, 1))

        gray = arr.mean(axis=2)
        brightness_mean = float(gray.mean())
        contrast = float(gray.std())

        max_ch = arr.max(axis=2)
        min_ch = arr.min(axis=2)
        saturation_mean = float((max_ch - min_ch).mean())

        green_dominance = float(np.mean((arr[:, :, 1] > arr[:, :, 0]) & (arr[:, :, 1] > arr[:, :, 2])))
        yellow_ratio = float(np.mean((arr[:, :, 0] > 0.42) & (arr[:, :, 1] > 0.42) & (arr[:, :, 2] < 0.36)))
        lesion_ratio = float(np.mean((arr[:, :, 0] > arr[:, :, 1] * 1.1) | (arr[:, :, 2] > arr[:, :, 1] * 1.1)))
        bright_ratio = float(np.mean(gray > 0.74))
        dark_ratio = float(np.mean(gray < 0.28))

        texture = float(np.mean(np.abs(np.diff(gray, axis=0))) + np.mean(np.abs(np.diff(gray, axis=1))))

        return np.array(
            [
                mean_rgb[0],
                mean_rgb[1],
                mean_rgb[2],
                std_rgb[0],
                std_rgb[1],
                std_rgb[2],
                brightness_mean,
                contrast,
                saturation_mean,
                green_dominance,
                yellow_ratio,
                lesion_ratio,
                bright_ratio,
                dark_ratio,
                texture,
            ],
            dtype=np.float32,
        )

    def _generate_synthetic_features(self, class_name: str, count: int, rng: np.random.Generator) -> np.ndarray:
        prototypes: dict[str, np.ndarray] = {
            "Leaf Blight": np.array([0.46, 0.42, 0.28, 0.21, 0.19, 0.14, 0.39, 0.24, 0.33, 0.27, 0.18, 0.41, 0.16, 0.27, 0.22]),
            "Sigatoka": np.array([0.49, 0.47, 0.29, 0.19, 0.18, 0.13, 0.42, 0.20, 0.30, 0.34, 0.22, 0.35, 0.18, 0.19, 0.19]),
            "Anthracnose": np.array([0.43, 0.36, 0.27, 0.25, 0.22, 0.18, 0.34, 0.27, 0.29, 0.24, 0.11, 0.45, 0.13, 0.34, 0.26]),
            "Powdery Mildew": np.array([0.57, 0.56, 0.50, 0.17, 0.15, 0.13, 0.54, 0.16, 0.18, 0.29, 0.09, 0.16, 0.31, 0.11, 0.14]),
            "Healthy": np.array([0.35, 0.54, 0.28, 0.13, 0.12, 0.10, 0.40, 0.13, 0.24, 0.62, 0.08, 0.11, 0.17, 0.09, 0.13]),
        }

        center = prototypes.get(class_name)
        if center is None:
            raise ValueError(f"No synthetic prototype available for class: {class_name}")

        scales = np.array([0.05, 0.05, 0.05, 0.035, 0.035, 0.03, 0.04, 0.03, 0.04, 0.06, 0.05, 0.06, 0.04, 0.04, 0.04])
        samples = rng.normal(loc=center, scale=scales, size=(count, center.shape[0]))
        return np.clip(samples, 0.0, 1.0).astype(np.float32)
