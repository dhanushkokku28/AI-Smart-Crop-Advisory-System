def parse_openweather_response(response_data: dict) -> dict:
    weather_list = response_data.get("weather", [])
    
    if not weather_list:
        return {
            "rainfall_forecast": "Unknown",
            "advisory": "No weather data available."
        }
        
    main_weather = weather_list[0].get("main", "Clear")
    description = weather_list[0].get("description", "clear sky").capitalize()
    
    # Simple rule-based advisory
    advisory = "Favorable conditions for farming activities."
    if "Rain" in main_weather or "Drizzle" in main_weather or "Thunderstorm" in main_weather:
        advisory = "Avoid pesticide spraying and fertilizer application today."
    elif "Extreme" in main_weather:
        advisory = "Take precautions against extreme weather."
        
    return {
        "rainfall_forecast": description,
        "advisory": advisory
    }

