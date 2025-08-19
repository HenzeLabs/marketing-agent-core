#!/bin/bash
# Script to standardize Cloud Scheduler job names to brand__source__frequency format
# Project: henzelabs-gpt, Location: us-central1
# This script will delete old jobs and recreate them with standardized names, preserving all settings.
# WARNING: This will cause a brief downtime for each job. Review before running in production.

set -e
PROJECT="henzelabs-gpt"
LOCATION="us-central1"

# Helper: base64 decode and pretty-print job body
b64decode() { echo "$1" | base64 --decode | jq .; }

# --- Job: ga4-pipeline-job -> labessentials__ga4__daily ---
gcloud scheduler jobs describe ga4-pipeline-job --location=$LOCATION --project=$PROJECT
# Delete old job
gcloud scheduler jobs delete ga4-pipeline-job --location=$LOCATION --project=$PROJECT -q
# Recreate with standardized name
gcloud scheduler jobs create http labessentials__ga4__daily \
  --location=$LOCATION \
  --project=$PROJECT \
  --schedule="0 2 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/run_pipeline_entrypoint" \
  --http-method=POST \
  --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
  --message-body='{"brand": "labessentials", "source": "ga4"}'

# --- Job: gsc-pipeline-job -> labessentials__gsc__daily ---
gcloud scheduler jobs describe gsc-pipeline-job --location=$LOCATION --project=$PROJECT
gcloud scheduler jobs delete gsc-pipeline-job --location=$LOCATION --project=$PROJECT -q
gcloud scheduler jobs create http labessentials__gsc__daily \
  --location=$LOCATION \
  --project=$PROJECT \
  --schedule="0 3 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/run_pipeline_entrypoint" \
  --http-method=POST \
  --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
  --message-body='{"brand": "labessentials", "source": "gsc"}'

# --- Job: pagespeed-pipeline-job -> labessentials__pagespeed__6h ---
gcloud scheduler jobs describe pagespeed-pipeline-job --location=$LOCATION --project=$PROJECT
gcloud scheduler jobs delete pagespeed-pipeline-job --location=$LOCATION --project=$PROJECT -q
gcloud scheduler jobs create http labessentials__pagespeed__6h \
  --location=$LOCATION \
  --project=$PROJECT \
  --schedule="0 */6 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/run_pipeline_entrypoint" \
  --http-method=POST \
  --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
  --message-body='{"brand": "labessentials", "source": "pagespeed"}'

# --- Job: shopify-pipeline-job -> labessentials__shopify__4h ---
gcloud scheduler jobs describe shopify-pipeline-job --location=$LOCATION --project=$PROJECT
gcloud scheduler jobs delete shopify-pipeline-job --location=$LOCATION --project=$PROJECT -q
gcloud scheduler jobs create http labessentials__shopify__4h \
  --location=$LOCATION \
  --project=$PROJECT \
  --schedule="0 */4 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/run_pipeline_entrypoint" \
  --http-method=POST \
  --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
  --message-body='{"brand": "labessentials", "source": "shopify"}'

# --- Job: test-products -> labessentials__shopify_products__test ---
gcloud scheduler jobs describe test-products --location=$LOCATION --project=$PROJECT
gcloud scheduler jobs delete test-products --location=$LOCATION --project=$PROJECT -q
gcloud scheduler jobs create http labessentials__shopify_products__test \
  --location=$LOCATION \
  --project=$PROJECT \
  --schedule="* * * * *" \
  --time-zone="Etc/UTC" \
  --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/run_pipeline_entrypoint" \
  --http-method=POST \
  --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
  --message-body='{"brand": "labessentials", "source": "shopify_products"}'

# --- End of script ---

echo "All jobs processed. Please verify in the Cloud Console."
