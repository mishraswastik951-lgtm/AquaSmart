import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/smart_irrigation")
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-smart-irrigation-key-2026")
    
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    MOCK_GOOGLE_LOGIN = os.getenv("MOCK_GOOGLE_LOGIN", "True").lower() == "true"
    
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    PORT = int(os.getenv("PORT", 5000))
