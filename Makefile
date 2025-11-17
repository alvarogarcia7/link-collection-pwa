.PHONY: help install test test-watch test-coverage clean

# Default target
help:
	@echo "Available targets:"
	@echo "  make install        - Install npm dependencies"
	@echo "  make test          - Run all tests"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make test-coverage - Run tests with coverage report"
	@echo "  make clean         - Clean node_modules and coverage"

# Install dependencies
install:
	npm install

# Run tests
test:
	npm test

# Run tests in watch mode
test-watch:
	npm run test:watch

# Run tests with coverage
test-coverage:
	npm run test:coverage

# Clean build artifacts
clean:
	rm -rf node_modules coverage .jest-cache
