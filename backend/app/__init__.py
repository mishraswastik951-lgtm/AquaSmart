import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, request
from flask_cors import CORS

def create_app(config_name='dev'):
    app = Flask(__name__)
    
    # Load config
    from config.config import config_by_name
    app.config.from_object(config_by_name[config_name])
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})
    
    # Configure logging
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/aquasmart.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('AquaSmart startup')
    
    # Initialize services
    with app.app_context():
        from app.services.firebase_service import init_firebase
        from database.mongo_connection import MongoDB
        init_firebase()
        MongoDB.init_db(app)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "aquasmart-api"}), 200
        
    # Request/Response logging middleware
    @app.before_request
    def log_request_info():
        app.logger.info('Headers: %s', request.headers)
        app.logger.info('Body: %s', request.get_data())

    # Error handling middleware
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal Server Error"}), 500

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.farm_routes import farm_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(farm_bp, url_prefix='/api/farms')
    return app
