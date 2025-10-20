#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
else
    echo "Warning: .env file not found!"
fi

# Build the project
echo "Building project..."
yarn build

# Create package.json for deployment
echo "Preparing deployment package..."
cp package.deploy.json dist/package.json
cp yarn.lock dist/

# Deploy to Google Cloud Functions (deploy directly from dist)
echo "Deploying to Google Cloud Functions..."
gcloud functions deploy cms-data-visualizer \
  --runtime=nodejs22 \
  --region=asia-northeast1 \
  --source=./dist \
  --entry-point=items \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars="REEARTH_CMS_INTEGRATION_API_BASE_URL=$REEARTH_CMS_INTEGRATION_API_BASE_URL,REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN=$REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN,REEARTH_CMS_PROJECT_ID=$REEARTH_CMS_PROJECT_ID,REEARTH_CMS_MODEL_ID=$REEARTH_CMS_MODEL_ID,API_SECRET_KEY=$API_SECRET_KEY,CORS_ORIGIN=$CORS_ORIGIN"

echo "Deployment complete!"
echo "Your function URL will be displayed above."