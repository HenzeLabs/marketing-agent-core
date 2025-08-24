#!/bin/bash
# scripts/deploy_and_validate.sh
# One-shot script: sets context, ensures ADMIN_TOKEN, (re)creates scheduler jobs, fires them, tails logs, and runs API smoke.
set -euo pipefail

export PROJECT=henzelabs-gpt
export REGION=us-east1
export SERVICE=marketing-agent-core
export SERVICE_URL="https://marketing-agent-core-906749953116.us-east1.run.app"
export SA_EMAIL="henze-gpt-agent@henzelabs-gpt.iam.gserviceaccount.com"

# 1. Context
GCLOUD="$(command -v gcloud)"
$GCLOUD config set project "$PROJECT"
$GCLOUD config set run/region "$REGION"

# 2. Ensure ADMIN_TOKEN
ADMIN_TOKEN=$($GCLOUD run services describe "$SERVICE" --region "$REGION" \
  --format='get(spec.template.spec.containers[0].env[NAME=ADMIN_TOKEN].value)')
if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  ADMIN_TOKEN=$(openssl rand -hex 32)
  $GCLOUD run services update "$SERVICE" --region "$REGION" \
    --set-env-vars ADMIN_TOKEN="$ADMIN_TOKEN"
fi
echo "ADMIN_TOKEN set."

# 3. Scheduler jobs (Clarity, GA4, Shopify)
function upsert_job() {
  local NAME="$1" PATH="$2" SCHED="$3"
  if $GCLOUD scheduler jobs describe "$NAME" --location "$REGION" >/dev/null 2>&1; then
    $GCLOUD scheduler jobs update http "$NAME" --location "$REGION" \
      --schedule="$SCHED" --time-zone="UTC" \
      --uri="$SERVICE_URL$PATH" --http-method=POST \
      --headers="X-Admin-Token=$ADMIN_TOKEN" \
      --oidc-service-account-email "$SA_EMAIL" --oidc-token-audience "$SERVICE_URL"
  else
    $GCLOUD scheduler jobs create http "$NAME" --location "$REGION" \
      --schedule="$SCHED" --time-zone="UTC" \
      --uri="$SERVICE_URL$PATH" --http-method=POST \
      --headers="X-Admin-Token=$ADMIN_TOKEN" \
      --oidc-service-account-email "$SA_EMAIL" --oidc-token-audience "$SERVICE_URL"
  fi
}
upsert_job ingest-clarity /admin/ingest/clarity "10 2 * * *"
upsert_job ingest-ga4 /admin/ingest/ga4 "0 2 * * *"
upsert_job ingest-shopify-hourly /admin/ingest/shopify "0 * * * *"

echo "Scheduler jobs created/updated."

# 4. Fire jobs and tail logs (background)
$GCLOUD scheduler jobs run ingest-clarity --location "$REGION"
$GCLOUD scheduler jobs run ingest-ga4 --location "$REGION"
$GCLOUD scheduler jobs run ingest-shopify-hourly --location "$REGION"

# Tail logs for 30s in background
($GCLOUD logs tail --region "$REGION" --project "$PROJECT" --service "$SERVICE" &)

# 5. API smoke
set +e
curl -fsS "$SERVICE_URL/_health" && echo OK
curl -fsS "$SERVICE_URL/api/health" && echo OK
curl -fsS "$SERVICE_URL/api/clarity/top-urls" | tee /dev/tty | grep -q '\[\s*\]' && echo "EMPTY clarity" && exit 2 || true
curl -fsS "$SERVICE_URL/api/metrics/sessions-daily" | head
curl -fsS "$SERVICE_URL/api/metrics/revenue-daily" | head
set -e

echo "All steps complete. Check logs above for details."
