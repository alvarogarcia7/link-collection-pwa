/**
 * Tests for URL Service
 */

import { convertToRawUrl, convertToGitHubBlobUrl } from '../../services/urlService.js';

describe('URL Service', () => {
  describe('convertToRawUrl', () => {
    test('should convert GitHub blob URL to raw URL', () => {
      const blobUrl = 'https://github.com/user/repo/blob/main/file.rec';
      const expected = 'https://raw.githubusercontent.com/user/repo/main/file.rec';

      const result = convertToRawUrl(blobUrl);
      expect(result).toBe(expected);
    });

    test('should handle URLs with branch names containing slashes', () => {
      const blobUrl = 'https://github.com/user/repo/blob/feature/branch/file.rec';
      const expected = 'https://raw.githubusercontent.com/user/repo/feature/branch/file.rec';

      const result = convertToRawUrl(blobUrl);
      expect(result).toBe(expected);
    });

    test('should return original URL if not a GitHub blob URL', () => {
      const regularUrl = 'https://example.com/file.rec';
      const result = convertToRawUrl(regularUrl);
      expect(result).toBe(regularUrl);
    });

    test('should return raw GitHub URLs unchanged', () => {
      const rawUrl = 'https://raw.githubusercontent.com/user/repo/main/file.rec';
      const result = convertToRawUrl(rawUrl);
      expect(result).toBe(rawUrl);
    });

    test('should handle GitHub URLs without blob', () => {
      const url = 'https://github.com/user/repo/file.rec';
      const result = convertToRawUrl(url);
      expect(result).toBe(url);
    });

    test('should handle complex GitHub URLs', () => {
      const blobUrl = 'https://github.com/org/project-name/blob/develop/path/to/file.rec';
      const expected = 'https://raw.githubusercontent.com/org/project-name/develop/path/to/file.rec';

      const result = convertToRawUrl(blobUrl);
      expect(result).toBe(expected);
    });
  });

  describe('convertToGitHubBlobUrl', () => {
    test('should convert raw GitHub URL to blob URL with line number', () => {
      const rawUrl = 'https://raw.githubusercontent.com/user/repo/main/file.rec';
      const lineNumber = 42;
      const expected = 'https://github.com/user/repo/blob/main/file.rec#L42';

      const result = convertToGitHubBlobUrl(rawUrl, lineNumber);
      expect(result).toBe(expected);
    });

    test('should handle regular GitHub URL with line number', () => {
      const url = 'https://github.com/user/repo/blob/main/file.rec';
      const lineNumber = 10;
      const expected = 'https://github.com/user/repo/blob/main/file.rec#L10';

      const result = convertToGitHubBlobUrl(url, lineNumber);
      expect(result).toBe(expected);
    });

    test('should handle URL without line number', () => {
      const rawUrl = 'https://raw.githubusercontent.com/user/repo/main/file.rec';
      const expected = 'https://github.com/user/repo/blob/main/file.rec';

      const result = convertToGitHubBlobUrl(rawUrl, null);
      expect(result).toBe(expected);
    });

    test('should handle URL without line number (undefined)', () => {
      const rawUrl = 'https://raw.githubusercontent.com/user/repo/main/file.rec';
      const expected = 'https://github.com/user/repo/blob/main/file.rec';

      const result = convertToGitHubBlobUrl(rawUrl);
      expect(result).toBe(expected);
    });

    test('should return empty string for empty URL', () => {
      const result = convertToGitHubBlobUrl('', 10);
      expect(result).toBe('');
    });

    test('should return empty string for null URL', () => {
      const result = convertToGitHubBlobUrl(null, 10);
      expect(result).toBe('');
    });

    test('should handle non-GitHub URLs', () => {
      const url = 'https://example.com/file.rec';
      const result = convertToGitHubBlobUrl(url, 10);
      expect(result).toBe('https://example.com/file.rec#L10');
    });

    test('should handle complex raw GitHub URLs', () => {
      const rawUrl = 'https://raw.githubusercontent.com/org/project/feature/branch/path/to/file.rec';
      const lineNumber = 123;
      const expected = 'https://github.com/org/project/blob/feature/branch/path/to/file.rec#L123';

      const result = convertToGitHubBlobUrl(rawUrl, lineNumber);
      expect(result).toBe(expected);
    });
  });
});
