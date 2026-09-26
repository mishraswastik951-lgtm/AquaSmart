from datetime import datetime

class Schemas:
    @staticmethod
    def user_schema(firebase_uid, email, name="", phone=""):
        return {
            "firebaseUid": firebase_uid,
            "email": email,
            "name": name,
            "phone": phone,
            "profileImage": "",
            "farm_ids": [],
            "subscription": {
                "tier": "free",
                "startDate": datetime.utcnow(),
                "renewalDate": None
            },
            "preferences": {
                "language": "en",
                "timezone": "UTC",
                "notifications": {"email": True, "sms": False, "push": True}
            },
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

    @staticmethod
    def farm_schema(user_id, name, location_coords, crop_type, total_area):
        return {
            "userId": user_id,
            "name": name,
            "description": "",
            "totalArea": total_area,
            "cropType": crop_type,
            "location": {
                "type": "Point",
                "coordinates": location_coords # [longitude, latitude]
            },
            "address": "",
            "sensors": [],
            "crops": [],
            "waterSource": "",
            "irrigationType": "",
            "soilType": "",
            "status": "active",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

    @staticmethod
    def sensor_schema(farm_id, sensor_type, model):
        return {
            "farmId": farm_id,
            "sensorType": sensor_type,
            "model": model,
            "serialNumber": "",
            "location": "",
            "depth": 0.0,
            "status": "active",
            "battery": 100,
            "lastReading": {
                "timestamp": datetime.utcnow(),
                "value": 0.0,
                "quality": 100
            },
            "readings": [],
            "createdAt": datetime.utcnow()
        }
