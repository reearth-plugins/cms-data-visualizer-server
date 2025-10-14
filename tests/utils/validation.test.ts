import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { validateRequest } from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateRequest', () => {
    const testSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      age: z.number().min(0, 'Age must be non-negative'),
      email: z.string().email('Invalid email format')
    });

    const validData = {
      name: 'Test User',
      age: 25,
      email: 'test@example.com'
    };

    it('should return success for valid data', () => {
      const result = validateRequest(testSchema, validData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        name: '',
        age: -5,
        email: 'invalid-email'
      };

      const result = validateRequest(testSchema, invalidData);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: 'name', message: 'Name is required' },
          { field: 'age', message: 'Age must be non-negative' },
          { field: 'email', message: 'Invalid email format' }
        ])
      );
    });

    it('should handle partial invalid data', () => {
      const partialInvalidData = {
        name: 'Valid Name',
        age: -1, // Invalid
        email: 'valid@example.com'
      };

      const result = validateRequest(testSchema, partialInvalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]).toEqual({
        field: 'age',
        message: 'Age must be non-negative'
      });
    });

    it('should handle non-ZodError exceptions', () => {
      const schemaWithError = {
        parse: () => { throw new Error('Non-Zod error'); }
      };

      const result = validateRequest(schemaWithError as any, validData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toEqual([
        { field: 'unknown', message: 'Validation failed' }
      ]);
    });

    it('should handle nested field paths', () => {
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1, 'Name is required')
          })
        })
      });

      const invalidNestedData = {
        user: {
          profile: {
            name: ''
          }
        }
      };

      const result = validateRequest(nestedSchema, invalidNestedData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toEqual([
        { field: 'user.profile.name', message: 'Name is required' }
      ]);
    });
  });
});