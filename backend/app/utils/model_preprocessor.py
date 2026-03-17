import numpy as np

class MLPreprocessor:
    def __init__(self):
        # In a real scenario, this would load fitted LabelEncoders or OneHotEncoders
        # For our mock implementation, we'll assign dummy hash values to categories
        self.known_soils = ["laterite", "alluvial", "red_clay", "forest_loam"]
        self.known_districts = ["wayanad", "palakkad", "trivandrum", "idukki", "kollam"]
        self.known_seasons = ["kharif", "rabi", "zaid", "perennial"]
        
    def _encode_categorical(self, value: str, known_list: list) -> float:
        """Mock encoding: converts a known category to an integer float, or 0.0 if unknown."""
        val = value.lower().strip()
        if val in known_list:
            return float(known_list.index(val) + 1)
        return 0.0

    def preprocess(self, soil_type: str, rainfall: float, temperature: float, season: str, district: str) -> np.ndarray:
        """
        Transforms raw request features into a 2D numpy array for sklearn.predict_proba.
        Expected Model Feature Order: [soil_type, rainfall, temperature, season, district]
        """
        f_soil = self._encode_categorical(soil_type, self.known_soils)
        f_season = self._encode_categorical(season, self.known_seasons)
        f_district = self._encode_categorical(district, self.known_districts)
        
        # Returns shape (1, 5) matching the single instance batch
        return np.array([[f_soil, float(rainfall), float(temperature), f_season, f_district]])
