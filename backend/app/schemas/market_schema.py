from pydantic import BaseModel
from datetime import date

class MarketPriceResponse(BaseModel):
    crop: str
    price: float
    market: str
    date: date
    trend: str
