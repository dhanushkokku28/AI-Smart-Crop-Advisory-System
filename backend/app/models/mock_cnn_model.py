import numpy as np

class MockCNNModel:
    """
    Mock implementation of a CNN Model for Phase 4 image detection testing.
    Replicates output of categorical Keras/PyTorch model.
    """
    def __init__(self):
        self.classes_ = ["Leaf Blight", "Sigatoka", "Anthracnose", "Powdery Mildew", "Healthy"]

    def predict(self, image_tensor: np.ndarray) -> np.ndarray:
        """
        Takes an image tensor, e.g. shape (1, 224, 224, 3) 
        and outputs categorical probabilities matching self.classes_ shape.
        For deterministic mocking, we use the image tensor sum.
        """
        if image_tensor.shape[1:] != (224, 224, 3):
            raise ValueError(f"Expected image tensor with shape (1, 224, 224, 3), got {image_tensor.shape}")
            
        # Create a deterministic but mock randomized distribution using mean channel luminosity sum
        seed_value = int(np.sum(image_tensor) * 100) % 1000
        np.random.seed(seed_value)
        
        probs = np.random.dirichlet(np.ones(len(self.classes_)), size=1)
        return probs
