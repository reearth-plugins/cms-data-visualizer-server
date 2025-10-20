import { ApiResponse } from '../types/index.js';

export type ResponseObject = {
  status(code: number): ResponseObject;
  json(body: unknown): void;
};

export function sendSuccess<T>(
  res: ResponseObject,
  data: T,
  statusCode = 200,
  total?: number
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(total !== undefined && { total })
  };
  
  res.status(statusCode).json(response);
}

export function sendError(
  res: ResponseObject,
  code: string,
  message: string,
  statusCode = 400,
  details?: { field: string; message: string }[]
): void {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };
  
  res.status(statusCode).json(response);
}