#!/bin/bash
# scripts/scheduler_recreate.sh: Recreate Cloud Scheduler jobs for Marketing Copilot (idempotent)
# Usage: bash scripts/scheduler_recreate.sh
set -euo pipefail

# Hardcode a robust PATH for gcloud and standard tools
export PATH="/opt/homebrew/share/google-cloud-sdk/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

PROJECT=henzelabs-gpt
REGION=us-east1
SERVICE=marketing-agent-core
SERVICE_URL="https://marketing-agent-core-906749953116.us-east1.run.app"
SA_EMAIL="henze-gpt-agent@henzelabs-gpt.iam.gserviceaccount.com"

# Get ADMIN_TOKEN from Cloud Run env
ADMIN_TOKEN=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='json' \
  | jq -r '.spec.template.spec.containers[0].env[]?|select(.name=="ADMIN_TOKEN")|.value')
if [[ -z "$ADMIN_TOKEN" || "$ADMIN_TOKEN" == "null" ]]; then
  echo "[ERROR] ADMIN_TOKEN not set on Cloud Run service. Set it and redeploy."
  exit 1
fi

# Job configs: name, path, schedule
JOBS=(
  "ingest-clarity:/admin/ingest/clarity:10 2 * * *"
  "ingest-ga4:/admin/ingest/ga4:0 2 * * *"
  "ingest-shopify-hourly:/admin/ingest/shopify:0 * * * *"
)


for job in "${JOBS[@]}"; do
  IFS=':' read -r NAME PATH SCHED <<< "$job"
  gcloud scheduler jobs delete "$NAME" --location="$REGION" --quiet || true
  gcloud scheduler jobs create http "$NAME" \
    --location="$REGION" \
    --schedule="$SCHED" \
    --uri="$SERVICE_URL$PATH" \
    --http-method=POST \
    --oidc-service-account-email="$SA_EMAIL" \
    --oidc-token-audience="$SERVICE_URL" \
    --headers="X-Admin-Token:$ADMIN_TOKEN" \
    --project="$PROJECT" \
    --time-zone="America/New_York"
done

echo "[OK] Scheduler jobs created. Run them with:"
echo "gcloud scheduler jobs run ingest-clarity --location=$REGION"
echo "gcloud scheduler jobs run ingest-ga4 --location=$REGION"
echo "gcloud scheduler jobs run ingest-shopify-hourly --location=$REGION"
