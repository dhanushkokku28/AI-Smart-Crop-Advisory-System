from typing import Protocol
import logging
import os

logger = logging.getLogger(__name__)

class LLMClient(Protocol):
    def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        ...

class MockLLMClient:
    def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        logger.info("MockLLMClient processing request.")
        return "ഈ ചോദ്യത്തിനുള്ള ഉത്തരം ഉടൻ ലഭ്യമാകും. (This is a mocked response, simulating Malayalam/Language capability.)"

class GeminiClient:
    def __init__(self, api_key: str):
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        except ImportError:
            logger.error("google-generativeai package not found. Cannot initialize GeminiClient.")
            raise

    def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        try:
            prompt = f"{system_prompt}\n\nUser Question:\n{user_prompt}"
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            raise

def get_llm_client() -> LLMClient:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            return GeminiClient(api_key=api_key)
        except Exception as e:
            logger.warning(f"Failed to initialize GeminiClient: {e}. Falling back to MockLLMClient.")
            return MockLLMClient()
    else:
        logger.warning("No GEMINI_API_KEY found in environment. Using MockLLMClient.")
        return MockLLMClient()
