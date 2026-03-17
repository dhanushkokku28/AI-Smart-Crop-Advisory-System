import pandas as pd
import os
import re

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")

class DatasetLoader:
    def __init__(self):
        self.soil_map = None
        self.crop_patterns = None
        self.crop_calendar = None
        self._load_datasets()
        
    def _load_datasets(self):
        soil_path = os.path.join(DATASETS_DIR, "kerala_soil_map.csv")
        patterns_path = os.path.join(DATASETS_DIR, "district_crop_patterns.csv")
        calendar_path = os.path.join(DATASETS_DIR, "crop_calendar.csv")
        
        # Load and validate kerala_soil_map
        if os.path.exists(soil_path):
            self.soil_map = pd.read_csv(soil_path)
            required_soil_cols = {"district", "soil_type", "agro_zone"}
            if not required_soil_cols.issubset(self.soil_map.columns):
                raise ValueError(f"Missing required columns in {soil_path}")
                
        # Load and validate district_crop_patterns
        if os.path.exists(patterns_path):
            self.crop_patterns = pd.read_csv(patterns_path)
            required_pattern_cols = {"district", "major_crops"}
            if not required_pattern_cols.issubset(self.crop_patterns.columns):
                raise ValueError(f"Missing required columns in {patterns_path}")
                
        # Load and validate crop_calendar
        if os.path.exists(calendar_path):
            self.crop_calendar = pd.read_csv(calendar_path)
            required_calendar_cols = {"crop", "season", "planting_month", "harvest_month"}
            if not required_calendar_cols.issubset(self.crop_calendar.columns):
                raise ValueError(f"Missing required columns in {calendar_path}")

    def normalize_district_name(self, name: str) -> str:
        """Lowercases, strips spaces, and removes special chars to match dataset."""
        if not name:
            return "unknown"
        # Lowercase and remove ' district' completely
        name = name.lower().replace(" district", "")
        # Remove any non-alphanumeric chars
        name = re.sub(r'[^a-z0-9]', '', name)
        return name

    def get_soil_and_agro_zone(self, raw_district: str) -> dict:
        """Looks up the district in the dataset, returns defaults if not found."""
        if self.soil_map is None:
            return {"soil_type": "laterite", "agro_zone": "unknown"}
            
        norm_district = self.normalize_district_name(raw_district)
        
        # In the CSV, we assume the district names are somewhat normalized
        # (e.g. wayanad, palakkad). Let's do a loose match or exact normalized match.
        match = self.soil_map[self.soil_map['district'].str.replace(' ', '').str.lower() == norm_district]
        
        if not match.empty:
            row = match.iloc[0]
            return {
                "soil_type": row["soil_type"],
                "agro_zone": row["agro_zone"]
            }
            
        return {"soil_type": "laterite", "agro_zone": "unknown"}
        
    def get_district_crops(self, raw_district: str) -> list:
        """Looks up the major crops for a district."""
        if self.crop_patterns is None:
            return ["pepper", "banana"]
            
        norm_district = self.normalize_district_name(raw_district)
        match = self.crop_patterns[self.crop_patterns['district'].str.replace(' ', '').str.lower() == norm_district]
        
        if not match.empty:
            crops_str = match.iloc[0]["major_crops"]
            return [c.strip() for c in crops_str.split(",")]
            
        return ["pepper", "banana"]

    def get_crop_calendar(self, crop: str) -> dict:
        """Looks up season info for a crop."""
        if self.crop_calendar is None:
            return {"season": "kharif", "planting_month": "all", "harvest_month": "all"}
            
        match = self.crop_calendar[self.crop_calendar['crop'].str.lower() == crop.lower()]
        
        if not match.empty:
            row = match.iloc[0]
            return {
                "season": row["season"],
                "planting_month": row["planting_month"],
                "harvest_month": row["harvest_month"]
            }
            
        return {"season": "kharif", "planting_month": "all", "harvest_month": "all"}
