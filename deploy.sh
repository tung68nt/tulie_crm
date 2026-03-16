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

# Deploy Service
# SECURITY: Non-public secrets use GCP Secret Manager (--update-secrets)
# Public vars (NEXT_PUBLIC_*) remain as env vars since they're client-exposed anyway
echo "Deploying to Cloud Run..."
echo ""
echo "⚠️  IMPORTANT: Before first deploy, create these GCP Secrets:"
echo "   gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --replication-policy=automatic"
echo "   gcloud secrets create RESEND_API_KEY --replication-policy=automatic"
echo "   gcloud secrets create DATABASE_URL --replication-policy=automatic"
echo "   gcloud secrets create DIRECT_URL --replication-policy=automatic"
echo "   gcloud secrets create PORTAL_SECRET --replication-policy=automatic"
echo "   Then add versions with: echo -n 'value' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""

gcloud run deploy "$APP_NAME" \
    --image asia-southeast1-docker.pkg.dev/"$PROJECT_ID"/tulie-repo/"$APP_NAME" \
    --platform managed \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --allow-unauthenticated \
    --update-env-vars NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    --update-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    --update-env-vars NEXT_PUBLIC_APP_URL="https://crm.tulie.agency" \
    --update-secrets SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest \
    --update-secrets RESEND_API_KEY=RESEND_API_KEY:latest \
    --update-secrets DATABASE_URL=DATABASE_URL:latest \
    --update-secrets DIRECT_URL=DIRECT_URL:latest \
    --update-secrets PORTAL_SECRET=PORTAL_SECRET:latest

echo ""
echo "Deployment completed successfully."
