# OceanAI Tests Folder - Quick Index

## 📁 Folder Structure

```
Tests/
├── test_cohere.py              # Cohere AI service tests
├── test_ms_graph.py            # Microsoft Graph API tests
├── test.api.py                 # Flask API endpoint tests
├── conftest.py                 # Shared pytest configuration & fixtures
├── pytest.ini                  # Pytest configuration file
├── requirements-test.txt       # Testing dependencies
├── README.md                   # Complete test documentation
├── TEST_EXECUTION_GUIDE.md     # Detailed command reference
└── INDEX.md                    # This file
```

## 📄 File Descriptions

| File                        | Purpose                               | Size   |
| --------------------------- | ------------------------------------- | ------ |
| **test_cohere.py**          | Cohere AI service unit tests          | 6.2 KB |
| **test_ms_graph.py**        | Microsoft Graph API integration tests | 5.7 KB |
| **test.api.py**             | Flask REST API endpoint tests         | 5.3 KB |
| **conftest.py**             | Pytest fixtures and configuration     | 2.2 KB |
| **pytest.ini**              | Pytest settings and markers           | 0.5 KB |
| **requirements-test.txt**   | Testing package dependencies          | -      |
| **README.md**               | Complete test suite documentation     | 6 KB   |
| **TEST_EXECUTION_GUIDE.md** | Command reference & troubleshooting   | -      |

## 🧪 Test Coverage

### test_cohere.py (9 tests)

- ✅ Email classification
- ✅ Classification of different email types (meetings, spam, etc.)
- ✅ Action item extraction
- ✅ Empty action item handling
- ✅ Email reply generation
- ✅ Professional tone reply generation
- ✅ Bulk email classification
- ✅ API error handling
- ✅ Invalid API key handling

### test_ms_graph.py (8 tests)

- ✅ Email retrieval
- ✅ Specific email retrieval by ID
- ✅ Email sending
- ✅ Invalid recipient handling
- ✅ Calendar retrieval
- ✅ Authentication clearing
- ✅ Email folder operations
- ✅ API error handling

### test.api.py (20+ tests)

- ✅ Health check endpoint
- ✅ Authentication status
- ✅ Login endpoint
- ✅ Logout endpoint
- ✅ Prompts endpoint
- ✅ Email fetch endpoint
- ✅ Email processing endpoint
- ✅ Reply generation endpoint
- ✅ Chat endpoint
- ✅ Invalid endpoint handling
- ✅ Invalid HTTP methods
- ✅ CORS headers validation
- ✅ API flow sequences
- ✅ Response consistency

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pip install -r requirements-test.txt
```

Or individually:

```bash
pip install pytest pytest-cov pytest-mock
```

### 2. Run All Tests

```bash
pytest
```

### 3. View Results with Details

```bash
pytest -v
```

### 4. Generate Coverage Report

```bash
pytest --cov=services --cov-report=html
```

## 📖 Documentation Files

### README.md

- Test file descriptions
- Running instructions
- Coverage goals
- Mocking approach
- Adding new tests
- Troubleshooting guide

**Read this first for complete overview!**

### TEST_EXECUTION_GUIDE.md

- Quick start guide
- Basic usage commands
- Coverage report generation
- Advanced options
- Debugging techniques
- CI/CD integration examples
- Best practices

**Reference this for specific commands!**

## 🔧 Key Pytest Commands

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest test_cohere.py

# Run specific test class
pytest test_cohere.py::TestCohereService

# Run specific test function
pytest test_cohere.py::TestCohereService::test_classify_email

# Generate HTML coverage report
pytest --cov=services --cov-report=html

# Stop on first failure
pytest -x

# Show only failures
pytest -q

# Run tests matching keyword
pytest -k "classify"
```

## 📊 Test Structure

All tests use:

- **unittest.mock** - For mocking external dependencies
- **pytest.fixture** - For shared test data and setup
- **pytest markers** - For test categorization (unit, integration, api)
- **Descriptive names** - Following `test_<functionality>_<scenario>` pattern

## 🔗 Fixtures Available (in conftest.py)

- `client` - Flask test client for API testing
- `cohere_service` - Mocked Cohere service instance
- `ms_graph_service` - Mocked MS Graph service instance
- `mock_access_token` - Sample authentication token
- `sample_emails` - Dictionary of sample email data
- `sample_email_data` - Complete sample email structure
- `mock_logger` - Mock logger for testing

## 🎯 Test Philosophy

✅ **Isolation** - Each test is independent
✅ **Mocking** - No external API calls
✅ **Coverage** - Comprehensive scenario testing
✅ **Clarity** - Descriptive test names
✅ **Reliability** - Deterministic results

## 📈 Coverage Goals

- Services Layer: 80%+ coverage
- API Endpoints: 90%+ coverage
- Email Processing: 85%+ coverage
- Overall: 85%+ code coverage

## 🐛 Common Issues & Solutions

| Issue              | Solution                                         |
| ------------------ | ------------------------------------------------ |
| Import errors      | Check conftest.py exists and sys.path is correct |
| No tests found     | Ensure test files start with `test_`             |
| Fixtures not found | Verify conftest.py in same directory             |
| Timeout issues     | Ensure mocks don't create infinite loops         |

## 📚 Additional Resources

- **Pytest Docs**: https://docs.pytest.org/
- **Mock Docs**: https://docs.python.org/3/library/unittest.mock.html
- **Coverage Docs**: https://coverage.readthedocs.io/

## ✅ Setup Verification

- [x] pytest 9.0.1+ installed
- [x] pytest-cov 7.0.0+ installed
- [x] pytest-mock 3.15.1+ installed
- [x] 3 comprehensive test files created
- [x] conftest.py with fixtures configured
- [x] pytest.ini with markers defined
- [x] Complete documentation provided

## 🎉 You're Ready!

Your test suite is fully set up and ready to use. Start by:

1. Reading `README.md` for overview
2. Running `pytest -v` to see tests in action
3. Reviewing `TEST_EXECUTION_GUIDE.md` for advanced usage
4. Generating coverage reports for quality metrics

**Happy testing! 🧪**
