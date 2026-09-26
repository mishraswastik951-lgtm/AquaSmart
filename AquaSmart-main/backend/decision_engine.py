import os
import joblib
import numpy as np

# Cache for loaded models
MODELS = {}
MODEL_DIR = "models/saved_models"

# Soil retention mapping
RETENTION_MAP = {
    "Farm_A": 0.95,
    "Farm_B": 0.85,
    "Farm_C": 0.60
}

def load_all_models():
    """Load trained models from models/saved_models/ into memory cache."""
    global MODELS
    reg_models = {
        "Linear Regression": "linear_regression.pkl",
        "Random Forest Regressor": "random_forest_regressor.pkl",
        "XGBoost Regressor": "xgboost_regressor.pkl",
        "LSTM (Neural Network)": "mlp_regressor.pkl"  # Fallback MLP saved under this key
    }
    
    clf_models = {
        "Logistic Regression": "logistic_regression.pkl",
        "SVM": "svm_classifier.pkl",
        "Random Forest Classifier": "random_forest_classifier.pkl",
        "XGBoost Classifier": "xgboost_classifier.pkl",
        "Voting Ensemble": "ensemble_classifier.pkl"
    }
    
    # Try loading regressors
    for name, filename in reg_models.items():
        path = os.path.join(MODEL_DIR, filename)
        if os.path.exists(path):
            try:
                MODELS[name] = joblib.load(path)
                print(f"Loaded Regressor: {name}")
            except Exception as e:
                print(f"Error loading regressor {name}: {e}")
                
    # Try loading classifiers
    for name, filename in clf_models.items():
        path = os.path.join(MODEL_DIR, filename)
        if os.path.exists(path):
            try:
                MODELS[name] = joblib.load(path)
                print(f"Loaded Classifier: {name}")
            except Exception as e:
                print(f"Error loading classifier {name}: {e}")
                
    # Check if we have tensorflow model loaded
    lstm_keras_path = os.path.join(MODEL_DIR, "lstm_regressor.keras")
    if os.path.exists(lstm_keras_path):
        try:
            import tensorflow as tf
            MODELS["LSTM (Neural Network)"] = tf.keras.models.load_model(lstm_keras_path)
            print("Loaded TensorFlow LSTM Keras model.")
        except Exception as e:
            print(f"Could not load Keras LSTM, using MLP fallback: {e}")

# Initial load
load_all_models()

def predict_soil_moisture(model_name, temp, humidity, rainfall, farm_id):
    """Predict next soil moisture using a regression model."""
    evap = temp * (1.0 - humidity / 100.0)
    retention = RETENTION_MAP.get(farm_id, 0.80)
    
    features = np.array([[temp, humidity, rainfall, evap, retention]])
    
    # Reload models if not loaded
    if not MODELS:
        load_all_models()
        
    model = MODELS.get(model_name)
    if not model:
        # Fallback to standard Linear Regression or default formula
        print(f"Regressor model {model_name} not loaded. Fallback estimation.")
        # Estimate: moisture drops with evap, rises with rainfall
        estimated = 50.0 + (rainfall * 2.0) - (evap * 5.0)
        return float(np.clip(estimated, 0.0, 100.0))
        
    try:
        if "LSTM" in model_name and hasattr(model, "predict"):
            # If it's a keras model, reshape features to 3D
            if hasattr(model, "input_shape") and len(model.input_shape) == 3:
                features_3d = features.reshape((features.shape[0], 1, features.shape[1]))
                pred = model.predict(features_3d)
                return float(pred.flatten()[0])
        
        pred = model.predict(features)
        return float(pred[0])
    except Exception as e:
        print(f"Error predicting soil moisture with {model_name}: {e}")
        return 40.0 # safe fallback moisture

def make_irrigation_decision(model_name, soil_moisture, temp, humidity, rainfall, farm_id, moisture_threshold=35.0):
    """
    Predict binary irrigation decision (1: Irrigate, 0: Skip) and confidence.
    If 'Rule-Based', use direct threshold checks.
    """
    if model_name == "Rule-Based":
        decision = 1 if soil_moisture < moisture_threshold else 0
        return decision, 1.0
        
    evap = temp * (1.0 - humidity / 100.0)
    retention = RETENTION_MAP.get(farm_id, 0.80)
    
    features = np.array([[soil_moisture, temp, humidity, rainfall, evap, retention]])
    
    if not MODELS:
        load_all_models()
        
    model = MODELS.get(model_name)
    if not model:
        print(f"Classifier {model_name} not loaded. Falling back to Rule-Based.")
        decision = 1 if soil_moisture < moisture_threshold else 0
        return decision, 1.0
        
    try:
        pred = model.predict(features)
        decision = int(pred[0])
        
        # Get probability/confidence
        confidence = 1.0
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(features)[0]
            confidence = float(proba[decision])
            
        return decision, confidence
    except Exception as e:
        print(f"Error predicting decision with {model_name}: {e}. Fallback to Rule-Based.")
        decision = 1 if soil_moisture < moisture_threshold else 0
        return decision, 1.0
