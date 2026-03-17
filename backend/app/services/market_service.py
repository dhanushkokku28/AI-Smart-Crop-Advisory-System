import httpx
import asyncio
from app.schemas.market_schema import MarketPriceResponse
from datetime import date
import random

class MarketService:
    async def get_market_prices(self, crop: str) -> MarketPriceResponse:
        # Simulate an external API call latency and retry loop
        async with httpx.AsyncClient(timeout=5.0) as client:
            for attempt in range(2):
                try:
                    # In a real environment, this hits Agmarknet
                    # We hit a mock URL or just sleep and raise mock data.
                    # As we do not have a real endpoint, we will simulate the waiting and schema mapping.
                    await asyncio.sleep(0.5) 
                    
                    # Generate realistic simulated data
                    prices = {"pepper": 720.0, "banana": 45.0, "coconut": 35.0}
                    base_price = prices.get(crop.lower(), 100.0)
                    fluctuation = random.uniform(-0.05, 0.05)
                    final_price = round(base_price * (1 + fluctuation), 2)
                    
                    trend = "rising" if fluctuation > 0 else "falling"
                    
                    return MarketPriceResponse(
                        crop=crop.capitalize(),
                        price=final_price,
                        market="Kozhikode",
                        date=date.today(),
                        trend=trend
                    )
                except httpx.HTTPError:
                    if attempt == 1:
                        break
                    await asyncio.sleep(1)
                    
        return MarketPriceResponse(
            crop=crop.capitalize(),
            price=0.0,
            market="Unknown",
            date=date.today(),
            trend="unavailable"
        )
