import httpx
import asyncio
from app.schemas.farm_schema import FarmContextRequest, FarmContextResponse
from app.utils.geo_utils import parse_nominatim_response
from app.utils.dataset_utils import DatasetLoader

class GeoService:
    def __init__(self):
        # In-memory cache for reverse geocoding
        self.location_cache = {}
        # Load CSVs once on init
        self.dataset_loader = DatasetLoader()

    async def get_farm_context(self, request: FarmContextRequest) -> FarmContextResponse:
        # Cache key rounded to ~11km precision (1 decimal place)
        cache_key = (round(request.latitude, 1), round(request.longitude, 1))
        
        district = "Unknown"

        
        if cache_key in self.location_cache:
            district = self.location_cache[cache_key]
        else:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={request.latitude}&lon={request.longitude}&zoom=10&addressdetails=1"
            headers = {"User-Agent": "SmartCropAdvisory/1.0"}
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                for attempt in range(2):
                    try:
                        response = await client.get(url, headers=headers)
                        response.raise_for_status()
                        parsed = parse_nominatim_response(response.json())
                        district = parsed.get("district", "Unknown")
                        self.location_cache[cache_key] = district
                        break
                    except httpx.HTTPError:
                        if attempt == 1:
                            district = "unknown_district"
                        await asyncio.sleep(1)
        
        # Fetch dataset enrichment
        dataset_info = self.dataset_loader.get_soil_and_agro_zone(district)

        return FarmContextResponse(
            district=district.capitalize(),
            soil_type=dataset_info["soil_type"].capitalize(),
            agro_zone=dataset_info["agro_zone"].replace('_', ' ').title(),
            season="Kharif", # Season and weather logic to be added/extended
            rainfall=180.0,
            temperature=24.0
        )
