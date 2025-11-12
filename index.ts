import 'dotenv/config';
import { http } from '@google-cloud/functions-framework';
import type { Request, Response } from '@google-cloud/functions-framework';
import cors from 'cors';

import { cmsService } from './src/services/cms.js';
import { CMSItem, CMSResponse, CMSField, CMSSchemaField, CMSAsset } from './src/types/index.js';
import { authenticate } from './src/utils/auth.js';
import { sendSuccess, sendError } from './src/utils/response.js';

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || false,
  credentials: true,
});

function promisify(fn: (req: Request, res: Response, callback: (err?: Error) => void) => void) {
  return (req: Request, res: Response) =>
    new Promise((resolve, reject) => {
      fn(req, res, (result?: Error) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

function filterFields(item: CMSItem, fieldsToInclude?: string[]): CMSItem {
  if (!fieldsToInclude || fieldsToInclude.length === 0) {
    return item;
  }

  const filtered: CMSItem = {
    id: item.id,
    createdAt: item.createdAt,
    fields: [],
  };
  
  // Include optional updatedAt if present
  if (item.updatedAt) {
    filtered.updatedAt = item.updatedAt;
  }

  // Filter fields based on fieldsToInclude
  if (item.fields && Array.isArray(item.fields)) {
    filtered.fields = item.fields.filter(field => 
      fieldsToInclude.includes(field.key)
    );
  }

  return filtered;
}

// Register HTTP function with Google Cloud Functions
http('items', async (req: Request, res: Response) => {
  try {
    // Apply CORS middleware
    await promisify(corsMiddleware)(req, res);

    // Only allow GET requests
    if (req.method !== 'GET') {
      return sendError(
        res,
        'METHOD_NOT_ALLOWED',
        `Method ${req.method} not allowed`,
        405
      );
    }

    // Authenticate request
    if (!authenticate(req as unknown as import('./src/utils/auth.js').AuthenticatedRequest)) {
      return sendError(
        res,
        'UNAUTHORIZED',
        'Invalid or missing authentication token',
        401
      );
    }

    const modelId = process.env.REEARTH_CMS_MODEL_ID;
    const projectId = process.env.REEARTH_CMS_PROJECT_ID;
    const workspaceId = process.env.REEARTH_CMS_WORKSPACE_ID;
    if (!modelId || !projectId || !workspaceId) {
      return sendError(
        res,
        'CONFIGURATION_ERROR',
        'Model ID, Project ID or Workspace ID not configured',
        500
      );
    }

    // Get field filtering configuration from environment
    const responseFieldsEnv = process.env.RESPONSE_FIELDS;
    const fieldsToInclude = responseFieldsEnv 
      ? responseFieldsEnv.split(',').map(field => field.trim())
      : undefined;

    try {
      // Fetch assets from CMS
      const assetsResponse = await cmsService.getAssets(workspaceId, projectId);

      // Fetch schema from CMS
      const schemaResponse = await cmsService.getModel(workspaceId, projectId, modelId);

      // Fetch items from CMS
      const itemsResponse = await cmsService.getItems(workspaceId, projectId, modelId);

      // Append schema fields' names to items' fields
      // Replace asset field values with corresponding asset URLs
      const items = itemsResponse.items.map((item: CMSItem) => ({
        ...item,
        fields: item.fields.map((field: CMSField) => {
          const schemaField = schemaResponse.schema.fields.find((f: CMSSchemaField) => f.key === field.key);
          return {
            ...field,
            name: schemaField ? schemaField.name : undefined,
            value: field.type === 'asset' && typeof field.value === 'string' ? 
              assetsResponse.items?.find((a: CMSAsset) => a.id === field.value)?.url || field.value 
              : field.type ==='asset' && Array.isArray(field.value) ? 
                field.value.map((v: string) => assetsResponse.items?.find((a: CMSAsset) => a.id === v)?.url || v) 
                : field.value
          };
        })
      }));
      
      // Apply field filtering if configured
      const fieldFilteredItems = items.map((item: CMSItem) =>
        filterFields(item, fieldsToInclude)
      );

      // Apply data filtering if configured
      const dataFiltersEnv = process.env.FILTERS;
      let finalItems = fieldFilteredItems;
      if (dataFiltersEnv) {
        const conditions = dataFiltersEnv.split(';').map(cond => cond.trim());
        finalItems = fieldFilteredItems.filter((item: CMSItem) => {
          return conditions.every(condition => {
            const [rawKey, rawValues] = condition.split('===');
            if (!rawKey || !rawValues) return true; // Skip invalid conditions
            const key = rawKey.trim();
            const values = rawValues.split('|').map(v => v.trim());
            const field = item.fields.find(f => f.key === key);
            if (!field) return false; // Field not found, exclude item
            return values.includes(String(field.value));
          });
        });
      }

      // Return response with original CMS structure
      const response: CMSResponse = {
        items: finalItems,
        ...(itemsResponse.totalCount !== undefined && { totalCount: itemsResponse.totalCount })
      };

      return sendSuccess(res, response, 200);

    } catch (error) {
      console.error('Error fetching items:', error);
      return sendError(
        res,
        'FETCH_FAILED',
        'Failed to fetch items from CMS',
        500
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      500
    );
  }
});