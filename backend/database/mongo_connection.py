from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from flask import current_app
import logging

class MongoDB:
    client = None
    db = None

    @classmethod
    def init_db(cls, app=None):
        """Initialize MongoDB connection"""
        if app is None:
            app = current_app
            
        uri = app.config.get('MONGODB_URI')
        try:
            cls.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Verify connection
            cls.client.admin.command('ping')
            cls.db = cls.client.get_default_database()
            app.logger.info("MongoDB connected successfully")
            
            # Setup indexes
            cls._create_indexes()
            
        except ConnectionFailure as e:
            app.logger.error(f"Failed to connect to MongoDB: {str(e)}")
            
    @classmethod
    def _create_indexes(cls):
        """Create necessary indexes for the collections"""
        if cls.db is None:
            return
            
        try:
            # Users indexes
            cls.db.users.create_index("firebaseUid", unique=True)
            cls.db.users.create_index("email", unique=True)
            
            # Farms indexes
            cls.db.farms.create_index([("userId", 1), ("createdAt", -1)])
            cls.db.farms.create_index([("location", "2dsphere")])
            
            # Sensors indexes
            cls.db.sensors.create_index([("farmId", 1), ("sensorType", 1)])
            cls.db.sensors.create_index([("readings.timestamp", -1)])
            
            # Alerts indexes
            cls.db.alerts.create_index([("userId", 1), ("status", 1)])
            cls.db.alerts.create_index([("createdAt", -1)])
            
            # TTL Index for old sensor data (30 days = 2592000 seconds)
            # In a real scenario, this might need more complex setup to expire just readings
            
            logging.info("MongoDB indexes created successfully")
        except Exception as e:
            logging.error(f"Error creating indexes: {str(e)}")

    @classmethod
    def get_db(cls):
        if cls.db is None:
            cls.init_db()
        return cls.db
