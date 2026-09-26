from flask import Blueprint, request, jsonify
from app.services.firebase_service import FirebaseService
from database.mongo_connection import MongoDB
from database.schemas import Schemas
from bson import ObjectId
from datetime import datetime
import traceback

farm_bp = Blueprint('farms', __name__)

def get_uid_from_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    decoded = FirebaseService.verify_token(token)
    return decoded.get('uid') if decoded else None

# Helper to serialize ObjectId
def serialize_doc(doc):
    if not doc:
        return None
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list) and len(value) > 0 and isinstance(value[0], ObjectId):
            doc[key] = [str(v) for v in value]
    return doc

@farm_bp.route('/', methods=['GET'])
def list_farms():
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    db = MongoDB.get_db()
    limit = int(request.args.get('limit', 10))
    offset = int(request.args.get('offset', 0))
    
    farms_cursor = db.farms.find({"userId": uid}).sort("createdAt", -1).skip(offset).limit(limit)
    farms = [serialize_doc(farm) for farm in farms_cursor]
    
    total = db.farms.count_documents({"userId": uid})
    
    return jsonify({
        "farms": farms,
        "total": total,
        "limit": limit,
        "offset": offset
    }), 200

@farm_bp.route('/', methods=['POST'])
def create_farm():
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json
    if not data or not data.get('name') or not data.get('location'):
        return jsonify({"error": "Missing required fields: name, location"}), 400
        
    try:
        db = MongoDB.get_db()
        new_farm = Schemas.farm_schema(
            user_id=uid,
            name=data.get('name'),
            location_coords=data.get('location'), # [longitude, latitude]
            crop_type=data.get('cropType', 'default'),
            total_area=data.get('totalArea', 0.0)
        )
        
        # Add optional fields
        if 'description' in data: new_farm['description'] = data['description']
        if 'address' in data: new_farm['address'] = data['address']
        if 'waterSource' in data: new_farm['waterSource'] = data['waterSource']
        if 'irrigationType' in data: new_farm['irrigationType'] = data['irrigationType']
        
        result = db.farms.insert_one(new_farm)
        
        # Also add farm ID to user's profile
        db.users.update_one(
            {"firebaseUid": uid},
            {"$push": {"farm_ids": result.inserted_id}}
        )
        
        return jsonify({"message": "Farm created", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create farm: {str(e)}"}), 500

@farm_bp.route('/<farm_id>', methods=['GET'])
def get_farm(farm_id):
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        db = MongoDB.get_db()
        farm = db.farms.find_one({"_id": ObjectId(farm_id), "userId": uid})
        
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
            
        return jsonify(serialize_doc(farm)), 200
    except Exception:
        return jsonify({"error": "Invalid farm ID"}), 400

@farm_bp.route('/<farm_id>', methods=['PUT'])
def update_farm(farm_id):
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json
    try:
        db = MongoDB.get_db()
        update_data = {"updatedAt": datetime.utcnow()}
        
        allowed_fields = ['name', 'description', 'totalArea', 'cropType', 'address', 'waterSource', 'irrigationType', 'status']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
                
        result = db.farms.update_one(
            {"_id": ObjectId(farm_id), "userId": uid},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Farm not found"}), 404
            
        return jsonify({"message": "Farm updated"}), 200
    except Exception:
        return jsonify({"error": "Invalid request"}), 400

@farm_bp.route('/<farm_id>', methods=['DELETE'])
def delete_farm(farm_id):
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        db = MongoDB.get_db()
        # Soft delete
        result = db.farms.update_one(
            {"_id": ObjectId(farm_id), "userId": uid},
            {"$set": {"status": "deleted", "updatedAt": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Farm not found"}), 404
            
        return jsonify({"message": "Farm deleted"}), 200
    except Exception:
        return jsonify({"error": "Invalid farm ID"}), 400

# SENSOR ROUTES
@farm_bp.route('/<farm_id>/sensors', methods=['GET'])
def list_sensors(farm_id):
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        db = MongoDB.get_db()
        # Verify ownership
        farm = db.farms.find_one({"_id": ObjectId(farm_id), "userId": uid})
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
            
        sensors = list(db.sensors.find({"farmId": ObjectId(farm_id)}))
        return jsonify([serialize_doc(s) for s in sensors]), 200
    except Exception:
        return jsonify({"error": "Invalid request"}), 400

@farm_bp.route('/<farm_id>/sensors', methods=['POST'])
def add_sensor(farm_id):
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json
    if not data or not data.get('sensorType') or not data.get('model'):
        return jsonify({"error": "Missing sensorType or model"}), 400
        
    try:
        db = MongoDB.get_db()
        farm = db.farms.find_one({"_id": ObjectId(farm_id), "userId": uid})
        if not farm:
            return jsonify({"error": "Farm not found"}), 404
            
        new_sensor = Schemas.sensor_schema(
            farm_id=ObjectId(farm_id),
            sensor_type=data.get('sensorType'),
            model=data.get('model')
        )
        
        if 'location' in data: new_sensor['location'] = data['location']
        if 'depth' in data: new_sensor['depth'] = data['depth']
        
        result = db.sensors.insert_one(new_sensor)
        
        db.farms.update_one(
            {"_id": ObjectId(farm_id)},
            {"$push": {"sensors": result.inserted_id}}
        )
        
        return jsonify({"message": "Sensor added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to add sensor: {str(e)}"}), 500

@farm_bp.route('/<farm_id>/sensors/<sensor_id>', methods=['GET'])
def get_sensor(farm_id, sensor_id):
    uid = get_uid_from_token()
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        db = MongoDB.get_db()
        # Ensure farm belongs to user
        if not db.farms.find_one({"_id": ObjectId(farm_id), "userId": uid}):
            return jsonify({"error": "Farm not found"}), 404
            
        sensor = db.sensors.find_one({"_id": ObjectId(sensor_id), "farmId": ObjectId(farm_id)})
        if not sensor:
            return jsonify({"error": "Sensor not found"}), 404
            
        return jsonify(serialize_doc(sensor)), 200
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

# Additional routes for Crops, Alerts, and Harvest can be scaffolded similarly
