import io
import sys
import logging

logger = logging.getLogger(__name__)

# Try to import real dependencies, but fail gracefully for lightweight local execution without ffmpeg
try:
    from gtts import gTTS
    import speech_recognition as sr
    from pydub import AudioSegment
    HAS_VOICE_DEPS = True
except ImportError:
    HAS_VOICE_DEPS = False
    logger.warning("Voice dependencies (gTTS, SpeechRecognition, pydub) missing. Using Mock Voice Layer.")

class VoiceUtils:
    def __init__(self):
        self.language_map = {
            "english": "en",
            "malayalam": "ml",
            "hindi": "hi"
        }

    def validate_audio(self, audio_bytes: bytes, filename: str) -> bool:
        """Ensures the uploaded file is a valid audio format under 10MB."""
        max_size = 10 * 1024 * 1024  # 10MB
        if len(audio_bytes) > max_size:
            raise ValueError("Audio file too large. Maximum size is 10MB.")
            
        allowed_formats = [".wav", ".mp3", ".m4a", ".ogg"]
        if filename and not any(filename.lower().endswith(ext) for ext in allowed_formats):
            raise ValueError("Unsupported audio format. Allowed: wav, mp3, m4a, ogg.")
            
        return True

    def _normalize_audio(self, audio_bytes: bytes) -> bytes:
        """
        Normalizes audio for transcription (16000Hz, mono).
        Mocks this process if dependencies are missing.
        """
        if not HAS_VOICE_DEPS:
            # Return raw if mock
            return audio_bytes
            
        try:
            # Assume arbitrary source (we'd dynamically detect in real env)
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
            audio = audio.set_channels(1).set_frame_rate(16000)
            
            out_io = io.BytesIO()
            audio.export(out_io, format="wav")
            return out_io.getvalue()
        except Exception as e:
            logger.error(f"Failed to normalize audio: {e}")
            raise ValueError("Audio normalization failed.")

    def speech_to_text(self, audio_bytes: bytes, language: str) -> str:
        """Transcribes incoming audio into text using SpeechRecognition."""
        if not HAS_VOICE_DEPS:
            logger.info("Mock STT processing.")
            return "How do I control pests in pepper plants?"
            
        lang_code = self.language_map.get(language.lower().strip(), "en")
        
        try:
            normalized_bytes = self._normalize_audio(audio_bytes)
            recognizer = sr.Recognizer()
            
            with sr.AudioFile(io.BytesIO(normalized_bytes)) as source:
                audio_data = recognizer.record(source)
                
            text = recognizer.recognize_google(audio_data, language=lang_code)
            return text
        except Exception as e:
            logger.error(f"STT Error: {e}")
            return "Unable to clearly understand the audio. Please try speaking again."

    def text_to_speech(self, text: str, language: str) -> bytes:
        """Synthesizes text into an MP3 byte stream."""
        if not HAS_VOICE_DEPS:
            logger.info("Mock TTS generation.")
            return b"" # Returns empty audio bytes for mock

        lang_code = self.language_map.get(language.lower().strip(), "en")
        
        try:
            tts = gTTS(text=text, lang=lang_code, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.read()
        except Exception as e:
            logger.error(f"TTS Error: {e}")
            return b""
