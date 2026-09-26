import os
import json
import numpy as np
import logging

try:
    from sklearn.ensemble import RandomForestClassifier
    import pickle
except ImportError:
    print("scikit-learn is not installed. To train the local ML models, please run: pip install scikit-learn")
    exit(1)

logging.basicConfig(level=logging.INFO)

def generate_training_data(num_samples=1000):
    """
    Generate synthetic farm datasets for training.
    Features: Moisture, Temp, Humidity, Light, Wind, Rain
    Target: Irrigation Needed (0 or 1)
    """
    X = []
    y = []
    
    for _ in range(num_samples):
        moisture = np.random.uniform(10, 80)
        temp = np.random.uniform(10, 45)
        humidity = np.random.uniform(20, 95)
        light = np.random.uniform(100, 1200)
        wind = np.random.uniform(0, 30)
        rain = np.random.uniform(0, 20)
        
        # Irrigation logic
        needs_irrigation = 0
        if moisture < 30:
            needs_irrigation = 1
        elif temp > 35 and moisture < 40:
            needs_irrigation = 1
        if rain > 5:
            needs_irrigation = 0
            
        X.append([moisture, temp, humidity, light, wind, rain])
        y.append(needs_irrigation)
        
    return np.array(X), np.array(y)

def train_model():
    logging.info("Generating synthetic Kaggle-like farm dataset...")
    X, y = generate_training_data(5000)
    
    logging.info("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    accuracy = model.score(X, y)
    logging.info(f"Model trained successfully. Accuracy on training set: {accuracy * 100:.2f}%")
    
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'rf_irrigation_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    logging.info(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
