import pytest
from unittest.mock import Mock, patch, MagicMock
from services.ms_graph_service import MSGraphService
import os

@pytest.fixture
def ms_graph_service():
    """Create MS Graph service instance for testing"""
    return MSGraphService()

@pytest.fixture
def mock_access_token():
    """Mock access token for testing"""
    return "mock_access_token_12345"

class TestMSGraphService:
    """Test suite for Microsoft Graph API integration"""
    
    def test_get_emails(self, ms_graph_service, mock_access_token):
        """Test retrieving emails from Outlook"""
        with patch.object(ms_graph_service, 'get_emails') as mock_get:
            mock_get.return_value = [
                {
                    'id': 'email_1',
                    'subject': 'Test Email 1',
                    'from': {'emailAddress': {'address': 'sender@example.com'}},
                    'bodyPreview': 'This is a test email',
                    'receivedDateTime': '2025-11-25T10:00:00Z'
                },
                {
                    'id': 'email_2',
                    'subject': 'Test Email 2',
                    'from': {'emailAddress': {'address': 'other@example.com'}},
                    'bodyPreview': 'Another test email',
                    'receivedDateTime': '2025-11-25T11:00:00Z'
                }
            ]
            
            result = ms_graph_service.get_emails(mock_access_token)
            
            assert isinstance(result, list)
            assert len(result) == 2
            assert result[0]['subject'] == 'Test Email 1'
            mock_get.assert_called_once_with(mock_access_token)
    
    def test_get_email_by_id(self, ms_graph_service, mock_access_token):
        """Test retrieving a specific email by ID"""
        with patch.object(ms_graph_service, 'get_email_by_id') as mock_get:
            mock_get.return_value = {
                'id': 'email_1',
                'subject': 'Test Email',
                'from': {'emailAddress': {'address': 'sender@example.com'}},
                'body': {'content': 'Full email body content'},
                'receivedDateTime': '2025-11-25T10:00:00Z'
            }
            
            result = ms_graph_service.get_email_by_id(mock_access_token, 'email_1')
            
            assert result is not None
            assert result['id'] == 'email_1'
            assert result['subject'] == 'Test Email'
            mock_get.assert_called_once_with(mock_access_token, 'email_1')
    
    def test_send_email(self, ms_graph_service, mock_access_token):
        """Test sending an email"""
        with patch.object(ms_graph_service, 'send_email') as mock_send:
            mock_send.return_value = {
                'status': 'success',
                'message': 'Email sent successfully'
            }
            
            result = ms_graph_service.send_email(
                mock_access_token,
                'recipient@example.com',
                'Test Subject',
                'Test body content'
            )
            
            assert result['status'] == 'success'
            mock_send.assert_called_once()
    
    def test_send_email_with_invalid_recipient(self, ms_graph_service, mock_access_token):
        """Test sending email with invalid recipient"""
        with patch.object(ms_graph_service, 'send_email') as mock_send:
            mock_send.return_value = {
                'status': 'error',
                'message': 'Invalid recipient email'
            }
            
            result = ms_graph_service.send_email(
                mock_access_token,
                'invalid-email',
                'Test Subject',
                'Test body'
            )
            
            assert result['status'] == 'error'
    
    def test_get_calendars(self, ms_graph_service, mock_access_token):
        """Test retrieving calendars"""
        with patch.object(ms_graph_service, 'get_calendars') as mock_get:
            mock_get.return_value = [
                {'id': 'calendar_1', 'name': 'Calendar 1'},
                {'id': 'calendar_2', 'name': 'Calendar 2'}
            ]
            
            result = ms_graph_service.get_calendars(mock_access_token)
            
            assert isinstance(result, list)
            assert len(result) >= 0
            mock_get.assert_called_once_with(mock_access_token)
    
    def test_clear_auth(self, ms_graph_service):
        """Test clearing authentication data"""
        with patch.object(ms_graph_service, 'clear_auth') as mock_clear:
            mock_clear.return_value = None
            
            ms_graph_service.clear_auth()
            
            mock_clear.assert_called_once()
    
    def test_move_email_to_folder(self, ms_graph_service, mock_access_token):
        """Test moving email to a different folder"""
        with patch.object(ms_graph_service, 'move_email_to_folder') as mock_move:
            mock_move.return_value = {
                'status': 'success',
                'message': 'Email moved successfully'
            }
            
            result = ms_graph_service.move_email_to_folder(
                mock_access_token,
                'email_1',
                'DeletedItems'
            )
            
            assert result['status'] == 'success'
    
    def test_handle_api_error(self, ms_graph_service):
        """Test error handling for API calls"""
        with patch.object(ms_graph_service, 'get_emails') as mock_get:
            mock_get.side_effect = Exception("API Connection Error")
            
            with pytest.raises(Exception):
                ms_graph_service.get_emails("invalid_token")
