from flask import Flask, request, jsonify, redirect, send_from_directory
import datetime
import os
import json
import bcrypt
import pandas as pd
from jose import jwt, JWTError
from flask_cors import CORS
from functools import wraps

from backend.config import Config
from backend.database import (
    db, users_col, farms_col, sensor_data_col, 
    irrigation_logs_col, alerts_col, init_db
)
from backend.decision_engine import (
    predict_soil_moisture, make_irrigation_decision, load_all_models
)

# Start Flask — serve the frontend/ directory as static files
_frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
app = Flask(__name__, static_folder=_frontend_dir, static_url_path="")
CORS(app)  # Allow cross-origin requests

# Serve index.html explicitly at root /
@app.route("/")
def serve_index():
    return send_from_directory(_frontend_dir, "index.html")


# Load default database seeding
try:
    init_db()
except Exception as e:
    print(f"Database init warning: {e}")

# Helper: JWT decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
            
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            current_user = users_col.find_one({"username": payload["username"]})
            if not current_user:
                return jsonify({"message": "User not found!"}), 401
            # Clean up object id
            current_user["_id"] = str(current_user["_id"])
            if "password_hash" in current_user:
                del current_user["password_hash"]
        except JWTError as e:
            return jsonify({"message": f"Token is invalid or expired: {e}"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# -----------------------------------------------------------------------------
# AUTHENTICATION ROUTES
# -----------------------------------------------------------------------------

@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "farmer") # Default role is farmer
    farm_ids = data.get("farm_ids", ["Farm_A", "Farm_B", "Farm_C"]) # Default assignments
    
    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400
        
    if users_col.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400
        
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode("utf-8"), salt)
    
    user_doc = {
        "username": username,
        "password_hash": password_hash,
        "role": role,
        "farm_ids": farm_ids,
        "created_at": datetime.datetime.utcnow()
    }
    users_col.insert_one(user_doc)
    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400
        
    user = users_col.find_one({"username": username})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"]):
        return jsonify({"message": "Invalid credentials!"}), 401
        
    # Generate JWT
    token_payload = {
        "username": user["username"],
        "role": user["role"],
        "farm_ids": user.get("farm_ids", []),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(token_payload, Config.JWT_SECRET, algorithm="HS256")
    
    return jsonify({
        "token": token,
        "role": user["role"],
        "username": user["username"],
        "farm_ids": user.get("farm_ids", [])
    }), 200

@app.route("/auth/google", methods=["GET"])
def google_auth():
    """Starts Google OAuth2 or uses local mock simulation."""
    if Config.MOCK_GOOGLE_LOGIN:
        # Redirect to callback with mock details
        mock_callback_url = f"/auth/google/callback?mock=true&username=GoogleUser_{datetime.datetime.now().microsecond}&email=googleuser@example.com&google_id=g_{datetime.datetime.now().microsecond}"
        return redirect(mock_callback_url)
    else:
        # Full Google OAuth URL setup (Standard integration endpoint redirect)
        # Note: If user wants full integration, they supply GOOGLE_CLIENT_ID
        google_oauth_url = (
            "https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={Config.GOOGLE_CLIENT_ID}&"
            "redirect_uri=http://localhost:5000/auth/google/callback&"
            "response_type=code&"
            "scope=openid%20profile%20email"
        )
        return redirect(google_oauth_url)

@app.route("/auth/google/callback", methods=["GET"])
def google_auth_callback():
    """Handles Google OAuth2 callback. Upserts google user into DB."""
    # Check if mock mode
    is_mock = request.args.get("mock", "false").lower() == "true"
    
    if is_mock:
        username = request.args.get("username")
        email = request.args.get("email")
        google_id = request.args.get("google_id")
    else:
        # Standard Google OAuth token exchange
        code = request.args.get("code")
        if not code:
            return "OAuth authorization code missing", 400
            
        import requests
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": Config.GOOGLE_CLIENT_ID,
            "client_secret": Config.GOOGLE_CLIENT_SECRET,
            "redirect_uri": "http://localhost:5000/auth/google/callback",
            "grant_type": "authorization_code"
        }
        token_response = requests.post(token_url, data=data).json()
        
        # Get User Info
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {token_response.get('access_token')}"}
        user_info = requests.get(userinfo_url, headers=headers).json()
        
        username = user_info.get("name", "GoogleUser").replace(" ", "") + "_" + user_info.get("sub", "")[-4:]
        email = user_info.get("email")
        google_id = user_info.get("sub")

    # Upsert user record
    existing_user = users_col.find_one({"google_id": google_id})
    if not existing_user:
        # Check if username exists
        count = 1
        base_username = username
        while users_col.find_one({"username": username}):
            username = f"{base_username}_{count}"
            count += 1
            
        user_doc = {
            "username": username,
            "email": email,
            "google_id": google_id,
            "role": "farmer",
            "farm_ids": ["Farm_A", "Farm_B", "Farm_C"],
            "created_at": datetime.datetime.utcnow()
        }
        users_col.insert_one(user_doc)
        user = user_doc
    else:
        user = existing_user

    # Generate JWT
    token_payload = {
        "username": user["username"],
        "role": user["role"],
        "farm_ids": user.get("farm_ids", []),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(token_payload, Config.JWT_SECRET, algorithm="HS256")

    # Redirect user back to frontend app with JWT query param
    # (In production we use httpOnly cookies, local storage query param redirection here is standard for decoupled setups)
    redirect_url = f"http://localhost:5000/index.html?token={token}&username={user['username']}&role={user['role']}&farms={','.join(user.get('farm_ids', []))}"
    return redirect(redirect_url)

# -----------------------------------------------------------------------------
# CORE API ENDPOINTS
# -----------------------------------------------------------------------------

@app.route("/api/farms", methods=["GET", "POST"])
def manage_farms():
    if request.method == "GET":
        farms = list(farms_col.find({}, {"_id": 0}))
        return jsonify(farms), 200
        
    elif request.method == "POST":
        data = request.json
        farm_id = data.get("farm_id")
        name = data.get("name")
        crop_type = data.get("crop_type", "Wheat")
        soil_type = data.get("soil_type", "Loam")
        location = data.get("location", "Main Grid")
        
        # Determine optimal threshold based on crop type
        crop_thresholds = {
            "Rice": 60.0,
            "Sugarcane": 55.0,
            "Maize": 45.0,
            "Vegetables": 40.0,
            "Wheat": 35.0,
            "Mustard": 30.0
        }
        # Use provided threshold if present, else fallback to mapping, else 30.0
        default_threshold = crop_thresholds.get(crop_type, 30.0)
        moisture_threshold = float(data.get("moisture_threshold", default_threshold))
        
        if not farm_id or not name:
            return jsonify({"message": "Farm ID and Name are required"}), 400
            
        if farms_col.find_one({"farm_id": farm_id}):
            return jsonify({"message": "Farm already exists"}), 400
            
        farm_doc = {
            "farm_id": farm_id,
            "name": name,
            "crop_type": crop_type,
            "soil_type": soil_type,
            "moisture_threshold": moisture_threshold,
            "location": location
        }
        farms_col.insert_one(farm_doc)
        return jsonify({"message": "Farm created successfully!", "farm": farm_doc}), 201

@app.route("/api/sensor-data", methods=["GET"])
def get_sensor_data():
    farm_id = request.args.get("farm_id")
    limit = int(request.args.get("limit", 50))
    
    if not farm_id:
        return jsonify({"message": "farm_id parameter is required"}), 400
        
    cursor = sensor_data_col.find({"farm_id": farm_id}, {"_id": 0}).sort("timestamp", -1).limit(limit)
    data_list = list(cursor)
    data_list.reverse()
    return jsonify(data_list), 200

@app.route("/api/irrigation-logs", methods=["GET"])
def get_irrigation_logs():
    farm_id = request.args.get("farm_id")
    limit = int(request.args.get("limit", 50))
    
    if not farm_id:
        return jsonify({"message": "farm_id parameter is required"}), 400
        
    cursor = irrigation_logs_col.find({"farm_id": farm_id}, {"_id": 0}).sort("timestamp", -1).limit(limit)
    logs_list = list(cursor)
    return jsonify(logs_list), 200

@app.route("/api/alerts", methods=["GET", "POST"])
def manage_alerts():
    if request.method == "GET":
        alerts = list(alerts_col.find({"status": "active"}, {"_id": 0}).sort("timestamp", -1))
        return jsonify(alerts), 200
        
    elif request.method == "POST":
        alert_id = request.json.get("alert_id")
        if not alert_id:
            return jsonify({"message": "alert_id is required"}), 400
        alerts_col.update_many({"alert_id": alert_id}, {"$set": {"status": "resolved", "resolved_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}})
        return jsonify({"message": "Alert resolved successfully!"}), 200

# -----------------------------------------------------------------------------
# CORE SIMULATOR & MODEL INFERENCE
# -----------------------------------------------------------------------------

def process_and_evaluate_telemetry(farm_id, temp, humidity, rainfall, raw_soil_moisture, source, regressor_model, classifier_model):
    """
    Decoupled processing engine. Normalizes inputs, runs predictions, 
    persists records, and checks alert thresholds.
    """
    farm = farms_col.find_one({"farm_id": farm_id})
    moisture_threshold = farm.get("moisture_threshold", 30.0) if farm else 30.0
    
    timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    # 1. Run Regression: Predict Soil Moisture
    predicted_moisture = predict_soil_moisture(regressor_model, temp, humidity, rainfall, farm_id)
    
    # Use predicted or raw moisture depending on system choice
    active_moisture = predicted_moisture if source == "virtual" else raw_soil_moisture
    
    # 2. Run Classification: Make Irrigation Decision
    decision, confidence = make_irrigation_decision(
        classifier_model, active_moisture, temp, humidity, rainfall, farm_id, moisture_threshold
    )
    
    # 3. Store Sensor Telemetry
    sensor_doc = {
        "farm_id": farm_id,
        "temperature": temp,
        "humidity": humidity,
        "rainfall": rainfall,
        "soil_moisture": active_moisture,
        "timestamp": timestamp,
        "source": source
    }
    sensor_data_col.insert_one(sensor_doc)
    
    # 4. Store Irrigation Log
    log_doc = {
        "farm_id": farm_id,
        "decision": "irrigate" if decision == 1 else "skip",
        "predicted_moisture": round(predicted_moisture, 2),
        "actual_moisture": round(active_moisture, 2),
        "model_used": classifier_model,
        "regressor_used": regressor_model,
        "confidence": round(confidence, 4),
        "timestamp": timestamp
    }
    irrigation_logs_col.insert_one(log_doc)
    
    # 5. Evaluate Alerts
    # Low Moisture Alert
    if active_moisture < moisture_threshold:
        alert_id = f"low_moisture_{farm_id}_{int(datetime.datetime.utcnow().timestamp())}"
        alert_doc = {
            "alert_id": alert_id,
            "farm_id": farm_id,
            "alert_type": "Low Moisture Warning",
            "message": f"Critical: Soil moisture ({active_moisture}%) is below configured threshold ({moisture_threshold}%). Irrigation advised.",
            "status": "active",
            "timestamp": timestamp
        }
        alerts_col.update_one(
            {"farm_id": farm_id, "alert_type": "Low Moisture Warning", "status": "active"},
            {"$set": alert_doc},
            upsert=True
        )
        
    # Anomaly Detection (Extreme Weather readings)
    if temp > 48.0 or temp < -5.0 or humidity < 5.0:
        alert_id = f"anomaly_{farm_id}_{int(datetime.datetime.utcnow().timestamp())}"
        alert_doc = {
            "alert_id": alert_id,
            "farm_id": farm_id,
            "alert_type": "Sensor Anomaly",
            "message": f"Warning: Extreme climate readings detected: Temp={temp}°C, Humidity={humidity}%. Check equipment.",
            "status": "active",
            "timestamp": timestamp
        }
        alerts_col.insert_one(alert_doc)
        
    return {
        "sensor_data": sensor_doc,
        "decision": log_doc
    }

@app.route("/api/sensors/simulate", methods=["POST"])
def simulate_sensor_reading():
    """
    Read the next sequential row from the farm's CSV file and run predictions.
    """
    data = request.json
    farm_id = data.get("farm_id", "Farm_A")
    regressor = data.get("regressor_model", "XGBoost Regressor")
    classifier = data.get("classifier_model", "XGBoost Classifier")
        
    csv_path = f"data/{farm_id}.csv"
    if not os.path.exists(csv_path):
        return jsonify({"message": f"Dataset for {farm_id} not found."}), 404
        
    df = pd.read_csv(csv_path)
    if len(df) == 0:
        return jsonify({"message": "CSV file is empty"}), 400
        
    # Read row sequentially based on count of database records
    db_count = sensor_data_col.count_documents({"farm_id": farm_id})
    row_idx = db_count % len(df)
    
    row = df.iloc[row_idx]
    
    # Extract values
    temp = float(row["temperature"])
    humidity = float(row["humidity"])
    rainfall = float(row["rainfall"])
    raw_moisture = float(row["soil_moisture"])
    
    # Process
    result = process_and_evaluate_telemetry(
        farm_id=farm_id,
        temp=temp,
        humidity=humidity,
        rainfall=rainfall,
        raw_soil_moisture=raw_moisture,
        source="virtual",
        regressor_model=regressor,
        classifier_model=classifier
    )
    
    # Clean up object id
    if "_id" in result["sensor_data"]:
        del result["sensor_data"]["_id"]
    if "_id" in result["decision"]:
        del result["decision"]["_id"]
        
    return jsonify(result), 200

# -----------------------------------------------------------------------------
# PHYSICAL SENSORS TELEMETRY INGESTION
# -----------------------------------------------------------------------------

@app.route("/api/sensors/ingest", methods=["POST"])
def ingest_physical_sensor():
    """
    Ingest telemetry from physical IoT hardware (e.g. ESP32).
    Includes API token check or direct POST handling.
    """
    data = request.json
    farm_id = data.get("farm_id")
    temp = data.get("temperature")
    humidity = data.get("humidity")
    rainfall = data.get("rainfall", 0.0)
    soil_moisture = data.get("soil_moisture")
    
    # Selected models (default to robust models)
    regressor = data.get("regressor_model", "XGBoost Regressor")
    classifier = data.get("classifier_model", "XGBoost Classifier")
    
    if not farm_id or temp is None or humidity is None or soil_moisture is None:
        return jsonify({"message": "Missing required sensor parameters (farm_id, temperature, humidity, soil_moisture)"}), 400
        
    # Process
    result = process_and_evaluate_telemetry(
        farm_id=farm_id,
        temp=float(temp),
        humidity=float(humidity),
        rainfall=float(rainfall),
        raw_soil_moisture=float(soil_moisture),
        source="physical",
        regressor_model=regressor,
        classifier_model=classifier
    )
    
    # Clean up object id
    if "_id" in result["sensor_data"]:
        del result["sensor_data"]["_id"]
    if "_id" in result["decision"]:
        del result["decision"]["_id"]
        
    return jsonify({
        "status": "success",
        "message": "Telemetry received",
        "result": result
    }), 201

# -----------------------------------------------------------------------------
# MODEL METRICS & STATUS
# -----------------------------------------------------------------------------

@app.route("/api/models/status", methods=["GET"])
def get_models_status():
    metrics_path = "models/saved_models/model_metrics.json"
    if not os.path.exists(metrics_path):
        return jsonify({"trained": False, "message": "No models trained yet."}), 200
        
    with open(metrics_path, "r") as f:
        metrics = json.load(f)
        
    metrics["trained"] = True
    return jsonify(metrics), 200

@app.route("/api/models/train", methods=["POST"])
def trigger_training():
    import subprocess
    try:
        subprocess.Popen(["python", "models/train_models.py"])
        return jsonify({"message": "Model retraining triggered in the background. Check status in a few seconds."}), 202
    except Exception as e:
        return jsonify({"message": f"Failed to start training process: {e}"}), 500


if __name__ == "__main__":
    # Ensure database models are cached
    load_all_models()
    app.run(host="0.0.0.0", port=Config.PORT, debug=True)

