from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Smart Crop Advisory System"
    version: str = "1.0.0"
    weather_api_key: str = ""
    agmarknet_api_key: str = ""
    llm_api_key: str = ""
    gemini_api_key: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
