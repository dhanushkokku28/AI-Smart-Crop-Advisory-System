import io
import numpy as np
from PIL import Image

class ImagePreprocessor:
    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size

    def validate_image(self, image_bytes: bytes, filename: str) -> bool:
        """
        Validates the image size and extension.
        Returns True if valid, raises ValueError if not.
        """
        # 5 MB limit
        MAX_SIZE = 5 * 1024 * 1024
        if len(image_bytes) > MAX_SIZE:
            raise ValueError("Image file too large. Maximum size is 5MB.")
            
        # Basic check for common image formats based on extension
        allowed_exts = [".jpg", ".jpeg", ".png"]
        if filename and not any(filename.lower().endswith(ext) for ext in allowed_exts):
            raise ValueError("Unsupported file type. Only JPG, JPEG, and PNG are allowed.")
            
        return True

    def process(self, image_bytes: bytes) -> np.ndarray:
        """
        Decodes incoming image bytes, converts to RGB, resizes to target size,
        normalizes pixel values between 0-1, and returns a 4D batch tensor numpy array.
        Expected shape: (1, 224, 224, 3)
        """
        # Load image via PIL
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise ValueError(f"Invalid image file: {e}")
            
        # Ensure 3-channel RGB format
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        # Resize to expected model dimension (e.g. 224x224)
        image = image.resize(self.target_size)
        
        # Convert to numpy array and normalize to [0, 1] range
        img_array = np.array(image, dtype=np.float32) / 255.0
        
        # Expand dims to create the (1, height, width, channels) batch tensor required by most CNNs
        tensor = np.expand_dims(img_array, axis=0)
        
        return tensor
