# CMS Data Visualizer Server (Backend)

This is the backend API server for the CMS Data Visualizer, built with Node.js and TypeScript, designed for Vercel serverless deployment.

## Project Overview

A Node.js backend that provides a general-purpose REST API endpoint for retrieving data from Re:Earth CMS models. The server acts as a proxy to the Re:Earth CMS Integration API with optional field filtering capabilities. All items from the configured model are retrieved automatically.

## Tech Stack

- **Node.js 22.x** with **TypeScript 5.9.3** (ES Modules)
- **Google Cloud Functions** for serverless deployment
- **Functions Framework** for local development and deployment
- **Axios** for HTTP requests to CMS Integration API
- **CORS** for cross-origin request handling
- **Zod** for runtime type validation utilities
- **Vitest** for testing framework

## Architecture

### Google Cloud Functions

```text
index.js                  # HTTP Cloud Function - general CMS data retrieval
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

- **`GET /`** - Retrieve CMS model items with optional filtering (Cloud Function HTTP trigger)

## Key Features

### Response Format

The server returns data in the original CMS structure with optional field filtering:

**API Response Format:**

```json
{
  "id": "item_1",
  "fields": [
    {"id": "field_1", "key": "title", "value": "Sample Title"},
    {"id": "field_2", "key": "description", "value": "Sample Description"}
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T01:00:00Z"
}
```

### Server-Side Filtering

The server supports two types of filtering via environment variables:

#### Field Filtering

Configure which fields to include in responses:

- `RESPONSE_FIELDS=title,description` - Only include specified fields
- Unset - Include all available fields
- Always includes `id` field

#### Data Filtering

Filter items based on field values:

- `FILTERS=status===published|draft;category===news` - Filter items by conditions
- Supports multiple conditions (AND logic) and values (OR logic)
- Uses `===` for exact matching
- Unset - Return all items

## Development Commands

```bash
yarn dev             # Start development server using Functions Framework on port 5200
yarn build                 # Build TypeScript to dist/
yarn start                 # Start Cloud Function locally using Functions Framework
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

- Items API endpoint with field filtering
- CMS service integration
- Utility functions (auth, validation, response)
- Error handling scenarios
- Field filtering logic

## Environment Configuration

Required environment variables for deployment:

```bash
REEARTH_CMS_INTEGRATION_API_BASE_URL=cms_integration_api_base_url
REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN=your_cms_integration_access_token
REEARTH_CMS_PROJECT_ID=your_project_id
REEARTH_CMS_MODEL_ID=your_model_id
API_SECRET_KEY=your_api_secret_key
CORS_ORIGIN=null
```

**Note:** `API_SECRET_KEY` is a static authentication token. Generate a secure random string for production - it will be required for authenticating requests from client applications.

### Optional Configuration

```bash
RESPONSE_FIELDS=title,description,author    # Field filtering (comma-separated)
FILTERS=status===published|draft;category===news  # Data filtering (condition-based)
```

## CMS Integration

The server integrates with **Re:Earth CMS Integration API** for:

- **Data retrieval** from specified CMS models
- **Server-side field filtering** of response fields
- **Server-side data filtering** based on field values
- **Authentication** via API tokens

API documentation available in `docs/cms-data-visualizer-api-document.md`.

## Deployment

Designed for **Google Cloud Functions** serverless deployment:

### Local Development
```bash
yarn install
yarn dev    # Runs on http://localhost:5200
```

### Deploy to Google Cloud
```bash
gcloud functions deploy cms-data-visualizer \
  --gen2 \
  --runtime=nodejs22 \
  --region=us-central1 \
  --source=. \
  --entry-point=items \
  --trigger=http \
  --allow-unauthenticated \
  --set-env-vars="REEARTH_CMS_INTEGRATION_API_BASE_URL=your_value,REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN=your_token,REEARTH_CMS_PROJECT_ID=your_project_id,REEARTH_CMS_MODEL_ID=your_model_id,API_SECRET_KEY=your_secret_key,CORS_ORIGIN=null"
```

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
        "fields": [
          {"id": "field_1", "key": "title", "value": "Sample Title"},
          {"id": "field_2", "key": "description", "value": "Sample Description"}
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T01:00:00Z"
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

---

## 📋 Important Instructions for Development

### Do what has been asked; nothing more, nothing less

- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one  
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User

### Markdown Linting Rules (markdownlint)

When editing markdown files, ALWAYS follow these rules to avoid linting errors:

#### MD022 - Headings surrounded by blank lines

**Rule**: Headings should be surrounded by blank lines

**Bad**:
```markdown
Some text
## Heading
Content immediately after
```

**Good**:
```markdown
Some text

## Heading

Content with proper spacing
```

#### MD032 - Lists surrounded by blank lines

**Rule**: Lists should be surrounded by blank lines

**Bad**:
```markdown
Some text:
- List item 1
- List item 2
More content
```

**Good**:
```markdown
Some text:

- List item 1
- List item 2

More content
```

#### Key Points

- Always add blank line BEFORE a heading (except first heading in file)
- Always add blank line AFTER a heading
- Always add blank line BEFORE a list
- Always add blank line AFTER a list
- This applies to ALL markdown files: README.md, CLAUDE.md, AGENTS.md, docs/*.md

#### Common Mistake Pattern

```markdown
#### Heading
Content starts immediately  ❌

**Some bold text:**
- List item
Content continues          ❌
```

#### Correct Pattern

```markdown
#### Heading

Content with proper spacing ✅

**Some bold text:**

- List item

Content continues          ✅
```

#### Additional Rules

- **MD024**: Multiple headings with the same content should be avoided
- **MD025**: Only one H1 heading per document
- **MD041**: First line in file should be a top level heading

### Example of Properly Formatted Markdown

```markdown
# Document Title

Brief description here.

## Section Heading

Some explanatory text before the list.

### Subsection

Configuration options:

- Option 1: Description here
- Option 2: Description here  
- Option 3: Description here

More content continues here.

#### Code Example

Here's how to use it:

\```bash
command --option value
\```

The command above does something important.

## Another Section

And so on...
```
