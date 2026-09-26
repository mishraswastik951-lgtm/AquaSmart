import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app

def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            firebase_config = current_app.config.get('FIREBASE_CONFIG')
            if firebase_config:
                if isinstance(firebase_config, str):
                    firebase_config = json.loads(firebase_config)
                cred = credentials.Certificate(firebase_config)
                firebase_admin.initialize_app(cred)
                current_app.logger.info("Firebase initialized successfully")
            else:
                current_app.logger.warning("FIREBASE_CONFIG not found in environment")
    except Exception as e:
        current_app.logger.error(f"Failed to initialize Firebase: {str(e)}")

class FirebaseService:
    @staticmethod
    def verify_token(id_token):
        """Verify a Firebase ID token and return the decoded token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            current_app.logger.error(f"Token verification failed: {str(e)}")
            return None

    @staticmethod
    def create_custom_token(uid, claims=None):
        """Create a custom token for the user"""
        try:
            custom_token = auth.create_custom_token(uid, claims)
            return custom_token
        except Exception as e:
            current_app.logger.error(f"Error creating custom token: {str(e)}")
            return None

            
    @staticmethod
    def get_user(uid):
        """Get Firebase user by UID"""
        try:
            return auth.get_user(uid)
        except Exception as e:
            current_app.logger.error(f"Failed to fetch user: {str(e)}")
            return None
            
    @staticmethod
    def set_user_role(uid, role):
        """Set custom claims for RBAC"""
        try:
            auth.set_custom_user_claims(uid, {'role': role})
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to set custom claims: {str(e)}")
            return False
