# CMS Data Visualizer Server API Documentation

This document describes the API endpoints provided by the CMS Data Visualizer Server, which acts as a proxy to the Re:Earth CMS Integration API.

## Overview

The server provides a simplified, general-purpose interface to retrieve data from Re:Earth CMS models. It internally uses the Re:Earth CMS Integration API and returns the data directly without modification.

## Authentication

All requests require API key authentication. Include the API secret key in the `Authorization` header:

```bash
Authorization: Bearer <API_SECRET_KEY>
```

## Base URL

```text
https://your-deployment-url.vercel.app
```

## Endpoints

### Get Items

**GET** `/items`

Retrieves items from a configured CMS model using the Re:Earth CMS Integration API.

#### Internal Implementation

This endpoint internally calls:

```text
GET /models/{modelId}/items?perPage=10000&page=1
```

on the Re:Earth CMS Integration API, where `{modelId}` is configured via environment variables. The server automatically requests all items by setting a large `perPage` value.

#### Query Parameters

This endpoint does not accept any query parameters. Field filtering is configured server-side via environment variables.

#### Example Request

```bash
GET /items
```

#### Response

The response returns data in the original CMS structure with optional server-side field filtering applied.

**Field Filtering Behavior:**

- Fields to include are configured via the `RESPONSE_FIELDS` environment variable
- If `RESPONSE_FIELDS` is configured, only fields with keys matching the specified list will be included
- If `RESPONSE_FIELDS` is not configured, all fields from the CMS response are returned
- Field names should match the exact field keys in the CMS model schema
- System fields like `id`, `createdAt`, and `updatedAt` are always included when present

**Success Response (200)**:

```json
{
  "items": [
    {
      "id": "item_id_1",
      "fields": [
        {
          "id": "field_1",
          "key": "title",
          "name": "Title",
          "type": "text",
          "value": "Sample Title"
        },
        {
          "id": "field_2", 
          "key": "description",
          "name": "Description", 
          "type": "textarea",
          "value": "Sample Description"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T01:00:00Z"
    }
  ],
  "totalCount": 1
}
```

*Note: The above example shows a filtered response when `RESPONSE_FIELDS=title,description` is configured. Only fields with matching keys are included in the fields array.*

**Error Responses:**

- **400**: Invalid request parameters
- **401**: Unauthorized - Invalid or missing API key
- **404**: Items not found
- **500**: Internal server error

## Environment Configuration

The server requires the following environment variables to be configured:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REEARTH_CMS_INTEGRATION_API_BASE_URL` | Base URL for the Re:Earth CMS Integration API | `https://api.reearth.dev` |
| `REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN` | Bearer token for CMS API authentication | `your-cms-token` |
| `REEARTH_CMS_PROJECT_MODEL_ID` | The model ID to query items from | `your-model-id` |
| `API_SECRET_KEY` | Secret key for authenticating client requests | `your_secret_key` |
| `RESPONSE_FIELDS` | Comma-separated list of fields to include in API responses | `all fields` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | CORS origin configuration | `null` (allows all origins) |

## Error Handling

The server handles errors from the upstream CMS Integration API and returns appropriate HTTP status codes:

- **400 Bad Request**: Invalid query parameters or malformed request
- **401 Unauthorized**: Missing or invalid API secret key
- **403 Forbidden**: CMS API access denied (invalid CMS token)
- **404 Not Found**: Requested model or items not found
- **500 Internal Server Error**: Upstream API errors or server issues

Error responses follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details if available"
}
```

## Rate Limiting

Rate limiting is handled by the upstream Re:Earth CMS Integration API. Refer to the CMS API documentation for current limits.

## CORS Support

The server supports CORS for cross-origin requests. Configure the `CORS_ORIGIN` environment variable to restrict origins, or set to `null` to allow all origins (recommended for plugin integration).
