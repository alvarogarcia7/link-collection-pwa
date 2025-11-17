/**
 * Tests for Filter Service
 */

import { applyFilters, extractCategories, extractTags } from '../../services/filterService.js';

describe('Filter Service', () => {
  const sampleRecords = [
    {
      Title: 'Test Link 1',
      Category: 'Development',
      Tags: 'javascript, testing',
      Body: 'This is a test body',
      Date: '2024-01-01'
    },
    {
      Title: 'Test Link 2',
      Category: 'Design',
      Tags: 'ui, ux',
      Body: 'Another test body',
      Date: '2024-01-15'
    },
    {
      Title: 'Production Link',
      Category: 'Development',
      Tags: 'production, deployment',
      Body: 'Production environment setup',
      Date: '2024-02-01'
    }
  ];

  describe('applyFilters', () => {
    test('should return all records when no filters applied', () => {
      const filters = {
        all: '',
        category: '',
        title: '',
        tags: '',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(3);
    });

    test('should filter by category (case insensitive)', () => {
      const filters = {
        all: '',
        category: 'design',
        title: '',
        tags: '',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(1);
      expect(result[0].Category).toBe('Design');
    });

    test('should filter by title (case insensitive)', () => {
      const filters = {
        all: '',
        category: '',
        title: 'production',
        tags: '',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(1);
      expect(result[0].Title).toContain('Production');
    });

    test('should filter by tags', () => {
      const filters = {
        all: '',
        category: '',
        title: '',
        tags: 'javascript',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(1);
      expect(result[0].Tags).toContain('javascript');
    });

    test('should filter by body content', () => {
      const filters = {
        all: '',
        category: '',
        title: '',
        tags: '',
        body: 'environment',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(1);
      expect(result[0].Body).toContain('environment');
    });

    test('should filter by date', () => {
      const filters = {
        all: '',
        category: '',
        title: '',
        tags: '',
        body: '',
        date: '2024-01'
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(2);
    });

    test('should filter by all fields', () => {
      const filters = {
        all: 'Development',
        category: '',
        title: '',
        tags: '',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(2);
    });

    test('should combine multiple filters with AND logic', () => {
      const filters = {
        all: '',
        category: 'Development',
        title: '',
        tags: 'production',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(1);
      expect(result[0].Title).toBe('Production Link');
    });

    test('should return empty array when no matches found', () => {
      const filters = {
        all: '',
        category: 'NonExistent',
        title: '',
        tags: '',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(0);
    });

    test('should handle records with missing fields', () => {
      const recordsWithMissingFields = [
        { Title: 'Only Title' },
        { Category: 'Only Category' },
        { Body: 'Only Body' }
      ];

      const filters = {
        all: '',
        category: 'Only',
        title: '',
        tags: '',
        body: '',
        date: ''
      };

      const result = applyFilters(recordsWithMissingFields, filters);
      expect(result).toHaveLength(1);
      expect(result[0].Category).toBe('Only Category');
    });

    test('should handle partial matches', () => {
      const filters = {
        all: '',
        category: '',
        title: 'Link',
        tags: '',
        body: '',
        date: ''
      };

      const result = applyFilters(sampleRecords, filters);
      expect(result).toHaveLength(3); // All titles contain "Link"
    });
  });

  describe('extractCategories', () => {
    test('should extract unique categories', () => {
      const result = extractCategories(sampleRecords);

      expect(result).toHaveLength(2);
      expect(result).toContain('Development');
      expect(result).toContain('Design');
    });

    test('should return sorted categories', () => {
      const result = extractCategories(sampleRecords);

      expect(result).toEqual(['Design', 'Development']);
    });

    test('should handle records without categories', () => {
      const records = [
        { Title: 'Test 1' },
        { Title: 'Test 2', Category: 'TestCat' }
      ];

      const result = extractCategories(records);

      expect(result).toHaveLength(1);
      expect(result).toContain('TestCat');
    });

    test('should remove duplicates', () => {
      const records = [
        { Category: 'Test' },
        { Category: 'Test' },
        { Category: 'Test' }
      ];

      const result = extractCategories(records);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Test');
    });

    test('should trim whitespace', () => {
      const records = [
        { Category: '  Spaced  ' },
        { Category: 'Normal' }
      ];

      const result = extractCategories(records);

      expect(result).toContain('Spaced');
      expect(result).toContain('Normal');
    });
  });

  describe('extractTags', () => {
    test('should extract unique tags', () => {
      const result = extractTags(sampleRecords);

      expect(result).toHaveLength(6);
      expect(result).toContain('javascript');
      expect(result).toContain('testing');
      expect(result).toContain('ui');
      expect(result).toContain('ux');
      expect(result).toContain('production');
      expect(result).toContain('deployment');
    });

    test('should return sorted tags', () => {
      const result = extractTags(sampleRecords);

      expect(result[0]).toBe('deployment');
      expect(result[result.length - 1]).toBe('ux');
    });

    test('should handle records without tags', () => {
      const records = [
        { Title: 'Test 1' },
        { Title: 'Test 2', Tags: 'tag1' }
      ];

      const result = extractTags(records);

      expect(result).toHaveLength(1);
      expect(result).toContain('tag1');
    });

    test('should split comma-separated tags', () => {
      const records = [
        { Tags: 'tag1, tag2, tag3' }
      ];

      const result = extractTags(records);

      expect(result).toHaveLength(3);
      expect(result).toContain('tag1');
      expect(result).toContain('tag2');
      expect(result).toContain('tag3');
    });

    test('should trim whitespace from tags', () => {
      const records = [
        { Tags: ' tag1 ,  tag2  , tag3 ' }
      ];

      const result = extractTags(records);

      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('should remove empty tags', () => {
      const records = [
        { Tags: 'tag1, , tag2, ,' }
      ];

      const result = extractTags(records);

      expect(result).toHaveLength(2);
      expect(result).toEqual(['tag1', 'tag2']);
    });

    test('should remove duplicate tags', () => {
      const records = [
        { Tags: 'tag1, tag2' },
        { Tags: 'tag2, tag3' },
        { Tags: 'tag1, tag3' }
      ];

      const result = extractTags(records);

      expect(result).toHaveLength(3);
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });
});
