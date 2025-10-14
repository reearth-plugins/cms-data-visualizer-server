import { describe, it, expect, vi } from 'vitest';

import { sendSuccess, sendError } from '../../src/utils/response';
import { createMockResponse } from '../utils/test-helpers';

describe('Response Utils', () => {
  describe('sendSuccess', () => {
    it('should send success response with default status code', () => {
      const { res, status, json } = createMockResponse();
      const data = { id: '123', name: 'Test' };

      sendSuccess(res as any, data);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: { id: '123', name: 'Test' }
      });
    });

    it('should send success response with custom status code', () => {
      const { res, status, json } = createMockResponse();
      const data = { id: '123', name: 'Test' };

      sendSuccess(res as any, data, 201);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: { id: '123', name: 'Test' }
      });
    });

    it('should include total count when provided', () => {
      const { res, status, json } = createMockResponse();
      const data = [{ id: '123' }, { id: '456' }];

      sendSuccess(res as any, data, 200, 10);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: '123' }, { id: '456' }],
        total: 10
      });
    });

    it('should not include total when not provided', () => {
      const { res, json } = createMockResponse();
      const data = { id: '123' };

      sendSuccess(res as any, data);

      expect(json).toHaveBeenCalledWith({
        success: true,
        data: { id: '123' }
      });
      
      // Ensure total is not included
      const callArgs = json.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('total');
    });

    it('should handle null data', () => {
      const { res, json } = createMockResponse();

      sendSuccess(res as any, null);

      expect(json).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });

    it('should handle empty array data', () => {
      const { res, json } = createMockResponse();

      sendSuccess(res as any, [], 200, 0);

      expect(json).toHaveBeenCalledWith({
        success: true,
        data: [],
        total: 0
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with default status code', () => {
      const { res, status, json } = createMockResponse();

      sendError(res as any, 'TEST_ERROR', 'Test error message');

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error message'
        }
      });
    });

    it('should send error response with custom status code', () => {
      const { res, status, json } = createMockResponse();

      sendError(res as any, 'NOT_FOUND', 'Resource not found', 404);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        }
      });
    });

    it('should include details when provided', () => {
      const { res, status, json } = createMockResponse();
      const details = [
        { field: 'title', message: 'Title is required' },
        { field: 'email', message: 'Invalid email format' }
      ];

      sendError(res as any, 'VALIDATION_ERROR', 'Validation failed', 400, details);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'title', message: 'Title is required' },
            { field: 'email', message: 'Invalid email format' }
          ]
        }
      });
    });

    it('should not include details when not provided', () => {
      const { res, json } = createMockResponse();

      sendError(res as any, 'SIMPLE_ERROR', 'Simple error');

      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SIMPLE_ERROR',
          message: 'Simple error'
        }
      });
      
      // Ensure details is not included
      const callArgs = json.mock.calls[0][0];
      expect(callArgs.error).not.toHaveProperty('details');
    });

    it('should handle empty details array', () => {
      const { res, json } = createMockResponse();

      sendError(res as any, 'ERROR_WITH_EMPTY_DETAILS', 'Error message', 400, []);

      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ERROR_WITH_EMPTY_DETAILS',
          message: 'Error message',
          details: []
        }
      });
    });

    it('should handle various HTTP status codes', () => {
      const { res, status } = createMockResponse();
      const statusCodes = [400, 401, 403, 404, 409, 422, 500, 503];

      statusCodes.forEach(code => {
        sendError(res as any, 'ERROR', 'Message', code);
        expect(status).toHaveBeenCalledWith(code);
        vi.clearAllMocks();
      });
    });
  });

  describe('Response format consistency', () => {
    it('should always include success field in responses', () => {
      const { res, json } = createMockResponse();

      sendSuccess(res as any, { test: 'data' });
      expect(json.mock.calls[0][0]).toHaveProperty('success', true);

      vi.clearAllMocks();

      sendError(res as any, 'ERROR', 'Message');
      expect(json.mock.calls[0][0]).toHaveProperty('success', false);
    });

    it('should maintain consistent response structure', () => {
      const { res, json } = createMockResponse();

      sendSuccess(res as any, { test: 'data' });
      const successResponse = json.mock.calls[0][0];
      expect(successResponse).toHaveProperty('success');
      expect(successResponse).toHaveProperty('data');

      vi.clearAllMocks();

      sendError(res as any, 'ERROR', 'Message');
      const errorResponse = json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('success');
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toHaveProperty('code');
      expect(errorResponse.error).toHaveProperty('message');
    });
  });
});