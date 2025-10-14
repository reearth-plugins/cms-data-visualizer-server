# CMS Data Visualizer Server (Backend)

This is the backend API server for the CMS Data Visualizer, built with Node.js and TypeScript, designed for Vercel serverless deployment.

## Project Overview

A Node.js backend that provides a general-purpose REST API endpoint for retrieving and transforming data from Re:Earth CMS models. The server acts as a proxy to the Re:Earth CMS Integration API with field transformation and filtering capabilities.

## Tech Stack

- **Node.js 22.x** with **TypeScript 5.9.3** (ES Modules)
- **Vercel** serverless functions for deployment
- **Axios** for HTTP requests to CMS Integration API
- **CORS** for cross-origin request handling
- **Zod** for runtime type validation utilities
- **Vitest** for testing framework

## Architecture

### Serverless Functions

```text
api/
└── items.ts              # GET /items endpoint - general CMS data retrieval
```

### Core Services

```text
src/
├── services/
│   └── cms.ts             # Re:Earth CMS Integration API service
├── utils/
│   ├── auth.ts            # Static API key authentication
│   ├── validation.ts      # Request validation utilities with Zod
│   └── response.ts        # Standardized API responses
└── types/
    └── index.ts           # TypeScript type definitions
```

## API Endpoints

### Data Retrieval

- **`GET /api/items`** - Retrieve and transform CMS model items

## Key Features

### Response Transformation

The server transforms CMS field arrays into clean key-value objects:

**CMS Format (Internal):**

```json
{
  "id": "item_1",
  "fields": [
    {"key": "title", "value": "Sample Title"},
    {"key": "description", "value": "Sample Description"}
  ]
}
```

**API Response (Transformed):**

```json
{
  "id": "item_1", 
  "title": "Sample Title",
  "description": "Sample Description"
}
```

### Server-Side Field Filtering

Configure which fields to include via environment variables:

- `RESPONSE_FIELDS=title,description` - Only include specified fields
- Unset - Include all available fields
- Always includes `id` field

## Development Commands

```bash
yarn dev:local             # Start development server on port 5200
yarn build                 # Build TypeScript to dist/
yarn type-check           # TypeScript type checking
yarn lint                 # Run ESLint
yarn lint:fix             # Fix ESLint issues
```

## Testing

```bash
yarn test                  # Run all tests
yarn test:watch           # Run tests in watch mode
yarn test:coverage        # Run tests with coverage report
```

### Test Coverage

- Items API endpoint with field transformation and filtering
- CMS service integration
- Utility functions (auth, validation, response)
- Error handling scenarios
- Field transformation logic

## Environment Configuration

Required environment variables for deployment:

```bash
REEARTH_CMS_INTEGRATION_API_BASE_URL=cms_integration_api_base_url
REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN=your_cms_integration_access_token
REEARTH_CMS_PROJECT_MODEL_ID=your_model_id
API_SECRET_KEY=your_api_secret_key
CORS_ORIGIN=null
```

**Note:** `API_SECRET_KEY` is a static authentication token. Generate a secure random string for production - it will be required for authenticating requests from client applications.

### Optional Configuration

```bash
RESPONSE_FIELDS=title,description,author    # Field filtering (comma-separated)
```

## CMS Integration

The server integrates with **Re:Earth CMS Integration API** for:

- **Data retrieval** from specified CMS models
- **Field transformation** from array format to key-value objects
- **Server-side filtering** of response fields
- **Authentication** via API tokens

API documentation available in `docs/cms-data-visualizer-api-document.md`.

## Deployment

Designed for **Vercel** serverless deployment:

1. Connect repository to Vercel
2. Configure environment variables in dashboard  
3. Auto-deploy on push to main branch

## CORS Configuration

Supports configurable CORS origins for client integration:

- **Development**: Configure via `CORS_ORIGIN` environment variable
- **Plugin Integration**: Set `CORS_ORIGIN=null` to allow all origins
- **Production**: Specify exact origins for security

## Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_1",
        "title": "Transformed Title",
        "description": "Transformed Description"
      }
    ],
    "totalCount": 1
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```
