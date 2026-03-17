from fastapi import APIRouter
from app.schemas.market_schema import MarketPriceResponse
from app.services.market_service import MarketService

router = APIRouter(prefix="/market", tags=["Market Intelligence"])
market_service = MarketService()

@router.get("/prices", response_model=MarketPriceResponse)
async def get_market_prices(crop: str):
    return await market_service.get_market_prices(crop)
