/**
 * Tests for URL History Service
 */

import { getUrlHistory, addToUrlHistory, clearUrlHistory } from '../../services/urlHistoryService.js';

describe('URL History Service', () => {
  let mockStorage;

  beforeEach(() => {
    // Create a mock storage object
    mockStorage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
      removeItem(key) {
        delete this.data[key];
      },
      clear() {
        this.data = {};
      }
    };
  });

  describe('getUrlHistory', () => {
    test('should return empty array when no history exists', () => {
      const result = getUrlHistory(mockStorage);
      expect(result).toEqual([]);
    });

    test('should return parsed history from storage', () => {
      const mockHistory = ['http://example.com/file1.rec', 'http://example.com/file2.rec'];
      mockStorage.setItem('recfileUrlHistory', JSON.stringify(mockHistory));

      const result = getUrlHistory(mockStorage);
      expect(result).toEqual(mockHistory);
    });

    test('should handle empty JSON array', () => {
      mockStorage.setItem('recfileUrlHistory', '[]');

      const result = getUrlHistory(mockStorage);
      expect(result).toEqual([]);
    });
  });

  describe('addToUrlHistory', () => {
    test('should add new URL to empty history', () => {
      const newUrl = 'http://example.com/test.rec';
      const result = addToUrlHistory(mockStorage, newUrl);

      expect(result).toEqual([newUrl]);
      expect(mockStorage.getItem('recfileUrlHistory')).toBe(JSON.stringify([newUrl]));
    });

    test('should add URL to beginning of existing history', () => {
      const existingHistory = ['http://example.com/old.rec'];
      mockStorage.setItem('recfileUrlHistory', JSON.stringify(existingHistory));

      const newUrl = 'http://example.com/new.rec';
      const result = addToUrlHistory(mockStorage, newUrl);

      expect(result).toEqual([newUrl, 'http://example.com/old.rec']);
    });

    test('should remove duplicates when adding existing URL', () => {
      const existingHistory = [
        'http://example.com/file1.rec',
        'http://example.com/file2.rec',
        'http://example.com/file3.rec'
      ];
      mockStorage.setItem('recfileUrlHistory', JSON.stringify(existingHistory));

      const result = addToUrlHistory(mockStorage, 'http://example.com/file2.rec');

      expect(result).toEqual([
        'http://example.com/file2.rec',
        'http://example.com/file1.rec',
        'http://example.com/file3.rec'
      ]);
      expect(result).toHaveLength(3);
    });

    test('should limit history to 10 items', () => {
      const existingHistory = Array.from({ length: 10 }, (_, i) =>
        `http://example.com/file${i}.rec`
      );
      mockStorage.setItem('recfileUrlHistory', JSON.stringify(existingHistory));

      const result = addToUrlHistory(mockStorage, 'http://example.com/new.rec');

      expect(result).toHaveLength(10);
      expect(result[0]).toBe('http://example.com/new.rec');
      expect(result).not.toContain('http://example.com/file9.rec');
    });

    test('should handle case-sensitive URLs correctly', () => {
      const existingHistory = ['http://Example.com/file.rec'];
      mockStorage.setItem('recfileUrlHistory', JSON.stringify(existingHistory));

      addToUrlHistory(mockStorage, 'http://example.com/file.rec');

      const result = getUrlHistory(mockStorage);
      expect(result).toHaveLength(2);
    });
  });

  describe('clearUrlHistory', () => {
    test('should remove history from storage', () => {
      mockStorage.setItem('recfileUrlHistory', JSON.stringify(['http://example.com/test.rec']));

      clearUrlHistory(mockStorage);

      expect(mockStorage.getItem('recfileUrlHistory')).toBeNull();
    });

    test('should not throw error when clearing empty history', () => {
      expect(() => clearUrlHistory(mockStorage)).not.toThrow();
    });
  });
});
