#!/bin/bash
# Setup Cloud Scheduler jobs for LW Scientific data ingestion

set -euo pipefail

PROJECT="henzelabs-gpt"
REGION="us-east1"
SERVICE_URL="https://marketing-agent-core-906749953116.us-east1.run.app"
SA_EMAIL="henze-gpt-agent@henzelabs-gpt.iam.gserviceaccount.com"

# Get ADMIN_TOKEN from Cloud Run service
ADMIN_TOKEN=$(gcloud run services describe marketing-agent-core --region $REGION \
  --format='get(spec.template.spec.containers[0].env[0].value)')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "❌ ADMIN_TOKEN not found in Cloud Run service"
  exit 1
fi

echo "✅ Found ADMIN_TOKEN"

# Function to create or update scheduler job
upsert_job() {
  local NAME="$1" PATH="$2" SCHED="$3" DESC="$4"
  
  if gcloud scheduler jobs describe "$NAME" --location "$REGION" >/dev/null 2>&1; then
    echo "🔄 Updating existing job: $NAME"
    gcloud scheduler jobs update http "$NAME" --location "$REGION" \
      --schedule="$SCHED" --time-zone="UTC" \
      --uri="$SERVICE_URL$PATH" --http-method=POST \
      --headers="X-Admin-Token=$ADMIN_TOKEN" \
      --oidc-service-account-email "$SA_EMAIL" \
      --oidc-token-audience "$SERVICE_URL" \
      --description="$DESC"
  else
    echo "➕ Creating new job: $NAME"
    gcloud scheduler jobs create http "$NAME" --location "$REGION" \
      --schedule="$SCHED" --time-zone="UTC" \
      --uri="$SERVICE_URL$PATH" --http-method=POST \
      --headers="X-Admin-Token=$ADMIN_TOKEN" \
      --oidc-service-account-email "$SA_EMAIL" \
      --oidc-token-audience "$SERVICE_URL" \
      --description="$DESC"
  fi
}

# Create LW Scientific scheduler jobs
echo "🚀 Setting up LW Scientific scheduler jobs..."

# Daily Shopify ingestion at 3:00 AM UTC
upsert_job "lwscientific-shopify-daily" \
  "/admin/ingest/shopify?brand=lwscientific" \
  "0 3 * * *" \
  "Daily LW Scientific Shopify data ingestion"

# Hourly Shopify orders (for recent activity)
upsert_job "lwscientific-shopify-hourly" \
  "/admin/ingest/shopify?brand=lwscientific&source=orders" \
  "15 * * * *" \
  "Hourly LW Scientific Shopify orders ingestion"

# Daily GA4 ingestion at 3:30 AM UTC
upsert_job "lwscientific-ga4-daily" \
  "/admin/ingest/ga4?brand=lwscientific" \
  "30 3 * * *" \
  "Daily LW Scientific GA4 data ingestion"

# Daily Clarity ingestion at 4:00 AM UTC
upsert_job "lwscientific-clarity-daily" \
  "/admin/ingest/clarity?brand=lwscientific" \
  "0 4 * * *" \
  "Daily LW Scientific Clarity data ingestion"

echo "✅ LW Scientific scheduler jobs created/updated successfully"
echo "📋 Jobs created:"
echo "  - lwscientific-shopify-daily (daily at 3:00 AM UTC)"
echo "  - lwscientific-shopify-hourly (hourly at :15)"
echo "  - lwscientific-ga4-daily (daily at 3:30 AM UTC)"
echo "  - lwscientific-clarity-daily (daily at 4:00 AM UTC)"