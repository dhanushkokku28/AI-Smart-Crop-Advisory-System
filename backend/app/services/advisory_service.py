from app.schemas.advisory_schema import AdvisoryRequest, AdvisoryResponse
from app.utils.llm_utils import get_llm_client
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class AdvisoryService:
    def __init__(self):
        self.llm_client = get_llm_client()
        self.allowed_languages = ["english", "malayalam", "hindi"]

    def query_advisor(self, request: AdvisoryRequest) -> AdvisoryResponse:
        language = request.language.lower().strip()
        if language not in self.allowed_languages:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")
            
        # Basic prompt injection protection
        if len(request.query) > 500:
            raise HTTPException(status_code=400, detail="Query too long. Please keep it under 500 characters.")

        context_strs = []
        if request.district:
            context_strs.append(f"District: {request.district}")
        if request.soil_type:
            context_strs.append(f"Soil Type: {request.soil_type}")
        if request.season:
            context_strs.append(f"Season: {request.season}")
        if request.weather_summary:
            context_strs.append(f"Weather: {request.weather_summary}")
        
        context_block = "\n".join(context_strs)
        if context_block:
            context_block = f"\nFarm Context:\n{context_block}\n"

        system_prompt = f"""You are an expert agricultural advisor helping small and marginal farmers in India.

Guidelines:
- Provide clear and practical farming advice.
- Use simple language suitable for farmers.
- If a disease or crop is mentioned, include treatment suggestions.
- Respond strictly in the requested language.
{context_block}
Language requested: {language}.
"""

        try:
            # Generate the response
            answer = self.llm_client.generate_response(
                system_prompt=system_prompt,
                user_prompt=request.query
            )
            return AdvisoryResponse(response=answer)
        except Exception as e:
            logger.error(f"Advisory generation failed: {e}")
            return AdvisoryResponse(response="Unable to reach advisory service at the moment. Please try again later.")
