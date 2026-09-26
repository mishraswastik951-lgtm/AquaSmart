import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/aquasmart')
    FIREBASE_CONFIG = os.environ.get('FIREBASE_CONFIG')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    MONGODB_URI = os.environ.get('TEST_MONGODB_URI', 'mongodb://localhost:27017/aquasmart_test')

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False

config_by_name = dict(
    dev=DevelopmentConfig,
    development=DevelopmentConfig,
    test=TestingConfig,
    prod=ProductionConfig,
    production=ProductionConfig
)
