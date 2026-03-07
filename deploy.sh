#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="tulie-crm"
REGION="asia-southeast1" # Default region
PROJECT_ID="tulie-crm"

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No default project is set in gcloud."
    echo "Please set one using: gcloud config set project <YOUR_PROJECT_ID>"
    exit 1
fi

echo "--------------------------------------------------------"
echo "Deploying $APP_NAME"
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "--------------------------------------------------------"
echo ""

# Load .env.local if it exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
  set -a
  source .env.local
  set +a
else
  echo "Warning: .env.local not found. Deployment may fail if secrets are missing."
fi

# Confirm
read -p "Do you want to proceed with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

# Build Image using Cloud Build Config
echo "Building container image..."
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_GCR_TAG="asia-southeast1-docker.pkg.dev/$PROJECT_ID/tulie-repo/$APP_NAME",_NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL",_NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  .

# Deploy Service with Env Vars
# Deploy Service with Env Vars
echo "Deploying to Cloud Run..."
gcloud run deploy "$APP_NAME" \
    --image asia-southeast1-docker.pkg.dev/"$PROJECT_ID"/tulie-repo/"$APP_NAME" \
    --platform managed \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --allow-unauthenticated \
    --update-env-vars NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    --update-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    --update-env-vars NEXT_PUBLIC_APP_URL="https://crm.tulie.agency" \
    --update-env-vars SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    --update-env-vars RESEND_API_KEY="$RESEND_API_KEY" \
    --update-env-vars DATABASE_URL="$DATABASE_URL" \
    --update-env-vars DIRECT_URL="$DIRECT_URL"

echo ""
echo "Deployment completed successfully."
