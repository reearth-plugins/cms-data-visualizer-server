# CMS Data Visualizer Server

A Node.js backend API server for the CMS Data Visualizer, built with TypeScript and designed for Google Cloud Functions deployment. This server provides a general-purpose REST API endpoint for retrieving data from Re:Earth CMS models with enhanced field information and optional filtering capabilities.

## ✨ Features

- **🔗 CMS Integration**: Direct integration with Re:Earth CMS Integration API
- **📊 Enhanced Data**: Automatically enriches item fields with schema metadata (field names, types)
- **🎯 Field Filtering**: Server-side field filtering via environment configuration
- **🚀 Serverless Ready**: Optimized for Google Cloud Functions deployment
- **🔐 Secure**: Static API key authentication
- **📦 Pagination**: Automatic handling of paginated CMS responses
- **🌐 CORS Support**: Configurable cross-origin request handling

## 🏗️ Architecture

### Cloud Functions

```text
index.ts                  # HTTP Cloud Function - CMS data retrieval with schema enhancement
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

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x
- Yarn package manager
- Re:Earth CMS project with Integration API access

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cms-data-visualizer-server

# Install dependencies
yarn install

# Configure environment variables (see Configuration section)
cp .env.example .env
```

### Development

```bash
# Start development server on port 5200
yarn dev

# Build TypeScript
yarn build

# Run tests
yarn test

# Type checking
yarn type-check

# Linting
yarn lint
yarn lint:fix
```

## 📡 API Endpoints

### Get Items

**`GET /`** (Cloud Function HTTP trigger)

Retrieve all items from the configured CMS model with enhanced field information.

#### Headers

```http
Authorization: Bearer <your_api_secret_key>
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_1",
        "fields": [
          {
            "id": "field_1",
            "key": "title",
            "name": "Article Title",
            "type": "text",
            "value": "Sample Title"
          },
          {
            "id": "field_2", 
            "key": "description",
            "name": "Article Description",
            "type": "textArea",
            "value": "Sample Description"
          }
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T01:00:00Z"
      }
    ],
    "totalCount": 1
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## ⚙️ Configuration

### Required Environment Variables

```bash
# Re:Earth CMS Integration API Configuration
REEARTH_CMS_INTEGRATION_API_BASE_URL=https://your-cms-domain/api
REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN=your_cms_integration_access_token
REEARTH_CMS_PROJECT_ID=your_project_id
REEARTH_CMS_MODEL_ID=your_model_id

# Authentication
API_SECRET_KEY=your_secure_random_string

# CORS Configuration
CORS_ORIGIN=null  # Use 'null' for plugin integration, or specify exact origins
```

### Optional Configuration

```bash
# Field Filtering (comma-separated field keys)
RESPONSE_FIELDS=title,description,author

# Data Filtering (filter items based on field values)
FILTERS=status===published|draft;category===news;priority===high
```

### Environment Setup Examples

#### Dev Environment

```bash
CORS_ORIGIN=http://localhost:3000
API_SECRET_KEY=dev-secret-key-change-in-production
```

#### Plugin Integration

```bash
CORS_ORIGIN=null  # Allows all origins for plugin use
```

#### Production Environment

```bash
CORS_ORIGIN=https://your-production-domain.com
API_SECRET_KEY=your-secure-production-key
```

## 🔧 Filtering

The server supports two types of server-side filtering:

### Field Filtering

Controls which fields are included in the response to reduce payload size:

- **All fields**: Leave `RESPONSE_FIELDS` unset
- **Specific fields**: Set `RESPONSE_FIELDS=field1,field2,field3`

### Data Filtering

Filters which items are returned based on field values:

- **No filtering**: Leave `FILTERS` unset
- **With conditions**: Set `FILTERS=field1===value1|value2;field2===value3`

#### Data Filter Syntax

```bash
# Single condition (OR values)
FILTERS=status===published|draft

