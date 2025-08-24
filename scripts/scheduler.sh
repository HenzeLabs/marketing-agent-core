#!/bin/bash
# scripts/scheduler.sh: Create/update Cloud Scheduler jobs for admin ingest endpoints (OIDC auth)
# Requires: gcloud, jq

set -euo pipefail

PROJECT=henzelabs-gpt
REGION=us-east1
SERVICE=marketing-agent-core
SERVICE_URL="https://marketing-agent-core-906749953116.us-east1.run.app"
SVC_ACCOUNT="henze-gpt-agent@henzelabs-gpt.iam.gserviceaccount.com"

# Job configs
JOBS=(
  "ga4:/admin/ingest/ga4"
  "clarity:/admin/ingest/clarity"
  "shopify:/admin/ingest/shopify"
)

for job in "${JOBS[@]}"; do
  NAME="ingest-$(cut -d: -f1 <<< "$job")"
  PATH="$(cut -d: -f2 <<< "$job")"
  gcloud scheduler jobs delete "$NAME" --location="$REGION" --quiet || true
  gcloud scheduler jobs create http "$NAME" \
    --location="$REGION" \
    --schedule="0 * * * *" \
    --uri="$SERVICE_URL$PATH" \
    --http-method=POST \
    --oidc-service-account-email="$SVC_ACCOUNT" \
    --oidc-token-audience="$SERVICE_URL" \
    --project="$PROJECT" \
    --time-zone="America/New_York"
done
