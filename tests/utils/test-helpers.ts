import { vi } from 'vitest';

export type MockRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

// Mock request helper
export function createMockRequest(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
}): MockRequest {
  return {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body,
    query: options.query || {},
  };
}

export type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  getHeader: ReturnType<typeof vi.fn>;
  headersSent: boolean;
  statusCode: number;
};

// Mock response helper that includes all necessary methods for CORS
export function createMockResponse(): {
  res: MockResponse;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  getHeader: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const end = vi.fn();
  const setHeader = vi.fn();
  const getHeader = vi.fn();
  const status = vi.fn(() => ({ json, end }));

  const res: MockResponse = {
    status,
    json,
    end,
    setHeader,
    getHeader,
    // Add other properties that CORS might need
    headersSent: false,
    statusCode: 200,
  };

  return { res, status, json, end, setHeader, getHeader };
}