# Testing Documentation

## Overview

This project uses Jest for testing the service layer. The codebase has been refactored to separate business logic (services) from presentation logic (DOM manipulation), making it easier to test.

## Test Structure

```
__tests__/
├── setup.js                           # Jest setup file
└── services/
    ├── filterService.test.js          # Filter logic tests
    ├── recfileParserService.test.js   # Recfile parser tests
    ├── urlHistoryService.test.js      # URL history management tests
    └── urlService.test.js             # URL conversion tests
```

## Services Architecture

The application logic has been extracted into the following service modules:

### `services/urlHistoryService.js`
- Manages URL history in localStorage
- Functions: `getUrlHistory()`, `addToUrlHistory()`, `clearUrlHistory()`

### `services/recfileParserService.js`
- Parses recfile format into structured records
- Handles continuation lines, metadata, and field parsing
- Function: `parseRecfile(text)`

### `services/filterService.js`
- Provides filtering functionality for records
- Extracts categories and tags
- Functions: `applyFilters()`, `extractCategories()`, `extractTags()`

### `services/urlService.js`
- Handles URL conversions
- Converts between GitHub blob and raw URLs
- Functions: `convertToRawUrl()`, `convertToGitHubBlobUrl()`

### `services/utilsService.js`
- Common utility functions
- Functions: `escapeHtml()`, `formatDate()`, `debounce()`

## Running Tests

### Using npm

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Using make

```bash
# Install dependencies
make install

# Run all tests
make test

# Run tests in watch mode
make test-watch

# Run tests with coverage
make test-coverage

# Clean build artifacts
make clean
```

## Test Coverage

Current test coverage includes:

- **URL History Service**: 10 tests
  - Empty history handling
  - Adding/removing URLs
  - Duplicate removal
  - History limit (10 items)

- **Recfile Parser Service**: 12 tests
  - Empty recfile parsing
  - Single and multiple records
  - Continuation lines (+)
  - Metadata lines (%)
  - Line number tracking
  - Complex real-world scenarios

- **Filter Service**: 22 tests
  - Filter by all fields
  - Category, title, tags, body, date filtering
  - Multiple filters with AND logic
  - Missing field handling
  - Category and tag extraction

- **URL Service**: 13 tests
  - GitHub blob to raw URL conversion
  - Raw to blob URL conversion
  - Line number linking
  - Non-GitHub URL handling

## Continuous Integration

Tests run automatically on:
- Push to `main`, `master`, or `claude/**` branches
- Pull requests to `main` or `master`

The CI workflow tests on Node.js versions 18.x and 20.x.

## Writing New Tests

When adding new features:

1. Create service functions in `services/` directory
2. Export functions using ES6 modules
3. Create corresponding test file in `__tests__/services/`
4. Import service functions in tests
5. Write descriptive test cases

Example:

```javascript
import { myFunction } from '../../services/myService.js';

describe('My Service', () => {
  test('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

## Test Philosophy

- **Unit tests**: Test services in isolation without DOM dependencies
- **Pure functions**: Services accept parameters and return values
- **No mocking**: Tests use real implementations where possible
- **Clear descriptions**: Test names describe what they're testing
- **Fast execution**: All tests run in under 5 seconds

## Troubleshooting

### ES Module Errors

If you see "Cannot use import statement outside a module":
- Ensure `package.json` has `"type": "module"`
- Run tests with `NODE_OPTIONS=--experimental-vm-modules jest`

### Missing Dependencies

```bash
npm install
# or
make install
```

### Test Failures

Run tests with verbose output:
```bash
npm test -- --verbose
```
