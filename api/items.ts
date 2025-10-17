import { VercelRequest, VercelResponse } from "@vercel/node";
import cors from "cors";

import { cmsService } from "../src/services/cms.js";
import { CMSItem, CMSResponse } from "../src/types";
import { authenticate, AuthenticatedRequest } from "../src/utils/auth.js";
import { sendSuccess, sendError } from "../src/utils/response.js";

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || false,
  credentials: true,
});

function promisify(fn: (req: VercelRequest, res: VercelResponse, callback: (err?: Error) => void) => void) {
  return (req: VercelRequest, res: VercelResponse) =>
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Apply CORS middleware
    await promisify(corsMiddleware)(req, res);

    // Only allow GET requests
    if (req.method !== "GET") {
      return sendError(
        res,
        "METHOD_NOT_ALLOWED",
        `Method ${req.method} not allowed`,
        405
      );
    }

    // Authenticate request
    if (!authenticate(req as AuthenticatedRequest)) {
      return sendError(
        res,
        "UNAUTHORIZED",
        "Invalid or missing authentication token",
        401
      );
    }

    const modelId = process.env.REEARTH_CMS_MODEL_ID;
    const projectId = process.env.REEARTH_CMS_PROJECT_ID;
    if (!modelId || !projectId) {
      return sendError(
        res,
        "CONFIGURATION_ERROR",
        "Model ID or Project ID not configured",
        500
      );
    }

    // Get field filtering configuration from environment
    const responseFieldsEnv = process.env.RESPONSE_FIELDS;
    const fieldsToInclude = responseFieldsEnv 
      ? responseFieldsEnv.split(",").map(field => field.trim())
      : undefined;

    try {
      // Fetch assets from CMS
      const assetsResponse = await cmsService.getAssets(projectId);

      // Fetch schema from CMS
      const schemaResponse = await cmsService.getModel(modelId);

      // Fetch items from CMS
      const itemsResponse = await cmsService.getItems(modelId);

      // Append schema fields' names to items' fields
      // Replace asset field values with corresponding asset URLs
      const items = itemsResponse.items.map(item => ({
        ...item,
        fields: item.fields.map(field => {
          const schemaField = schemaResponse.schema.fields.find(f => f.key === field.key);
          return {
            ...field,
            name: schemaField ? schemaField.name : undefined,
            value: field.type === 'asset' && typeof field.value === 'string' ? 
              assetsResponse.items?.find(a => a.id === field.value)?.url || field.value 
              : field.type ==='asset' && Array.isArray(field.value) ? 
                field.value.map(v => assetsResponse.items?.find(a => a.id === v)?.url || v) 
                : field.value
          };
        })
      }));
      
      // Apply field filtering if configured
      const filteredItems = items.map(item =>
        filterFields(item, fieldsToInclude)
      );

      // Return response with original CMS structure
      const response: CMSResponse = {
        items: filteredItems,
        ...(itemsResponse.totalCount !== undefined && { totalCount: itemsResponse.totalCount })
      };

      return sendSuccess(res, response, 200);

    } catch (error) {
      console.error("Error fetching items:", error);
      return sendError(
        res,
        "FETCH_FAILED",
        "Failed to fetch items from CMS",
        500
      );
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return sendError(
      res,
      "INTERNAL_ERROR",
      "An unexpected error occurred",
      500
    );
  }
}