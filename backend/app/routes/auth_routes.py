from flask import Blueprint, request, jsonify
from app.services.firebase_service import FirebaseService
from database.mongo_connection import MongoDB
from database.schemas import Schemas
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('idToken'):
        return jsonify({"error": "Missing ID token"}), 400
        
    decoded_token = FirebaseService.verify_token(data.get('idToken'))
    if not decoded_token:
        return jsonify({"error": "Invalid token"}), 401
        
    uid = decoded_token.get('uid')
    email = decoded_token.get('email')
    
    db = MongoDB.get_db()
    existing_user = db.users.find_one({"firebaseUid": uid})
    
    if not existing_user:
        new_user = Schemas.user_schema(
            firebase_uid=uid, 
            email=email,
            name=data.get('name', ''),
            phone=data.get('phone', '')
        )
        db.users.insert_one(new_user)
        return jsonify({"message": "User registered successfully"}), 201
        
    return jsonify({"message": "User already exists"}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    id_token = get_token_from_header()
    if not id_token:
        return jsonify({"error": "Missing token"}), 401
        
    decoded_token = FirebaseService.verify_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid token"}), 401
        
    db = MongoDB.get_db()
    user = db.users.find_one({"firebaseUid": decoded_token.get('uid')}, {'_id': 0})
    
    if not user:
        return jsonify({"error": "User not found. Please register."}), 404
        
    return jsonify({"message": "Login successful", "user": user}), 200

@auth_bp.route('/profile', methods=['GET', 'PUT'])
def profile():
    id_token = get_token_from_header()
    if not id_token:
        return jsonify({"error": "Missing token"}), 401
        
    decoded_token = FirebaseService.verify_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid token"}), 401
        
    uid = decoded_token.get('uid')
    db = MongoDB.get_db()
    
    if request.method == 'GET':
        user = db.users.find_one({"firebaseUid": uid}, {'_id': 0})
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
        
    if request.method == 'PUT':
        data = request.json
        update_data = {
            "updatedAt": datetime.utcnow()
        }
        
        # Allow updating specific fields
        for field in ['name', 'phone', 'preferences']:
            if field in data:
                update_data[field] = data[field]
                
        db.users.update_one(
            {"firebaseUid": uid},
            {"$set": update_data}
        )
        return jsonify({"message": "Profile updated successfully"}), 200
