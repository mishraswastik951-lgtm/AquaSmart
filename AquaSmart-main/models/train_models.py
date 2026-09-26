import pandas as pd
import numpy as np
import os
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, VotingClassifier
from sklearn.svm import SVC
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score
from sklearn.neural_network import MLPRegressor
from xgboost import XGBRegressor, XGBClassifier

# Graceful tensorflow import
HAS_TENSORFLOW = False
try:
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense
    HAS_TENSORFLOW = True
except Exception as e:
    print(f"Warning: TensorFlow import failed ({e}). Falling back to scikit-learn MLPRegressor for Neural Network model.")

def train_and_evaluate():
    os.makedirs("models/saved_models", exist_ok=True)
    
    # Copy global variable locally to avoid scope errors
    has_tf = HAS_TENSORFLOW
    
    # 1. Load Data
    data_path = "data/raw_data.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Source file {data_path} not found. Run synthetic data generator first.")
        
    df = pd.read_csv(data_path)
    
    # Feature Engineering
    df['evaporation'] = df['temperature'] * (1.0 - df['humidity'] / 100.0)
    retention_map = {"Farm_A": 0.95, "Farm_B": 0.85, "Farm_C": 0.60}
    df['soil_retention'] = df['farm_id'].map(retention_map)
    
    # Regression Datasets (Moisture prediction)
    X_reg = df[['temperature', 'humidity', 'rainfall', 'evaporation', 'soil_retention']]
    y_reg = df['soil_moisture']
    X_reg_train, X_reg_test, y_reg_train, y_reg_test = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)
    
    # Classification Datasets (Decision prediction)
    X_clf = df[['soil_moisture', 'temperature', 'humidity', 'rainfall', 'evaporation', 'soil_retention']]
    y_clf = df['irrigate']
    X_clf_train, X_clf_test, y_clf_train, y_clf_test = train_test_split(X_clf, y_clf, test_size=0.2, random_state=42)
    
    metrics = {
        "regression": {},
        "classification": {},
        "framework_status": {
            "tensorflow_available": has_tf
        }
    }
    
    # =========================================================================
    # PART A: REGRESSION MODELS (Predict Soil Moisture)
    # =========================================================================
    print("\n--- Training Regression Models (Target: Soil Moisture) ---")
    
    # 1. Linear Regression
    lr = LinearRegression()
    lr.fit(X_reg_train, y_reg_train)
    lr_pred = lr.predict(X_reg_test)
    metrics["regression"]["Linear Regression"] = {
        "rmse": float(np.sqrt(mean_squared_error(y_reg_test, lr_pred))),
        "r2": float(r2_score(y_reg_test, lr_pred))
    }
    joblib.dump(lr, "models/saved_models/linear_regression.pkl")
    print("Linear Regression trained.")
    
    # 2. Random Forest Regressor
    rf_reg = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf_reg.fit(X_reg_train, y_reg_train)
    rf_reg_pred = rf_reg.predict(X_reg_test)
    metrics["regression"]["Random Forest"] = {
        "rmse": float(np.sqrt(mean_squared_error(y_reg_test, rf_reg_pred))),
        "r2": float(r2_score(y_reg_test, rf_reg_pred))
    }
    joblib.dump(rf_reg, "models/saved_models/random_forest_regressor.pkl")
    print("Random Forest Regressor trained.")
    
    # 3. XGBoost Regressor
    xgb_reg = XGBRegressor(n_estimators=100, max_depth=5, random_state=42, n_jobs=-1)
    xgb_reg.fit(X_reg_train, y_reg_train)
    xgb_reg_pred = xgb_reg.predict(X_reg_test)
    metrics["regression"]["XGBoost"] = {
        "rmse": float(np.sqrt(mean_squared_error(y_reg_test, xgb_reg_pred))),
        "r2": float(r2_score(y_reg_test, xgb_reg_pred))
    }
    joblib.dump(xgb_reg, "models/saved_models/xgboost_regressor.pkl")
    print("XGBoost Regressor trained.")
    
    # 4. Neural Network Regressor (LSTM if TF available, else MLP)
    if has_tf:
        try:
            X_reg_train_lstm = np.array(X_reg_train).reshape((X_reg_train.shape[0], 1, X_reg_train.shape[1]))
            X_reg_test_lstm = np.array(X_reg_test).reshape((X_reg_test.shape[0], 1, X_reg_test.shape[1]))
            
            lstm = Sequential([
                LSTM(64, activation='relu', input_shape=(1, X_reg_train.shape[1]), return_sequences=True),
                LSTM(32, activation='relu'),
                Dense(1)
            ])
            lstm.compile(optimizer='adam', loss='mse')
            lstm.fit(X_reg_train_lstm, y_reg_train, epochs=15, batch_size=32, verbose=0)
            
            lstm_pred = lstm.predict(X_reg_test_lstm).flatten()
            metrics["regression"]["LSTM (Neural Network)"] = {
                "rmse": float(np.sqrt(mean_squared_error(y_reg_test, lstm_pred))),
                "r2": float(r2_score(y_reg_test, lstm_pred))
            }
            lstm.save("models/saved_models/lstm_regressor.keras")
            print("LSTM Regressor trained and saved.")
        except Exception as e:
            print(f"Error training TensorFlow LSTM: {e}. Falling back to MLPRegressor.")
            has_tf = False
            metrics["framework_status"]["tensorflow_available"] = False
            
    if not has_tf:
        # Fallback MLP Regressor
        mlp = MLPRegressor(hidden_layer_sizes=(64, 32), activation='relu', max_iter=500, random_state=42)
        mlp.fit(X_reg_train, y_reg_train)
        mlp_pred = mlp.predict(X_reg_test)
        metrics["regression"]["LSTM (Neural Network)"] = {
            "rmse": float(np.sqrt(mean_squared_error(y_reg_test, mlp_pred))),
            "r2": float(r2_score(y_reg_test, mlp_pred))
        }
        joblib.dump(mlp, "models/saved_models/mlp_regressor.pkl")
        print("MLP Regressor (LSTM Fallback) trained and saved.")
    
    # =========================================================================
    # PART B: CLASSIFICATION MODELS (Predict Irrigation Decision)
    # =========================================================================
    print("\n--- Training Classification Models (Target: Irrigate) ---")
    
    def evaluate_clf(name, clf, X_train, y_train, X_test, y_test):
        clf.fit(X_train, y_train)
        pred = clf.predict(X_test)
        
        acc = accuracy_score(y_test, pred)
        prec = precision_score(y_test, pred, zero_division=0)
        rec = recall_score(y_test, pred, zero_division=0)
        f1 = f1_score(y_test, pred, zero_division=0)
        
        metrics["classification"][name] = {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1)
        }
        print(f"Classifier {name} trained. Accuracy: {acc:.4f}")
        return clf

    # 1. Logistic Regression
    lr_clf = LogisticRegression(max_iter=1000)
    evaluate_clf("Logistic Regression", lr_clf, X_clf_train, y_clf_train, X_clf_test, y_clf_test)
    joblib.dump(lr_clf, "models/saved_models/logistic_regression.pkl")
    
    # 2. Support Vector Machine (SVM)
    svm_clf = SVC(probability=True, random_state=42)
    evaluate_clf("SVM", svm_clf, X_clf_train, y_clf_train, X_clf_test, y_clf_test)
    joblib.dump(svm_clf, "models/saved_models/svm_classifier.pkl")
    
    # 3. Random Forest Classifier
    rf_clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    evaluate_clf("Random Forest", rf_clf, X_clf_train, y_clf_train, X_clf_test, y_clf_test)
    joblib.dump(rf_clf, "models/saved_models/random_forest_classifier.pkl")
    
    # 4. XGBoost Classifier
    xgb_clf = XGBClassifier(n_estimators=100, max_depth=5, random_state=42, n_jobs=-1)
    evaluate_clf("XGBoost", xgb_clf, X_clf_train, y_clf_train, X_clf_test, y_clf_test)
    joblib.dump(xgb_clf, "models/saved_models/xgboost_classifier.pkl")
    
    # 5. Ensemble (Voting) Classifier
    voting_clf = VotingClassifier(
        estimators=[
            ('rf', RandomForestClassifier(n_estimators=100, random_state=42)),
            ('xgb', XGBClassifier(n_estimators=100, max_depth=5, random_state=42)),
            ('svm', SVC(probability=True, random_state=42))
        ],
        voting='soft'
    )
    evaluate_clf("Voting Ensemble", voting_clf, X_clf_train, y_clf_train, X_clf_test, y_clf_test)
    joblib.dump(voting_clf, "models/saved_models/ensemble_classifier.pkl")
    
    # Save metrics JSON
    with open("models/saved_models/model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)
        
    print("\nTraining completed successfully! Saved all models & metrics.")

if __name__ == "__main__":
    train_and_evaluate()
