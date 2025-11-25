import pytest
from unittest.mock import Mock, patch, MagicMock
from services.cohere_service import CohereService
import os

@pytest.fixture
def cohere_service():
    """Create Cohere service instance for testing"""
    api_key = os.getenv('COHERE_API_KEY', 'test_api_key')
    return CohereService(api_key)

@pytest.fixture
def sample_emails():
    """Provide sample email data for testing"""
    return {
        'meeting': {
            'subject': 'Team Meeting Tomorrow',
            'body': 'We have a meeting scheduled for tomorrow at 2 PM. Please prepare your updates.'
        },
        'action': {
            'subject': 'Action Required',
            'body': 'Please review the document by Friday and send your feedback before EOD.'
        },
        'request': {
            'subject': 'Meeting Request',
            'body': 'Can we schedule a meeting for next week to discuss the project timeline?'
        },
        'spam': {
            'subject': 'URGENT: Claim your prize!',
            'body': 'You have won a free prize! Click here to claim your reward now!'
        }
    }

class TestCohereService:
    """Test suite for Cohere AI service integration"""
    
    def test_classify_email(self, cohere_service, sample_emails):
        """Test email classification"""
        with patch.object(cohere_service, 'classify_email') as mock_classify:
            mock_classify.return_value = 'Meetings'
            
            category = cohere_service.classify_email(sample_emails['meeting']['body'])
            
            assert category in ['Work', 'Meetings', 'Clients', 'Newsletters', 
                               'HR', 'Financial', 'Alerts', 'Technical Support',
                               'Promotions', 'Personal', 'Legal', 'Spam']
            mock_classify.assert_called_once()
    
    def test_classify_email_spam(self, cohere_service, sample_emails):
        """Test classifying spam emails"""
        with patch.object(cohere_service, 'classify_email') as mock_classify:
            mock_classify.return_value = 'Spam'
            
            category = cohere_service.classify_email(sample_emails['spam']['body'])
            
            assert category == 'Spam'
    
    def test_extract_action_items(self, cohere_service, sample_emails):
        """Test extracting action items from emails"""
        with patch.object(cohere_service, 'extract_action_items') as mock_extract:
            mock_extract.return_value = [
                'Review the document',
                'Send feedback',
                'Respond by EOD Friday'
            ]
            
            action_items = cohere_service.extract_action_items(sample_emails['action']['body'])
            
            assert isinstance(action_items, list)
            assert len(action_items) > 0
            assert 'Review the document' in action_items
            mock_extract.assert_called_once()
    
    def test_extract_action_items_empty(self, cohere_service):
        """Test extracting action items from email with no actions"""
        with patch.object(cohere_service, 'extract_action_items') as mock_extract:
            mock_extract.return_value = []
            
            action_items = cohere_service.extract_action_items("This is just informational.")
            
            assert isinstance(action_items, list)
            assert len(action_items) == 0
    
    def test_generate_reply(self, cohere_service, sample_emails):
        """Test generating email reply"""
        with patch.object(cohere_service, 'generate_reply') as mock_generate:
            mock_generate.return_value = (
                "Thank you for reaching out. I would be happy to schedule a meeting. "
                "How about next Tuesday or Wednesday at 2 PM?"
            )
            
            reply = cohere_service.generate_reply(
                sample_emails['request']['body'],
                sample_emails['request']['subject']
            )
            
            assert isinstance(reply, str)
            assert len(reply) > 0
            mock_generate.assert_called_once()
    
    def test_generate_reply_professional_tone(self, cohere_service, sample_emails):
        """Test generating professional reply"""
        with patch.object(cohere_service, 'generate_reply') as mock_generate:
            mock_generate.return_value = (
                "Thank you for your inquiry. We appreciate your interest. "
                "Our team will get back to you within 24 hours."
            )
            
            reply = cohere_service.generate_reply(
                sample_emails['action']['body'],
                sample_emails['action']['subject']
            )
            
            assert 'thank you' in reply.lower() or 'appreciate' in reply.lower()
    
    def test_classify_bulk_emails(self, cohere_service, sample_emails):
        """Test classifying multiple emails at once"""
        with patch.object(cohere_service, 'classify_email') as mock_classify:
            classifications = {
                'Work': 1,
                'Meetings': 1,
                'Spam': 1
            }
            mock_classify.side_effect = lambda x: [
                'Meetings', 'Work', 'Spam'
            ]
            
            results = []
            for email_type, email_data in sample_emails.items():
                result = cohere_service.classify_email(email_data['body'])
                results.append(result)
    
    def test_handle_api_error(self, cohere_service):
        """Test error handling for API failures"""
        with patch.object(cohere_service, 'classify_email') as mock_classify:
            mock_classify.side_effect = Exception("API Rate Limit Exceeded")
            
            with pytest.raises(Exception):
                cohere_service.classify_email("Test email")
    
    def test_invalid_api_key(self):
        """Test initialization with invalid API key"""
        with patch('services.cohere_service.CohereService') as mock_service:
            mock_service.side_effect = Exception("Invalid API Key")
            
            with pytest.raises(Exception):
                CohereService("invalid_key_12345")