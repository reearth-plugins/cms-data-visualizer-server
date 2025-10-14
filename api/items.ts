import { VercelRequest, VercelResponse } from "@vercel/node";
import cors from "cors";

import { cmsService } from "../src/services/cms.js";
import { CMSItem, TransformedItem, ItemsResponse } from "../src/types";
import { authenticate, AuthenticatedRequest } from "../src/utils/auth.js";
import { sendSuccess, sendError } from "../src/utils/response.js";

const corsOrigin = process.env.CORS_ORIGIN === "null" ? null : process.env.CORS_ORIGIN;

const corsMiddleware = cors({
  origin: corsOrigin || false,
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

function transformItem(item: CMSItem, fieldsToInclude?: string[]): TransformedItem {
  const transformed: TransformedItem = {
    id: item.id,
  };

  // Transform fields array to key-value pairs
  if (item.fields && Array.isArray(item.fields)) {
    for (const field of item.fields) {
      // Apply field filtering if specified
      if (!fieldsToInclude || fieldsToInclude.includes(field.key)) {
        transformed[field.key] = field.value;
      }
    }
  }

  return transformed;
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

    const modelId = process.env.REEARTH_CMS_PROJECT_MODEL_ID;
    if (!modelId) {
      return sendError(
        res,
        "CONFIGURATION_ERROR",
        "Model ID not configured",
        500
      );
    }

    // Get field filtering configuration from environment
    const responseFieldsEnv = process.env.RESPONSE_FIELDS;
    const fieldsToInclude = responseFieldsEnv 
      ? responseFieldsEnv.split(",").map(field => field.trim())
      : undefined;

    try {
      // Fetch items from CMS
      const cmsResponse = await cmsService.getItems(modelId);
      
      // Transform and filter items
      const transformedItems = cmsResponse.items.map(item => 
        transformItem(item, fieldsToInclude)
      );

      // Return response with transformed items
      const response: ItemsResponse = {
        items: transformedItems,
        ...(cmsResponse.totalCount !== undefined && { totalCount: cmsResponse.totalCount })
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