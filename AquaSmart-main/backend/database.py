from pymongo import MongoClient, ASCENDING, DESCENDING
import bcrypt
import datetime
from backend.config import Config

# Initialize MongoDB client
client = MongoClient(Config.MONGO_URI)
db = client.get_database()

# Collections
users_col = db["users"]
farms_col = db["farms"]
sensor_data_col = db["sensor_data"]
irrigation_logs_col = db["irrigation_logs"]
alerts_col = db["alerts"]

def init_db():
    """Initialize indexes and seed initial data for the application."""
    print("Initializing Database...")
    
    # 1. Create indexes
    users_col.create_index("username", unique=True)
    users_col.create_index("google_id", sparse=True)
    
    farms_col.create_index("farm_id", unique=True)
    
    # Compound indexes for fast telemetry queries
    sensor_data_col.create_index([("farm_id", ASCENDING), ("timestamp", DESCENDING)])
    irrigation_logs_col.create_index([("farm_id", ASCENDING), ("timestamp", DESCENDING)])
    alerts_col.create_index([("farm_id", ASCENDING), ("timestamp", DESCENDING)])
    alerts_col.create_index("status")
    
    # 2. Seed Default Farms
    default_farms = [
        {
            "farm_id": "Farm_A",
            "name": "Northern Field (Wheat)",
            "crop_type": "Wheat",
            "soil_type": "Clay",
            "moisture_threshold": 35.0,
            "location": "Sector 4-A"
        },
        {
            "farm_id": "Farm_B",
            "name": "Eastern Valley (Rice)",
            "crop_type": "Rice",
            "soil_type": "Loam",
            "moisture_threshold": 45.0,
            "location": "Sector 9-B"
        },
        {
            "farm_id": "Farm_C",
            "name": "Southern Ridge (Maize)",
            "crop_type": "Maize",
            "soil_type": "Sand",
            "moisture_threshold": 25.0,
            "location": "Sector 1-C"
        }
    ]
    
    for farm in default_farms:
        farms_col.update_one(
            {"farm_id": farm["farm_id"]},
            {"$set": farm},
            upsert=True
        )
    print("Farms seeded.")

    # 3. Seed Default Admin User
    admin_username = "admin"
    existing_admin = users_col.find_one({"username": admin_username})
    if not existing_admin:
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw("adminpassword".encode("utf-8"), salt)
        
        admin_user = {
            "username": admin_username,
            "password_hash": password_hash,
            "role": "admin",
            "farm_ids": ["Farm_A", "Farm_B", "Farm_C"],
            "created_at": datetime.datetime.utcnow()
        }
        users_col.insert_one(admin_user)
        print("Default Admin user seeded: admin / adminpassword")
    else:
        print("Admin user already exists.")

if __name__ == "__main__":
    init_db()
