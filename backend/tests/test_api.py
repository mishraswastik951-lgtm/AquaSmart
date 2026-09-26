import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app('test')
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json == {"status": "healthy", "service": "aquasmart-api"}

def test_unauthorized_access(client):
    """Test accessing protected route without token"""
    response = client.get('/api/farms/')
    assert response.status_code == 401
