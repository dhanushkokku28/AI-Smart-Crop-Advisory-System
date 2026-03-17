import numpy as np

class MockRandomForest:
    """
    A mock mock implementation of sklearn's RandomForestClassifier 
    so the backend compiles and functions without needing the real .joblib file.
    """
    def __init__(self):
        self.classes_ = np.array(["Pepper", "Banana", "Rice", "Coconut", "Coffee"])
        
    def predict_proba(self, X):
        """Returns dummy probabilities mapping to classes_."""
        # We'll just generate a deterministically somewhat random output based on the input sum pattern
        # This gives a faux-dynamic feel without real ML inference
        seed_val = int(np.sum(X)) % 100
        np.random.seed(seed_val)
        
        probs = np.random.dirichlet(np.ones(len(self.classes_)), size=1)
        return probs
