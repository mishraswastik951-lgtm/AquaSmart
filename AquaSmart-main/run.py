import sys
import os
import webbrowser
from threading import Timer

# Ensure root directory is in python search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.config import Config
from backend.database import init_db
from backend.decision_engine import load_all_models
from backend.app import app

def open_browser():
    """Helper to auto-open web browser once Flask starts."""
    webbrowser.open_new(f"http://localhost:{Config.PORT}/")

def main():
    print("=================================================================")
    print("      AquaSmart - Smart Irrigation System                        ")
    print("=================================================================")
    
    # 1. Initialize MongoDB structures and seed data
    try:
        init_db()
    except Exception as e:
        print(f"Error initializing MongoDB: {e}")
        print("Please ensure MongoDB is running local at 'mongodb://localhost:27017' or update MONGO_URI in .env")
        sys.exit(1)
        
    # 2. Check if models are trained and load them
    metrics_path = "models/saved_models/model_metrics.json"
    if not os.path.exists(metrics_path):
        print("\n[Notice] No pre-trained ML models found. Running synthetic data generator and model training...")
        
        # Run synthetic data generator
        from data.synthetic_data_generator import generate_synthetic_data
        generate_synthetic_data()
        
        # Train models
        from models.train_models import train_and_evaluate
        train_and_evaluate()
        
    print("\nCaching machine learning models into memory...")
    load_all_models()
    
    # 3. Start browser trigger (2 seconds delayed to give Flask time to bind)
    Timer(2.0, open_browser).start()
    
    # 4. Launch Flask server
    print(f"\nStarting Flask web services at: http://localhost:{Config.PORT}")
    print("Press Ctrl+C to terminate services.")
    app.run(host="0.0.0.0", port=Config.PORT, debug=False) # Debug False prevents multiple browser triggers

if __name__ == "__main__":
    main()
