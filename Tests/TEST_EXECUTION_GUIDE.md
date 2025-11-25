# Test Execution Guide

## Quick Start

### 1. Install Test Dependencies

```bash
# Option A: Install individual packages
pip install pytest pytest-cov pytest-mock

# Option B: Install from requirements file
pip install -r requirements-test.txt
```

### 2. Run All Tests

```bash
cd Tests
pytest
```

### 3. View Results

```bash
# With verbose output
pytest -v

# With detailed output
pytest -vv
```

## Installation Verification

After installing packages, verify installation:

```bash
pytest --version
python -m pytest --version
```

## Running Tests

### Basic Usage

```bash
# Run all tests in current directory
pytest

# Run specific test file
pytest test_cohere.py
pytest test_ms_graph.py
pytest test.api.py

# Run specific test class
pytest test_cohere.py::TestCohereService

# Run specific test function
pytest test_cohere.py::TestCohereService::test_classify_email

# Run tests matching a pattern
pytest -k "classify"
pytest -k "email"
```

### Coverage Reports

```bash
# Generate basic coverage report
pytest --cov=services

# Generate HTML coverage report
pytest --cov=services --cov-report=html

# Generate multiple report formats
pytest --cov=services --cov-report=html --cov-report=term --cov-report=xml

# Coverage for specific module
pytest --cov=services.cohere_service test_cohere.py
```

### Output Formatting

```bash
# Verbose output with all details
pytest -v

# Very verbose (show setup/teardown)
pytest -vv

# Show local variables on failure
pytest -l

# Show only summary
pytest --tb=no

# Show detailed traceback
pytest --tb=long

# Quiet output (only show failures)
pytest -q
```

### Test Selection

```bash
# Run tests with specific marker
pytest -m unit
pytest -m integration
pytest -m api

# Run all except slow tests
pytest -m "not slow"

# Run tests that match keyword
pytest -k "auth"
pytest -k "email and not spam"
```

### Parallel Execution

```bash
# Install pytest-xdist first
pip install pytest-xdist

# Run tests in parallel
pytest -n auto

# Run with specific number of workers
pytest -n 4
```

## Advanced Options

### Watch Mode (Re-run on Changes)

```bash
# Install pytest-watch
pip install pytest-watch

# Run tests automatically on file changes
ptw

# Run specific test file on changes
ptw test_cohere.py
```

### Debugging

```bash
# Stop on first failure
pytest -x

# Stop after N failures
pytest --maxfail=3

# Enter debugger on failure
pytest --pdb

# Enter debugger at start
pytest --trace
```

### Markers and Filtering

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run only API tests
pytest -m api

# Run everything except slow tests
pytest -m "not slow"

# Combine markers
pytest -m "unit or integration"
```

## Sample Commands

### Complete Test Suite with Report

```bash
pytest -v --tb=short --cov=services --cov-report=html
```

### Run Tests with Detailed Output

```bash
pytest -vv --tb=long --capture=no
```

### CI/CD Pipeline Test

```bash
pytest -v --tb=short --cov=services --cov-report=xml --cov-report=term
```

### Development Testing (Fast)

```bash
pytest -x -q
```

### Full Testing (Comprehensive)

```bash
pytest -v --cov=services --cov-report=html --cov-report=term-missing
```

## Understanding Test Results

### Success Output

```
test_cohere.py::TestCohereService::test_classify_email PASSED       [ 10%]
```

### Failure Output

```
test_cohere.py::TestCohereService::test_classify_email FAILED       [ 10%]
E   AssertionError: assert 'Spam' == 'Work'
```

### Skipped Tests

```
test_cohere.py::TestCohereService::test_pending_feature SKIPPED     [ 10%]
```

### Error During Collection

```
ERROR test_cohere.py - Import error
```

## Coverage Reports

### HTML Coverage Report

```bash
pytest --cov=services --cov-report=html
# Open: htmlcov/index.html
```

### Coverage Report with Missing Lines

```bash
pytest --cov=services --cov-report=term-missing --cov-report=html
```

### Coverage Thresholds

```bash
# Fail if coverage drops below 80%
pytest --cov=services --cov-fail-under=80
```

## Continuous Integration

### GitHub Actions Example

```yaml
- name: Run tests
  run: |
    pip install pytest pytest-cov pytest-mock
    pytest --cov=services --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v2
  with:
    file: ./coverage.xml
```

## Troubleshooting

### "No tests found"

- Check test file names start with `test_` or end with `_test.py`
- Check functions start with `test_`
- Verify current directory contains tests

### "ImportError: cannot import module"

- Ensure conftest.py is in test directory
- Check sys.path includes backend directory
- Verify package structure is correct

### "Fixture not found"

- Check fixture name matches exactly
- Verify conftest.py is in same directory
- Check fixture is properly decorated with @pytest.fixture

### "Test hangs/never completes"

- Check for infinite loops in mocked functions
- Verify mock side_effects are properly configured
- Use pytest timeout: `pip install pytest-timeout`

## Best Practices

1. **Run tests before committing**

   ```bash
   pytest -x  # Stop on first failure
   ```

2. **Check coverage regularly**

   ```bash
   pytest --cov=services --cov-report=term-missing
   ```

3. **Use descriptive test names**

   - `test_classify_email_as_work()`
   - `test_extract_action_items_from_detailed_email()`

4. **Isolate tests with fixtures**

   - Use conftest.py for shared fixtures
   - Each test should be independent

5. **Mock external dependencies**
   - Never connect to real APIs in tests
   - Use unittest.mock for all external services

## Performance Tips

- Use `-x` to stop on first failure during development
- Use `-q` for quiet mode when running frequently
- Run only relevant tests with `-k` filtering
- Use `--maxfail` to limit reported failures

## Additional Resources

- Pytest Documentation: https://docs.pytest.org/
- Pytest Fixtures: https://docs.pytest.org/en/latest/how-to/fixtures.html
- Mock Documentation: https://docs.python.org/3/library/unittest.mock.html
- Coverage Documentation: https://coverage.readthedocs.io/
