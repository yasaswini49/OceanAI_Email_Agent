import sys
import os
from pathlib import Path

# Add backend directory to Python path for imports
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

import pytest
from unittest.mock import MagicMock

@pytest.fixture(scope='session')
def setup_test_env():
    """Setup test environment variables"""
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['COHERE_API_KEY'] = os.getenv('COHERE_API_KEY', 'test_key')
    os.environ['AZURE_CLIENT_ID'] = os.getenv('AZURE_CLIENT_ID', 'test_client_id')
    os.environ['AZURE_CLIENT_SECRET'] = os.getenv('AZURE_CLIENT_SECRET', 'test_secret')
    os.environ['AZURE_TENANT_ID'] = os.getenv('AZURE_TENANT_ID', 'test_tenant')

@pytest.fixture
def mock_logger():
    """Provide a mock logger for tests"""
    logger = MagicMock()
    return logger

@pytest.fixture
def sample_email_data():
    """Provide sample email data for testing"""
    return {
        'id': 'email_123',
        'subject': 'Test Email Subject',
        'from': {
            'emailAddress': {
                'address': 'sender@example.com',
                'name': 'Test Sender'
            }
        },
        'bodyPreview': 'This is a test email preview',
        'body': {
            'content': 'This is the full content of the test email body with more details.'
        },
        'receivedDateTime': '2025-11-25T10:00:00Z',
        'isRead': False,
        'categories': [],
        'importance': 'normal'
    }

@pytest.fixture
def sample_token():
    """Provide a sample authentication token"""
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_token_payload.signature'

@pytest.fixture
def sample_api_response():
    """Provide sample API response structure"""
    return {
        'status': 'success',
        'data': {},
        'message': 'Operation successful'
    }

def pytest_configure(config):
    """Configure pytest with custom settings"""
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests (deselect with '-m \"not unit\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
