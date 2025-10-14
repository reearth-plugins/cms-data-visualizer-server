import { vi, describe, it, expect, beforeEach } from 'vitest';

import handler from '../../api/items';
import { cmsService } from '../../src/services/cms';
import { createMockRequest, createMockResponse } from '../utils/test-helpers';

// Mock the CMS service
vi.mock('../../src/services/cms', () => ({
  cmsService: {
    getItems: vi.fn()
  }
}));

// Mock authentication
vi.mock('../../src/utils/auth', () => ({
  authenticate: vi.fn(() => true),
  AuthenticatedRequest: vi.fn()
}));

const mockedCmsService = cmsService as any;

const mockCMSResponse = {
  items: [
    {
      id: "item_1",
      fields: [
        { id: "f1", key: "title", value: "Test Title" },
        { id: "f2", key: "description", value: "Test Description" },
        { id: "f3", key: "internal", value: "Internal Note" }
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T01:00:00Z"
    }
  ],
  totalCount: 1
};

describe('/api/items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default environment variables
    process.env.REEARTH_CMS_PROJECT_MODEL_ID = 'test-model-id';
    delete process.env.RESPONSE_FIELDS;
  });

  describe('GET /api/items', () => {
    it('should return all items without field filtering', async () => {
      mockedCmsService.getItems.mockResolvedValue(mockCMSResponse);

      const req = createMockRequest({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' }
      });
      const { res, status, json } = createMockResponse();

      await handler(req as any, res as any);

      expect(mockedCmsService.getItems).toHaveBeenCalledWith('test-model-id');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: {
          items: [
            {
              id: "item_1",
              title: "Test Title",
              description: "Test Description",
              internal: "Internal Note"
            }
          ],
          totalCount: 1
        }
      });
    });

    it('should filter fields when RESPONSE_FIELDS is configured', async () => {
      process.env.RESPONSE_FIELDS = 'title,description';
      mockedCmsService.getItems.mockResolvedValue(mockCMSResponse);

      const req = createMockRequest({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' }
      });
      const { res, status, json } = createMockResponse();

      await handler(req as any, res as any);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: {
          items: [
            {
              id: "item_1",
              title: "Test Title",
              description: "Test Description"
            }
          ],
          totalCount: 1
        }
      });
    });

    it('should handle missing model ID configuration', async () => {
      delete process.env.REEARTH_CMS_PROJECT_MODEL_ID;

      const req = createMockRequest({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' }
      });
      const { res, status, json } = createMockResponse();

      await handler(req as any, res as any);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Model ID not configured'
        }
      });
    });

    it('should handle CMS service errors', async () => {
      mockedCmsService.getItems.mockRejectedValue(new Error('CMS Error'));

      const req = createMockRequest({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' }
      });
      const { res, status, json } = createMockResponse();

      await handler(req as any, res as any);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch items from CMS'
        }
      });
    });

    it('should reject non-GET requests', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' }
      });
      const { res, status, json } = createMockResponse();

      await handler(req as any, res as any);

      expect(status).toHaveBeenCalledWith(405);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method POST not allowed'
        }
      });
    });

    it('should reject requests without authentication', async () => {
      // Mock authentication to return false
      const { authenticate } = await import('../../src/utils/auth');
      vi.mocked(authenticate).mockReturnValue(false);

      const req = createMockRequest({
        method: 'GET'
      });
      const { res, status, json } = createMockResponse();

      await handler(req as any, res as any);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing authentication token'
        }
      });
    });
  });
});