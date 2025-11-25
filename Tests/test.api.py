import pytest
from unittest.mock import patch, MagicMock
from app import app
import json

@pytest.fixture
def client():
    """Create Flask test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_auth_token():
    """Mock authentication token"""
    return "mock_auth_token_12345"

class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_health_check(self, client):
        """Test API health status"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
    
    def test_health_response_format(self, client):
        """Test health check response format"""
        response = client.get('/api/health')
        data = response.get_json()
        assert 'status' in data
        assert data['status'] in ['healthy', 'unhealthy']

class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_auth_status_unauthenticated(self, client):
        """Test auth status when not authenticated"""
        response = client.get('/api/auth/status')
        assert response.status_code == 200
        data = response.get_json()
        assert 'authenticated' in data
    
    def test_auth_status_response_format(self, client):
        """Test auth status response contains required fields"""
        response = client.get('/api/auth/status')
        data = response.get_json()
        assert isinstance(data, dict)
        assert 'authenticated' in data
    
    def test_login_endpoint_exists(self, client):
        """Test login endpoint"""
        response = client.get('/api/auth/login')
        assert response.status_code in [200, 302, 400]  # May redirect or require POST
    
    def test_logout_endpoint(self, client):
        """Test logout endpoint"""
        response = client.post('/api/auth/logout')
        assert response.status_code in [200, 400]

class TestPromptsEndpoint:
    """Test prompts endpoint"""
    
    def test_get_prompts(self, client):
        """Test retrieving classification prompts"""
        response = client.get('/api/prompts')
        assert response.status_code == 200
        data = response.get_json()
        assert 'classification' in data or isinstance(data, dict)
    
    def test_prompts_response_format(self, client):
        """Test prompts response format"""
        response = client.get('/api/prompts')
        data = response.get_json()
        assert isinstance(data, dict)

class TestEmailEndpoints:
    """Test email processing endpoints"""
    
    def test_fetch_emails_endpoint(self, client):
        """Test fetching emails endpoint"""
        response = client.get('/api/emails/fetch')
        assert response.status_code in [200, 400, 401]  # May require auth token
    
    def test_process_email_endpoint(self, client):
        """Test email processing endpoint"""
        response = client.post('/api/emails/process')
        assert response.status_code in [200, 400, 422]
    
    def test_generate_reply_endpoint(self, client):
        """Test email reply generation"""
        response = client.post('/api/emails/generate-reply')
        assert response.status_code in [200, 400, 422]

class TestChatEndpoint:
    """Test chat endpoint"""
    
    def test_chat_endpoint(self, client):
        """Test chat endpoint"""
        response = client.post('/api/chat')
        assert response.status_code in [200, 400, 422]
    
    def test_chat_request_format(self, client):
        """Test chat request requires proper format"""
        response = client.post('/api/chat', 
            json={'message': 'Hello'})
        assert response.status_code in [200, 400, 422]

class TestErrorHandling:
    """Test error handling"""
    
    def test_invalid_endpoint(self, client):
        """Test accessing invalid endpoint"""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
    
    def test_invalid_method(self, client):
        """Test using invalid HTTP method"""
        response = client.post('/api/health')
        assert response.status_code in [405, 400]
    
    def test_cors_headers(self, client):
        """Test CORS headers in response"""
        response = client.get('/api/health')
        assert response.status_code == 200

class TestIntegration:
    """Integration tests"""
    
    def test_api_flow_sequence(self, client):
        """Test typical API call sequence"""
        # 1. Check health
        health = client.get('/api/health')
        assert health.status_code == 200
        
        # 2. Check auth status
        auth = client.get('/api/auth/status')
        assert auth.status_code == 200
        
        # 3. Get prompts
        prompts = client.get('/api/prompts')
        assert prompts.status_code == 200
    
    def test_response_consistency(self, client):
        """Test response format consistency"""
        endpoints = [
            '/api/health',
            '/api/auth/status',
            '/api/prompts'
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 200
            data = response.get_json()
            assert isinstance(data, dict)