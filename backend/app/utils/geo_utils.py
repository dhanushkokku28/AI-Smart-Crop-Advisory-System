import math

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # TODO: Implement haversine formula
    return 0.0

def parse_nominatim_response(response_data: dict) -> dict:
    address = response_data.get("address", {})
    
    # Try different keys Nominatim might use for district/county
    district = (
        address.get("state_district") or 
        address.get("county") or 
        address.get("city_district") or 
        address.get("city") or 
        "Unknown"
    )
    
    # Strip "District" word if present to normalize
    if district != "Unknown" and district.endswith(" District"):
        district = district.replace(" District", "")
        
    state = address.get("state", "Unknown")
    
    return {
        "district": district,
        "state": state
    }

