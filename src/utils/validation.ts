import { z } from 'zod';

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: { field: string; message: string }[];
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { success: false, errors };
    }
    return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
  }
}