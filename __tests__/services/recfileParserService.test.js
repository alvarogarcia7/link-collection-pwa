/**
 * Tests for Recfile Parser Service
 */

import { parseRecfile } from '../../services/recfileParserService.js';

describe('Recfile Parser Service', () => {
  describe('parseRecfile', () => {
    test('should parse empty recfile', () => {
      const result = parseRecfile('');
      expect(result).toEqual([]);
    });

    test('should parse single record with basic fields', () => {
      const recfile = `Title: Test Link
Category: Testing
Link: http://example.com

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        Title: 'Test Link',
        Category: 'Testing',
        Link: 'http://example.com'
      });
    });

    test('should parse multiple records', () => {
      const recfile = `Title: First Link
Category: Cat1

Title: Second Link
Category: Cat2

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(2);
      expect(result[0].Title).toBe('First Link');
      expect(result[1].Title).toBe('Second Link');
    });

    test('should handle continuation lines with +', () => {
      const recfile = `Title: Multi-line Title
Body: This is the first line
+ This is a continuation
+ And another line

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(1);
      expect(result[0].Body).toContain('first line');
      expect(result[0].Body).toContain('continuation');
      expect(result[0].Body).toContain('another line');
      // Check that continuation lines maintain newlines
      expect(result[0].Body.split('\n')).toHaveLength(3);
    });

    test('should skip metadata lines starting with %', () => {
      const recfile = `%rec: links
%type: Title line
%mandatory: Title

Title: Test Link
Category: Testing

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        Title: 'Test Link',
        Category: 'Testing'
      });
      expect(result[0]['%rec']).toBeUndefined();
    });

    test('should track line numbers for records', () => {
      const recfile = `Title: First
Category: Test

Title: Second
Link: http://test.com

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(2);
      expect(result[0]._lineNumber).toBe(1);
      expect(result[1]._lineNumber).toBe(4);
    });

    test('should handle fields with colons in values', () => {
      const recfile = `Title: Test
Link: http://example.com:8080/path

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(1);
      expect(result[0].Link).toBe('http://example.com:8080/path');
    });

    test('should handle records without trailing empty line', () => {
      const recfile = `Title: Last Record
Category: Final`;

      const result = parseRecfile(recfile);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        Title: 'Last Record',
        Category: 'Final'
      });
    });

    test('should handle multi-line field values without +', () => {
      const recfile = `Title: Test
Description: Line one
  line two continued

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(1);
      expect(result[0].Description).toContain('Line one');
      expect(result[0].Description).toContain('line two');
    });

    test('should handle complex real-world recfile', () => {
      const recfile = `%rec: links

Title: GitHub
Category: Development
Tags: git, version-control, hosting
Link: https://github.com
Date: 2024-01-01
Body: GitHub is a web-based platform for version control
+ and collaboration using Git.

Title: Stack Overflow
Category: Development
Tags: programming, qa, community
Link: https://stackoverflow.com
Origin: https://stackoverflow.blog
Id: so-001

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        Title: 'GitHub',
        Category: 'Development',
        Tags: 'git, version-control, hosting',
        Link: 'https://github.com',
        Date: '2024-01-01'
      });
      expect(result[0].Body).toContain('version control');
      expect(result[0].Body).toContain('collaboration');

      expect(result[1]).toMatchObject({
        Title: 'Stack Overflow',
        Origin: 'https://stackoverflow.blog',
        Id: 'so-001'
      });
    });

    test('should handle empty lines within record', () => {
      const recfile = `Title: Test



Category: Testing

`;
      const result = parseRecfile(recfile);

      // Empty lines should end records
      expect(result).toHaveLength(2);
      expect(result[0].Title).toBe('Test');
      expect(result[1].Category).toBe('Testing');
    });

    test('should trim whitespace from field values', () => {
      const recfile = `Title:   Spaces Around
Category:Testing

`;
      const result = parseRecfile(recfile);

      expect(result).toHaveLength(1);
      expect(result[0].Title).toBe('Spaces Around');
      expect(result[0].Category).toBe('Testing');
    });
  });
});