# Multiple conditions (AND logic between conditions)
FILTERS=status===published;category===news;priority===high

# Mixed examples
FILTERS=type===article|blog;status===published;author===john|jane
```

**Filter Rules:**

- Multiple conditions are separated by `;` (AND logic)
- Multiple values for a condition are separated by `|` (OR logic) 
- Field-value matching uses `===`
- String comparison is case-sensitive
- Items are excluded if any condition fails

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode  
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Test Coverage

- ✅ Items API endpoint with schema enhancement
- ✅ Field filtering logic
- ✅ Data filtering logic with multiple conditions
- ✅ CMS service integration
- ✅ Authentication utilities
- ✅ Error handling scenarios

## 🚀 Deployment

### Google Cloud Functions (Recommended)

#### Prerequisites

1. **Install Google Cloud CLI**: 
   ```bash
   # On macOS
   brew install --cask google-cloud-sdk
   ```

2. **Authenticate and Setup**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable Cloud Functions API** (if not already enabled):
   ```bash
   gcloud services enable cloudfunctions.googleapis.com
   ```

#### Deploy

```bash
# Deploy using the provided script
yarn deploy

# Or manually
gcloud functions deploy cms-data-visualizer \
  --runtime=nodejs22 \
  --region=asia-northeast1 \
  --source=./dist \
  --entry-point=items \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars="REEARTH_CMS_INTEGRATION_API_BASE_URL=your_value,..."
```

#### Environment Variables Setup

Create a `.env` file in the root directory with your environment variables:

```bash
REEARTH_CMS_INTEGRATION_API_BASE_URL=https://api.cms.reearth.io/api
REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN=your_token
REEARTH_CMS_PROJECT_ID=your_project_id
REEARTH_CMS_MODEL_ID=your_model_id
API_SECRET_KEY=your_secret_key
CORS_ORIGIN=null

# Optional: Filter specific fields in response
RESPONSE_FIELDS=title,description,status

# Optional: Filter items by field values
FILTERS=status===published|draft;category===news
```

The deploy script will automatically load these variables and deploy your function.

#### Deployed Function URL

After successful deployment, your function will be available at:
```
https://asia-northeast1-YOUR_PROJECT_ID.cloudfunctions.net/cms-data-visualizer
```

## 🔒 Security

- **Authentication**: All API endpoints require Bearer token authentication
- **CORS**: Configurable CORS policies for secure cross-origin access
- **Environment Variables**: Sensitive configuration stored securely
- **No Secrets in Code**: All API keys and tokens managed via environment variables

## 🤝 API Integration

### Client Example

```javascript
const response = await fetch('https://asia-northeast1-YOUR_PROJECT_ID.cloudfunctions.net/cms-data-visualizer', {
  headers: {
    'Authorization': `Bearer ${API_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Re:Earth Plugin Integration

The server is designed to work seamlessly with Re:Earth plugins by supporting:

- Null CORS origin for plugin environments
- Standardized response formats
- Enhanced field metadata for visualization

## 📚 Documentation

- **API Documentation**: See `docs/cms-data-visualizer-api-document.md`
- **Project Instructions**: See `CLAUDE.md` for development guidelines
- **CMS Integration**: Refer to Re:Earth CMS Integration API documentation

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors

```bash
# For plugin integration
CORS_ORIGIN=null

# For specific domains
CORS_ORIGIN=https://your-domain.com
```

#### Authentication Failures

- Ensure `API_SECRET_KEY` matches between client and server
- Check that Authorization header includes "Bearer " prefix

#### CMS Connection Issues

- Verify `REEARTH_CMS_INTEGRATION_API_BASE_URL` is correct
- Confirm `REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN` has proper permissions
- Check that `REEARTH_CMS_PROJECT_ID` and `REEARTH_CMS_MODEL_ID` exist in your CMS project

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

---

**Built with ❤️ for the Re:Earth ecosystem**