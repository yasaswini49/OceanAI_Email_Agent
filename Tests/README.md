# OceanAI Test Suite

This folder contains comprehensive unit and integration tests for the OceanAI email processing application.

## Test Files

### 1. `test_cohere.py`

Tests for the Cohere AI service integration, including:

- **Email Classification**: Verify emails are correctly categorized (Work, Meetings, Spam, etc.)
- **Action Item Extraction**: Test extraction of actionable items from email content
- **Reply Generation**: Validate AI-powered email reply generation
- **Error Handling**: Test API error handling and edge cases
- **Bulk Processing**: Test processing multiple emails simultaneously

**Key Test Classes:**

- `TestCohereService` - Main test suite for Cohere functionality

### 2. `test_ms_graph.py`

Tests for Microsoft Graph API integration with Outlook, including:

- **Email Retrieval**: Test fetching emails from Outlook mailbox
- **Email Details**: Test retrieving specific email contents
- **Email Sending**: Validate email composition and sending
- **Calendar Operations**: Test calendar access and management
- **Authentication**: Test token handling and auth clearing
- **Email Organization**: Test moving emails between folders
- **Error Handling**: Test API error scenarios

**Key Test Classes:**

- `TestMSGraphService` - Main test suite for Microsoft Graph functionality

### 3. `test.api.py`

Tests for Flask REST API endpoints, including:

- **Health Check**: Verify API is running and healthy
- **Authentication**: Test auth status and login/logout endpoints
- **Email Processing**: Test email fetch, process, and reply generation
- **Chat Interface**: Test chat endpoint functionality
- **Error Handling**: Test invalid requests and error responses
- **Integration**: Test typical API call sequences
- **CORS**: Validate CORS headers in responses

**Key Test Classes:**

- `TestHealthEndpoints` - Health check tests
- `TestAuthEndpoints` - Authentication endpoint tests
- `TestPromptsEndpoint` - Prompts endpoint tests
- `TestEmailEndpoints` - Email processing endpoints
- `TestChatEndpoint` - Chat functionality tests
- `TestErrorHandling` - Error handling tests
- `TestIntegration` - Integration flow tests

## Configuration Files

### `pytest.ini`

Configuration file for pytest with:

- Test discovery settings
- Marker definitions (unit, integration, api, slow)
- Output formatting options
- Coverage settings

### `conftest.py`

Shared pytest configuration and fixtures:

- Test environment setup
- Mock logger fixture
- Sample email data fixture
- Sample authentication token fixture
- Sample API response fixture

## Running Tests

### Prerequisites

Ensure all testing packages are installed:

```bash
pip install pytest pytest-cov pytest-mock
```

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest test_cohere.py
pytest test_ms_graph.py
pytest test.api.py
```

### Run Tests by Marker

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run only API tests
pytest -m api
```

### Run with Coverage Report

```bash
# Generate coverage report
pytest --cov=services --cov-report=html

# View HTML coverage report
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac
xdg-open htmlcov/index.html  # Linux
```

### Run Tests with Verbose Output

```bash
pytest -v
```

### Run Specific Test Function

```bash
pytest test_cohere.py::TestCohereService::test_classify_email
```

## Test Mocking

All tests use `unittest.mock` for:

- Service method mocking
- API response mocking
- Error simulation
- Token/credential mocking

This allows tests to run without requiring:

- Active Microsoft Outlook accounts
- Valid Cohere API keys
- Backend server running
- Network connectivity

## Environment Variables

Tests use the following environment variables (with fallback defaults):

- `COHERE_API_KEY` - Cohere API key (default: 'test_key')
- `AZURE_CLIENT_ID` - Azure app registration ID (default: 'test_client_id')
- `AZURE_CLIENT_SECRET` - Azure app secret (default: 'test_secret')
- `AZURE_TENANT_ID` - Azure tenant ID (default: 'test_tenant')
- `FLASK_ENV` - Flask environment (set to 'testing' during tests)

## Test Coverage Goals

- **Services Layer**: 80%+ coverage
- **API Endpoints**: 90%+ coverage
- **Email Processing**: 85%+ coverage
- **Overall**: 85%+ code coverage

## Adding New Tests

1. Create test function with `test_` prefix
2. Use appropriate fixtures from `conftest.py`
3. Mock external dependencies
4. Assert expected behavior
5. Follow naming convention: `test_<functionality>_<scenario>`

Example:

```python
def test_classify_work_email(cohere_service, sample_emails):
    """Test classifying work-related emails"""
    with patch.object(cohere_service, 'classify_email') as mock_classify:
        mock_classify.return_value = 'Work'
        result = cohere_service.classify_email(sample_emails['work']['body'])
        assert result == 'Work'
```

## Continuous Integration

Tests should be run:

- Before committing code
- In CI/CD pipeline
- After dependency updates
- Before releases

## Troubleshooting

### Import Errors

If you see import errors like `Import "services" could not be resolved`:

- Ensure you're running tests from the `Tests` directory
- Check that `conftest.py` is present and correct
- Verify backend path is correctly added to `sys.path`

### Missing Fixtures

If fixtures are not found:

- Ensure `conftest.py` is in the same directory as tests
- Verify fixture names match exactly in test functions
- Check pytest installation: `pytest --version`

### API Connection Errors

If tests fail with connection errors:

- Verify all external services are mocked
- Check mock patches are correctly applied
- Ensure test environment isolation

## Support

For issues or questions about tests:

1. Check test documentation in individual test files
2. Review conftest.py for available fixtures
3. Refer to pytest documentation: https://docs.pytest.org/
4. Check mock documentation: https://docs.python.org/3/library/unittest.mock.html
