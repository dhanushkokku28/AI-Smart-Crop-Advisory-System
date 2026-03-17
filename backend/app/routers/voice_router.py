from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.utils.voice_utils import VoiceUtils
from pydantic import BaseModel

class STTResponse(BaseModel):
    text: str

class TTSRequest(BaseModel):
    text: str
    language: str

router = APIRouter(prefix="/voice", tags=["Voice Support"])
voice_utils = VoiceUtils()

@router.post("/transcribe", response_model=STTResponse)
async def transcribe_audio(audio: UploadFile = File(...), language: str = Form(...)):
    """Receives an audio file and transcribes it into text."""
    audio_bytes = await audio.read()
    
    try:
        voice_utils.validate_audio(audio_bytes, audio.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    text = voice_utils.speech_to_text(audio_bytes, language)
    return STTResponse(text=text)

@router.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    """Synthesizes text input into a spoken audio byte stream."""
    try:
        audio_stream = voice_utils.text_to_speech(request.text, request.language)
        if not audio_stream:
            # Fallback mock check
            return Response(content=b"MockAudioFileNotRealAudio", media_type="audio/mpeg")
            
        return Response(content=audio_stream, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Voice synthesis failed.")
