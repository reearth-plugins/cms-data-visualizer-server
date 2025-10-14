import { vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.REEARTH_CMS_INTEGRATION_API_BASE_URL = 'https://test-api.reearth.dev';
process.env.REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN = 'test-token';
process.env.REEARTH_CMS_PROJECT_ID = 'test-project-id';
process.env.REEARTH_CMS_PROJECT_PHOTOGRAPHS_MODEL_ID = 'test-model-id';
process.env.API_SECRET_KEY = 'test-api-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};

// Mock axios globally
vi.mock('axios');

// Mock multer for file upload tests
const mockMulter = vi.fn(() => ({
  single: vi.fn(() => (req: any, _res: any, next: any) => {
    req.file = {
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: 1024000,
      buffer: Buffer.from('test-image-data')
    };
    next();
  })
}));

mockMulter.memoryStorage = vi.fn();

vi.mock('multer', () => ({
  default: mockMulter
}));